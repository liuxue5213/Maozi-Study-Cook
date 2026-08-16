#!/usr/bin/env python3
"""
为所有菜品生成预览图
使用 ModelScope Z-Image-Turbo 模型生成高质量美食图片

使用方法:
1. 安装依赖: pip install requests Pillow mysql-connector-python
2. 设置 API_KEY (默认使用 ModelScope 提供的 key)
3. 运行: python scripts/generate-recipe-images.py
"""

import os
import sys
import time
import json
import requests
from io import BytesIO
from PIL import Image
from datetime import datetime

# ============================================
# 配置
# ============================================
API_KEY = "ms-dd0f5c6b-f3e3-4628-b94d-615e8ff78386"  # ModelScope Token
BASE_URL = "https://api-inference.modelscope.cn/"
MODEL = "Tongyi-MAI/Z-Image-Turbo"

# 数据库配置 (与 .env 保持一致)
DB_CONFIG = {
    "host": "127.0.0.1",
    "port": 3307,
    "user": "root",
    "password": "",
    "database": "maozi_cook",
}

# 图片保存目录
IMAGE_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads", "recipe-covers")
os.makedirs(IMAGE_DIR, exist_ok=True)

# 支持的图片格式
SUPPORTED_FORMATS = ["JPEG", "PNG", "WEBP"]

# ============================================
# 数据库操作
# ============================================
class Database:
    def __init__(self):
        self.conn = None

    def connect(self):
        try:
            import mysql.connector
            self.conn = mysql.connector.connect(**DB_CONFIG)
            print(f"✅ 数据库连接成功: {DB_CONFIG['database']}")
        except ImportError:
            print("❌ 请先安装 mysql-connector-python: pip install mysql-connector-python")
            sys.exit(1)
        except Exception as e:
            print(f"❌ 数据库连接失败: {e}")
            sys.exit(1)

    def get_recipes_without_images(self):
        """获取还没有封面的菜谱"""
        cursor = self.conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT r.id, r.title, r.description, c.name as cuisine_name
            FROM recipes r
            LEFT JOIN cuisines c ON r.cuisineId = c.id
            WHERE r.coverImage IS NULL OR r.coverImage = ''
            ORDER BY r.id
        """)
        recipes = cursor.fetchall()
        cursor.close()
        return recipes

    def get_all_recipes(self):
        """获取所有菜谱"""
        cursor = self.conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT r.id, r.title, r.description, c.name as cuisine_name
            FROM recipes r
            LEFT JOIN cuisines c ON r.cuisineId = c.id
            ORDER BY r.id
        """)
        recipes = cursor.fetchall()
        cursor.close()
        return recipes

    def update_recipe_image(self, recipe_id, image_path):
        """更新菜谱封面"""
        cursor = self.conn.cursor()
        cursor.execute(
            "UPDATE recipes SET coverImage = %s WHERE id = %s",
            (image_path, recipe_id)
        )
        self.conn.commit()
        cursor.close()

    def close(self):
        if self.conn:
            self.conn.close()


# ============================================
# 图片生成器
# ============================================
class ImageGenerator:
    def __init__(self, api_key):
        self.api_key = api_key
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }

    def generate(self, prompt, retries=3):
        """
        生成图片 (异步模式)
        返回: (success: bool, image_bytes: bytes or error_msg: str)
        """
        for attempt in range(retries):
            try:
                # 1. 提交生成任务
                response = requests.post(
                    f"{BASE_URL}v1/images/generations",
                    headers={**self.headers, "X-ModelScope-Async-Mode": "true"},
                    data=json.dumps({
                        "model": MODEL,
                        "prompt": prompt,
                    }, ensure_ascii=False).encode("utf-8"),
                    timeout=30,
                )
                response.raise_for_status()
                task_id = response.json().get("task_id")

                if not task_id:
                    return False, f"No task_id in response: {response.json()}"

                # 2. 轮询等待结果 (最多 5 分钟)
                max_wait = 300  # 5 分钟
                poll_interval = 3  # 每 3 秒查询一次
                elapsed = 0

                while elapsed < max_wait:
                    time.sleep(poll_interval)
                    elapsed += poll_interval

                    result = requests.get(
                        f"{BASE_URL}v1/tasks/{task_id}",
                        headers={**self.headers, "X-ModelScope-Task-Type": "image_generation"},
                        timeout=30,
                    )
                    result.raise_for_status()
                    data = result.json()

                    status = data.get("task_status")

                    if status == "SUCCEED":
                        image_url = data.get("output_images", [None])[0]
                        if image_url:
                            # 下载图片
                            img_response = requests.get(image_url, timeout=30)
                            img_response.raise_for_status()
                            return True, img_response.content
                        else:
                            return False, "No image URL in response"

                    elif status == "FAILED":
                        return False, f"Task failed: {data}"

                    # PENDING 或 RUNNING，继续等待

                return False, f"Timeout after {max_wait}s"

            except requests.exceptions.RequestException as e:
                if attempt < retries - 1:
                    wait = 5 * (attempt + 1)
                    print(f"    ⚠️ 请求失败 ({e})，{wait}s 后重试...")
                    time.sleep(wait)
                else:
                    return False, f"Request failed: {e}"
            except Exception as e:
                return False, f"Unexpected error: {e}"

        return False, "Max retries exceeded"

    def save_image(self, image_bytes, recipe_id):
        """保存图片到本地"""
        try:
            img = Image.open(BytesIO(image_bytes))
            # 转换为 RGB (如果是 RGBA)
            if img.mode == "RGBA":
                img = img.convert("RGB")

            # 保存为 JPEG
            filename = f"recipe_{recipe_id}.jpg"
            filepath = os.path.join(IMAGE_DIR, filename)
            img.save(filepath, "JPEG", quality=85)

            # 返回相对路径
            return f"/uploads/recipe-covers/{filename}"
        except Exception as e:
            print(f"    ❌ 保存图片失败: {e}")
            return None


