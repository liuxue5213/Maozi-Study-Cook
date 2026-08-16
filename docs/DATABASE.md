# 数据库设计文档

## 1. ER 关系图

```
┌──────────┐     ┌──────────────┐     ┌──────────┐
│  users   │────<│   posts      │>────│  cuisines│
└──────────┘     └──────────────┘     └──────────┘
     │                │                     
     │                ├──< post_images       
     │                ├──< comments          
     │                └──< likes             
     │                                      
     ├──< favorites >────┐                   
     ├──< check_ins      │     ┌──────────┐ 
     ├──< user_preferences     │ recipes  │ 
     └──< user_follows         └──────────┘ 
                                  │         
                     ┌────────────┼────────────┐
                     ▼            ▼            ▼
              ┌──────────┐ ┌───────────┐ ┌──────────┐
              │  steps   │ │ingredients│ │  seasons │
              └──────────┘ └───────────┘ └──────────┘
```

## 2. 表结构定义

### 2.1 users（用户表）

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INT | PK, AUTO_INCREMENT | 用户ID |
| uuid | VARCHAR(36) | UNIQUE, NOT NULL | 对外暴露的用户标识 |
| username | VARCHAR(50) | UNIQUE, NOT NULL | 用户名 |
| email | VARCHAR(100) | UNIQUE | 邮箱 |
| phone | VARCHAR(20) | UNIQUE | 手机号 |
| password | VARCHAR(255) | NOT NULL | bcrypt 加密密码 |
| nickname | VARCHAR(50) | | 昵称 |
| avatar | VARCHAR(500) | | 头像URL |
| bio | VARCHAR(500) | | 个人简介 |
| gender | TINYINT | DEFAULT 0 | 性别 0未知 1男 2女 |
| birthday | DATE | | 生日 |
| status | TINYINT | DEFAULT 1 | 状态 0禁用 1正常 |
| last_login_at | DATETIME | | 最后登录时间 |
| created_at | DATETIME | DEFAULT NOW() | 创建时间 |
| updated_at | DATETIME | ON UPDATE NOW() | 更新时间 |

### 2.2 cuisines（菜系表）

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INT | PK, AUTO_INCREMENT | 菜系ID |
| name | VARCHAR(50) | NOT NULL | 菜系名称 |
| name_en | VARCHAR(50) | | 英文名 |
| slug | VARCHAR(50) | UNIQUE, NOT NULL | URL标识 |
| description | TEXT | | 菜系介绍 |
| history | TEXT | | 历史渊源 |
| characteristics | TEXT | | 特点特色 |
| famous_dishes | VARCHAR(500) | | 代表菜（JSON数组） |
| image_url | VARCHAR(500) | | 封面图 |
| sort_order | INT | DEFAULT 0 | 排序 |
| recipe_count | INT | DEFAULT 0 | 菜谱数量 |
| created_at | DATETIME | DEFAULT NOW() | 创建时间 |

### 2.3 recipes（菜谱表）

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INT | PK, AUTO_INCREMENT | 菜谱ID |
| title | VARCHAR(100) | NOT NULL | 菜名 |
| description | TEXT | | 简介 |
| cuisine_id | INT | FK → cuisines | 所属菜系 |
| cover_image | VARCHAR(500) | | 封面图 |
| difficulty | TINYINT | DEFAULT 1 | 难度 1-5 |
| prep_time | INT | | 准备时间（分钟） |
| cook_time | INT | | 烹饪时间（分钟） |
| servings | INT | DEFAULT 2 | 份量 |
| tips | TEXT | | 技巧提示 |
| view_count | INT | DEFAULT 0 | 浏览次数 |
| like_count | INT | DEFAULT 0 | 点赞数 |
| favorite_count | INT | DEFAULT 0 | 收藏数 |
| status | TINYINT | DEFAULT 1 | 状态 0草稿 1发布 |
| created_by | INT | FK → users | 创建者 |
| created_at | DATETIME | DEFAULT NOW() | 创建时间 |
| updated_at | DATETIME | ON UPDATE NOW() | 更新时间 |

### 2.4 ingredients（食材表）

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INT | PK, AUTO_INCREMENT | 食材ID |
| name | VARCHAR(50) | NOT NULL | 食材名称 |
| category | VARCHAR(30) | | 分类：蔬菜/肉类/水产/调料... |
| image_url | VARCHAR(500) | | 图片 |
| description | VARCHAR(500) | | 描述 |
| nutrition_info | JSON | | 营养成分 |
| created_at | DATETIME | DEFAULT NOW() | 创建时间 |

### 2.5 recipe_ingredients（菜谱食材关联表）

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INT | PK, AUTO_INCREMENT | ID |
| recipe_id | INT | FK → recipes | 菜谱ID |
| ingredient_id | INT | FK → ingredients | 食材ID |
| name | VARCHAR(50) | NOT NULL | 食材名称（冗余，方便查询） |
| amount | VARCHAR(50) | | 用量 |
| is_main | TINYINT | DEFAULT 0 | 是否主料 |
| sort_order | INT | DEFAULT 0 | 排序 |

### 2.6 recipe_steps（菜谱步骤表）

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INT | PK, AUTO_INCREMENT | ID |
| recipe_id | INT | FK → recipes | 菜谱ID |
| step_number | INT | NOT NULL | 步骤序号 |
| description | TEXT | NOT NULL | 步骤描述 |
| image_url | VARCHAR(500) | | 步骤图 |
| duration | INT | | 该步骤耗时（分钟） |
| tips | VARCHAR(500) | | 步骤小贴士 |

