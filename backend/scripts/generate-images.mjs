#!/usr/bin/env node
/**
 * 菜品预览图定时生成脚本
 * =================================
 * 功能: 为没有封面的菜品生成 AI 美食摄影图片
 * 频率: 每天执行一次，每次最多 100 道
 * 存储: /var/www/Maozi-Study-Cook/backend/uploads/recipe-covers/
 *
 * 使用方式:
 *   node scripts/generate-images.mjs          # 生成 100 张
 *   node scripts/generate-images.mjs --limit 50   # 生成 50 张
 *   node scripts/generate-images.mjs --all        # 生成全部
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// 动态导入 ESM 模块
const { PrismaClient } = await import('@prisma/client');
const { default: axios } = await import('axios');
const { createWriteStream } = await import('fs');
const { mkdir, access } = await import('fs/promises');
const { join, dirname } = await import('path');
const { fileURLToPath } = await import('url');
const { promisify } = await import('util');
const stream = await import('stream');

const pipeline = promisify(stream.pipeline);

// ======================== 配置 ========================
const __dirname = dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = join(__dirname, '..', 'uploads', 'recipe-covers');
const MODEL = 'Tongyi-MAI/Z-Image-Turbo';
const API_BASE = 'https://api-inference.modelscope.cn/';

// ModelScope API Key（从环境变量读取）
const API_KEY = process.env.MODELSCOPE_API_KEY || 'ms-dd0f5c6b-f3e3-4628-b94d-615e8ff78386';

// 数据库配置
const prisma = new PrismaClient();

// ======================== 解析参数 ========================
const args = process.argv.slice(2);
const limitIndex = args.indexOf('--limit');
const BATCH_SIZE = limitIndex !== -1 ? parseInt(args[limitIndex + 1]) || 100 : 100;
const GENERATE_ALL = args.includes('--all');

// ======================== Prompt 生成 ========================
function generatePrompt(recipe) {
  const cuisine = recipe.cuisine?.name || '中餐';
  const desc = (recipe.description || '').slice(0, 60);

  return `Professional food photography of a delicious Chinese dish called "${recipe.title}", a traditional ${cuisine} cuisine. ${desc ? `The dish features ${desc}.` : ''} Beautifully plated on a ceramic plate with appetizing colors and textures, soft natural lighting from the side, shallow depth of field, dark rustic wooden table background, garnished with fresh herbs, steaming hot, ultra-realistic, 4K, high detail, food magazine style, no text, no watermark.`;
}

// ======================== 图片生成 ========================
async function generateImage(prompt) {
  const headers = {
    Authorization: `Bearer ${API_KEY}`,
    'Content-Type': 'application/json',
  };

  // 1. 提交异步生成任务
  const submitRes = await axios.post(
    `${API_BASE}v1/images/generations`,
    {
      model: MODEL,
      prompt,
    },
    {
      headers: { ...headers, 'X-ModelScope-Async-Mode': 'true' },
      timeout: 30000,
    },
  );

  const taskId = submitRes.data?.task_id;
  if (!taskId) {
    throw new Error('Failed to get task_id');
  }

  // 2. 轮询等待结果（最多 5 分钟）
  const maxWait = 300000; // 5 分钟
  const pollInterval = 5000; // 5 秒
  let elapsed = 0;

  while (elapsed < maxWait) {
    await new Promise((r) => setTimeout(r, pollInterval));
    elapsed += pollInterval;

    const resultRes = await axios.get(`${API_BASE}v1/tasks/${taskId}`, {
      headers: { ...headers, 'X-ModelScope-Task-Type': 'image_generation' },
      timeout: 30000,
    });

    const status = resultRes.data?.task_status;

    if (status === 'SUCCEED') {
      return resultRes.data?.output_images?.[0];
    }

    if (status === 'FAILED') {
      throw new Error('Image generation failed');
    }
  }

  throw new Error('Image generation timeout');
}

// ======================== 下载图片 ========================
async function downloadImage(url, filepath) {
  const response = await axios.get(url, {
    responseType: 'stream',
    timeout: 60000,
  });
  await pipeline(response.data, createWriteStream(filepath));
}

// ======================== 主流程 ========================
async function main() {
  const startTime = Date.now();

  console.log('='.repeat(60));
  console.log('🎨 菜品预览图定时生成任务');
  console.log(`⏰ 开始时间: ${new Date().toLocaleString('zh-CN')}`);
  console.log(`📦 本次数量: ${GENERATE_ALL ? '全部' : BATCH_SIZE} 道`);
  console.log('='.repeat(60));

  // 确保目录存在
  await mkdir(UPLOAD_DIR, { recursive: true });

  // 获取待生成的菜品
  const where = { OR: [{ coverImage: null }, { coverImage: '' }] };
  const recipes = await prisma.recipe.findMany({
    where,
    include: { cuisine: { select: { name: true } } },
    take: GENERATE_ALL ? undefined : BATCH_SIZE,
    orderBy: { id: 'asc' },
  });

  console.log(`📊 待处理: ${recipes.length} 道菜品\n`);

  if (recipes.length === 0) {
    console.log('✅ 所有菜品都已有封面图');
    await prisma.$disconnect();
    return;
  }

  let success = 0;
  let failed = 0;

  for (let i = 0; i < recipes.length; i++) {
    const recipe = recipes[i];
    const progress = `[${i + 1}/${recipes.length}]`;

    try {
      console.log(`${progress} 🍳 ${recipe.title}...`);

      // 生成图片
      const prompt = generatePrompt(recipe);
      const imageUrl = await generateImage(prompt);

      if (!imageUrl) {
        throw new Error('No image URL returned');
      }

      // 保存图片
      const filename = `recipe_${recipe.id}.jpg`;
      const filepath = join(UPLOAD_DIR, filename);
      await downloadImage(imageUrl, filepath);

      // 更新数据库
      await prisma.recipe.update({
        where: { id: recipe.id },
        data: { coverImage: `/uploads/recipe-covers/${filename}` },
      });

      success++;
      console.log(`  ✅ 已生成: ${filename}`);
    } catch (error) {
      failed++;
      console.log(`  ❌ 失败: ${error.message}`);
    }

    // 间隔 3 秒避免 API 限流
    if (i < recipes.length - 1) {
      await new Promise((r) => setTimeout(r, 3000));
    }
  }

  // 汇总
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
  console.log('\n' + '='.repeat(60));
  console.log('🎉 任务完成!');
  console.log(`⏱️ 耗时: ${elapsed} 秒`);
  console.log(`✅ 成功: ${success} 道`);
  console.log(`❌ 失败: ${failed} 道`);
  console.log(`📊 剩余: ${recipes.length - success - failed} 道未处理`);
  console.log('='.repeat(60));

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error('💥 脚本异常:', e);
  process.exit(1);
});
