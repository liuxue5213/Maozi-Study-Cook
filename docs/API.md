# API 接口文档

## 1. 接口规范

### 基础信息
- 基础路径：`/api`
- 数据格式：JSON
- 认证方式：Bearer Token（JWT）
- 字符编码：UTF-8

### 统一响应格式

```json
{
  "code": 0,
  "message": "success",
  "data": {},
  "timestamp": 1723800000000
}
```

### 分页响应格式

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

### 错误码

| code | 说明 |
|------|------|
| 0 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未认证/Token 过期 |
| 403 | 无权限 |
| 404 | 资源不存在 |
| 429 | 请求过于频繁 |
| 500 | 服务器内部错误 |

---

## 2. 认证模块 `/api/auth`

### 2.1 用户注册

```
POST /api/auth/register
```

**请求体：**
```json
{
  "username": "maozi_user",
  "email": "user@example.com",
  "phone": "13800138000",
  "password": "Aa123456",
  "nickname": "麦子"
}
```

**响应：**
```json
{
  "code": 0,
  "message": "注册成功",
  "data": {
    "userId": 1,
    "accessToken": "eyJhbG...",
    "refreshToken": "eyJhbG..."
  }
}
```

### 2.2 用户登录

```
POST /api/auth/login
```

**请求体：**
```json
{
  "account": "user@example.com",
  "password": "Aa123456"
}
```

### 2.3 刷新 Token

```
POST /api/auth/refresh
```

**请求体：**
```json
{
  "refreshToken": "eyJhbG..."
}
```

### 2.4 退出登录

```
POST /api/auth/logout
Authorization: Bearer <token>
```

### 2.5 发送验证码

```
POST /api/auth/captcha
```

**请求体：**
```json
{
  "phone": "13800138000",
  "type": "register"
}
```

---

## 3. 用户模块 `/api/users`

### 3.1 获取当前用户信息

```
GET /api/users/me
Authorization: Bearer <token>
```

### 3.2 更新个人资料

```
PUT /api/users/me
Authorization: Bearer <token>
```

**请求体：**
```json
{
  "nickname": "麦子",
  "avatar": "https://...",
  "bio": "热爱烹饪的程序员",
  "gender": 1,
  "birthday": "1995-01-01"
}
```

### 3.3 获取用户偏好设置

```
GET /api/users/me/preferences
Authorization: Bearer <token>
```

### 3.4 更新偏好设置

```
PUT /api/users/me/preferences
Authorization: Bearer <token>
```

**请求体：**
```json
{
  "dietGoal": "清淡养生",
  "tastePreferences": ["清淡鲜美", "咸甜交织"],
  "allergies": ["花生"],
  "dislikedIngredients": ["香菜", "葱"]
}
```

### 3.5 获取用户主页

```
GET /api/users/:uuid/profile
```

**响应包含：** 基本信息、关注数、粉丝数、帖子数、连续打卡、最近作品

### 3.6 关注/取消关注

```
POST /api/users/:uuid/follow
DELETE /api/users/:uuid/follow
Authorization: Bearer <token>
```

---

## 4. 菜系模块 `/api/cuisines`

### 4.1 获取菜系列表

```
GET /api/cuisines?page=1&pageSize=20
```

**响应：**
```json
{
  "code": 0,
  "data": {
    "list": [
      {
        "id": 1,
        "name": "川菜",
        "nameEn": "Sichuan",
        "slug": "sichuan",
        "description": "麻辣鲜香...",
        "famousDishes": ["麻婆豆腐", "回锅肉", "水煮鱼"],
        "imageUrl": "https://...",
        "recipeCount": 128
      }
    ]
  }
}
```

### 4.2 获取菜系详情

```
GET /api/cuisines/:slug
```

### 4.3 获取菜系下的菜谱

```
GET /api/cuisines/:slug/recipes?page=1&pageSize=20&difficulty=1
```

---

## 5. 菜谱模块 `/api/recipes`

### 5.1 获取菜谱列表

```
GET /api/recipes?page=1&pageSize=20&cuisineId=&difficulty=&keyword=&sortBy=hot
```

**参数说明：**
| 参数 | 类型 | 说明 |
|------|------|------|
| page | int | 页码，默认 1 |
| pageSize | int | 每页数量，默认 20 |
| cuisineId | int | 菜系筛选 |
| difficulty | int | 难度筛选 1-5 |
| keyword | string | 搜索关键词 |
| sortBy | string | 排序：hot/new/time/rating |

### 5.2 获取菜谱详情

```
GET /api/recipes/:id
```

**响应：**
```json
{
  "code": 0,
  "data": {
    "id": 1,
    "title": "麻婆豆腐",
    "description": "川菜经典...",
    "cuisine": { "id": 1, "name": "川菜" },
    "coverImage": "https://...",
    "difficulty": 2,
    "prepTime": 15,
    "cookTime": 20,
    "servings": 2,
    "tips": "豆腐先焯水去腥味",
    "ingredients": [
      { "name": "嫩豆腐", "amount": "400g", "isMain": true },
      { "name": "肉末", "amount": "100g", "isMain": true },
      { "name": "豆瓣酱", "amount": "2勺", "isMain": false }
    ],
    "steps": [
      { "stepNumber": 1, "description": "豆腐切块，焯水...", "duration": 3 },
      { "stepNumber": 2, "description": "热锅下肉末炒香...", "duration": 5 }
    ],
    "viewCount": 12580,
    "likeCount": 856,
    "favoriteCount": 423,
    "isFavorited": false,
    "isLiked": false
  }
}
```

