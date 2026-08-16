# 部署指南

## 1. 服务器信息

| 项目 | 值 |
|------|-----|
| IP | 120.48.13.152 |
| 系统 | Ubuntu 24.04 LTS |
| CPU | 2 核 |
| 内存 | 1.8 GB |
| 磁盘 | 40 GB（已用 65%） |
| 已安装 | MySQL 8.0, Redis 7.0, Nginx 1.24, Node.js 22, Python 3.12 |

## 2. 端口分配

| 端口 | 服务 | 说明 |
|------|------|------|
| 80 | Nginx | HTTP |
| 443 | Nginx | HTTPS（待配置 SSL） |
| 60135 | NestJS | 后端 API（通过 Nginx 代理） |
| 3306 | MySQL | 数据库 |
| 6379 | Redis | 缓存 |
| 60130 | Expo Dev | 前端开发（生产不暴露） |

## 3. 部署架构

```
用户 → Nginx(:80) → /api/* → NestJS(:60135)
                     → /*   → 前端静态文件
```

## 4. 部署步骤

### 4.1 服务器初始化

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装必要工具
sudo apt install -y curl git wget unzip

# 安装 Node.js 22（已有，跳过）
node -v  # v22.22.0 ✓

# 安装 pnpm
npm install -g pnpm

# 安装 PM2（进程管理）
npm install -g pm2
```

### 4.2 数据库配置

```bash
# 登录 MySQL
mysql -u root -p

# 创建数据库和用户
CREATE DATABASE IF NOT EXISTS maozi_cook DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'maozi'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON maozi_cook.* TO 'maozi'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 4.3 Redis 配置

```bash
# 已有 Redis，配置密码
sudo nano /etc/redis/redis.conf

# 找到并修改：
# requirepass your_redis_password

sudo systemctl restart redis
```

### 4.4 后端部署

```bash
# 克隆代码
cd /var/www
git clone https://github.com/liuxue5213/Maozi-Study-Cook.git
cd Maozi-Study-Cook/backend

# 安装依赖
pnpm install

# 配置环境变量
cp .env.example .env
nano .env  # 填写实际配置

# 数据库迁移
pnpm prisma migrate deploy

# 构建
pnpm run build

# 使用 PM2 启动
pm2 start dist/main.js --name maozi-api

# 设置开机自启
pm2 startup
pm2 save
```

### 4.5 前端 Web 部署

```bash
cd ../frontend

# 安装依赖
pnpm install

# 构建 Web 版本
pnpm expo export:web

# 复制到 Nginx 静态目录
sudo cp -r dist/* /var/www/html/
```

### 4.6 Nginx 配置

```nginx
# /etc/nginx/sites-available/maozi

server {
    listen 80;
    server_name your-domain.com;

    # 前端静态文件
    root /var/www/html;
    index index.html;

    # 前端路由（SPA）
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API 代理
    location /api/ {
        proxy_pass http://127.0.0.1:60135;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # 上传文件
    location /uploads/ {
        alias /var/www/Maozi-Study-Cook/backend/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml;
    gzip_min_length 1000;
}
```

```bash
# 启用站点
sudo ln -s /etc/nginx/sites-available/maozi /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 5. SSL 证书（推荐）

```bash
# 安装 Certbot
sudo apt install -y certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d your-domain.com

# 自动续期（已自动配置）
sudo certbot renew --dry-run
```

## 6. CI/CD 自动化

项目配置了 GitHub Actions，推送代码后自动：
1. 运行 lint 和测试
2. 构建前端和后端
3. SSH 到服务器执行部署脚本

详见 `.github/workflows/deploy.yml`

## 7. 监控与日志

```bash
# 查看 PM2 日志
pm2 logs maozi-api

# 查看 Nginx 访问日志
tail -f /var/log/nginx/access.log

# 查看错误日志
tail -f /var/log/nginx/error.log

# PM2 监控
pm2 monit
```

## 8. 备份策略

```bash
# 数据库备份（每日）
mysqldump -u maozi -p maozi_cook > /backup/maozi_cook_$(date +%Y%m%d).sql

# 可以配置 crontab
crontab -e
# 0 3 * * * mysqldump -u maozi -p'password' maozi_cook > /backup/maozi_cook_$(date +\%Y\%m\%d).sql
```

## 9. 常见问题

| 问题 | 解决方案 |
|------|----------|
| PM2 进程退出 | `pm2 logs` 查看日志，检查 .env 配置 |
| 数据库连接失败 | 检查 MySQL 是否运行：`systemctl status mysql` |
| 端口被占用 | `lsof -i :60135` 查看占用进程 |
| 内存不足 | 添加 Swap 或优化 PM2 配置 |
