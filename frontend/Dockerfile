# ============================================
# 麦子学厨 - 前端 Web Dockerfile
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

# 构建 Web 版本
RUN npx expo export --platform web

# 生产阶段（Nginx 静态服务）
FROM nginx:alpine AS production

# 复制构建产物
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制 Nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 暴露端口
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