### 2.7 posts（社区帖子表）

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INT | PK, AUTO_INCREMENT | 帖子ID |
| user_id | INT | FK → users | 作者 |
| recipe_id | INT | FK → recipes | 关联菜谱（可选） |
| content | TEXT | NOT NULL | 内容 |
| type | TINYINT | DEFAULT 1 | 类型 1作品 2提问 3分享 |
| like_count | INT | DEFAULT 0 | 点赞数 |
| comment_count | INT | DEFAULT 0 | 评论数 |
| is_checkin | TINYINT | DEFAULT 0 | 是否打卡 |
| status | TINYINT | DEFAULT 1 | 状态 |
| created_at | DATETIME | DEFAULT NOW() | 创建时间 |
| updated_at | DATETIME | ON UPDATE NOW() | 更新时间 |

### 2.8 post_images（帖子图片表）

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INT | PK, AUTO_INCREMENT | ID |
| post_id | INT | FK → posts | 帖子ID |
| image_url | VARCHAR(500) | NOT NULL | 图片URL |
| sort_order | INT | DEFAULT 0 | 排序 |
| created_at | DATETIME | DEFAULT NOW() | 创建时间 |

### 2.9 comments（评论表）

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INT | PK, AUTO_INCREMENT | ID |
| post_id | INT | FK → posts | 帖子ID |
| user_id | INT | FK → users | 评论者 |
| parent_id | INT | FK → comments | 父评论（支持楼中楼） |
| content | TEXT | NOT NULL | 内容 |
| like_count | INT | DEFAULT 0 | 点赞数 |
| status | TINYINT | DEFAULT 1 | 状态 |
| created_at | DATETIME | DEFAULT NOW() | 创建时间 |

### 2.10 likes（点赞表）

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INT | PK, AUTO_INCREMENT | ID |
| user_id | INT | FK → users | 用户 |
| target_type | VARCHAR(20) | NOT NULL | 目标类型：post/recipe/comment |
| target_id | INT | NOT NULL | 目标ID |
| created_at | DATETIME | DEFAULT NOW() | 创建时间 |
| UNIQUE | (user_id, target_type, target_id) | | 联合唯一索引 |

### 2.11 favorites（收藏表）

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INT | PK, AUTO_INCREMENT | ID |
| user_id | INT | FK → users | 用户 |
| recipe_id | INT | FK → recipes | 菜谱ID |
| created_at | DATETIME | DEFAULT NOW() | 创建时间 |
| UNIQUE | (user_id, recipe_id) | | 联合唯一索引 |

### 2.12 check_ins（打卡记录表）

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INT | PK, AUTO_INCREMENT | ID |
| user_id | INT | FK → users | 用户 |
| recipe_id | INT | FK → recipes | 菜谱ID |
| post_id | INT | FK → posts | 关联帖子 |
| image_url | VARCHAR(500) | | 成品图 |
| note | VARCHAR(500) | | 心得 |
| checkin_date | DATE | NOT NULL | 打卡日期 |
| created_at | DATETIME | DEFAULT NOW() | 创建时间 |
| UNIQUE | (user_id, checkin_date) | | 每日一次打卡 |

### 2.13 user_preferences（用户偏好表）

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INT | PK, AUTO_INCREMENT | ID |
| user_id | INT | FK → users, UNIQUE | 用户 |
| diet_goal | VARCHAR(50) | | 饮食目标 |
| taste_preferences | JSON | | 口味偏好 |
| allergies | JSON | | 过敏/忌口 |
| disliked_ingredients | JSON | | 不喜欢的食材 |
| updated_at | DATETIME | ON UPDATE NOW() | 更新时间 |

### 2.14 user_follows（关注关系表）

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INT | PK, AUTO_INCREMENT | ID |
| follower_id | INT | FK → users | 关注者 |
| following_id | INT | FK → users | 被关注者 |
| created_at | DATETIME | DEFAULT NOW() | 创建时间 |
| UNIQUE | (follower_id, following_id) | | 联合唯一索引 |

### 2.15 ai_recognition_logs（AI识别日志表）

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INT | PK, AUTO_INCREMENT | ID |
| user_id | INT | FK → users | 用户 |
| image_url | VARCHAR(500) | | 原图 |
| recognized_items | JSON | | 识别结果 |
| created_at | DATETIME | DEFAULT NOW() | 创建时间 |

## 3. 索引设计

| 表名 | 索引 | 用途 |
|------|------|------|
| recipes | INDEX(cuisine_id, status) | 按菜系查询 |
| recipes | INDEX(difficulty, status) | 按难度筛选 |
| recipes | FULLTEXT(title, description) | 全文搜索 |
| recipe_ingredients | INDEX(ingredient_id) | 食材反查 |
| posts | INDEX(user_id, created_at) | 用户帖子列表 |
| posts | INDEX(created_at) | 社区时间线 |
| comments | INDEX(post_id, created_at) | 帖子评论列表 |
| likes | INDEX(target_type, target_id) | 点赞数统计 |
| check_ins | INDEX(user_id, checkin_date) | 打卡日历 |

## 4. 初始数据

### 八大菜系预置数据

| 菜系 | 英文名 | 特点 |
|------|--------|------|
| 川菜 | Sichuan | 麻辣鲜香，一菜一格 |
| 鲁菜 | Shandong | 咸鲜醇厚，火候精湛 |
| 粤菜 | Cantonese | 清淡鲜美，选料广博 |
| 苏菜 | Jiangsu | 清鲜平和，精工细作 |
| 浙菜 | Zhejiang | 清鲜脆嫩，南料北烹 |
| 闽菜 | Fujian | 鲜香清淡，汤路广泛 |
| 湘菜 | Hunan | 香辣酸辣，口味浓郁 |
| 徽菜 | Anhui | 咸鲜微甜，讲究火功 |
