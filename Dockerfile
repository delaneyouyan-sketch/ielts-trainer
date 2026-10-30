# ===== 构建阶段：编译前后端产物 =====
FROM node:22-bookworm-slim AS build
WORKDIR /app

# 先安装依赖（利用层缓存）
COPY package.json package-lock.json ./
RUN npm ci --registry=https://registry.npmjs.org

# 安装 Linux 平台的原生绑定（本地 mac 构建用 darwin 包，云上 Linux 构建需要 gnu 包）
RUN npm install --no-save lightningcss-linux-x64-gnu@1.32.0 @rolldown/binding-linux-x64-gnu@1.2.16 --registry=https://registry.npmjs.org

# 前端构建时注入的公开配置（Supabase 的 URL 与匿名 key，非密钥）
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL \
    VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY

# 拷贝源码并构建
COPY . .
RUN npm run build

# ===== 运行阶段：只保留产物与依赖 =====
FROM node:22-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules

EXPOSE 3000
CMD ["node", "dist/server/main.js"]
