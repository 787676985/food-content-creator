# 美食内容创作平台 - Dockerfile
# 多阶段构建，优化镜像大小

# 阶段1: 依赖安装
FROM node:20-alpine AS deps
WORKDIR /app

# 安装bun
RUN npm install -g bun

# 复制package文件
COPY package.json bun.lock ./

# 安装依赖
RUN bun install --frozen-lockfile

# 阶段2: 构建应用
FROM node:20-alpine AS builder
WORKDIR /app

# 安装bun
RUN npm install -g bun

# 复制依赖
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 设置环境变量
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# 构建应用
RUN bun run build

# 阶段3: 生产环境
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# 创建非root用户
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 复制构建产物
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# 设置权限
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

# 启动应用
CMD ["node", "server.js"]
