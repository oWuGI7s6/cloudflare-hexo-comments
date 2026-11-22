# Cloudflare Hexo Comments


一个用于 Hexo 博客的轻量评论系统，后端运行于 Cloudflare Workers，评论保存在 Cloudflare D1 数据库

访客无需注册或登录，可选择填写昵称和网址，也可以保持匿名。评论提交后立即公开显示。管理后台支持密码登录、查看评论和删除评论。

## 功能

- 匿名评论或填写昵称、网址
- 昵称留空时显示为“匿名”
- 评论按 Hexo 页面路径独立保存
- 支持安全的常用 Markdown、编辑预览和手动刷新
- 评论内容按纯文本或安全 HTML 展示，不执行原始 HTML
- 管理员密码登录、查看评论、删除评论
- IP 哈希限流：默认每分钟最多提交 8 次
- 支持 Worker 自定义域名和 Hexo 跨域访问

## 目录结构

```text
cloudflare-hexo-comments/
├── public/
│   ├── admin/index.html   管理后台
│   └── widget.js          Hexo 评论组件
├── src/index.js           Workers API
├── migrations/            数据库迁移文件
├── schema.sql             D1 建表文件
├── wrangler.toml          Cloudflare 部署配置
└── package.json
```

## 前置要求

需要准备：

- 一个 Cloudflare 账号
- 一个已启用域名解析的 Hexo 博客，或本地 Hexo 博客
- Node.js 和 npm
- Git 或可直接下载 ZIP 的 GitHub 仓库

检查 Node.js 和 npm：

```bash
node --version
npm --version
```

如果没有 Git，可以在 GitHub 仓库页面选择 **Code → Download ZIP**，解压后在项目目录打开终端。

## 第一部分：下载项目并登录 Cloudflare

克隆仓库：

```bash
git clone https://github.com/oWuGI7s6/cloudflare-hexo-comments.git
cd cloudflare-hexo-comments
npm install
```

登录 Cloudflare：

```bash
npx wrangler login
```

浏览器会打开 Cloudflare 授权页面。登录并授权后，回到终端确认登录状态：

```bash
npx wrangler whoami
```

显示当前账号或邮箱即表示登录成功。若本地是另一个账号，可先执行 `npx wrangler logout`，再重新登录。

## 第二部分：创建 D1 数据库

创建数据库：

```bash
npx wrangler d1 create hexo-comments
```

命令输出中会包含：

```text
database_name = "hexo-comments"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

复制完整的 `database_id`。

打开项目根目录中的 `wrangler.toml`，找到：

```toml
[[d1_databases]]
binding = "DB"
database_name = "hexo-comments"
database_id = "REPLACE_WITH_YOUR_D1_DATABASE_ID"
```

将占位值替换为实际 ID：

```toml
[[d1_databases]]
binding = "DB"
database_name = "hexo-comments"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

不要修改 `binding = "DB"`，否则 `src/index.js` 将无法找到数据库。

可以随时检查数据库是否存在：

```bash
npx wrangler d1 list
```

## 第三部分：初始化数据库表

远端数据库创建：

```bash
npm run db:init:remote
```

等价于：

```bash
npx wrangler d1 execute hexo-comments --remote --file=./schema.sql
```

如果是第一次部署，执行一次即可。成功后会显示 SQL 执行结果。

如果数据库曾经使用过旧版本，并且已有 `comments` 表，但未包含 `website` 字段，只执行一次迁移：

```bash
npx wrangler d1 execute hexo-comments --remote --file=./migrations/0002_add_website.sql
```

迁移只用于新增网址字段，不会删除旧评论。不要重复执行迁移；如果 D1 已���提示 `duplicate column name: website`，说明迁移已经完成，不是部署错误。

## 第四部分：设置管理密码和安全密钥

分别执行：

```bash
npx wrangler secret put ADMIN_PASSWORD
npx wrangler secret put ADMIN_SECRET
npx wrangler secret put RATE_LIMIT_SALT
```

每条命令执行后会提示输入值。

### ADMIN_PASSWORD

管理员登录后台使用的密码。

建议：

- 至少 12 位
- 不使用博客管理面板的相同密码
- 不要提交到 Git 或写进 `wrangler.toml`

### ADMIN_SECRET

用于签名管理员登录会话的随机密钥。不要使用与密码相同的值。

### RATE_LIMIT_SALT

用于将访客 IP 哈希化、实现评论限流的随机盐值。

生成随机密钥：

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

分别运行两次，得到两个不同的值，分别用于 `ADMIN_SECRET` 和 `RATE_LIMIT_SALT`。不要把随机值发给别人或提交到仓库。

查看已设置的密钥名称：

```bash
npx wrangler secret list
```

密钥值不会显示在该列表中。忘记管理员密码时，重新运行：

```bash
npx wrangler secret put ADMIN_PASSWORD
```

## 第五部分：配置允许访问的博客域名

打开 `wrangler.toml`：

```toml
ALLOWED_ORIGINS = ""
```

填入博客浏览器地址栏中的完整来源，即协议加域名，不包含文章路径。

例如：

```toml
ALLOWED_ORIGINS = "https://owugi7s6.netlify.app"
```

如果博客同时使用两个域名，用逗号分隔：

```toml
ALLOWED_ORIGINS = "`https://example.` `com,https://www.example.com`"
```

注意：

- `https://example` `.com` 和 `http://exam`  `ple`  `.com` 不是同一个来源
- `https://example` `.com` 和 `https://www`.`example`.`com` 需要分别填写
- 不要填写文章 URL，如 `https://example`.`com/posts/test/`
- 不要在值末尾保留文章路径或访问路径

