# mysite_next

一个基于 Next.js 16、React 19 和 SQLite 的个人网站项目，包含首页、博客列表、文章详情、评论区、后台登录、富文本发文和图片上传能力。

## 功能特性

- 首页展示个人站点内容
- 博客列表与文章详情页
- 评论区留言
- 后台登录发布文章
- TipTap 富文本编辑器
- 图片上传并插入正文
- 自动把正文第一张图保存为文章封面
- SQLite 持久化文章与评论
- Docker Compose 卷挂载持久化数据库和上传图片

## 技术栈

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- TipTap
- better-sqlite3
- sanitize-html

## 本地运行

安装依赖：

```bash
npm install
```

启动开发环境：

```bash
npm run dev
```

构建生产版本：

```bash
npm run build
```

启动生产服务：

```bash
npm run start
```

代码检查：

```bash
npm run lint
```

默认访问地址：

```text
http://localhost:3000
```

## 环境变量

建议在根目录创建 `.env.local`：

```env
BLOG_ADMIN_PASSWORD=your-password
BLOG_SESSION_TOKEN=your-custom-session-token
```

- `BLOG_ADMIN_PASSWORD`：后台登录密码，不设置时默认是 `admin`
- `BLOG_SESSION_TOKEN`：登录态 cookie 对应的令牌，不设置时会基于密码自动生成

## 路由说明

- `/`：首页
- `/blog`：博客列表，同时也是登录后的发文入口
- `/blog/[id]`：文章详情页与评论区
- `/login`：后台登录页
- `/admin`：当前重定向到登录页
- `/api/upload`：登录后可用的图片上传接口

## 数据与存储

- SQLite 数据库文件默认保存在 `data/blog.sqlite`
- 上传文件默认保存在 `public/uploads`
- `data/` 和 `public/uploads/` 已加入忽略规则，不会默认提交到 Git
- 使用 Docker Compose 时，`/app/data` 和 `/app/public/uploads` 会通过卷挂载持久化

首次运行时会自动创建以下数据表：

- `posts`
- `comments`
- `commenter_profiles`

## Docker 运行

构建并启动：

```bash
docker compose up -d --build
```

停止服务：

```bash
docker compose down
```

查看日志：

```bash
docker compose logs -f
```

## 项目结构

```text
app/
  admin/
  api/upload/
  blog/
  login/
components/
  nav-links.tsx
  rich-text-editor.tsx
lib/
  auth.ts
  db.ts
public/
  uploads/
Dockerfile
docker-compose.yml
```

## 后台发布流程

1. 打开 `/login`
2. 输入管理员密码
3. 登录成功后进入 `/blog`
4. 使用富文本编辑器发布文章
5. 上传图片后会插入正文，正文第一张图会自动作为文章封面

## 备注

- 当前项目使用本地 SQLite，适合个人站点或轻量内容管理场景
- 评论作者名会根据 IP 自动生成，更适合简单留言场景
- 如果部署到线上，建议务必配置自定义管理员密码和会话令牌