# ============================================
# Prompt 生成器
# ============================================
def generate_prompt(title, description, cuisine_name):
    """为菜品生成高质量的美食摄影 prompt"""
    # 清理描述
    desc = (description or "")[:80]

    prompt = (
        f"Professional food photography of a delicious Chinese dish called '{title}', "
        f"a traditional {cuisine_name} cuisine. "
        f"The dish is beautifully plated on a ceramic plate, "
        f"with appetizing colors and textures, "
        f"soft natural lighting from the side, "
        f"shallow depth of field, "
        f"dark rustic wooden table background, "
        f"garnished with fresh herbs, "
        f"steaming hot, "
        f"ultra-realistic, 4K, high detail, food magazine style"
    )
    return prompt


# ============================================
# 主流程
# ============================================
def main():
    import argparse
    parser = argparse.ArgumentParser(description="为菜品生成预览图")
    parser.add_argument("--all", action="store_true", help="重新生成所有图片（包括已有封面的）")
    parser.add_argument("--limit", type=int, default=0, help="限制生成数量（0=无限制）")
    parser.add_argument("--delay", type=float, default=2.0, help="每次请求间隔秒数（避免限流）")
    args = parser.parse_args()

    db = Database()
    db.connect()

    # 获取菜谱列表
    if args.all:
        recipes = db.get_all_recipes()
        mode = "全部"
    else:
        recipes = db.get_recipes_without_images()
        mode = "仅无封面"

    if args.limit > 0:
        recipes = recipes[:args.limit]

    print(f"\n📊 模式: {mode}")
    print(f"📊 待生成数量: {len(recipes)} 道")
    print(f"📦 图片保存目录: {IMAGE_DIR}")
    print(f"🎨 模型: {MODEL}")
    print(f"⏱️ 请求间隔: {args.delay}s\n")

    if len(recipes) == 0:
        print("✅ 所有菜谱都已有封面图片")
        db.close()
        return

    # 创建生成器
    generator = ImageGenerator(API_KEY)

    # 统计
    success_count = 0
    fail_count = 0
    skipped_count = 0
    start_time = time.time()

    for idx, recipe in enumerate(recipes, 1):
        recipe_id = recipe["id"]
        title = recipe["title"]
        cuisine = recipe.get("cuisine_name", "")

        # 进度显示
        progress = f"[{idx}/{len(recipes)}]"
        eta_seconds = (time.time() - start_time) / idx * (len(recipes) - idx) if idx > 1 else 0
        eta = f"ETA: {int(eta_seconds // 60)}m{int(eta_seconds % 60)}s" if eta_seconds > 0 else ""
        print(f"{progress} 🍳 {title} ({cuisine}) {eta}")

        # 生成 prompt
        prompt = generate_prompt(title, recipe.get("description"), cuisine)

        # 生成图片
        success, result = generator.generate(prompt)

        if success:
            # 保存图片
            image_path = generator.save_image(result, recipe_id)
            if image_path:
                # 更新数据库
                db.update_recipe_image(recipe_id, image_path)
                success_count += 1
                print(f"    ✅ 已生成: {image_path}")
            else:
                fail_count += 1
                print(f"    ❌ 保存失败")
        else:
            fail_count += 1
            print(f"    ❌ 生成失败: {result}")

        # 间隔避免限流
        if idx < len(recipes):
            time.sleep(args.delay)

    # 汇总
    elapsed = time.time() - start_time
    print(f"\n{'='*50}")
    print(f"🎉 完成!")
    print(f"⏱️ 总耗时: {int(elapsed // 60)}m{int(elapsed % 60)}s")
    print(f"✅ 成功: {success_count}")
    print(f"❌ 失败: {fail_count}")
    print(f"📊 总计: {len(recipes)}")
    print(f"{'='*50}\n")

    db.close()


if __name__ == "__main__":
    main()
