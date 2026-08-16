# 🥟 帽子学厨 — 阿里云通义千问 AI 配置指南

## 一、安全说明（重要！）

由于本仓库是 **Public（公开）** 的，**API Key 绝对不能硬编码在代码中**。

| ❌ 危险做法 | ✅ 安全做法 |
|------------|-----------|
| 代码中写死 API Key | 使用 `.env` 环境变量 |
| 提交 `.env` 到 Git | `.env` 已加入 `.gitignore` |
| GitHub Actions 中明文写 Key | 使用 GitHub Repository Secrets |

---

## 二、获取阿里云百炼 API Key

1. 访问 [阿里云百炼控制台](https://bailian.console.aliyun.com/)
2. 开通通义千问服务（有免费额度）
3. 创建 API Key：**我的服务 → API-KEY → 创建新的 API-KEY**
4. 复制 Key（只显示一次！）

---

## 三、本地开发配置

复制 `.env.example` 为 `.env` 并填写：

```bash
cd backend
cp .env.example .env
nano .env  # 编辑配置
```

### AI 相关配置项

```env
# ===== AI 服务（阿里云百炼/通义千问） =====
# 你的阿里云百炼 API Key
AI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# API 地址（默认即可）
AI_BASE_URL=https://dashscope.aliyuncs.com/api/v1

# 视觉模型（用于拍照识别食材/菜品）
AI_VISION_MODEL=qwen-vl-plus

# 文本模型（用于推荐菜谱、生成步骤）
AI_TEXT_MODEL=qwen-plus

# 步骤详情模型（可同上）
AI_DETAIL_MODEL=qwen-plus
```

---

## 四、模型选择指南

| 功能 | 推荐模型 | 价格参考 | 说明 |
|------|---------|---------|------|
| 📸 **拍照识别食材** | `qwen-vl-plus` | ¥0.002/张 | 性价比高，识别准确 |
| 📸 **高清食材识别** | `qwen-vl-max` | ¥0.004/张 | 更精准，适合复杂场景 |
| 🔍 **推荐菜谱** | `qwen-plus` | ¥0.0008/1K tokens | 日常推荐够用 |
| 🔍 **高质量推荐** | `qwen-max` | ¥0.02/1K tokens | 更智能的推荐 |
| 👨‍🍳 **生成步骤** | `qwen-plus` | ¥0.0008/1K tokens | 生成详细烹饪步骤 |
| 💭 **深度思考** | `qwen-plus` + `enable_thinking` | ¥0.0008/1K tokens | 复杂推理 |

### 模型价格（2026年最新）

| 模型 | 输入价格 | 输出价格 | 备注 |
|------|---------|---------|------|
| `qwen-vl-plus` | ¥0.002/张 | - | 视觉理解 |
| `qwen-vl-max` | ¥0.004/张 | - | 视觉理解（更强） |
| `qwen-plus` | ¥0.0008/1K tokens | ¥0.002/1K tokens | 文本生成 |
| `qwen-max` | ¥0.004/1K tokens | ¥0.012/1K tokens | 文本生成（更强） |
| `qwen-turbo` | ¥0.0003/1K tokens | ¥0.0006/1K tokens | 快速低价 |

---

## 五、两种 API 调用方式

### 方式一：原生 DashScope API（当前使用）

```
POST https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation
```

```json
{
  "model": "qwen-vl-plus",
  "input": {
    "messages": [
      {
        "role": "user",
        "content": [
          {"image": "data:image/jpeg;base64,..."},
          {"text": "请识别图片中的食材"}
        ]
      }
    ]
  }
}
```

### 方式二：OpenAI 兼容模式

```
POST https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions
```

```json
{
  "model": "qwen-vl-plus",
  "messages": [
    {
      "role": "user",
      "content": [
        {"type": "image_url", "image_url": {"url": "data:image/jpeg;base64,..."}},
        {"type": "text", "text": "请识别图片中的食材"}
      ]
    }
  ]
}
```

---

## 六、生产环境配置（服务器）

### 服务器上配置

```bash
# SSH 到服务器
ssh root@120.48.13.152

# 编辑 .env
cd /var/www/Maozi-Study-Cook/backend
nano .env

# 重启服务
pm2 restart maozi-api
```

### GitHub Actions Secrets（CI/CD）

在 GitHub 仓库设置中添加 Secrets：

1. 进入仓库 **Settings → Secrets and variables → Actions**
2. 点击 **New repository secret**
3. 添加以下 Secrets：

| Secret Name | 说明 |
|-------------|------|
| `SERVER_HOST` | 服务器 IP |
| `SERVER_USER` | 服务器用户名 |
| `SSH_PRIVATE_KEY` | SSH 私钥 |
| `AI_API_KEY` | 阿里云百炼 API Key |
| `JWT_SECRET` | JWT 密钥 |
| `DATABASE_URL` | 数据库连接 |

在 `.github/workflows/deploy.yml` 中引用：

```yaml
- name: 部署后端
  uses: appleboy/ssh-action@v1
  with:
    host: ${{ secrets.SERVER_HOST }}
    username: ${{ secrets.SERVER_USER }}
    key: ${{ secrets.SSH_PRIVATE_KEY }}
    envs: ${{ secrets.AI_API_KEY }}
    script: |
      cd /var/www/Maozi-Study-Cook/backend
      echo "AI_API_KEY=${{ secrets.AI_API_KEY }}" >> .env
      pm2 restart maozi-api
```

---

## 七、测试 AI 识别功能

### 1. 启动后端

```bash
cd backend
npm run start:dev
```

### 2. 测试识别接口

```bash
# 先登录获取 Token
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"account":"你的账号","password":"你的密码"}' | python3 -c "import json,sys; print(json.load(sys.stdin)['data']['accessToken'])")

# 测试食材识别（用 base64 图片）
curl -s -X POST http://localhost:3000/api/ai/recognize-base64 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"image": "你的图片base64", "type": "ingredient"}' | python3 -m json.tool
```

### 3. 测试推荐菜谱

```bash
curl -s -X POST http://localhost:3000/api/ai/recommend \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"ingredients": ["豆腐", "青椒", "猪肉"]}' | python3 -m json.tool
```

---

## 八、常见问题

### Q: API Key 泄露了怎么办？
A: 立即在阿里云百炼控制台**删除旧 Key** → **创建新 Key** → 更新 `.env` → 重启服务。

### Q: 识别不准确怎么办？
A:
1. 确保图片清晰、光线充足
2. 尝试使用 `qwen-vl-max` 替代 `qwen-vl-plus`
3. 调整 prompt 中的描述

### Q: 免费额度是多少？
A: 阿里云百炼新用户通常有免费额度，具体查看控制台。

### Q: 如何查看 API 调用量？
A: 阿里云百炼控制台 → 用量统计

---

## 九、项目中的 AI 代码位置

| 文件 | 说明 |
|------|------|
| `backend/src/modules/ai/ai.service.ts` | AI 服务核心逻辑 |
| `backend/src/modules/ai/ai.controller.ts` | API 路由 |
| `backend/src/config/ai.config.ts` | 配置加载 |
| `backend/.env.example` | 环境变量模板 |
| `frontend/src/app/(tabs)/camera.tsx` | 拍照识别页面 |
| `frontend/src/services/aiService.ts` | 前端 AI API 调用 |
