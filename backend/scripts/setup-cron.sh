#!/bin/bash
# ============================================
# 麦子学厨 - 定时图片生成任务配置脚本
# 在服务器上运行此脚本配置 cron job
# ============================================

echo "🔧 配置菜品图片定时生成任务..."

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
GENERATE_SCRIPT="$PROJECT_DIR/scripts/generate-images.mjs"
LOG_DIR="/var/log/maozi-cook"

# 确保日志目录存在
sudo mkdir -p "$LOG_DIR"
sudo chown "$(whoami)" "$LOG_DIR"

# 确保生成脚本可执行
chmod +x "$GENERATE_SCRIPT"

# 创建 cron 任务（每天凌晨 3:00 执行，每次 100 张）
CRON_JOB="0 3 * * * cd $PROJECT_DIR && /usr/bin/node $GENERATE_SCRIPT --limit 100 >> $LOG_DIR/image-gen.log 2>&1"

# 检查是否已存在
if crontab -l 2>/dev/null | grep -q "generate-images.mjs"; then
  echo "⚠️ 定时任务已存在，跳过配置"
else
  # 添加新任务
  (crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -
  echo "✅ 定时任务已添加"
fi

echo ""
echo "📋 当前 crontab:"
crontab -l 2>/dev/null | grep "generate-images" || echo "  (无)"
echo ""
echo "📝 任务详情:"
echo "  - 执行时间: 每天 03:00"
echo "  - 每次数量: 100 道"
echo "  - 日志位置: $LOG_DIR/image-gen.log"
echo "  - 脚本位置: $GENERATE_SCRIPT"
echo ""
echo "💡 手动测试命令:"
echo "  cd $PROJECT_DIR && node scripts/generate-images.mjs --limit 3"
