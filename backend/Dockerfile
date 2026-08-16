# ============================================
# 麦子学厨 - 后端 Dockerfile
# ============================================

# 构建阶段
FROM node:22-alpine AS builder

WORKDIR /app

# 复制依赖文件
COPY package.json package-lock.json ./

# 安装依赖
RUN npm ci

# 复制源码
COPY . .

# 生成 Prisma Client
RUN npx prisma generate

# 构建
RUN npm run build

# 生产阶段
FROM node:22-alpine AS production

WORKDIR /app

# 只复制生产所需文件
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma

# 创建上传目录
RUN mkdir -p uploads/avatar uploads/post uploads/recipe uploads/temp

# 暴露端口
EXPOSE 3000

# 启动命令
CMD ["node", "dist/main.js"]
