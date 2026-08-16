# 🥟 帽子学做饭 (Maozi Study Cook)

> 一站式烹饪学习社交平台 — 学菜系知识、看做菜教程、拍照识别食材、AI 推荐菜谱、社区分享打卡

![Platform](https://img.shields.io/badge/platform-Android%20%7C%20iOS%20%7C%20Web-blue)
![Backend](https://img.shields.io/badge/backend-NestJS-red)
![Frontend](https://img.shields.io/badge/frontend-React%20Native%20%2B%20Expo-green)
![Database](https://img.shields.io/badge/database-MySQL%20%2B%20Redis-orange)
![License](https://img.shields.io/badge/license-MIT-green)

---

## 📖 项目介绍

帽子学做饭是一个**集烹饪学习、智能推荐、社交分享于一体的综合性平台**。用户可以学习国内外菜系知识、查看详细的做菜教程、通过拍照识别食材获取 AI 菜谱推荐，还可以在交流圈分享自己的烹饪作品、打卡记录。

本项目整合了多个开源项目的优势能力，目标是打造一个**Web + APK 多平台一体化**的烹饪学习社区。

### 核心能力

| 功能模块 | 描述 |
|----------|------|
| 📚 **菜系学习** | 八大菜系知识介绍、代表菜品、烹饪技巧（第一版重点国内菜系） |
| 📖 **菜谱教程** | 详细的步骤图文教程、难度分级、视频链接 |
| 📸 **拍照识别** | 拍摄食材/菜品照片，AI 自动识别内容 |
| 🤖 **智能推荐** | 根据现有食材 AI 推荐可制作的菜品，支持个性化偏好 |
| 🔍 **菜谱搜索** | 按食材、菜系、难度等多维度筛选 |
| 👤 **用户系统** | 注册登录、个人资料、收藏历史 |
| 🌐 **交流圈** | 发布烹饪作品、照片打卡、点赞评论互动 |
| 🎯 **打卡系统** | 每日做饭打卡、连续打卡记录 |

---

## 🏗️ 技术架构

### 整体架构

```
┌────────────────────────────────────────────────────────┐
│                        用户层                           │
│   📱 Android App    📱 iOS App    💻 Web (PWA)         │
└────────────────────────┬───────────────────────────────┘
                         │ HTTPS / WebSocket
                         ▼
┌────────────────────────────────────────────────────────┐
│                      API 网关层                         │
│              NestJS + Nginx 反向代理                     │
│         JWT 认证 · 限流 · 日志 · 错误处理                │
└───────┬──────────┬──────────┬──────────┬───────────────┘
        │          │          │          │
        ▼          ▼          ▼          ▼
   ┌─────────┐┌─────────┐┌─────────┐┌──────────┐
   │用户服务  ││菜谱服务  ││社交服务  ││AI 服务    │
   │注册/登录 ││CRUD     ││发帖/评论 ││拍照识别   │
   │个人资料  ││搜索/分类 ││点赞/收藏 ││菜谱推荐   │
   │关注     ││菜系管理  ││打卡     ││步骤生成   │
   └─────────┘└─────────┘└─────────┘└──────────┘
        │          │          │          │
        ▼          ▼          ▼          ▼
┌────────────────────────────────────────────────────────┐
│                      数据层                             │
│   MySQL    Redis    本地文件存储    AI API              │
└────────────────────────────────────────────────────────┘
```

### 技术栈明细

| 层级 | 技术选型 | 说明 |
|------|----------|------|
| **前端框架** | React Native + Expo SDK 54 | 一套代码 → APK + iOS + Web |
| **语言** | TypeScript | 类型安全，全栈统一 |
| **导航** | Expo Router | 文件路由，Web 和 Native 统一 |
| **UI 组件** | NativeWind (Tailwind CSS) | 一套样式多平台生效 |
| **状态管理** | Zustand | 轻量高效 |
| **后端框架** | NestJS | 模块化、可扩展、TypeScript 原生 |
| **ORM** | Prisma | 类型安全的数据库操作 |
| **数据库** | MySQL 8.0 | 主数据存储 |
| **缓存** | Redis 7.0 | 会话、推荐结果缓存 |
| **Web 服务器** | Nginx | 反向代理、静态资源 |
| **AI 识别** | 通义千问 VL / GPT-4o | 拍照识别食材 |
| **用户认证** | JWT + Refresh Token | 手机号/邮箱 + 第三方登录 |
| **文件存储** | 本地存储（初期）/ OSS（后期） | 图片文件 |
| **部署** | Docker + GitHub Actions | CI/CD 自动化 |

---

## 📁 项目结构

```
Maozi-Study-Cook/
├── README.md                    # 项目介绍（本文件）
├── .gitignore                   # Git 忽略规则
├── docker-compose.yml           # Docker 编排配置
├── .github/
│   └── workflows/
│       ├── ci.yml               # CI 检查（lint + test + build）
│       └── deploy.yml           # 自动部署到服务器
├── docs/
│   ├── ARCHITECTURE.md          # 详细架构文档
│   ├── DATABASE.md              # 数据库设计文档
│   ├── API.md                   # API 接口文档
│   └── DEPLOYMENT.md            # 部署指南
├── backend/                     # NestJS 后端
│   ├── src/
│   │   ├── main.ts              # 入口文件
│   │   ├── app.module.ts        # 根模块
│   │   ├── config/              # 配置文件
│   │   ├── modules/
│   │   │   ├── auth/            # 认证模块
│   │   │   ├── users/           # 用户模块
│   │   │   ├── recipes/         # 菜谱模块
│   │   │   ├── cuisines/        # 菜系模块
│   │   │   ├── ai/              # AI 服务模块
│   │   │   ├── community/       # 社区模块
│   │   │   ├── upload/          # 文件上传模块
│   │   │   └── common/          # 公共模块
│   │   └── prisma/              # Prisma 数据库 schema
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
├── frontend/                    # Expo + React Native Web 前端
│   ├── src/
│   │   ├── app/                 # 页面路由（Expo Router）
│   │   ├── components/          # 公共组件
│   │   ├── hooks/               # 自定义 Hooks
│   │   ├── stores/              # 状态管理
│   │   ├── services/            # API 服务
│   │   ├── utils/               # 工具函数
│   │   └── assets/              # 静态资源
│   ├── package.json
│   ├── app.json                 # Expo 配置
│   ├── tsconfig.json
│   └── Dockerfile
└── nginx/
    └── nginx.conf               # Nginx 配置
```

---

## 🚀 快速开始

### 前置条件

- Node.js >= 18
- MySQL >= 8.0
- Redis >= 6.0
- pnpm（推荐）或 npm

### 本地开发

```bash
# 1. 克隆项目
git clone https://github.com/liuxue5213/Maozi-Study-Cook.git
cd Maozi-Study-Cook

# 2. 启动后端
cd backend
cp .env.example .env        # 配置环境变量
pnpm install
pnpm prisma migrate dev     # 初始化数据库
pnpm run start:dev          # 启动后端 http://localhost:3000

# 3. 启动前端（新终端）
cd frontend
pnpm install
pnpm expo start             # 启动 Expo 开发服务器

# 4. 访问
# Web: 浏览器打开 http://localhost:8081
# Android: 用 Expo Go 扫描二维码
# iOS: 用相机扫描二维码
```

### 环境变量配置

后端 `.env` 文件：

```env
# 数据库
DATABASE_URL="mysql://root:password@localhost:3306/maozi_cook"
REDIS_URL="redis://localhost:6379"

# JWT
JWT_SECRET="your-jwt-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret-key"
JWT_EXPIRES_IN="7d"

# AI 服务
AI_API_KEY="your-ai-api-key"
AI_BASE_URL="https://dashscope.aliyuncs.com/api/v1"
AI_VISION_MODEL="qwen-vl-plus"

# 服务器
PORT=3000
CORS_ORIGIN="*"

# 文件上传
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE=10485760
```

---

## 🗄️ 数据库设计

### 核心表结构

| 表名 | 说明 |
|------|------|
| `users` | 用户表（基础信息、认证） |
| `cuisines` | 菜系表（八大菜系等） |
| `recipes` | 菜谱表（基础信息、步骤、难度） |
| `recipe_ingredients` | 菜谱食材关联表 |
| `ingredients` | 食材表 |
| `recipe_steps` | 菜谱步骤表 |
| `posts` | 社区帖子表 |
| `post_images` | 帖子图片表 |
| `comments` | 评论表 |
| `likes` | 点赞表 |
| `favorites` | 收藏表 |
| `check_ins` | 打卡记录表 |
| `user_preferences` | 用户偏好设置表 |

详细设计见 [docs/DATABASE.md](docs/DATABASE.md)

---

## 📡 API 接口

### 接口概览

| 模块 | 路径前缀 | 主要接口 |
|------|----------|----------|
| 认证 | `/api/auth` | register / login / refresh / logout |
| 用户 | `/api/users` | profile / update / preferences |
| 菜系 | `/api/cuisines` | list / detail / recipes |
| 菜谱 | `/api/recipes` | list / search / detail / steps |
| AI | `/api/ai` | recognize / recommend / generate-steps |
| 社区 | `/api/community` | posts / create / like / comment |
| 打卡 | `/api/checkin` | create / calendar / streak |
| 上传 | `/api/upload` | image |

详细接口文档见 [docs/API.md](docs/API.md)

---

## 🚢 部署

### 服务器信息

- **IP**: 120.48.13.152
- **系统**: Ubuntu 24.04
- **配置**: 2核 CPU / 1.8GB 内存 / 40GB 磁盘
- **已装服务**: MySQL 8.0, Redis 7.0, Nginx 1.24, Node.js 22

### 部署方式

```bash
# 方式一：Docker 部署（推荐）
docker-compose up -d

# 方式二：手动部署
# 后端
cd backend && pnpm install && pnpm prisma migrate deploy && pnpm run build && pm2 start dist/main.js
# 前端 Web
cd frontend && pnpm install && pnpm expo export:web && cp -r dist/* /var/www/html/
```

详细部署指南见 [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)

---

## 🔒 安全说明

- 所有敏感配置（API Key、数据库密码、JWT Secret）通过**环境变量**注入
- `.env` 文件已加入 `.gitignore`，不会提交到公开仓库
- GitHub Actions 使用 **Repository Secrets** 管理部署密钥
- 用户密码使用 **bcrypt** 加密存储
- API 使用 **JWT + Refresh Token** 双令牌机制

---

## 📋 开发路线图

### v1.0 - MVP（第一版）
- [x] 项目初始化与技术选型
- [ ] 用户注册登录（手机号 + 邮箱）
- [ ] 菜系知识模块（八大菜系）
- [ ] 菜谱库（基础 CRUD、搜索、分类）
- [ ] 拍照识别食材（AI 接口对接）
- [ ] 根据食材推荐菜谱
- [ ] 菜谱详情与步骤教程

### v2.0 - 社交功能
- [ ] 交流圈（发帖、图片上传）
- [ ] 点赞、评论、收藏
- [ ] 打卡系统
- [ ] 用户个人主页

### v3.0 - 增强体验
- [ ] 个性化推荐算法优化
- [ ] 国外菜系扩展
- [ ] 视频教程
- [ ] 营养分析
- [ ] APK 打包发布

---

## 📄 许可证

本项目基于 [MIT License](LICENSE) 开源。

项目参考了以下开源项目（均为 MIT 许可）：
- [AiRecipe](https://github.com/shenzhuqi/AiRecipe) — AI 拍照识别食材推荐
- [MyCook](https://github.com/AlexanderJ-Carter/MyCook) — 菜谱聚合与搜索
- [HowToCook](https://github.com/Anduin2017/HowToCook) — 程序员做饭指南
- [CookLikeHOC](https://github.com/Gar-b-age/CookLikeHOC) — 老乡鸡风格菜谱

---

## 🤝 贡献

欢迎提交 Issue 和 PR！请确保代码通过 lint 和测试。

---

**Made with ❤️ by Maozi Team**
