#!/bin/bash
# ============================================
# 麦子学厨 - 一键部署脚本
# 用法: bash scripts/deploy.sh "提交信息"
# ============================================

set -e

# 配置
SERVER_HOST="${SERVER_HOST:-120.48.13.152}"
SERVER_USER="${SERVER_USER:-root}"
SERVER_DIR="/var/www/Maozi-Study-Cook"
BRANCH="main"

# 颜色
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'

echo -e "${GREEN}🚀 麦子学厨自动部署${NC}"
echo "=============================================="

# 1. 提交
echo -e "\n${YELLOW}📦 提交本地更改${NC}"
if [ -n "$(git status --porcelain)" ]; then
  COMMIT_MSG="${1:-feat: 自动部署更新}"
  git add -A && git commit -m "$COMMIT_MSG"
  echo "  ✅ 已提交"
else
  echo "  ℹ️  无本地更改"
fi

# 2. 推送
echo -e "\n${YELLOW}📤 推送到 GitHub${NC}"
git push origin "$BRANCH" && echo "  ✅ 推送成功" || { echo -e "${RED}❌ 推送失败${NC}"; exit 1; }

# 3. 服务器部署
echo -e "\n${YELLOW}🖥️  服务器部署${NC}"
ssh "$SERVER_USER@$SERVER_HOST" bash << EOF
  set -e
  cd "$SERVER_DIR"
  echo "  📥 拉取代码..."
  git fetch origin "$BRANCH" && git reset --hard "origin/$BRANCH"

  echo "  📦 安装依赖..."
  (cd backend && npm ci --production && npm run build)
  (cd frontend && npm ci && npm run build:web)

  echo "  🔄 重启服务..."
  pm2 restart maozi-api --update-env || pm2 start backend/dist/main.js --name maozi-api
  sudo nginx -t && sudo systemctl reload nginx
EOF

echo -e "\n${GREEN}==============================================${NC}"
echo -e "${GREEN}🎉 部署完成!${NC}"
echo "  🌐 前端: http://$SERVER_HOST"
echo "  📡 后端: http://$SERVER_HOST:60135"
echo -e "${GREEN}==============================================${NC}"
