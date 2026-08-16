#!/bin/bash
# ============================================
# AI 识别功能测试脚本
# 使用方法:
#   1. 确保后端已启动 (npm run start:dev)
#   2. 修改下面的 ACCOUNT 和 PASSWORD
#   3. bash scripts/test-ai.sh <图片路径>
# ============================================

BASE_URL="http://localhost:3000"
ACCOUNT="newuser2026"
PASSWORD="Aa<REDACTED>

# 获取 Token
echo "🔑 登录获取 Token..."
TOKEN_RES=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"account\":\"$ACCOUNT\",\"password\":\"$PASSWORD\"}")

TOKEN=$(echo "$TOKEN_RES" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d['data']['accessToken'])" 2>/dev/null)

if [ -z "$TOKEN" ]; then
  echo "❌ 登录失败，请检查账号密码"
  echo "$TOKEN_RES"
  exit 1
fi
echo "✅ 登录成功"

# 测试推荐菜谱
echo ""
echo "🔍 测试推荐菜谱（食材: 豆腐、青椒、猪肉）..."
RECOMMEND_RES=$(curl -s -X POST "$BASE_URL/api/ai/recommend" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"ingredients": ["豆腐", "青椒", "猪肉"]}')
echo "$RECOMMEND_RES" | python3 -m json.tool 2>/dev/null || echo "$RECOMMEND_RES"

# 测试图片识别（如果提供了图片）
if [ -n "$1" ] && [ -f "$1" ]; then
  echo ""
  echo "📸 测试图片识别: $1"

  # 将图片转为 base64
  IMG_BASE64=$(base64 -i "$1" | tr -d '\n')

  # 识别食材
  echo "🥬 识别食材中..."
  RECOGNIZE_RES=$(curl -s -X POST "$BASE_URL/api/ai/recognize-base64" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"image\":\"$IMG_BASE64\",\"type\":\"ingredient\"}")
  echo "$RECOGNIZE_RES" | python3 -m json.tool 2>/dev/null || echo "$RECOGNIZE_RES"
else
  echo ""
  echo "💡 提示: 提供图片路径可测试识别功能"
  echo "   用法: bash scripts/test-ai.sh <图片路径>"
fi

echo ""
echo "✅ 测试完成"
