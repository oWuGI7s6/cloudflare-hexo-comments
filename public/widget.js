(() => {
  const script = document.currentScript;
  const api = (script?.dataset.api || "").replace(/\/$/, "");
  if (!api) { console.error("Hexo Comments: please set data-api on the script tag."); return; }

  const root = document.createElement("section");
  root.className = "cf-comments";
  root.innerHTML = `<style>
    .cf-comments{--cc-accent:#5575ed;--cc-text:#263247;--cc-muted:#8490a2;--cc-line:#e7eaf0;max-width:820px;margin:3rem auto;color:var(--cc-text);font:inherit}
    .cf-comments *{box-sizing:border-box}.cc-heading{display:flex;align-items:center;justify-content:space-between;gap:1rem;margin-bottom:.75rem}.cc-title{font-size:1.35rem;font-weight:700;letter-spacing:-.025em;margin:0}.cc-tools{display:flex;align-items:center;gap:.45rem}.cc-count{color:var(--cc-muted);font-size:.84rem}.cc-tool{display:inline-flex;align-items:center;justify-content:center;gap:.35rem;padding:.38rem .55rem;border:1px solid var(--cc-line);border-radius:4px;background:transparent;color:#626f83;font:inherit;font-size:.82rem;cursor:pointer;transition:background .16s,color .16s,border-color .16s,transform .16s}.cc-tool:hover{background:#f2f4f8;color:var(--cc-text);border-color:#d4d9e3}.cc-tool:active{transform:scale(.97)}.cc-tool:disabled{opacity:.55;cursor:wait}.cc-refresh-icon{width:14px;height:14px;transition:transform .35s}.cc-refreshing .cc-refresh-icon{transform:rotate(180deg)}
    .cc-list{display:grid}.cc-card{padding:1.05rem 0;border-top:1px solid var(--cc-line);animation:cc-enter .25s ease both}.cc-card:first-child{border-top:0}.cc-meta{display:flex;align-items:center;gap:.65rem;margin-bottom:.55rem}.cc-avatar{display:grid;place-items:center;flex:none;width:34px;height:34px;border-radius:4px;color:#fff;font-size:.9rem;font-weight:700}.cc-author{display:grid;gap:.12rem}.cc-name{font-weight:650;font-size:.94rem;color:inherit;text-decoration:none}.cc-name[href]:hover{color:var(--cc-accent);text-decoration:underline;text-underline-offset:3px}.cc-time{font-size:.77rem;color:var(--cc-muted)}.cc-content{padding-left:44px;line-height:1.8;font-size:.96rem;overflow-wrap:anywhere}.cc-content>:first-child{margin-top:0}.cc-content>:last-child{margin-bottom:0}.cc-content p{margin:.5em 0}.cc-content h1,.cc-content h2,.cc-content h3,.cc-content h4{line-height:1.35;margin:.9em 0 .45em}.cc-content h1{font-size:1.35em}.cc-content h2{font-size:1.2em}.cc-content h3,.cc-content h4{font-size:1.05em}.cc-content a{color:var(--cc-accent);text-decoration:underline;text-underline-offset:2px}.cc-content blockquote{margin:.6em 0;padding:.1em .9em;border-left:3px solid #d5dbea;color:#69758a}.cc-content ul,.cc-content ol{padding-left:1.5em;margin:.5em 0}.cc-content pre{overflow:auto;padding:.85rem 1rem;background:#f3f5f8;border:1px solid var(--cc-line);border-radius:4px;font-size:.87em;line-height:1.6}.cc-content code{padding:.12em .32em;background:#f0f2f6;border-radius:3px;font-size:.9em}.cc-content pre code{padding:0;background:none}.cc-content hr{border:0;border-top:1px solid var(--cc-line);margin:1em 0}.cc-empty,.cc-error{color:var(--cc-muted);font-size:.92rem;padding:1rem 0;margin:0}.cc-error{color:#bd4d58}
    .cc-form-wrap{margin-top:1rem;padding:1rem 0;border-top:1px solid var(--cc-line)}.cc-form-title{font-weight:650;font-size:.96rem;margin:0 0 .75rem}.cc-form{display:grid;gap:.65rem}.cc-fields{display:grid;grid-template-columns:1fr 1fr;gap:.65rem}.cc-form input,.cc-form textarea{width:100%;border:1px solid #dfe3eb;border-radius:4px;padding:.72rem .8rem;background:#fff;color:inherit;font:inherit;font-size:.91rem;outline:none;transition:border-color .16s,box-shadow .16s}.cc-form input::placeholder,.cc-form textarea::placeholder{color:#9aa4b4}.cc-form input:hover,.cc-form textarea:hover{border-color:#b9c3d5}.cc-form input:focus,.cc-form textarea:focus{border-color:var(--cc-accent);box-shadow:0 0 0 2px rgba(85,117,237,.11)}.cc-form textarea{min-height:120px;resize:vertical;line-height:1.65}.cc-form textarea[hidden],.cc-preview[hidden]{display:none}.cc-preview{min-height:120px;padding:.72rem .8rem;border:1px solid #dfe3eb;border-radius:4px;background:#fff;line-height:1.7;overflow-wrap:anywhere}.cc-preview:empty::before{content:"预览内容会显示在这里";color:#9aa4b4}.cc-preview h1,.cc-preview h2,.cc-preview h3{line-height:1.35}.cc-preview pre{overflow:auto;padding:.75rem;background:#f3f5f8;border-radius:4px}.cc-preview code{padding:.12em .3em;background:#f0f2f6;border-radius:3px}.cc-preview pre code{padding:0;background:none}.cc-preview blockquote{margin:.5em 0;padding-left:.8em;border-left:3px solid #d5dbea;color:#69758a}.cc-preview a{color:var(--cc-accent)}.cc-preview ul,.cc-preview ol{padding-left:1.5em}.cc-hint{margin:0;color:var(--cc-muted);font-size:.79rem}.cc-actions{display:flex;align-items:center;gap:.7rem;flex-wrap:wrap}.cc-form button.cc-submit{border:1px solid #4968d7;border-radius:4px;padding:.65rem 1rem;background:#5575ed;color:#fff;font:inherit;font-size:.9rem;font-weight:600;cursor:pointer;transition:background .16s,transform .16s,border-color .16s}.cc-form button.cc-submit:hover:not(:disabled){background:#4565df;border-color:#3e5ccc}.cc-form button.cc-submit:active:not(:disabled){transform:translateY(1px)}.cc-form button:disabled{opacity:.62;cursor:wait}.cc-status{min-height:1.3em;color:var(--cc-muted);font-size:.84rem}.cc-status[data-state=error]{color:#bd4d58}.cc-hp{position:absolute!important;left:-10000px!important;width:1px!important;height:1px!important;overflow:hidden!important}
    @keyframes cc-enter{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}@media(max-width:560px){.cc-fields{grid-template-columns:1fr}.cc-content{padding-left:0}.cc-heading{align-items:flex-start}}@media(prefers-reduced-motion:reduce){.cf-comments *{animation-duration:.01ms!important;transition-duration:.01ms!important;scroll-behavior:auto!important}}
  </style><div class="cc-heading"><h2 class="cc-title">评论</h2><div class="cc-tools"><span class="cc-count" aria-live="polite"></span><button class="cc-tool cc-refresh" type="button" aria-label="刷新评论" title="刷新评论"><svg class="cc-refresh-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M13.2 6A5.5 5.5 0 0 0 3 4.1L1.8 5.4M1.8 5.4V2.8m0 2.6h2.7M2.8 10A5.5 5.5 0 0 0 13 11.9l1.2-1.3m0 0v2.6m0-2.6h-2.7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg><span>刷新</span></button></div></div><div class="cc-list" aria-live="polite"></div><div class="cc-form-wrap"><h4 class="cc-form-title"> </h4><form class="cc-form"><div class="cc-fields"><input name="nickname" maxlength="40" placeholder="昵称（选填）" autocomplete="nickname" aria-label="昵称（选填）"><input name="website" type="url" maxlength="200" placeholder="网址（选填）" autocomplete="url" aria-label="网址（选填）"></div><label class="cc-hp" aria-hidden="true">Website<input name="website_honeypot" tabindex="-1" autocomplete="off"></label><textarea class="cc-input" name="content" maxlength="3000" required placeholder="支持 Markdown…" aria-label="评论内容"></textarea><div class="cc-preview" hidden aria-label="Markdown 预览"></div><div class="cc-actions"><button class="cc-submit" type="submit"><span class="cc-button-label">发表评论</span></button><button class="cc-tool cc-preview-toggle" type="button">预览</button><span class="cc-status" role="status" aria-live="polite"></span></div></form></div></div>`;
  (script?.parentNode || document.body).insertBefore(root, script?.nextSibling || null);
  const pagePath = window.location.pathname.replace(/\/$/, "") || "/";
  const list = root.querySelector(".cc-list");
  const status = root.querySelector(".cc-status");
  const submitButton = root.querySelector(".cc-submit");
  const buttonLabel = root.querySelector(".cc-button-label");
  const count = root.querySelector(".cc-count");
  const refreshButton = root.querySelector(".cc-refresh");
  const input = root.querySelector(".cc-input");
  const preview = root.querySelector(".cc-preview");
  const previewToggle = root.querySelector(".cc-preview-toggle");
  const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
  function inlineMarkdown(value) {
    const tokens = [];
    const save = (html) => { const marker = `\u0000${tokens.length}\u0000`; tokens.push(html); return marker; };
    let text = String(value);
    text = text.replace(/`([^`\n]+)`/g, (_, code) => save(`<code>${escapeHtml(code)}</code>`));
    text = text.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)(?:\s+"([^"]*)")?\)/g, (match, label, href, title) => {
      try {
        const url = new URL(href);
        if (!['http:', 'https:'].includes(url.protocol)) return match;
        return save(`<a href="${escapeHtml(url.href)}"${title ? ` title="${escapeHtml(title)}"` : ""} target="_blank" rel="noopener noreferrer nofollow">${escapeHtml(label)}</a>`);
      } catch { return match; }
    });
    text = escapeHtml(text)
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/__(.+?)__/g, "<strong>$1</strong>")
      .replace(/~~(.+?)~~/g, "<del>$1</del>")
      .replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, "$1<em>$2</em>")
      .replace(/(^|[^_])_([^_\n]+)_(?!_)/g, "$1<em>$2</em>")
      .replace(/\n/g, "<br>");
    return text.replace(/\u0000(\d+)\u0000/g, (_, index) => tokens[Number(index)] || "");
  }
  function renderMarkdown(value) {
    const lines = String(value || "").replace(/\r\n?/g, "\n").split("\n");
    const blocks = [];
    let paragraph = [];
    const flushParagraph = () => { if (paragraph.length) { blocks.push(`<p>${inlineMarkdown(paragraph.join("\n"))}</p>`); paragraph = []; } };
    for (let i = 0; i < lines.length;) {
      const line = lines[i];
      if (/^\s*```/.test(line)) {
        flushParagraph();
        const language = line.match(/^\s*```([\w+-]*)/)?.[1] || "";
        const code = [];
        i++;
        while (i < lines.length && !/^\s*```\s*$/.test(lines[i])) code.push(lines[i++]);
        if (i < lines.length) i++;
        blocks.push(`<pre><code${language ? ` class="language-${escapeHtml(language)}"` : ""}>${escapeHtml(code.join("\n"))}</code></pre>`);
        continue;
      }
      const heading = line.match(/^\s{0,3}(#{1,6})\s+(.+?)\s*#*\s*$/);
      if (heading) { flushParagraph(); const level = heading[1].length; blocks.push(`<h${level}>${inlineMarkdown(heading[2])}</h${level}>`); i++; continue; }
      if (/^\s{0,3}(---+|___+|\*\s*\*\s*\*+)\s*$/.test(line)) { flushParagraph(); blocks.push("<hr>"); i++; continue; }
      if (/^\s*>/.test(line)) {
        flushParagraph(); const quote = [];
        while (i < lines.length && /^\s*>/.test(lines[i])) quote.push(lines[i++].replace(/^\s*>\s?/, ""));
        blocks.push(`<blockquote>${renderMarkdown(quote.join("\n"))}</blockquote>`); continue;
      }
      const unordered = line.match(/^\s*[-+*]\s+(.+)$/);
      const ordered = line.match(/^\s*\d+[.)]\s+(.+)$/);
      if (unordered || ordered) {
        flushParagraph(); const isOrdered = Boolean(ordered); const items = [];
        while (i < lines.length) {
          const item = lines[i].match(isOrdered ? /^\s*\d+[.)]\s+(.+)$/ : /^\s*[-+*]\s+(.+)$/);
          if (!item) break;
          items.push(`<li>${inlineMarkdown(item[1])}</li>`); i++;
        }
        blocks.push(`<${isOrdered ? "ol" : "ul"}>${items.join("")}</${isOrdered ? "ol" : "ul"}>`); continue;
      }
      if (!line.trim()) { flushParagraph(); i++; continue; }
      paragraph.push(line); i++;
    }
    flushParagraph();
    return blocks.join("");
  }
  const avatarColors = ["#5575ed", "#0f8b8d", "#ff4583", "#8161bd", "#ff9035", "#559cdf", "#c9fc69", "#ff7b5a"];
  function avatarColor(name) {
    let hash = 0;
    for (const char of name) hash = (hash * 31 + char.codePointAt(0)) | 0;
    return avatarColors[Math.abs(hash) % avatarColors.length];
  }
  const safeUrl = (value) => {
    try { const url = new URL(value); return ["http:", "https:"].includes(url.protocol) ? url.href : ""; } catch { return ""; }
  };
  const formatDate = (time) => new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(time));
  function render(comments) {
    count.textContent = `${comments.length} 条评论`;
    if (!comments.length) { list.innerHTML = '<p class="cc-empty">还没有评论，来留下第一条吧。</p>'; return; }
    list.innerHTML = comments.map((comment) => {
      const nickname = comment.nickname || "匿名";
      const website = safeUrl(comment.website || "");
      const initial = [...nickname][0] || "?";
      const name = website
        ? `<a class="cc-name" href="${escapeHtml(website)}" target="_blank" rel="noopener noreferrer nofollow">${escapeHtml(nickname)}</a>`
        : `<span class="cc-name">${escapeHtml(nickname)}</span>`;
      return `<article class="cc-card"><div class="cc-meta"><span class="cc-avatar" style="background:${avatarColor(nickname)}" aria-hidden="true">${escapeHtml(initial)}</span><span class="cc-author">${name}<time class="cc-time" datetime="${new Date(comment.created_at).toISOString()}">${formatDate(comment.created_at)}</time></span></div><div class="cc-content">${renderMarkdown(comment.content)}</div></article>`;
    }).join("");
  }
  async function load() {
    refreshButton.disabled = true;
    refreshButton.classList.add("cc-refreshing");
    try {
      const response = await fetch(`${api}/api/comments?path=${encodeURIComponent(pagePath)}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "加载评论失败");
      render(data.comments || []);
    } catch (error) { list.innerHTML = `<p class="cc-error">${escapeHtml(error.message)}</p>`; }
    finally { refreshButton.disabled = false; refreshButton.classList.remove("cc-refreshing"); }
  }
  refreshButton.addEventListener("click", load);
  previewToggle.addEventListener("click", () => {
    const showing = !preview.hidden;
    if (showing) {
      preview.hidden = true; input.hidden = false; previewToggle.textContent = "预览"; input.focus();
    } else {
      preview.innerHTML = renderMarkdown(input.value);
      preview.hidden = false; input.hidden = true; previewToggle.textContent = "继续编辑";
    }
  });
  root.querySelector("form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    submitButton.disabled = true; buttonLabel.textContent = "正在发布…"; status.dataset.state = ""; status.textContent = "评论提交中";
    try {
      const response = await fetch(`${api}/api/comments`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ path: pagePath, nickname: values.get("nickname"), website: values.get("website"), content: values.get("content"), website_honeypot: values.get("website_honeypot") }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "提交失败");
      form.reset(); preview.innerHTML = ""; preview.hidden = true; input.hidden = false; previewToggle.textContent = "预览"; status.textContent = "发布成功！"; await load();
    } catch (error) { status.dataset.state = "error"; status.textContent = error.message; }
    finally { submitButton.disabled = false; buttonLabel.textContent = "评论"; }
  });
  load();
})();
