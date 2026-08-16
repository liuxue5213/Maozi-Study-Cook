# 麦子学厨 - 前端

基于 React Native + Expo 的跨平台前端，支持 Android、iOS、Web 三端。

## 技术栈

- **框架**: React Native + Expo SDK 54
- **路由**: Expo Router（文件路由）
- **样式**: NativeWind (Tailwind CSS)
- **状态**: Zustand
- **HTTP**: Axios
- **语言**: TypeScript

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run start

# 平台选择
npm run android    # Android
npm run ios        # iOS
npm run web        # Web

# 构建 Web 版本
npm run build:web
```

## 目录结构

```
src/
├── app/           # 页面路由
│   ├── (auth)/    # 认证页面
│   ├── (tabs)/    # Tab 页面
│   ├── recipe/    # 菜谱详情
│   ├── post/      # 帖子详情
│   └── cuisine/   # 菜系详情
├── components/    # 公共组件
├── hooks/         # 自定义 Hooks
├── stores/        # 状态管理
├── services/      # API 服务
├── utils/         # 工具函数
└── assets/        # 静态资源
```

## 环境变量

前端通过 `apiClient.ts` 自动根据运行环境选择 API 地址：
- Web: `/api`（通过 Nginx 代理）
- 开发模式: `http://120.48.13.152:3000/api`
- 生产模式: `https://your-domain.com/api`