空的 `ALLOWED_ORIGINS` 会禁止组件进行跨域评论请求。修改后重新部署。

## 第六部分：部署到 Cloudflare Workers

运行：

```bash
npm run deploy
```

也可以直接运行：

```bash
npx wrangler deploy
```

部署成功后，终端会显示 Worker 地址，类似：

```text
https://cloudflare-hexo-comments.<worker-subdomain`>.workers`.`dev`
```

部署后测试：

```text
Worker地址/widget.js
Worker地址/admin/
```

例如：

```text
https://comment.owugi7s6.dpdns.org/widget.js
https://comment.owugi7s6.dpdns.org/admin/
```

- `/widget.js` 应返回 JavaScript
- `/admin/` 应显示评论管理登录页面
- `/admin/` 使用刚设置的 `ADMIN_PASSWORD` 登录

根路径没有评论页面，直接访问 `https://Worker域名/` 通常是空白或固定资源结果；评论组件应部署到 Hexo 页面。

## 第七部分：绑定自定义域名

使用 `workers`.`dev` 地址可以直接运行，但如果该域名无法访问，可以在 Cloudflare 中绑定自定义域名。

### 绑定方法

1. 打开 Cloudflare 控制台。
2. 进入 **Workers & Pages**。
3. 选择评论系统 Worker。
4. 打开 **Settings / 设置 → Domains & Routes / 域和路由**。
5. 点击 **Add / 添加 → Custom Domain / 自定义域名**。
6. 输入子域名，例如：

```text
comment.owugi7s6.dpdns.org
```

7. 等待 DNS 和证书生效。

域名所对应的 zone 必须由 Cloudflare 管理。绑定后不要再手动将子域名 CNAME 到 `workers`.`dev`，Cloudflare 会自动建立所需路由。

绑定成功后测试：

```text
https://comment.owugi7s6.dpdns.org/widget.js
https://comment.owugi7s6.dpdns.org/admin/
```

## 第八部分：接入 Hexo / Redefine

在目标文章或页面的 Markdown 正文中加入：

```html
<div id="comments"></div>
<script
  src="https://comment.owugi7s6.dpdns.org/widget.js"
  data-api="https://comment.owugi7s6.dpdns.org"
  defer
></script>
```

将地址替换成实际 Worker 或自定义域名。不要保留 `<你的子域>` 或占位符。

组件脚本只需放在需要评论的页面末尾即可。它会读取：

```javascript
window.location.pathname
```

作为文章唯一路径，因此评论会按页面分开保存。

### Redefine 页面模板方法

如果希望评论显示在每篇文章下方，可以把脚本放到适合的 Redefine 文章布局模板中，而不是只放在单独的评论页面。

常见模板位置包括：

```text
themes/redefine/layout/_partial/
themes/redefine/layout/post.ejs
```

具体文件以主题版本为准。

查找包含文章正文的模板位置：

```bash
rg "article-content|post-content|markdown-body" themes/redefine/layout
```

找到文章正文结束位置后，在评论区模板中加入脚本。不要只将脚本放入主题的 `<head>` 注入区，否则组件可能被插入 `<head>` 而不显示在正文中。

### Redefine 的 Swup/Pjax

Redefine 使用 Swup 单页切换时，可保留：

```html
data-swup-reload-script
```

例如：

```html
<div id="comments"></div>
<script
  src="https://comment.owugi7s6.dpdns.org/widget.js"
  data-api="https://comment.owugi7s6.dpdns.org"
  data-swup-reload-script
  defer
></script>
```

如果主题没有启用 Swup，也可以不写该属性。

注意脚本标签不要同时包含无效属性串写法，例如：

```html
data-swup-reload-script type="text/javascript"
```

可以正确保留属性分离：

```html
data-swup-reload-script
  type="text/javascript"
```

但现代浏览器下通常不需要额外填写 `type="text/javascript"`。

### 构建 Hexo

修改 Hexo 页面或模板后执行：

```bash
npx hexo clean
npx hexo generate
npx hexo server
```

本地预览地址通常是：

```text
http://localhost:4000
```

生成到 `public/` 后，再部署 Hexo 的 Netlify、GitHub Pages、Cloudflare Pages 或服务器。

检查构建后的 HTML 是否包含：

```html
<script
  src="https://comment.owugi7s6.dpdns.org/widget.js"
  data-api="https://comment.owugi7s6.dpdns.org"
>
```

如果构建后的 HTML 中没有脚本，说明注入位置或主题模板配置未生效。

## 更新 Worker

仓库更新后：

```bash
cd cloudflare-hexo-comments
git pull
npm install
npm run deploy
```

更新前端组件后，浏览器可能缓存旧脚本；强制刷新：

- Windows：`Ctrl+F5`
- macOS：`Command+Shift+R`

如果只修改了 `wrangler.toml` 中的环境变量，也需要重新部署：

```bash
npm run deploy
```


## 管理评论

打开：

```text
https://评论Worker域名/admin/
```

使用部署时设置的 `ADMIN_PASSWORD` 登录。

管理后台可以：

- 查看评论者昵称和网址
- 查看评论所属页面
- 查看评论时间
- 逐条删除评论
- 分页查看评论

管理后台会话有效期为 7 天，关闭浏览器不一定会立即清除会话；可使用退出登录主动清除。


## 数据安全

- 评论仅保存昵称、网址、正文、页面路径和时间
- 评论正文支持安全格式，不允许直接插入HTML
- 管理密码和密钥只保存在 Cloudflare Secrets 中
- 不要公开分享管理员密码、密钥或数据库备份
- 建议定期导出 D1 数据库作为备份

