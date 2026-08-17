#!/bin/bash
# ============================================
# 麦子学厨 - 后端同步部署脚本
# 直接部署到服务器，不经过 GitHub Actions
# ============================================

set -e

# ======================== 配置 ========================
SERVER_HOST="${SERVER_HOST:-120.48.13.152}"
SERVER_USER="${SERVER_USER:-root}"
SERVER_DIR="/var/www/Maozi-Study-Cook"
SSH_KEY="${SSH_KEY:-$HOME/.ssh/maozi_deploy}"
LOCAL_DIR="$(cd "$(dirname "$0")/../.." && pwd)"

# SSH 选项
SSH_OPTS="-i $SSH_KEY -o StrictHostKeyChecking=no -o ConnectTimeout=10"

# ======================== 颜色 ========================
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# ======================== 函数 ========================
log() { echo -e "${GREEN}[✓]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
error() { echo -e "${RED}[✗]${NC} $1"; exit 1; }

# ======================== 开始 ========================
echo "=========================================="
echo "🚀 麦子学厨 - 后端同步部署"
echo "=========================================="
echo "  服务器: $SERVER_HOST"
echo "  目录:   $SERVER_DIR"
echo "=========================================="

# 1. 检查 SSH 密钥
if [ ! -f "$SSH_KEY" ]; then
  error "SSH 密钥不存在: $SSH_KEY"
fi
log "SSH 密钥就绪"

# 2. 测试 SSH 连接
echo ""
echo "📡 测试 SSH 连接..."
if ssh $SSH_OPTS $SERVER_USER@$SERVER_HOST "echo 'SSH OK'" 2>/dev/null; then
  log "SSH 连接成功"
else
  error "SSH 连接失败，请检查密钥和服务器"
fi

# 3. 检查服务器环境
echo ""
echo "🔍 检查服务器环境..."
ssh $SSH_OPTS $SERVER_USER@$SERVER_HOST bash << 'REMOTE'
  # 检查必要工具
  command -v git >/dev/null || { echo "❌ 未安装 git"; exit 1; }
  command -v node >/dev/null || { echo "❌ 未安装 Node.js"; exit 1; }
  command -v npm >/dev/null || { echo "❌ 未安装 npm"; exit 1; }
  command -v pm2 >/dev/null || { echo "⚠️  未安装 PM2，将使用 npm 启动"; }
  
  echo "  ✅ Node.js: $(node -v)"
  echo "  ✅ npm: $(npm -v)"
  echo "  ✅ Git: $(git --version | awk '{print $3}')"
REMOTE
log "服务器环境检查通过"

# 4. 同步代码
echo ""
echo "📤 同步代码到服务器..."
if ssh $SSH_OPTS $SERVER_USER@$SERVER_HOST "[ -d '$SERVER_DIR/.git' ]"; then
  # 已有仓库，拉取更新
  log "仓库已存在，拉取更新..."
  ssh $SSH_OPTS $SERVER_USER@$SERVER_HOST "cd $SERVER_DIR && git pull origin main"
else
  # 首次克隆
  log "首次部署，克隆仓库..."
  ssh $SSH_OPTS $SERVER_USER@$SERVER_HOST "git clone https://github.com/liuxue5213/Maozi-Study-Cook.git $SERVER_DIR"
fi
log "代码同步完成"

# 5. 安装依赖 + 构建 + 重启
echo ""
echo "🔨 安装依赖 + 构建 + 重启服务..."
ssh $SSH_OPTS $SERVER_USER@$SERVER_HOST bash << REMOTE
  set -e
  cd $SERVER_DIR/backend

  # 安装依赖（需要 dev 依赖来构建）
  echo "  📦 安装依赖..."
  npm ci

  # 数据库迁移
  echo "  🗄️  数据库迁移..."
  npx prisma migrate deploy 2>/dev/null || echo "  ⚠️  迁移跳过（可能已最新）"

  # 构建
  echo "  🔨 构建..."
  node_modules/.bin/nest build

  # 重启服务
  echo "  🔄 重启服务..."
  if command -v pm2 >/dev/null; then
    pm2 restart maozi-api --update-env 2>/dev/null || pm2 start dist/src/main.js --name maozi-api
    pm2 save
  else
    # 无 PM2，先杀旧进程再启动
    pkill -f "node dist/src/main.js" 2>/dev/null || true
    nohup node dist/src/main.js > /tmp/maozi-api.log 2>&1 &
    echo "  ✅ 服务已启动 (PID: $!)"
  fi

  echo ""
  echo "  ✅ 部署完成！"
REMOTE

# 6. 验证服务
echo ""
echo "✅ 验证服务状态..."
sleep 3
if ssh $SSH_OPTS $SERVER_USER@$SERVER_HOST "curl -s -o /dev/null -w '%{http_code}' http://localhost:60135/api/cuisines" 2>/dev/null | grep -q "200"; then
  log "服务运行正常！"
else
  warn "服务可能未启动，请手动检查"
fi

# ======================== 完成 ========================
echo ""
echo "=========================================="
echo "🎉 部署完成！"
echo "=========================================="
echo "  🌐 API: http://$SERVER_HOST:60135/api"
echo "  📚 文档: http://$SERVER_HOST:60135/api/docs"
echo "=========================================="