### 5.3 按食材搜索菜谱

```
GET /api/recipes/by-ingredients?ingredients=豆腐,肉末,青椒
```

### 5.4 收藏/取消收藏

```
POST /api/recipes/:id/favorite
DELETE /api/recipes/:id/favorite
Authorization: Bearer <token>
```

### 5.5 点赞/取消点赞

```
POST /api/recipes/:id/like
DELETE /api/recipes/:id/like
Authorization: Bearer <token>
```

---

## 6. AI 服务模块 `/api/ai`

### 6.1 拍照识别食材

```
POST /api/ai/recognize
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**请求参数：**
| 参数 | 类型 | 说明 |
|------|------|------|
| image | File | 图片文件 |
| type | string | 类型：food(菜品) / ingredient(食材) / fridge(冰箱) |

**响应：**
```json
{
  "code": 0,
  "data": {
    "items": [
      { "name": "豆腐", "confidence": 0.98, "category": "豆制品" },
      { "name": "青椒", "confidence": 0.95, "category": "蔬菜" },
      { "name": "猪肉", "confidence": 0.92, "category": "肉类" }
    ],
    "imageUrl": "https://..."
  }
}
```

### 6.2 根据食材推荐菜谱

```
POST /api/ai/recommend
Authorization: Bearer <token>
```

**请求体：**
```json
{
  "ingredients": ["豆腐", "青椒", "猪肉"],
  "preferences": {
    "taste": ["麻辣"],
    "difficulty": 2,
    "timeLimit": 30
  }
}
```

**响应：**
```json
{
  "code": 0,
  "data": {
    "recommendations": [
      {
        "recipeId": 1,
        "title": "麻婆豆腐",
        "matchScore": 0.92,
        "missingIngredients": ["豆瓣酱"],
        "cookTime": 20,
        "reason": "食材高度匹配，经典川菜"
      },
      {
        "recipeId": 2,
        "title": "青椒肉丝",
        "matchScore": 0.85,
        "missingIngredients": [],
        "cookTime": 15,
        "reason": "食材齐全，简单快手"
      }
    ]
  }
}
```

### 6.3 生成菜谱步骤

```
POST /api/ai/generate-steps
Authorization: Bearer <token>
```

**请求体：**
```json
{
  "title": "番茄炒蛋",
  "ingredients": ["番茄", "鸡蛋", "葱"],
  "difficulty": 1
}
```

---

## 7. 社区模块 `/api/community`

### 7.1 获取动态列表

```
GET /api/community/posts?page=1&pageSize=20&type=&sortBy=hot
```

### 7.2 发布帖子

```
POST /api/community/posts
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**请求参数：**
| 参数 | 类型 | 说明 |
|------|------|------|
| content | string | 内容 |
| type | int | 类型 1作品 2提问 3分享 |
| recipeId | int | 关联菜谱ID（可选） |
| images | File[] | 图片（最多9张） |
| isCheckin | boolean | 是否打卡 |

### 7.3 获取帖子详情

```
GET /api/community/posts/:id
```

### 7.4 删除帖子

```
DELETE /api/community/posts/:id
Authorization: Bearer <token>
```

### 7.5 点赞帖子

```
POST /api/community/posts/:id/like
DELETE /api/community/posts/:id/like
Authorization: Bearer <token>
```

### 7.6 获取评论列表

```
GET /api/community/posts/:id/comments?page=1&pageSize=20
```

### 7.7 发表评论

```
POST /api/community/posts/:id/comments
Authorization: Bearer <token>
```

**请求体：**
```json
{
  "content": "看起来很好吃！",
  "parentId": 0
}
```

---

## 8. 打卡模块 `/api/checkin`

### 8.1 创建打卡

```
POST /api/checkin
Authorization: Bearer <token>
```

**请求体：**
```json
{
  "recipeId": 1,
  "image": "图片文件",
  "note": "第一次做，味道还不错",
  "checkinDate": "2026-08-16"
}
```

### 8.2 获取打卡日历

```
GET /api/checkin/calendar?year=2026&month=8
Authorization: Bearer <token>
```

**响应：**
```json
{
  "code": 0,
  "data": {
    "streak": 7,
    "totalDays": 15,
    "calendar": [
      { "date": "2026-08-01", "checked": true },
      { "date": "2026-08-02", "checked": false }
    ]
  }
}
```

### 8.3 获取打卡记录

```
GET /api/checkin/list?page=1&pageSize=20
Authorization: Bearer <token>
```

---

## 9. 上传模块 `/api/upload`

### 9.1 上传图片

```
POST /api/upload/image
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**请求参数：**
| 参数 | 类型 | 说明 |
|------|------|------|
| file | File | 图片文件（jpg/png/webp, max 10MB） |
| folder | string | 目录：avatar/post/recipe |

**响应：**
```json
{
  "code": 0,
  "data": {
    "url": "https://xxx.com/images/xxx.jpg",
    "filename": "xxx.jpg",
    "size": 1024000
  }
}
```
