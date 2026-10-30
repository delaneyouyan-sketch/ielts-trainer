# 雅思逆袭 · 英语自学训练站（独立版）

从妙搭导出的全栈应用，已完成平台解绑改造：登录、数据库、录音存储全部迁移到 Supabase，
部署到任意 Node 托管平台即可独立运行，与飞书 / 妙搭 / 企业账号无关。

## 技术栈

- 前端：React 19 + Vite + Tailwind CSS v4
- 后端：NestJS 10（渲染前端静态页面 + 提供 API）
- 数据库：PostgreSQL（Supabase，drizzle-orm 访问）
- 登录：Supabase Auth（邮箱密码）
- 文件存储：Supabase Storage（口语录音）

## 本地开发

```bash
# 1. 配置环境变量（复制模板并填入 Supabase 信息）
cp .env.example .env

# 2. 安装依赖
npm install

# 3. 启动（前端 5173 + 后端 3000，前端自动代理 /api 到后端）
npm run dev
```

打开 http://localhost:5173 即可（首次访问走登录页，注册新账号）。

## 构建与运行

```bash
npm run build      # 产物输出到 dist/（dist/server + dist/client）
npm start          # 生产运行：node dist/server/main.js，监听 3000
```

## 部署到 Render（免费）

1. 把本项目推送到 GitHub 仓库（注意 `.env` 已被 .gitignore 忽略，密钥不会泄露）。
2. Render 控制台 → New → Web Service → 连接该仓库。
3. 配置：
   - Build Command：`npm install && npm run build`
   - Start Command：`npm start`
   - Node 版本：22
4. 环境变量（Environment）：见下方「环境变量」（Render 会自动注入 `PORT`，与代码默认一致即可，或把 `SERVER_PORT` 设为空让其读 `PORT`）。
5. 部署完成后，打开 Render 分配的 https 网址即可使用。

## 部署后配置（必做）

拿到 Render 网址（形如 `https://xxx.onrender.com`）后，到 Supabase 控制台补两处：

1. **登录回调**：Authentication → URL Configuration → 把 `Site URL` 和 `Redirect URLs` 都填上你的 Render 网址（`https://xxx.onrender.com/**` 用 `**` 通配所有子路径），否则 GitHub 登录和邮箱注册跳转会失败。
2. **（可选）关闭邮箱验证**：Authentication → Sign In / Providers → Email → 关闭 `Confirm email`，注册后即可直接登录，不用收邮件点链接。

## 环境变量

| 变量 | 说明 | 获取位置 |
|---|---|---|
| `SUPABASE_URL` | Supabase 项目地址 | Supabase 控制台 → Project Settings → API |
| `SUPABASE_ANON_KEY` | 匿名公钥（服务端验证登录用） | 同上 |
| `SUPABASE_SERVICE_ROLE_KEY` | 服务端密钥 | 同上（仅服务端使用） |
| `DATABASE_URL` | PostgreSQL 连接串（代码已内置 SSL 连接） | Project Settings → Database → Connection string（直连 URI，5432 端口）或 Session pooler（6543 端口） |
| `VITE_SUPABASE_URL` | 同 `SUPABASE_URL`（Vite 注入前端） | 同上 |
| `VITE_SUPABASE_ANON_KEY` | 同 `SUPABASE_ANON_KEY`（Vite 注入前端） | 同上 |
| `SERVER_HOST` | 监听地址，默认 `0.0.0.0` | 一般不用改 |
| `SERVER_PORT` | 端口，默认 `3000` | Render 会自动注入 `PORT`，若使用该变量需保持一致 |

## 数据库初始化

首次使用前需在 Supabase 数据库里建两张表（在 Supabase SQL Editor 执行）：

```sql
-- 用户学习状态表
create table if not exists trainer_state (
  owner uuid primary key,
  done_lessons jsonb not null default '{}',
  checkins text[] not null default '{}',
  mistakes text[] not null default '{}',
  best_score integer,
  _created_at timestamptz(3) not null default now(),
  _created_by uuid,
  _updated_at timestamptz(3) not null default now(),
  _updated_by uuid
);

-- 口语录音档案表
create table if not exists trainer_recording (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null,
  tag varchar(100) not null,
  task text not null,
  duration integer not null default 0,
  checks text[] not null default '{}',
  audio_url text not null,
  _created_at timestamptz(3) not null default now(),
  _created_by uuid,
  _updated_at timestamptz(3) not null default now(),
  _updated_by uuid
);
create index if not exists idx_trainer_recording_owner_created
  on trainer_recording (owner, _created_at desc);
```

## 录音存储

在 Supabase 控制台 → Storage 创建公开 bucket，名称固定为 `recordings`（代码中写死）：
- Storage → New bucket → 名称 `recordings` → Public bucket（公开读，供回听播放）
