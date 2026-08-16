import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
const prisma = new PrismaClient();

const D = JSON.parse(readFileSync('prisma/recipes_extra.json', 'utf8'));
console.log(`🍳 共加载 ${D.length} 道菜谱`);

let created = 0, skipped = 0, errors = 0;
for (const d of D) {
  try {
    const cuisine = await prisma.cuisine.findUnique({ where: { slug: d.cus } });
    if (!cuisine) { console.warn(`⚠️ 菜系 ${d.cus} 不存在: ${d.title}`); errors++; continue; }
    const existing = await prisma.recipe.findFirst({ where: { title: d.title } });
    if (existing) { skipped++; continue; }
    await prisma.recipe.create({
      data: {
        title: d.title, description: d.desc, cuisineId: cuisine.id,
        difficulty: d.diff, prepTime: d.prep, cookTime: d.cook,
        servings: d.num, tips: d.tip, status: 1,
        ingredients: { create: d.ing.map(([name, amount, isMain], i) => ({ name, amount, isMain, sortOrder: i })) },
        steps: { create: d.stp.map(([description, duration, tips], i) => ({ stepNumber: i + 1, description, duration, tips: tips || null })) },
      },
    });
    created++;
  } catch (e) {
    console.error(`  ❌ ${d.title}: ${e.message}`);
    errors++;
  }
}

const cuisines = await prisma.cuisine.findMany();
for (const c of cuisines) {
  const count = await prisma.recipe.count({ where: { cuisineId: c.id, status: 1 } });
  await prisma.cuisine.update({ where: { id: c.id }, data: { recipeCount: count } });
  if (count > 0) console.log(`📊 ${c.name}: ${count} 道`);
}

console.log(`\n🎉 完成！新增 ${created} 道，跳过 ${skipped} 道，错误 ${errors} 道`);
await prisma.$disconnect();
