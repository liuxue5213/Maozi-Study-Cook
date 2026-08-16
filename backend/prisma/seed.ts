import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * 种子数据：八大菜系 + 示例菜谱
 */
async function main() {
  console.log('🌱 开始填充种子数据...');

  // ==================== 八大菜系 ====================
  const cuisines = [
    {
      name: '川菜',
      nameEn: 'Sichuan',
      slug: 'sichuan',
      description:
        '川菜即四川菜肴，是中国特色传统的四大中国菜系之一，取材广泛，调味多变，菜式多样，口味清鲜醇浓并重，以善用麻辣调味著称，并以其别具一格的烹调方法和浓郁的地方风味，融会了东南西北各方的特点。',
      history:
        '川菜起源于春秋战国时的蜀国，秦汉时期初现端倪，汉晋时期古典川菜成型，以"尚滋味"、"好辛香"为特点；唐宋时期的古典川菜进一步发展，川菜开始出川，流传于全国；明末清初，辣椒传入中国，川菜逐渐形成以麻辣著称的特色；清末民初，现代川菜最终形成。',
      characteristics:
        '麻辣鲜香，一菜一格，百菜百味。擅长炒、炸、烧、烩、蒸、煮、炖、煨等烹调技法。调味多用三椒（辣椒、花椒、胡椒）和鲜姜。',
      famousDishes: JSON.stringify([
        '麻婆豆腐',
        '回锅肉',
        '水煮鱼',
        '宫保鸡丁',
        '夫妻肺片',
        '鱼香肉丝',
      ]),
      imageUrl: '/images/cuisines/sichuan.jpg',
      sortOrder: 1,
    },
    {
      name: '鲁菜',
      nameEn: 'Shandong',
      slug: 'shandong',
      description:
        '鲁菜是起源于山东的齐鲁风味，是中国传统四大菜系中唯一的自发型菜系，是历史最悠久、技法最丰富、难度最高、最见功力的菜系。',
      history:
        '鲁菜起源于山东淄博，春秋战国时期孔子提出"食不厌精，脍不厌细"的饮食观，对鲁菜的发展影响深远。北魏贾思勰《齐民要术》总结了山东地区的烹调技法。明清时期鲁菜成为宫廷御膳主体。',
      characteristics:
        '咸鲜醇厚，火候精湛，精于制汤，善以葱香调味。擅长爆、炒、烧、炸、溜、焖、扒等技法。',
      famousDishes: JSON.stringify([
        '糖醋鲤鱼',
        '九转大肠',
        '葱烧海参',
        '油焖大虾',
        '四喜丸子',
        '德州扒鸡',
      ]),
      imageUrl: '/images/cuisines/shandong.jpg',
      sortOrder: 2,
    },
    {
      name: '粤菜',
      nameEn: 'Cantonese',
      slug: 'cantonese',
      description:
        '粤菜即广东菜，发源于岭南，由广州菜、潮州菜、东江菜三种地方风味组成，选料精细，清而不淡，鲜而不俗，嫩而不生，油而不腻。',
      history:
        '粤菜形成于汉代，以广州菜为代表。唐宋时期随着中原移民南迁，粤菜吸收各地烹调之长。明清时期广州作为通商口岸，粤菜发展迅速，形成独特风格。',
      characteristics:
        '清淡鲜美，选料广博奇杂，口味随季节变化而变化。擅长炒、煎、焗、焖、炸、煲、炖、扣等技法。',
      famousDishes: JSON.stringify([
        '白切鸡',
        '烧鹅',
        '蜜汁叉烧',
        '清蒸石斑鱼',
        '虾饺',
        '肠粉',
      ]),
      imageUrl: '/images/cuisines/cantonese.jpg',
      sortOrder: 3,
    },
    {
      name: '苏菜',
      nameEn: 'Jiangsu',
      slug: 'jiangsu',
      description:
        '苏菜即江苏菜系，由南京、徐海、淮扬、苏南四种风味组成，是宫廷第二大菜系，今天国宴仍以淮扬菜为主。',
      history:
        '苏菜起源于南北朝时期，唐宋时期与浙菜竞秀，成为"南食"两大台柱之一。明清时期，苏菜沿运河、长江发展，影响遍及全国。',
      characteristics:
        '清鲜平和，精工细作，讲究造型，口味略甜。擅长炖、焖、蒸、炒、烧等技法。',
      famousDishes: JSON.stringify([
        '松鼠鳜鱼',
        '大煮干丝',
        '文思豆腐',
        '软兜长鱼',
        '盐水鸭',
        '蟹粉狮子头',
      ]),
      imageUrl: '/images/cuisines/jiangsu.jpg',
      sortOrder: 4,
    },
    {
      name: '浙菜',
      nameEn: 'Zhejiang',
      slug: 'zhejiang',
      description:
        '浙菜即浙江菜，以杭州、宁波、绍兴和温州四种风味为代表，菜式小巧玲珑，菜品鲜美滑嫩、脆软清爽。',
      history:
        '浙江烹饪的历史可以追溯到河姆渡文化时期。南宋时期，浙菜达到鼎盛，成为"南食"的代表。明清时期，浙菜进一步发展，形成独特的地方风格。',
      characteristics:
        '清鲜脆嫩，南料北烹，制作精细，富于变化。擅长炒、炸、烩、溜、蒸、烧等技法。',
      famousDishes: JSON.stringify([
        '东坡肉',
        '西湖醋鱼',
        '龙井虾仁',
        '叫花鸡',
        '宋嫂鱼羹',
        '冰糖甲鱼',
      ]),
      imageUrl: '/images/cuisines/zhejiang.jpg',
      sortOrder: 5,
    },
    {
      name: '闽菜',
      nameEn: 'Fujian',
      slug: 'fujian',
      description:
        '闽菜发源于福州，以福州菜为基础，后又融合闽东、闽南、闽西、闽北、莆仙五地风味菜形成的菜系。',
      history:
        '闽菜起源于闽侯县，两晋、南北朝时期，汉人南迁带来中原烹饪技术。唐宋时期，闽菜逐渐形成特色。明清时期，闽菜发展成熟，成为独立菜系。',
      characteristics:
        '鲜香清淡，汤路广泛，善制汤菜，善用红糟。擅长蒸、炒、煎、炸、焖、炖、煨等技法。',
      famousDishes: JSON.stringify([
        '佛跳墙',
        '荔枝肉',
        '沙茶面',
        '土笋冻',
        '太极芋泥',
        '七星鱼丸',
      ]),
      imageUrl: '/images/cuisines/fujian.jpg',
      sortOrder: 6,
    },
    {
      name: '湘菜',
      nameEn: 'Hunan',
      slug: 'hunan',
      description:
        '湘菜即湖南菜，以长沙、衡阳、湘潭三地为代表，是中国历史悠久的地方风味菜，早在汉朝就已形成菜系。',
      history:
        '湘菜起源于汉朝，经过长期发展，到明清时期逐渐成熟。湖南气候温暖湿润，辣椒有驱湿作用，因此湘菜以辣著称。',
      characteristics:
        '香辣酸辣，口味浓郁，重油重色，擅长煨、炖、腊、蒸、炒等技法。',
      famousDishes: JSON.stringify([
        '剁椒鱼头',
        '辣椒炒肉',
        '臭豆腐',
        '口味虾',
        '毛氏红烧肉',
        '湘西外婆菜',
      ]),
      imageUrl: '/images/cuisines/hunan.jpg',
      sortOrder: 7,
    },
    {
      name: '徽菜',
      nameEn: 'Anhui',
      slug: 'anhui',
      description:
        '徽菜起源于南宋时期的徽州府，是古徽州的地方特色，其独特的地理人文环境赋予了徽菜独有的味道。',
      history:
        '徽菜起源于南宋，徽商的兴起促进了徽菜的发展。徽菜随着徽商的足迹传播到全国各地，有"无徽不成镇"之说。',
      characteristics:
        '咸鲜微甜，讲究火功，善烹野味，以烹制山珍野味著称。擅长烧、炖、焖、熏、蒸等技法。',
      famousDishes: JSON.stringify([
        '臭鳜鱼',
        '毛豆腐',
        '一品锅',
        '黄山炖鸽',
        '问政山笋',
        '中和汤',
      ]),
      imageUrl: '/images/cuisines/anhui.jpg',
      sortOrder: 8,
    },
  ];

  // 插入菜系数据
  for (const cuisine of cuisines) {
    await prisma.cuisine.upsert({
      where: { slug: cuisine.slug },
      update: {},
      create: cuisine,
    });
  }
  console.log(`✅ 已插入 ${cuisines.length} 个菜系`);

  // ==================== 示例菜谱 ====================
  const sichuan = await prisma.cuisine.findUnique({ where: { slug: 'sichuan' } });

  if (sichuan) {
    // 麻婆豆腐
    const mapo = await prisma.recipe.upsert({
      where: { id: 1 },
      update: {},
      create: {
        title: '麻婆豆腐',
        description:
          '麻婆豆腐是四川省传统名菜之一，属于川菜。主要原料为豆腐和牛肉末（也可以用猪肉），特点是麻、辣、烫、香、酥、嫩、鲜、活八字。',
        cuisineId: sichuan.id,
        difficulty: 2,
        prepTime: 15,
        cookTime: 20,
        servings: 2,
        tips: '豆腐先焯水可以去除豆腥味，也能使豆腐更不容易碎',
        status: 1,
        ingredients: {
          create: [
            { name: '嫩豆腐', amount: '400g', isMain: true, sortOrder: 0 },
            { name: '牛肉末', amount: '100g', isMain: true, sortOrder: 1 },
            { name: '豆瓣酱', amount: '2大勺', isMain: false, sortOrder: 2 },
            { name: '花椒粉', amount: '1小勺', isMain: false, sortOrder: 3 },
            { name: '蒜末', amount: '适量', isMain: false, sortOrder: 4 },
            { name: '姜末', amount: '适量', isMain: false, sortOrder: 5 },
            { name: '葱花', amount: '适量', isMain: false, sortOrder: 6 },
            { name: '生抽', amount: '1勺', isMain: false, sortOrder: 7 },
            { name: '水淀粉', amount: '适量', isMain: false, sortOrder: 8 },
          ],
        },
        steps: {
          create: [
            {
              stepNumber: 1,
              description: '豆腐切成2cm见方的小块，放入加了盐的开水中焯水2分钟，捞出沥干备用。',
              duration: 3,
              tips: '焯水时加盐可以防止豆腐碎裂',
            },
            {
              stepNumber: 2,
              description: '热锅冷油，下牛肉末煸炒至变色出香味。',
              duration: 3,
              tips: '一定要把肉末炒干炒香',
            },
            {
              stepNumber: 3,
              description: '下豆瓣酱、姜末、蒜末，小火炒出红油。',
              duration: 2,
              tips: '小火慢炒，炒出香味',
            },
            {
              stepNumber: 4,
              description: '加入适量清水或高汤，放入豆腐，加生抽调味。',
              duration: 1,
            },
            {
              stepNumber: 5,
              description: '中火烧3-5分钟，让豆腐入味。',
              duration: 5,
              tips: '轻轻推动，避免翻炒导致豆腐碎裂',
            },
            {
              stepNumber: 6,
              description: '用水淀粉勾芡，撒上花椒粉和葱花即可出锅。',
              duration: 1,
              tips: '分2-3次勾芡，每次少量',
            },
          ],
        },
      },
    });

    // 更新菜系菜谱数
    await prisma.cuisine.update({
      where: { id: sichuan.id },
      data: { recipeCount: 1 },
    });

    console.log('✅ 已插入示例菜谱：麻婆豆腐');
  }

  console.log('🎉 种子数据填充完成！');
}

main()
  .catch((e) => {
    console.error('❌ 种子数据填充失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
