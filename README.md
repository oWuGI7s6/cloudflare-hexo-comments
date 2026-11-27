# Cloudflare Hexo Comments

一个用于 Hexo 博客的轻量评论系统，后端运行于 Cloudflare Workers，评论保存在 Cloudflare D1 数据库，兼容 Hexo Redefine 等主题。

访客无需注册或登录，可填写昵称和网址，也可以匿名评论。评论提交后立即公开；访客可在顶层评论下回复。管理后台可使用密码登录、查看并删除评论。

## 功能

- 匿名评论或填写昵称、网址；昵称留空显示“匿名”。
- 按 Hexo 页面路径隔离评论。
- 单层回复：访客可以回复顶层评论，回复本身不继续嵌套，避免线程过深。
- 支持常用安全 Markdown、编辑预览、手动刷新。
- 简洁拟物化控件与缩进回复区；评论正文不执行原始 HTML。
- 管理员密码登录、查看、删除评论；删除顶层评论时会一并删除其回复。
- IP 哈希限流：默认每分钟最多 8 次发布（评论和回复共用额度）。
- 支持 Worker 自定义域名和 Hexo 跨域访问。

## 部署前准备

需要 Cloudflare 账号、Node.js/npm、Git（或下载 ZIP）及一个 Hexo 博客。

```bash
node --version
npm --version
```

## 首次部署

### 1. 下载项目并登录 Cloudflare

```bash
git clone https://github.com/oWuGI7s6/cloudflare-hexo-comments.git
cd cloudflare-hexo-comments
npm install
npx wrangler login
npx wrangler whoami
```

`wrangler login` 会打开浏览器完成授权。`whoami` 用于确认当前登录的 Cloudflare 账号。

### 2. 创建 D1 数据库并配置 ID

```bash
npx wrangler d1 create hexo-comments
```

复制输出中的 `database_id`，填写进 `wrangler.toml`：

```toml
[[d1_databases]]
binding = "DB"
database_name = "hexo-comments"
database_id = "这里填创建结果中的UUID"
```

不要更改 `binding = "DB"`。如果数据库已存在，不要再次创建；可用 `npx wrangler d1 list` 查询 ID，并确认 Wrangler 登录的是拥有该数据库的账号。

### 3. 初始化 D1 表

首次部署：

```bash
npm run db:init:remote
```

这会执行 `schema.sql`，其中已包含网址和回复所需的字段。已有评论数据时，不要重新执行整个 schema 来代替迁移。

### 4. 设置后台凭据与随机密钥

```bash
npx wrangler secret put ADMIN_PASSWORD
npx wrangler secret put ADMIN_SECRET
npx wrangler secret put RATE_LIMIT_SALT
```

每条命令提示输入时填写对应值。可用以下命令生成随机值（分别运行两次，为两个 Secret 使用不同值）：

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

- `ADMIN_PASSWORD`：管理后台登录密码，使用强密码。
- `ADMIN_SECRET`：签名后台会话的随机密钥。
- `RATE_LIMIT_SALT`：IP 哈希限流用随机盐。

这些 Secret 存在 Cloudflare，不写进 `wrangler.toml`、`.dev.vars` 公共仓库或 Hexo 页面。可用 `npx wrangler secret list` 查看已设置的名称（不会显示值）。

### 5. 配置 Hexo 博客来源

在 `wrangler.toml` 的 `[vars]` 部分设置 `ALLOWED_ORIGINS`。填写博客浏览器地址栏的协议和域名，不含路径：

```toml
[vars]
ALLOWED_ORIGINS = "https://your-blog.example"
```

多个博客域名逗号分隔，必须逐个精确匹配协议、主机名及 www 形式，例如：

```toml
ALLOWED_ORIGINS = "https://your-blog.example,https://www.your-blog.example"
```

### 6. 部署 Worker 和静态资源

```bash
npm run deploy
```

成功后 Wrangler 会显示 Worker URL。访问以下路径确认：

```text
https://你的Worker域名/widget.js
https://你的Worker域名/admin/
```

`widget.js` 应返回 JavaScript，`admin/` 应显示后台登录页。Worker 根路径不是博客首页。

## 已有部署升级：添加回复字段

