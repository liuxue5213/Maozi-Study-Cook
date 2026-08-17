#!/usr/bin/env node
/**
 * 菜品预览图定时生成脚本（图片优化版）
 * =================================
 * 功能:
 *   1. 为没有封面的菜品生成 AI 美食摄影图片
 *   2. 为已有封面但缺缩略图的菜品补生成（压缩存量大图，不重新生成）
 * 图片规格（解决手机端加载慢）:
 *   - 主图:  720px 宽 JPEG q82（约 80-150KB，详情页用）
 *   - 缩略图: 400px 宽 JPEG q75（约 30-60KB，列表页用，存 thumbs/ 子目录）
 *
 * 使用方式:
 *   node scripts/generate-images.mjs            # 生成 100 道
 *   node scripts/generate-images.mjs --limit 50 # 生成 50 道
 *   node scripts/generate-images.mjs --all      # 生成全部
 *   node scripts/generate-images.mjs --thumbs-only  # 只补缩略图/压缩存量图
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const { PrismaClient } = await import('@prisma/client');
const { default: axios } = await import('axios');
const { mkdir } = await import('fs/promises');
const { join, dirname } = await import('path');
const { fileURLToPath } = await import('url');

const __dirname = dirname(fileURLToPath(import.meta.url));

// ======================== 配置 ========================
const UPLOAD_DIR = join(__dirname, '..', 'uploads', 'recipe-covers');
const THUMB_DIR = join(UPLOAD_DIR, 'thumbs');
const MODEL = 'Tongyi-MAI/Z-Image-Turbo';
const API_BASE = 'https://api-inference.modelscope.cn/';
const API_KEY = process.env.MODELSCOPE_API_KEY || 'ms-dd0f5c6b-f3e3-4628-b94d-615e8ff78386';

const prisma = new PrismaClient();
const sharp = require('sharp');

// ======================== 解析参数 ========================
const args = process.argv.slice(2);
const limitIndex = args.indexOf('--limit');
const BATCH_SIZE = limitIndex !== -1 ? parseInt(args[limitIndex + 1]) || 100 : 100;
const GENERATE_ALL = args.includes('--all');
const THUMBS_ONLY = args.includes('--thumbs-only');

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

  const submitRes = await axios.post(
    `${API_BASE}v1/images/generations`,
    { model: MODEL, prompt },
    { headers: { ...headers, 'X-ModelScope-Async-Mode': 'true' }, timeout: 30000 },
  );

  const taskId = submitRes.data?.task_id;
  if (!taskId) throw new Error('Failed to get task_id');

  // 轮询等待结果（最多 5 分钟）
  let elapsed = 0;
  while (elapsed < 300000) {
    await new Promise((r) => setTimeout(r, 5000));
    elapsed += 5000;

    const resultRes = await axios.get(`${API_BASE}v1/tasks/${taskId}`, {
      headers: { ...headers, 'X-ModelScope-Task-Type': 'image_generation' },
      timeout: 30000,
    });

    if (resultRes.data?.task_status === 'SUCCEED') {
      return resultRes.data?.output_images?.[0];
    }
    if (resultRes.data?.task_status === 'FAILED') {
      throw new Error('Image generation failed');
    }
  }
  throw new Error('Image generation timeout');
}

// ======================== 保存（压缩 + 缩略图） ========================
async function saveImages(imageBuffer, recipeId) {
  const mainBuf = await sharp(imageBuffer)
    .resize({ width: 720, withoutEnlargement: true })
    .jpeg({ quality: 82 })
    .toBuffer();
  const thumbBuf = await sharp(imageBuffer)
    .resize({ width: 400, withoutEnlargement: true })
    .jpeg({ quality: 75 })
    .toBuffer();

  const fileName = `recipe_${recipeId}.jpg`;
  await sharp(mainBuf).toFile(join(UPLOAD_DIR, fileName));
  await sharp(thumbBuf).toFile(join(THUMB_DIR, fileName));

  return {
    coverImage: `/uploads/recipe-covers/${fileName}`,
    coverThumb: `/uploads/recipe-covers/thumbs/${fileName}`,
    mainKB: Math.round(mainBuf.length / 1024),
    thumbKB: Math.round(thumbBuf.length / 1024),
  };
}

// ======================== 主流程 ========================
async function main() {
  const startTime = Date.now();

  console.log('='.repeat(60));
  console.log('🎨 菜品预览图生成任务（优化版）');
  console.log(`⏰ 开始时间: ${new Date().toLocaleString('zh-CN')}`);
  console.log(`📦 模式: ${GENERATE_ALL ? '全部' : BATCH_SIZE + ' 道'}${THUMBS_ONLY ? '（仅补缩略图）' : ''}`);
  console.log('='.repeat(60));

  await mkdir(UPLOAD_DIR, { recursive: true });
  await mkdir(THUMB_DIR, { recursive: true });

  // ---------- Pass 1: 为已有封面但缺缩略图的存量图做本地压缩（不调 AI） ----------
  const needThumb = await prisma.recipe.findMany({
    where: { coverImage: { not: null }, coverThumb: null },
    select: { id: true, title: true, coverImage: true },
    orderBy: { id: 'asc' },
  });
  console.log(`📊 待压缩补缩略图: ${needThumb.length} 道`);

  let optimized = 0;
  for (const r of needThumb) {
    try {
      const localPath = join(__dirname, '..', r.coverImage.replace(/^\/+/, ''));
      const buf = await sharp(localPath).toBuffer();
      const saved = await saveImages(buf, r.id);
      await prisma.recipe.update({
        where: { id: r.id },
        data: { coverImage: saved.coverImage, coverThumb: saved.coverThumb },
      });
      optimized++;
      if (optimized % 20 === 0) console.log(`  压缩进度: ${optimized}/${needThumb.length}`);
    } catch (e) {
      console.log(`  ⚠️ #${r.id} ${r.title} 本地文件缺失或损坏: ${e.message}`);
    }
  }
  console.log(`✅ 存量压缩完成: ${optimized} 道\n`);

  if (THUMBS_ONLY) {
    console.log(`🎉 完成！耗时 ${((Date.now() - startTime) / 1000 / 60).toFixed(1)} 分钟`);
    await prisma.$disconnect();
    return;
  }

  // ---------- Pass 2: 为没有封面的菜品生成 AI 图片 ----------
  const recipes = await prisma.recipe.findMany({
    where: { OR: [{ coverImage: null }, { coverImage: '' }] },
    include: { cuisine: { select: { name: true } } },
    take: GENERATE_ALL ? undefined : BATCH_SIZE,
    orderBy: { id: 'asc' },
  });

  console.log(`📊 待生成: ${recipes.length} 道菜品\n`);
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
      const imageUrl = await generateImage(generatePrompt(recipe));
      if (!imageUrl) throw new Error('No image URL returned');

      // 下载到内存 → 压缩保存双规格
      const res = await axios.get(imageUrl, { responseType: 'arraybuffer', timeout: 60000 });
      const saved = await saveImages(Buffer.from(res.data), recipe.id);

      await prisma.recipe.update({
        where: { id: recipe.id },
        data: { coverImage: saved.coverImage, coverThumb: saved.coverThumb },
      });

      success++;
      console.log(`  ✅ 已生成: 主图 ${saved.mainKB}KB / 缩略图 ${saved.thumbKB}KB`);
    } catch (error) {
      failed++;
      console.log(`  ❌ 失败: ${error.message}`);
    }

    if (i < recipes.length - 1) await new Promise((r) => setTimeout(r, 3000));
  }

  const elapsed = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
  console.log('\n' + '='.repeat(60));
  console.log('🎉 任务完成!');
  console.log(`⏱️ 耗时: ${elapsed} 分钟`);
  console.log(`✅ 成功: ${success} 道`);
  console.log(`❌ 失败: ${failed} 道`);
  console.log('='.repeat(60));

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error('💥 脚本异常:', e);
  process.exit(1);
});
