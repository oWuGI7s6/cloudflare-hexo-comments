# Cloudflare Hexo Comments

一个轻量、简洁的 Hexo 评论系统：Cloudflare Workers 提供 API，D1 保存数据，Redefine（或其他 Hexo 主题）通过一段脚本接入。访客无需登录，可匿名或填写昵称、网址直接评论；评论立即公开；后台使用管理员密码登录，可查看并删除评论。

## 功能
- 昵称与网址均可选；昵称留空显示“匿名”。网址只接受 HTTP/HTTPS 链接，并以安全的新标签页链接展示。
- 无访客账号、无审核流程；公开评论会立即显示。
- 管理页：`https://你的Worker域名/admin/`，可查看评论者网址及删除评论。
- 评论内容按纯文本安全展示，不支持 Markdown/HTML。
- 基于 D1 的简单 IP 哈希限流：每分钟最多 8 次提交；不保存原始 IP。不是大型站点级防滥用方案。
- 管理员会话为 HttpOnly、Secure、SameSite=Strict Cookie，有效期 7 天。部署前务必设置强管理员密码和随机签名密钥。

## 部署到 Cloudflare

需要 Node.js/npm、一个 Cloudflare 账号，以及已安装的 Hexo 博客。

1. 克隆并安装依赖：

   ```bash
   git clone https://github.com/oWuGI7s6/cloudflare-hexo-comments.git
   cd cloudflare-hexo-comments
   npm install
   npx wrangler login
   ```

2. 创建 D1 数据库：

   ```bash
   npx wrangler d1 create hexo-comments
   ```

   将命令返回的 `database_id` 填入 `wrangler.toml` 中 `[[d1_databases]]` 的 `database_id`，不要改动绑定名称 `DB`。

3. 创建数据库表：

   ```bash
   npm run db:init:remote
   ```

   如果是**已有部署和现存数据库**升级以支持网址字段，只执行一次：

   ```bash
   npx wrangler d1 execute hexo-comments --remote --file=./migrations/0002_add_website.sql
   ```

   该迁移会为既有评论新增空网址字段，旧评论和数据会保留。不要对同一数据库重复执行；D1 会提示列已存在。

4. 设置后台凭据与 IP 哈希盐。使用强且唯一的值，按提示输入：

   ```bash
   npx wrangler secret put ADMIN_PASSWORD
   npx wrangler secret put ADMIN_SECRET
   npx wrangler secret put RATE_LIMIT_SALT
   ```

   `ADMIN_SECRET` 和 `RATE_LIMIT_SALT` 应为不同的随机秘密值；可用 `openssl rand -base64 32` 生成。不要把秘密写入仓库或 `wrangler.toml`。如果管理员密码遗失，可重新运行 `wrangler secret put ADMIN_PASSWORD`。

5. 在 `wrangler.toml` 的 `ALLOWED_ORIGINS` 中填写 Hexo 网站完整来源（协议+域名，不含路径），多个来源逗号分隔，例如：

   ```toml
   ALLOWED_ORIGINS = "https://example.com,https://www.example.com"
   ```

   如博客有预览域名也可加入。留空时跨域浏览器访问会被阻止；同域 Worker 的管理页仍可用。修改配置后重新部署。

6. 发布：

   ```bash
   npm run deploy
   ```

   Wrangler 会显示 Worker 地址，例如 `https://cloudflare-hexo-comments.<你的子域>.workers.dev`。如果你绑定了自定义域名，以下示例中的地址替换为该域名。部署后打开 `/admin/`，用 `ADMIN_PASSWORD` 登录。

## 接入

将下面代码加入 Redefine 的自定义注入脚本位置（或文章布局模板中需要显示评论的位置）。确认 API 地址替换为上一步部署后的 Worker 地址：

```html
<div id="comments"></div>
<script
  src="https://cloudflare-hexo-comments.<你的子域>.workers.dev/widget.js"
  data-api="https://cloudflare-hexo-comments.<你的子域>.workers.dev"
  defer
></script>
```

如果主题已有评论区配置，优先使用主题的自定义评论组件/自定义脚本注入功能，避免在多个位置重复插入。也可以直接在 Hexo 文章布局模板（常见为 `layout/_partial/...` 或主题提供的自定义布局）中添加。具体位置因 Redefine 版本而异；确保脚本只在文章页加载，并且 `data-api` 与部署地址完全一致。

评论依据 `window.location.pathname` 关联文章。若调整 Hexo 固定链接或文章 URL，旧评论仍绑定原路径，不会自动迁移。

## 本地开发

先创建本地 D1 并设置本地 secrets（`npx wrangler secret put NAME --local`，依 Wrangler 版本而异），然后运行：

```bash
npm run db:init:local
npm run dev
```

本地环境需要配置 `ADMIN_PASSWORD`、`ADMIN_SECRET` 和 `RATE_LIMIT_SALT`；也可直接用 `npx wrangler dev` 并按 Wrangler 本地开发方式设置变量。部署前必须在 Cloudflare 远端 D1 初始化表结构并设置远端 secrets。

## 管理与维护

- 查看评论：后台 `/admin/`。
- 删除评论：后台逐条删除。
- 备份：使用 `wrangler d1 export hexo-comments --remote --output=backup.sql`（以当前 Wrangler CLI 帮助为准）并妥善保管备份文件。
- 管理页面登录只应通过 HTTPS。不要将管理员密码或密钥提交到 Git。
- 若面临大量垃圾评论，可在 Cloudflare 增加 WAF/Turnstile，并考虑迁移到 Durable Objects 实现更严格的全局限流。


