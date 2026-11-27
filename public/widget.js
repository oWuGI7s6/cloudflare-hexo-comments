(() => {
  const script = document.currentScript;
  const api = (script?.dataset.api || "").replace(/\/$/, "");
  if (!api) {
    console.error("Hexo Comments: please set data-api on the script tag.");
    return;
  }

  // ── UI styles: edit this block to customize the component appearance ──
  const STYLES = `
    .cf-comments {
      --cc-accent: #5575ed;
      --cc-accent-strong: #3f5fd6;
      --cc-text: #263247;
      --cc-muted: #8490a2;
      --cc-line: rgba(125, 142, 170, .2);
      --cc-surface: #f7f8fb;
      --cc-shadow: 0 8px 24px rgba(37, 54, 88, .07), 0 2px 5px rgba(37, 54, 88, .04);
      max-width: 820px;
      margin: 3rem auto;
      color: var(--cc-text);
      font: inherit;
      line-height: 1.6;
      isolation: isolate;
    }
    .cf-comments * { box-sizing: border-box; }
    .cc-panel {
      overflow: hidden;
      border: 1px solid rgba(255,255,255,.92);
      border-radius: 16px;
      background: linear-gradient(155deg, #fff 0%, #f8f9fc 58%, #f1f3f8 100%);
      box-shadow: var(--cc-shadow), inset 0 1px 0 rgba(255,255,255,.95);
    }
    .cc-heading {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      padding: 1.2rem 1.35rem;
      border-bottom: 1px solid var(--cc-line);
      background: linear-gradient(180deg, rgba(255,255,255,.9), rgba(247,248,251,.72));
    }
    .cc-title { margin: 0; font-size: 1.25rem; font-weight: 720; letter-spacing: -.025em; }
    .cc-tools { display: flex; align-items: center; gap: .65rem; }
    .cc-count { color: var(--cc-muted); font-size: .82rem; white-space: nowrap; }
    .cc-tool {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: .4rem;
      min-height: 34px;
      padding: .38rem .65rem;
      border: 1px solid #e0e5ee;
      border-radius: 7px;
      background: linear-gradient(180deg, #fff, #f1f3f7);
      color: #5f6c81;
      font: inherit;
      font-size: .82rem;
      cursor: pointer;
      box-shadow: 0 2px 4px rgba(30,45,70,.07), inset 0 1px 0 #fff;
      transition: transform .16s ease, box-shadow .16s ease, border-color .16s ease, color .16s ease;
    }
    .cc-tool:hover:not(:disabled) {
      transform: translateY(-1px);
      border-color: #cbd4e4;
      color: var(--cc-accent-strong);
      box-shadow: 0 4px 9px rgba(30,45,70,.1), inset 0 1px 0 #fff;
    }
    .cc-tool:active:not(:disabled) { transform: translateY(0); box-shadow: inset 0 2px 4px rgba(30,45,70,.1); }
    .cc-tool:disabled { opacity: .58; cursor: wait; }
    .cc-refresh-icon { width: 14px; height: 14px; transition: transform .35s ease; }
    .cc-refreshing .cc-refresh-icon { transform: rotate(180deg); }

    .cc-list { padding: .25rem 1.35rem; }
    .cc-card { padding: 1.15rem 0; border-bottom: 1px solid var(--cc-line); animation: cc-enter .24s ease both; }
    .cc-card:last-child { border-bottom: 0; }
    .cc-meta { display: flex; align-items: center; gap: .65rem; margin-bottom: .6rem; }
    .cc-avatar {
      display: grid;
      place-items: center;
      flex: none;
      width: 36px;
      height: 36px;
      border: 1px solid rgba(255,255,255,.7);
      border-radius: 11px;
      color: #fff;
      font-size: .88rem;
      font-weight: 700;
      box-shadow: inset 0 1px 1px rgba(255,255,255,.42), 0 3px 7px rgba(32,48,75,.16);
    }
    .cc-author { display: grid; gap: .08rem; min-width: 0; }
    .cc-name { color: inherit; font-size: .93rem; font-weight: 680; text-decoration: none; }
    .cc-name[href]:hover { color: var(--cc-accent-strong); text-decoration: underline; text-underline-offset: 3px; }
    .cc-time { color: var(--cc-muted); font-size: .76rem; }
    .cc-content { padding-left: 46px; font-size: .95rem; line-height: 1.8; overflow-wrap: anywhere; }
    .cc-content > :first-child { margin-top: 0; }
    .cc-content > :last-child { margin-bottom: 0; }
    .cc-content p { margin: .5em 0; }
    .cc-content h1, .cc-content h2, .cc-content h3, .cc-content h4 { margin: .9em 0 .45em; line-height: 1.35; }
    .cc-content h1 { font-size: 1.35em; }
    .cc-content h2 { font-size: 1.2em; }
    .cc-content h3, .cc-content h4 { font-size: 1.05em; }
    .cc-content a { color: var(--cc-accent-strong); text-decoration: underline; text-underline-offset: 2px; }
    .cc-content blockquote { margin: .6em 0; padding: .1em .9em; border-left: 3px solid #d5dbea; color: #69758a; }
    .cc-content ul, .cc-content ol { margin: .5em 0; padding-left: 1.5em; }
    .cc-content pre { overflow: auto; padding: .85rem 1rem; border: 1px solid #e6e9ef; border-radius: 7px; background: #f0f2f6; font-size: .87em; line-height: 1.6; }
    .cc-content code { padding: .12em .32em; border: 1px solid rgba(30,45,70,.04); border-radius: 4px; background: #eef0f5; font-size: .9em; }
    .cc-content pre code { padding: 0; border: 0; background: none; }
    .cc-content hr { margin: 1em 0; border: 0; border-top: 1px solid var(--cc-line); }
    .cc-reply-actions { margin: .25rem 0 0 46px; }
    .cc-reply-button { min-height: 29px; padding: .25rem .55rem; background: linear-gradient(180deg, #fff, #f4f6f9); font-size: .78rem; }
    .cc-replies {
      margin: .8rem 0 0 46px;
      padding: .15rem 0 .15rem 1rem;
      border-left: 2px solid #dce3f0;
      border-radius: 0 10px 10px 0;
      background: linear-gradient(90deg, rgba(235,239,247,.58), rgba(247,248,251,0));
    }
    .cc-reply { padding: .75rem .7rem .75rem 0; }
    .cc-reply + .cc-reply { border-top: 1px solid rgba(125,142,170,.13); }
    .cc-reply .cc-avatar { width: 30px; height: 30px; border-radius: 9px; font-size: .76rem; }
    .cc-reply .cc-content { padding-left: 40px; font-size: .91rem; }
    .cc-empty, .cc-error { margin: 0; padding: 1.2rem 0; color: var(--cc-muted); font-size: .9rem; }
    .cc-error { color: #bd4d58; }

    .cc-form-wrap { padding: 1.1rem 1.35rem 1.35rem; border-top: 1px solid var(--cc-line); background: linear-gradient(180deg, #f5f6fa, #f9fafd); }
    .cc-form-title { margin: 0 0 .75rem; font-size: .96rem; font-weight: 700; }
    .cc-form { display: grid; gap: .65rem; }
    .cc-fields { display: grid; grid-template-columns: 1fr 1fr; gap: .65rem; }
    .cc-form input, .cc-form textarea {
      width: 100%;
      padding: .72rem .8rem;
      border: 1px solid #dce2eb;
      border-radius: 8px;
      outline: none;
      background: linear-gradient(180deg, #f4f6f9, #fff 55%);
      color: inherit;
      font: inherit;
      font-size: .9rem;
      box-shadow: inset 0 2px 4px rgba(35,50,75,.055), 0 1px 0 rgba(255,255,255,.9);
      transition: border-color .16s ease, box-shadow .16s ease, background .16s ease;
    }
    .cc-form input::placeholder, .cc-form textarea::placeholder { color: #9aa4b4; }
    .cc-form input:hover, .cc-form textarea:hover { border-color: #c4cede; }
    .cc-form input:focus, .cc-form textarea:focus {
      border-color: #8ca1ef;
      background: #fff;
      box-shadow: inset 0 1px 2px rgba(35,50,75,.035), 0 0 0 3px rgba(85,117,237,.12);
    }
    .cc-form textarea { min-height: 118px; resize: vertical; line-height: 1.65; }
    .cc-form textarea[hidden], .cc-preview[hidden] { display: none; }
    .cc-preview {
      min-height: 118px;
      padding: .72rem .8rem;
      border: 1px solid #dce2eb;
      border-radius: 8px;
      background: linear-gradient(180deg, #f4f6f9, #fff 45%);
      line-height: 1.7;
      overflow-wrap: anywhere;
      box-shadow: inset 0 2px 4px rgba(35,50,75,.045);
    }
    .cc-preview:empty::before { content: "预览内容会显示在这里"; color: #9aa4b4; }
    .cc-preview h1, .cc-preview h2, .cc-preview h3 { line-height: 1.35; }
    .cc-preview pre { overflow: auto; padding: .75rem; border-radius: 6px; background: #f0f2f6; }
    .cc-preview code { padding: .12em .3em; border-radius: 4px; background: #eef0f5; }
    .cc-preview pre code { padding: 0; background: none; }
    .cc-preview blockquote { margin: .5em 0; padding-left: .8em; border-left: 3px solid #d5dbea; color: #69758a; }
    .cc-preview a { color: var(--cc-accent-strong); }
    .cc-preview ul, .cc-preview ol { padding-left: 1.5em; }
    .cc-hint { margin: 0; color: var(--cc-muted); font-size: .78rem; }
    .cc-actions { display: flex; align-items: center; gap: .65rem; flex-wrap: wrap; }
    .cc-submit {
      min-height: 38px;
      padding: .55rem .95rem;
      border: 1px solid #4968d7;
      border-radius: 8px;
      background: linear-gradient(180deg, #6c88f5 0%, #5575ed 52%, #4969df 100%);
      color: #fff;
      font: inherit;
      font-size: .88rem;
      font-weight: 650;
      cursor: pointer;
      box-shadow: 0 3px 7px rgba(51,78,170,.2), inset 0 1px 0 rgba(255,255,255,.4), inset 0 -1px 0 rgba(36,59,145,.16);
      transition: transform .16s ease, filter .16s ease, box-shadow .16s ease;
    }
    .cc-submit:hover:not(:disabled) { transform: translateY(-1px); filter: brightness(1.035); box-shadow: 0 5px 11px rgba(51,78,170,.24), inset 0 1px 0 rgba(255,255,255,.42); }
    .cc-submit:active:not(:disabled) { transform: translateY(1px); box-shadow: inset 0 2px 4px rgba(35,55,130,.32); }
    .cc-submit:disabled { opacity: .62; cursor: wait; }
    .cc-status { min-height: 1.3em; color: var(--cc-muted); font-size: .82rem; }
    .cc-status[data-state="error"] { color: #bd4d58; }
    .cc-reply-form {
      margin: .65rem 0 .25rem 46px;
      padding: .9rem;
      border: 1px solid #e0e5ee;
      border-radius: 10px;
      background: linear-gradient(145deg, #fff, #f5f7fb);
      box-shadow: 0 4px 12px rgba(37,54,88,.07), inset 0 1px 0 #fff;
      animation: cc-enter .18s ease both;
    }
    .cc-reply-label { margin: 0; color: var(--cc-muted); font-size: .8rem; }
    .cc-reply-form textarea { min-height: 82px; }
    .cc-hp { position: absolute !important; left: -10000px !important; width: 1px !important; height: 1px !important; overflow: hidden !important; }
    @keyframes cc-enter { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
    @media (max-width: 560px) {
      .cc-panel { border-radius: 12px; }
      .cc-heading { padding: 1rem; }
      .cc-list { padding: .2rem 1rem; }
      .cc-form-wrap { padding: 1rem; }
      .cc-fields, .cc-reply-form .cc-fields { grid-template-columns: 1fr; }
      .cc-content { padding-left: 0; }
      .cc-reply-actions { margin-left: 0; }
      .cc-replies { margin-left: .5rem; padding-left: .65rem; }
      .cc-reply .cc-content { padding-left: 0; }
      .cc-reply-form { margin-left: 0; }
      .cc-heading { align-items: flex-start; }
    }
    @media (prefers-reduced-motion: reduce) {
      .cf-comments *, .cf-comments *::before, .cf-comments *::after { animation-duration: .01ms !important; transition-duration: .01ms !important; scroll-behavior: auto !important; }
    }
  `;

  // ── Component markup: edit labels and element order here ──
  const MARKUP = `
    <div class="cc-panel">
      <header class="cc-heading">
        <h3 class="cc-title">评论</h3>
        <div class="cc-tools">
          <span class="cc-count" aria-live="polite"></span>
          <button class="cc-tool cc-refresh" type="button" aria-label="刷新" title="刷新">
            <svg class="cc-refresh-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M13.2 6A5.5 5.5 0 0 0 3 4.1L1.8 5.4M1.8 5.4V2.8m0 2.6h2.7M2.8 10A5.5 5.5 0 0 0 13 11.9l1.2-1.3m0 0v2.6m0-2.6h-2.7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <span>刷新</span>
          </button>
        </div>
      </header>
      <div class="cc-list" aria-live="polite"></div>
      <div class="cc-form-wrap">
        <form class="cc-form cc-main-form">
          <div class="cc-fields">
            <input name="nickname" maxlength="40" placeholder="昵称（选填）" autocomplete="nickname" aria-label="昵称（选填）">
            <input name="website" type="url" maxlength="200" placeholder="网址（选填）" autocomplete="url" aria-label="网址（选填）">
          </div>
          <label class="cc-hp" aria-hidden="true">Website<input name="website_honeypot" tabindex="-1" autocomplete="off"></label>
          <textarea class="cc-input" name="content" maxlength="3000" required placeholder="支持 Markdown…" aria-label="评论内容"></textarea>
          <div class="cc-preview" hidden aria-label="Markdown 预览"></div>
          <div class="cc-actions">
            <button class="cc-submit" type="submit"><span class="cc-button-label">评论</span></button>
            <button class="cc-tool cc-preview-toggle" type="button">预览</button>
            <span class="cc-status" role="status" aria-live="polite"></span>
          </div>
        </form>
      </div>
    </div>
  `;

  const root = document.createElement("section");
  root.className = "cf-comments";
  const style = document.createElement("style");
  style.textContent = STYLES;
  root.append(style);
  root.insertAdjacentHTML("beforeend", MARKUP);
  (script?.parentNode || document.body).insertBefore(root, script?.nextSibling || null);

  const pagePath = window.location.pathname.replace(/\/$/, "") || "/";
  const list = root.querySelector(".cc-list");
  const status = root.querySelector(".cc-main-form .cc-status");
  const count = root.querySelector(".cc-count");
  const refreshButton = root.querySelector(".cc-refresh");
  const mainForm = root.querySelector(".cc-main-form");
  const mainSubmitButton = mainForm.querySelector(".cc-submit");
  const buttonLabel = root.querySelector(".cc-button-label");
  const input = root.querySelector(".cc-input");
  const preview = root.querySelector(".cc-preview");
  const previewToggle = root.querySelector(".cc-preview-toggle");
  const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));

  // ── Safe Markdown renderer ──
  function inlineMarkdown(value) {
    const tokens = [];
    const save = (html) => {
      const marker = `\u0000${tokens.length}\u0000`;
      tokens.push(html);
      return marker;
    };
    let text = String(value);
    text = text.replace(/`([^`\n]+)`/g, (_, code) => save(`<code>${escapeHtml(code)}</code>`));
    text = text.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)(?:\s+"([^"]*)")?\)/g, (match, label, href, title) => {
      try {
        const url = new URL(href);
        if (!["http:", "https:"].includes(url.protocol)) return match;
        return save(`<a href="${escapeHtml(url.href)}"${title ? ` title="${escapeHtml(title)}"` : ""} target="_blank" rel="noopener noreferrer nofollow">${escapeHtml(label)}</a>`);
      } catch {
        return match;
      }
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
    const flushParagraph = () => {
      if (paragraph.length) {
        blocks.push(`<p>${inlineMarkdown(paragraph.join("\n"))}</p>`);
        paragraph = [];
      }
    };

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
      if (heading) {
        flushParagraph();
        const level = heading[1].length;
        blocks.push(`<h${level}>${inlineMarkdown(heading[2])}</h${level}>`);
        i++;
        continue;
      }
      if (/^\s{0,3}(---+|___+|\*\s*\*\s*\*+)\s*$/.test(line)) {
        flushParagraph();
        blocks.push("<hr>");
        i++;
        continue;
      }
      if (/^\s*>/.test(line)) {
        flushParagraph();
        const quote = [];
        while (i < lines.length && /^\s*>/.test(lines[i])) quote.push(lines[i++].replace(/^\s*>\s?/, ""));
        blocks.push(`<blockquote>${renderMarkdown(quote.join("\n"))}</blockquote>`);
        continue;
      }
      const unordered = line.match(/^\s*[-+*]\s+(.+)$/);
      const ordered = line.match(/^\s*\d+[.)]\s+(.+)$/);
      if (unordered || ordered) {
        flushParagraph();
        const isOrdered = Boolean(ordered);
        const items = [];
        while (i < lines.length) {
          const item = lines[i].match(isOrdered ? /^\s*\d+[.)]\s+(.+)$/ : /^\s*[-+*]\s+(.+)$/);
          if (!item) break;
          items.push(`<li>${inlineMarkdown(item[1])}</li>`);
          i++;
        }
        blocks.push(`<${isOrdered ? "ol" : "ul"}>${items.join("")}</${isOrdered ? "ol" : "ul"}>`);
        continue;
      }
      if (!line.trim()) {
        flushParagraph();
        i++;
        continue;
      }
      paragraph.push(line);
      i++;
    }
    flushParagraph();
    return blocks.join("");
  }

  const avatarColors = ["#5575ed", "#0f8b8d", "#d94f83", "#8161bd", "#d57b32", "#4386c2", "#73953f", "#d66c54"];
  function avatarColor(name) {
    let hash = 0;
    for (const char of name) hash = (hash * 31 + char.codePointAt(0)) | 0;
    return avatarColors[Math.abs(hash) % avatarColors.length];
  }
  function safeUrl(value) {
    try {
      const url = new URL(value);
      return ["http:", "https:"].includes(url.protocol) ? url.href : "";
    } catch {
      return "";
    }
  }
  const formatDate = (time) => new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(time));

  // ── Comment templates: edit these small functions to customize comment markup ──
  function commentMarkup(comment, isReply = false) {
    const nickname = comment.nickname || "匿名";
    const website = safeUrl(comment.website || "");
    const initial = [...nickname][0] || "?";
    const author = website
      ? `<a class="cc-name" href="${escapeHtml(website)}" target="_blank" rel="noopener noreferrer nofollow">${escapeHtml(nickname)}</a>`
      : `<span class="cc-name">${escapeHtml(nickname)}</span>`;
    const id = Number(comment.id);
    return `
      <article class="${isReply ? "cc-reply" : "cc-card"}" data-comment-id="${id}">
        <div class="cc-meta">
          <span class="cc-avatar" style="background:${avatarColor(nickname)}" aria-hidden="true">${escapeHtml(initial)}</span>
          <span class="cc-author">${author}<time class="cc-time" datetime="${new Date(comment.created_at).toISOString()}">${formatDate(comment.created_at)}</time></span>
        </div>
        <div class="cc-content">${renderMarkdown(comment.content)}</div>
        ${isReply ? "" : `<div class="cc-reply-actions"><button class="cc-tool cc-reply-button" type="button" data-reply-to="${id}">回复</button></div><div class="cc-reply-slot"></div>`}
      </article>
    `;
  }

  function render(comments) {
    const roots = comments.filter((comment) => comment.parent_id == null);
    const replies = new Map();
    for (const comment of comments) {
      if (comment.parent_id != null) {
        const key = String(comment.parent_id);
        if (!replies.has(key)) replies.set(key, []);
        replies.get(key).push(comment);
      }
    }
    const replyCount = comments.length - roots.length;
    count.textContent = `${roots.length} 条评论${replyCount ? ` · ${replyCount} 条回复` : ""}`;
    if (!roots.length) {
      list.innerHTML = '<p class="cc-empty">还没有评论，来留下第一条吧。</p>';
      return;
    }
    list.innerHTML = roots.map((comment) => {
      const children = replies.get(String(comment.id)) || [];
      const replyMarkup = children.length
        ? `<div class="cc-replies" aria-label="回复">${children.map((reply) => commentMarkup(reply, true)).join("")}</div>`
        : "";
      return commentMarkup(comment).replace('<div class="cc-reply-slot"></div>', `${replyMarkup}<div class="cc-reply-slot"></div>`);
    }).join("");
  }

  // ── API and interaction handlers ──
  async function load() {
    refreshButton.disabled = true;
    refreshButton.classList.add("cc-refreshing");
    try {
      const response = await fetch(`${api}/api/comments?path=${encodeURIComponent(pagePath)}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "加载评论失败");
      render(data.comments || []);
    } catch (error) {
      list.innerHTML = `<p class="cc-error">${escapeHtml(error.message)}</p>`;
    } finally {
      refreshButton.disabled = false;
      refreshButton.classList.remove("cc-refreshing");
    }
  }

  function createReplyForm(parentId, nickname) {
    const form = document.createElement("form");
    form.className = "cc-form cc-reply-form";
    form.dataset.parentId = String(parentId);
    form.innerHTML = `
      <p class="cc-reply-label">回复 ${escapeHtml(nickname)}</p>
      <div class="cc-fields">
        <input name="nickname" maxlength="40" placeholder="昵称（选填）" autocomplete="nickname">
        <input name="website" type="url" maxlength="200" placeholder="网址（选填）" autocomplete="url">
      </div>
      <label class="cc-hp" aria-hidden="true">Website<input name="website_honeypot" tabindex="-1" autocomplete="off"></label>
      <textarea name="content" maxlength="3000" required placeholder="回复…"></textarea>
      <div class="cc-actions">
        <button class="cc-submit" type="submit">评论</button>
        <button class="cc-tool cc-cancel-reply" type="button">取消</button>
        <span class="cc-status" role="status" aria-live="polite"></span>
      </div>
    `;
    return form;
  }

  async function submitComment(form, parentId = null) {
    const button = form.querySelector(".cc-submit");
    const formStatus = form.querySelector(".cc-status");
    const values = new FormData(form);
    button.disabled = true;
    if (formStatus) {
      formStatus.dataset.state = "";
      formStatus.textContent = "正在发布…";
    }
    if (parentId === null) {
      buttonLabel.textContent = "正在发布…";
      status.dataset.state = "";
      status.textContent = "正在提交…";
    }
    try {
      const response = await fetch(`${api}/api/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: pagePath,
          nickname: values.get("nickname"),
          website: values.get("website"),
          content: values.get("content"),
          website_honeypot: values.get("website_honeypot"),
          parent_id: parentId,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "提交失败");
      if (parentId !== null) {
        status.dataset.state = "";
        status.textContent = "回复已发布";
      } else {
        form.reset();
        preview.innerHTML = "";
        preview.hidden = true;
        input.hidden = false;
        previewToggle.textContent = "预览";
        status.textContent = "发布成功！";
      }
      await load();
    } catch (error) {
      const target = parentId === null ? status : formStatus;
      target.dataset.state = "error";
      target.textContent = error.message;
    } finally {
      button.disabled = false;
      if (parentId === null) buttonLabel.textContent = "评论";
    }
  }

  refreshButton.addEventListener("click", load);
  previewToggle.addEventListener("click", () => {
    if (!preview.hidden) {
      preview.hidden = true;
      input.hidden = false;
      previewToggle.textContent = "预览";
      input.focus();
      return;
    }
    preview.innerHTML = renderMarkdown(input.value);
    preview.hidden = false;
    input.hidden = true;
    previewToggle.textContent = "继续编辑";
  });

  list.addEventListener("click", (event) => {
    const replyButton = event.target.closest("[data-reply-to]");
    if (replyButton) {
      const comment = replyButton.closest("[data-comment-id]");
      const slot = comment?.querySelector(".cc-reply-slot");
      if (!slot) return;
      if (slot.querySelector(".cc-reply-form")) {
        slot.replaceChildren();
        return;
      }
      root.querySelectorAll(".cc-reply-form").forEach((form) => form.remove());
      const name = comment.querySelector(".cc-name")?.textContent || "这条评论";
      const form = createReplyForm(Number(replyButton.dataset.replyTo), name);
      slot.append(form);
      form.querySelector("textarea")?.focus();
      return;
    }
    if (event.target.closest(".cc-cancel-reply")) event.target.closest(".cc-reply-form")?.remove();
  });

  list.addEventListener("submit", async (event) => {
    const form = event.target.closest(".cc-reply-form");
    if (!form) return;
    event.preventDefault();
    await submitComment(form, Number(form.dataset.parentId));
  });
  mainForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    await submitComment(mainForm);
  });

  load();
})();
