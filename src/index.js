const jsonHeaders = { "content-type": "application/json; charset=utf-8" };
const encoder = new TextEncoder();
const RATE_WINDOW_MS = 60_000;
const RATE_LIMIT = 8;

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), { status, headers: { ...jsonHeaders, ...headers } });
}

function allowedOrigin(request, env) {
  const origin = request.headers.get("Origin");
  if (!origin) return null;
  const configured = (env.ALLOWED_ORIGINS || "").split(",").map((item) => item.trim()).filter(Boolean);
  if (!configured.length) return null;
  try {
    return configured.some((value) => new URL(value).origin === new URL(origin).origin) ? origin : null;
  } catch {
    return null;
  }
}

function withCors(response, request, env) {
  const origin = allowedOrigin(request, env);
  if (!origin) return response;
  const headers = new Headers(response.headers);
  headers.set("Access-Control-Allow-Origin", origin);
  headers.set("Access-Control-Allow-Credentials", "true");
  headers.set("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type");
  headers.append("Vary", "Origin");
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

function b64url(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}
function fromB64url(value) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  return Uint8Array.from(atob(base64 + "=".repeat((4 - base64.length % 4) % 4)), (char) => char.charCodeAt(0));
}
async function hmac(secret, message) {
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(message)));
}
async function secureEqual(left, right) {
  const [a, b] = await Promise.all([
    crypto.subtle.digest("SHA-256", encoder.encode(left)),
    crypto.subtle.digest("SHA-256", encoder.encode(right)),
  ]);
  const x = new Uint8Array(a); const y = new Uint8Array(b);
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i];
  return diff === 0;
}
async function createToken(env) {
  const payload = b64url(encoder.encode(JSON.stringify({ exp: Date.now() + 7 * 24 * 60 * 60 * 1000 })));
  return `${payload}.${b64url(await hmac(env.ADMIN_SECRET, payload))}`;
}
async function isAdmin(request, env) {
  if (!env.ADMIN_SECRET) return false;
  const cookie = request.headers.get("Cookie") || "";
  const token = cookie.split(";").map((part) => part.trim()).find((part) => part.startsWith("cf_comments_admin="))?.slice("cf_comments_admin=".length);
  if (!token) return false;
  const [payload, signature, extra] = token.split(".");
  if (!payload || !signature || extra) return false;
  try {
    const expected = b64url(await hmac(env.ADMIN_SECRET, payload));
    if (!(await secureEqual(signature, expected))) return false;
    return JSON.parse(new TextDecoder().decode(fromB64url(payload))).exp > Date.now();
  } catch {
    return false;
  }
}
function cookie(value, maxAge) {
  return `cf_comments_admin=${value}; HttpOnly; Secure; SameSite=Strict; Path=/api/admin; Max-Age=${maxAge}`;
}
function cleanText(value, maxLength) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}
function cleanWebsite(value) {
  const website = cleanText(value, 200);
  if (!website) return "";
  try {
    const url = new URL(/^[a-z][a-z\d+.-]*:\/\//i.test(website) ? website : `https://${website}`);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.href;
  } catch {
    return null;
  }
}

async function hashIp(request, env) {
  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  const bytes = await crypto.subtle.digest("SHA-256", encoder.encode(`${env.RATE_LIMIT_SALT}:${ip}`));
  return b64url(new Uint8Array(bytes));
}

async function handle(request, env) {
  const url = new URL(request.url);
  if (request.method === "OPTIONS") return new Response(null, { status: 204 });

  if (url.pathname === "/api/comments" && request.method === "GET") {
    const path = cleanText(url.searchParams.get("path"), 500);
    if (!path) return json({ error: "缺少页面路径" }, 400);
    const { results } = await env.DB.prepare(
      "SELECT id, path, nickname, website, content, created_at, parent_id FROM comments WHERE path = ? ORDER BY created_at ASC LIMIT 500",
    ).bind(path).all();
    return json({ comments: results });
  }

  if (url.pathname === "/api/comments" && request.method === "POST") {
    let body;
    try { body = await request.json(); } catch { return json({ error: "请求格式无效" }, 400); }
    if (body.website_honeypot) return json({ ok: true });
    const path = cleanText(body.path, 500);
    const nickname = cleanText(body.nickname, 40) || "匿名";
    const content = cleanText(body.content, 3000);
    const website = cleanWebsite(body.website);
    const parentId = body.parent_id == null || body.parent_id === "" ? null : Number(body.parent_id);
    if (!path || !content) return json({ error: "页面路径和评论内容不能为空" }, 400);
    if (content.length < 2) return json({ error: "评论至少需要 2 个字符" }, 400);
    if (website === null) return json({ error: "网址格式无效，请填写有效的网址" }, 400);
    if (parentId !== null && (!Number.isSafeInteger(parentId) || parentId < 1)) return json({ error: "回复目标无效" }, 400);
    if (parentId !== null) {
      const parent = await env.DB.prepare("SELECT id, parent_id FROM comments WHERE id = ? AND path = ?")
        .bind(parentId, path).first();
      if (!parent || parent.parent_id !== null) return json({ error: "找不到可回复的评论" }, 404);
    }
    if (!env.RATE_LIMIT_SALT) return json({ error: "服务尚未完成配置" }, 503);

    const ipHash = await hashIp(request, env);
    const now = Date.now();
    await env.DB.prepare(`INSERT INTO rate_limits (ip_hash, window_start, hits) VALUES (?, ?, 1)
      ON CONFLICT(ip_hash) DO UPDATE SET
        window_start = CASE WHEN excluded.window_start - rate_limits.window_start >= ? THEN excluded.window_start ELSE rate_limits.window_start END,
        hits = CASE WHEN excluded.window_start - rate_limits.window_start >= ? THEN 1 ELSE rate_limits.hits + 1 END`)
      .bind(ipHash, now, RATE_WINDOW_MS, RATE_WINDOW_MS).run();
    const limit = await env.DB.prepare("SELECT hits FROM rate_limits WHERE ip_hash = ?").bind(ipHash).first();
    if (limit?.hits > RATE_LIMIT) return json({ error: "评论太频繁，请稍后再试" }, 429);

    const result = await env.DB.prepare(
      "INSERT INTO comments (path, nickname, website, content, created_at, parent_id) VALUES (?, ?, ?, ?, ?, ?)",
    ).bind(path, nickname, website, content, now, parentId).run();
    return json({ comment: { id: result.meta.last_row_id, path, nickname, website, content, created_at: now, parent_id: parentId } }, 201);
  }

  if (url.pathname === "/api/admin/login" && request.method === "POST") {
    if (!env.ADMIN_PASSWORD || !env.ADMIN_SECRET) return json({ error: "请先配置管理员密码和密钥" }, 503);
    let body;
    try { body = await request.json(); } catch { return json({ error: "请求格式无效" }, 400); }
    if (!(await secureEqual(String(body.password || ""), env.ADMIN_PASSWORD))) return json({ error: "密码错误" }, 401);
    return json({ ok: true }, 200, { "Set-Cookie": cookie(await createToken(env), 7 * 24 * 60 * 60) });
  }

  if (url.pathname === "/api/admin/logout" && request.method === "POST") {
    return json({ ok: true }, 200, { "Set-Cookie": cookie("", 0) });
  }

  if (url.pathname.startsWith("/api/admin/")) {
    if (!(await isAdmin(request, env))) return json({ error: "请先登录管理后台" }, 401);
    if (url.pathname === "/api/admin/comments" && request.method === "GET") {
      const page = Math.max(0, Number.parseInt(url.searchParams.get("page") || "0", 10) || 0);
      const { results } = await env.DB.prepare(
        "SELECT id, path, nickname, website, content, created_at, parent_id FROM comments ORDER BY created_at DESC LIMIT 100 OFFSET ?",
      ).bind(page * 100).all();
      const count = await env.DB.prepare("SELECT COUNT(*) AS count FROM comments").first();
      return json({ comments: results, total: count?.count || 0 });
    }
    const match = url.pathname.match(/^\/api\/admin\/comments\/(\d+)$/);
    if (match && request.method === "DELETE") {
      const id = Number(match[1]);
      await env.DB.prepare("DELETE FROM comments WHERE parent_id = ?").bind(id).run();
      await env.DB.prepare("DELETE FROM comments WHERE id = ?").bind(id).run();
      return json({ ok: true });
    }
    return json({ error: "找不到接口" }, 404);
  }
  return json({ error: "找不到接口" }, 404);
}

export default {
  async fetch(request, env) {
    try {
      const response = await handle(request, env);
      return withCors(response, request, env);
    } catch (error) {
      console.error("Request failed", error);
      return withCors(json({ error: "服务器暂时不可用" }, 500), request, env);
    }
  },
};
