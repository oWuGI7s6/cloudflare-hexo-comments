(() => {
  const script = document.currentScript;
  const api = (script?.dataset.api || "").replace(/\/$/, "");
  if (!api) { console.error("Hexo Comments: please set data-api on the script tag."); return; }

  const root = document.createElement("section");
  root.className = "cf-comments";
  root.innerHTML = `<style>
    .cf-comments{--cc-accent:#5575ed;--cc-accent-dark:#3f5fd6;--cc-text:#263247;--cc-muted:#8490a2;--cc-line:rgba(125,142,170,.2);--cc-glass:rgba(255,255,255,.62);max-width:820px;margin:3rem auto;color:var(--cc-text);font:inherit;isolation:isolate}
    .cf-comments *{box-sizing:border-box}.cc-shell{padding:clamp(1.15rem,4vw,2rem);border:1px solid rgba(255,255,255,.68);border-radius:16px;background:linear-gradient(145deg,rgba(255,255,255,.76),rgba(247,249,255,.55));box-shadow:0 18px 55px rgba(37,54,88,.08),inset 0 1px rgba(255,255,255,.8);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px)}
    .cc-heading{display:flex;align-items:center;justify-content:space-between;gap:1rem;margin-bottom:1.25rem}.cc-title{font-size:1.35rem;font-weight:700;letter-spacing:-.025em;margin:0}.cc-count{color:var(--cc-muted);font-size:.84rem;padding:.32rem .62rem;border:1px solid var(--cc-line);border-radius:6px;background:rgba(255,255,255,.45)}
    .cc-list{display:grid}.cc-card{padding:1.1rem 0;border-top:1px solid var(--cc-line);animation:cc-enter .35s ease both}.cc-card:first-child{border-top:0}.cc-meta{display:flex;align-items:center;flex-wrap:wrap;gap:.55rem;margin-bottom:.62rem}.cc-avatar{display:grid;place-items:center;width:34px;height:34px;border-radius:9px;color:#fff;background:linear-gradient(145deg,#8399ff,#5a72dc);font-size:.9rem;font-weight:700;box-shadow:0 3px 9px rgba(85,117,237,.18)}.cc-author{display:grid;gap:.12rem}.cc-name{font-weight:650;font-size:.95rem}.cc-time{font-size:.77rem;color:var(--cc-muted)}.cc-website{margin-left:auto;color:var(--cc-accent);font-size:.82rem;text-decoration:none;padding:.35rem .55rem;border-radius:5px;transition:background .18s,color .18s,transform .18s}.cc-website:hover{background:rgba(85,117,237,.09);color:var(--cc-accent-dark);transform:translateY(-1px)}.cc-content{white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.8;font-size:.96rem;padding-left:44px}.cc-empty,.cc-error{color:var(--cc-muted);font-size:.92rem;padding:1.2rem 0;margin:0}.cc-error{color:#bd4d58}
    .cc-form-wrap{margin-top:1.25rem;padding:1.1rem;border:1px solid var(--cc-line);border-radius:11px;background:rgba(255,255,255,.43)}.cc-form-title{font-weight:650;font-size:.96rem;margin:0 0 .85rem}.cc-form{display:grid;gap:.7rem}.cc-fields{display:grid;grid-template-columns:1fr 1fr;gap:.7rem}.cc-form input,.cc-form textarea{width:100%;border:1px solid rgba(125,142,170,.24);border-radius:7px;padding:.76rem .85rem;background:rgba(255,255,255,.63);color:inherit;font:inherit;font-size:.91rem;outline:none;transition:border-color .18s,box-shadow .18s,background .18s,transform .18s}.cc-form input::placeholder,.cc-form textarea::placeholder{color:#9aa4b4}.cc-form input:hover,.cc-form textarea:hover{border-color:rgba(85,117,237,.4);background:rgba(255,255,255,.83)}.cc-form input:focus,.cc-form textarea:focus{border-color:var(--cc-accent);background:#fff;box-shadow:0 0 0 3px rgba(85,117,237,.12)}.cc-form textarea{min-height:115px;resize:vertical;line-height:1.65}.cc-actions{display:flex;align-items:center;gap:.85rem;flex-wrap:wrap}.cc-form button{position:relative;overflow:hidden;border:1px solid transparent;border-radius:6px;padding:.68rem 1.05rem;background:linear-gradient(135deg,#6683f5,#4e6bdd);color:white;font:inherit;font-size:.9rem;font-weight:600;cursor:pointer;box-shadow:0 4px 10px rgba(74,101,210,.2);transition:transform .16s,box-shadow .16s,filter .16s}.cc-form button:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 7px 16px rgba(74,101,210,.27);filter:saturate(1.08)}.cc-form button:active:not(:disabled){transform:translateY(0) scale(.98);box-shadow:0 2px 6px rgba(74,101,210,.2)}.cc-form button:disabled{opacity:.68;cursor:wait}.cc-status{min-height:1.3em;color:var(--cc-muted);font-size:.85rem}.cc-status[data-state=error]{color:#bd4d58}.cc-hp{position:absolute!important;left:-10000px!important;width:1px!important;height:1px!important;overflow:hidden!important}
    @keyframes cc-enter{from{opacity:0;transform:translateY(7px)}to{opacity:1;transform:translateY(0)}}@media(max-width:560px){.cc-shell{border-radius:12px}.cc-fields{grid-template-columns:1fr}.cc-content{padding-left:0}.cc-heading{margin-bottom:.8rem}}@media(prefers-reduced-motion:reduce){.cf-comments *{animation-duration:.01ms!important;transition-duration:.01ms!important;scroll-behavior:auto!important}}
  </style><div class="cc-shell"><div class="cc-heading"><h2 class="cc-title">评论</h2><span class="cc-count" aria-live="polite"></span></div><div class="cc-list" aria-live="polite"></div><div class="cc-form-wrap"><h3 class="cc-form-title">留下你的想法</h3><form class="cc-form"><div class="cc-fields"><input name="nickname" maxlength="40" placeholder="昵称（选填，默认匿名）" autocomplete="nickname" aria-label="昵称（选填）"><input name="website" type="url" maxlength="200" placeholder="网址（选填，如 https://example.com）" autocomplete="url" aria-label="网址（选填）"></div><label class="cc-hp" aria-hidden="true">Website<input name="website_honeypot" tabindex="-1" autocomplete="off"></label><textarea name="content" maxlength="3000" required placeholder="友善交流，写下你的评论…" aria-label="评论内容"></textarea><div class="cc-actions"><button type="submit"><span class="cc-button-label">发表评论</span></button><span class="cc-status" role="status" aria-live="polite"></span></div></form></div></div>`;
  (script?.parentNode || document.body).insertBefore(root, script?.nextSibling || null);
  const pagePath = window.location.pathname.replace(/\/$/, "") || "/";
  const list = root.querySelector(".cc-list");
  const status = root.querySelector(".cc-status");
  const button = root.querySelector("button");
  const buttonLabel = root.querySelector(".cc-button-label");
  const count = root.querySelector(".cc-count");
  const escape = (value) => String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
  const safeUrl = (value) => {
    try { const url = new URL(value); return ["http:", "https:"].includes(url.protocol) ? url.href : ""; } catch { return ""; }
  };
  const formatDate = (time) => new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(time));
  function render(comments) {
    count.textContent = `${comments.length} 条评论`;
    if (!comments.length) { list.innerHTML = '<p class="cc-empty">还没有评论</p>'; return; }
    list.innerHTML = comments.map((comment) => {
      const website = safeUrl(comment.website || "");
      return `<article class="cc-card"><div class="cc-meta"><span class="cc-avatar" aria-hidden="true">${escape((comment.nickname || "匿").slice(0, 1))}</span><span class="cc-author"><span class="cc-name">${escape(comment.nickname)}</span><time class="cc-time" datetime="${new Date(comment.created_at).toISOString()}">${formatDate(comment.created_at)}</time></span>${website ? `<a class="cc-website" href="${escape(website)}" target="_blank" rel="noopener noreferrer nofollow">个人主页 ↗</a>` : ""}</div><div class="cc-content">${escape(comment.content)}</div></article>`;
    }).join("");
  }
  async function load() {
    try {
      const response = await fetch(`${api}/api/comments?path=${encodeURIComponent(pagePath)}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "加载评论失败");
      render(data.comments || []);
    } catch (error) { list.innerHTML = `<p class="cc-error">${escape(error.message)}</p>`; }
  }
  root.querySelector("form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    button.disabled = true; buttonLabel.textContent = "正在发布…"; status.dataset.state = ""; status.textContent = "评论提交中";
    try {
      const response = await fetch(`${api}/api/comments`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ path: pagePath, nickname: values.get("nickname"), website: values.get("website"), content: values.get("content"), website_honeypot: values.get("website_honeypot") }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "提交失败");
      form.reset(); status.textContent = "发布成功！"; await load();
    } catch (error) { status.dataset.state = "error"; status.textContent = error.message; }
    finally { button.disabled = false; buttonLabel.textContent = "评论"; }
  });
  load();
})();
