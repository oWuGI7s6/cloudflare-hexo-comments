(() => {
  const script = document.currentScript;
  const api = (script?.dataset.api || "").replace(/\/$/, "");
  if (!api) { console.error("Hexo Comments: please set data-api on the script tag."); return; }
  const root = document.createElement("section");
  root.className = "cf-comments";
  root.innerHTML = `<style>
    .cf-comments{--cc-accent:#5b7cfa;--cc-text:#253047;--cc-muted:#8490a5;max-width:820px;margin:2.5rem auto;color:var(--cc-text);font: inherit}
    .cf-comments *{box-sizing:border-box}.cc-title{font-size:1.45rem;font-weight:650;margin:0 0 1.25rem}.cc-card{padding:1rem 0;border-bottom:1px solid rgba(130,145,170,.2)}
    .cc-meta{display:flex;align-items:center;gap:.65rem;margin-bottom:.5rem}.cc-name{font-weight:600}.cc-time{font-size:.82rem;color:var(--cc-muted)}.cc-content{white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.75}
    .cc-form{display:grid;gap:.75rem;margin-top:1.25rem}.cc-form input,.cc-form textarea{width:100%;border:1px solid rgba(130,145,170,.35);border-radius:10px;padding:.75rem .9rem;background:transparent;color:inherit;font:inherit;outline:none}
    .cc-form input:focus,.cc-form textarea:focus{border-color:var(--cc-accent)}.cc-form textarea{min-height:110px;resize:vertical}.cc-actions{display:flex;align-items:center;gap:1rem}.cc-form button{border:0;border-radius:9px;padding:.65rem 1.15rem;background:var(--cc-accent);color:#fff;font:inherit;cursor:pointer}.cc-form button:disabled{opacity:.6;cursor:wait}.cc-status,.cc-empty{color:var(--cc-muted);font-size:.92rem}.cc-hp{position:absolute;left:-10000px}
    </style><h2 class="cc-title">评论</h2><div class="cc-list" aria-live="polite"></div><form class="cc-form"><input name="nickname" maxlength="40" placeholder="昵称（可选，默认匿名）" autocomplete="nickname"><label class="cc-hp" aria-hidden="true">Website<input name="website" tabindex="-1" autocomplete="off"></label><textarea name="content" maxlength="3000" required placeholder="写下你的评论…"></textarea><div class="cc-actions"><button type="submit">发表评论</button><span class="cc-status" role="status"></span></div></form>`;
  (script?.parentNode || document.body).insertBefore(root, script?.nextSibling || null);
  const pagePath = window.location.pathname.replace(/\/$/, "") || "/";
  const list = root.querySelector(".cc-list");
  const status = root.querySelector(".cc-status");
  const escape = (value) => String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
  const formatDate = (time) => new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(time));
  function render(comments) {
    if (!comments.length) { list.innerHTML = '<p class="cc-empty">还没有评论，来留下第一条吧。</p>'; return; }
    list.innerHTML = comments.map((comment) => `<article class="cc-card"><div class="cc-meta"><span class="cc-name">${escape(comment.nickname)}</span><time class="cc-time" datetime="${new Date(comment.created_at).toISOString()}">${formatDate(comment.created_at)}</time></div><div class="cc-content">${escape(comment.content)}</div></article>`).join("");
  }
  async function load() {
    try {
      const response = await fetch(`${api}/api/comments?path=${encodeURIComponent(pagePath)}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "加载评论失败");
      render(data.comments || []);
    } catch (error) { list.innerHTML = `<p class="cc-empty">${escape(error.message)}</p>`; }
  }
  root.querySelector("form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const button = form.querySelector("button");
    const values = new FormData(form);
    button.disabled = true; status.textContent = "正在提交…";
    try {
      const response = await fetch(`${api}/api/comments`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ path: pagePath, nickname: values.get("nickname"), content: values.get("content"), website: values.get("website") }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "提交失败");
      form.reset(); status.textContent = "评论已发布"; await load();
    } catch (error) { status.textContent = error.message; }
    finally { button.disabled = false; }
  });
  load();
})();