如果现有 D1 数据库已经有 `comments` 和 `website` 字段，**先备份，再只运行一次新迁移**：

```bash
npx wrangler d1 export hexo-comments --remote --output=comments-before-replies.sql
npx wrangler d1 execute hexo-comments --remote --file=./migrations/0003_add_replies.sql
```

然后拉取最新代码并发布 Worker：

```bash
git pull
npm install
npm run deploy
```

`0003_add_replies.sql` 只新增 `parent_id` 列和索引，不删除旧评论。不要重复执行；若提示 `duplicate column name: parent_id`，迁移已应用。若数据库尚未包含 `website` 字段，先执行相应旧迁移 `0002_add_website.sql`，再执行 `0003_add_replies.sql`。

## 绑定自定义域名（可选）

在 Cloudflare 控制台进入 **Workers & Pages → 你的 Worker → Settings → Domains & Routes → Add → Custom Domain**，添加由 Cloudflare DNS 托管的子域名，例如 `comments.example.com`。等待 DNS 与 HTTPS 证书生效后，先测试 `/widget.js` 和 `/admin/`。不要手动将同一主机名 CNAME 到 `workers.dev`。

## 接入 Hexo / Redefine

将下面代码放在希望显示评论的页面正文末尾，或者文章布局的正文后方。替换为实际 Worker/自定义域名：

```html
<div id="comments"></div>
<script
  src="https://comments.example.com/widget.js"
  data-api="https://comments.example.com"
  defer
></script>
```

若 Redefine 启用了 Swup，可给脚本增加 `data-swup-reload-script`：

```html
<script
  src="https://comments.example.com/widget.js"
  data-api="https://comments.example.com"
  data-swup-reload-script
  defer
></script>
```

组件会以 `window.location.pathname` 作为页面标识。若更改 Hexo permalink，原路径下的评论不会自动搬到新路径。

页面/模板修改后本地构建预览：

```bash
npx hexo clean
npx hexo generate
npx hexo server
```

通常打开 `http://localhost:4000`。检查生成后的 `public/.../index.html` 确实包含 widget 脚本标签，并确认 Network 中 widget 和 API 请求成功。

## 本地开发

本地 D1 与远端数据库独立。建立本地表并创建项目根目录 `.dev.vars`：

```bash
npm run db:init:local
```

`.dev.vars` 示例（不要提交）：

```text
ADMIN_PASSWORD=local-test-password
ADMIN_SECRET=local-random-secret
RATE_LIMIT_SALT=local-random-salt
ALLOWED_ORIGINS=http://localhost:4000
```

启动 Worker：

```bash
npm run dev
```

一般访问 `http://localhost:8787/admin/`。在 Hexo 本地页面使用的 API 应指向本地 Worker，并确保允许来源包含 Hexo 实际地址。

## 管理与备份

- 管理后台：`https://你的Worker域名/admin/`。
- 后台可查看、删除评论；删除顶层评论时，其回复也会被删除。
- 每分钟 8 次限额由同一个 IP 哈希计数器供评论和回复共用。
- 定期备份：`npx wrangler d1 export hexo-comments --remote --output=comments-backup.sql`。
- 管理会话使用 HttpOnly、Secure、SameSite=Strict Cookie，有效期 7 天。

## 常见问题

### 部署时报 D1 database_id 无效

确认 `wrangler.toml` 有真实数据库 UUID，而不是占位符；运行 `npx wrangler d1 list` 核对数据库存在，并用 `npx wrangler whoami` 核对账号。

### 评论区空白

确认 `/widget.js` 返回 200；查看浏览器 Console 的 JavaScript 错误；检查 Hexo 构建后的 HTML 包含脚本，并且脚本位于 `<body>` 内容位置而非 `<head>`。更新后强制刷新浏览器缓存（Windows `Ctrl+F5`，macOS `Command+Shift+R`）。

### `Failed to fetch` 或 CORS 错误

确认 `ALLOWED_ORIGINS` 是博客的 Origin（例如 `https://blog.example.com`），不是 API 域名或文章路径；改配置后重新执行 `npm run deploy`。

## 技术栈与许可

Cloudflare Workers、D1、Wrangler、原生 JavaScript 与 Web Crypto API。MIT License。
