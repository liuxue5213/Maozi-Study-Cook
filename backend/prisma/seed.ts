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

    // ==================== 更多菜谱（八大菜系各 2 道） ====================
    const ing = (name: string, amount: string, isMain = false) => ({ name, amount, isMain });
    const stp = (n: number, description: string, duration = 3, tips?: string) => ({
      stepNumber: n,
      description,
      duration,
      ...(tips ? { tips } : {}),
    });

    const extraRecipes = [
      {
        id: 2, slug: 'sichuan', title: '回锅肉', difficulty: 2, prepTime: 15, cookTime: 15, servings: 2,
        description: '回锅肉是川菜代表菜之一，肥瘦相间的五花肉先煮后炒，配豆瓣酱与蒜苗，肥而不腻，酱香浓郁。',
        tips: '肉要煮到八成熟，炒时用中火把肉片煸出灯盏窝',
        ingredients: [ing('五花肉', '400g', true), ing('蒜苗', '100g', true), ing('郫县豆瓣酱', '1大勺'), ing('甜面酱', '1小勺'), ing('豆豉', '1小勺'), ing('姜片', '3片'), ing('料酒', '2勺')],
        steps: [stp(1, '五花肉冷水下锅，加姜片料酒，煮约15分钟至八成熟，捞出晾凉切薄片。', 18), stp(2, '蒜苗斜切成段，豆瓣酱剁细备用。', 2), stp(3, '中火将肉片煸炒至微卷出油，呈灯盏窝状。', 5, '火不要太大避免炒焦'), stp(4, '下豆瓣酱、豆豉、甜面酱炒出红油。', 2), stp(5, '加入蒜苗段翻炒断生即可出锅。', 2)],
      },
      {
        id: 3, slug: 'sichuan', title: '宫保鸡丁', difficulty: 3, prepTime: 20, cookTime: 10, servings: 2,
        description: '宫保鸡丁以鸡丁、花生米、干辣椒为主料，糊辣荔枝味型，酸甜微辣，是享誉世界的川菜名品。',
        tips: '碗汁提前调好，大火快炒一气呵成',
        ingredients: [ing('鸡胸肉', '300g', true), ing('油炸花生米', '80g', true), ing('干辣椒', '10个'), ing('花椒', '1小勺'), ing('葱段', '50g'), ing('生抽', '2勺'), ing('香醋', '2勺'), ing('白糖', '1勺'), ing('淀粉', '1勺')],
        steps: [stp(1, '鸡肉切丁，用料酒、生抽、淀粉腌15分钟。', 15), stp(2, '将生抽、香醋、白糖、淀粉加少许水调成碗汁。', 2), stp(3, '热油下干辣椒花椒炸出香味，下鸡丁炒至变色。', 3), stp(4, '加葱段翻炒，倒入碗汁快速翻匀。', 2), stp(5, '最后加花生米翻炒几下即可。', 1, '花生米最后放保持酥脆')],
      },
      {
        id: 4, slug: 'cantonese', title: '白切鸡', difficulty: 2, prepTime: 10, cookTime: 25, servings: 4,
        description: '白切鸡是粤菜经典，皮爽肉滑、原汁原味，蘸姜葱蓉食用，最能体现鸡肉的鲜甜。',
        tips: '三提三浸再浸熟，冰水过凉鸡皮才爽脆',
        ingredients: [ing('三黄鸡', '1只(约1.2kg)', true), ing('姜', '1块'), ing('葱', '3根'), ing('料酒', '2勺'), ing('沙姜', '1小块'), ing('花生油', '3勺'), ing('盐', '适量')],
        steps: [stp(1, '整鸡洗净，锅中水加姜葱料酒烧至微沸。', 3), stp(2, '提鸡三次浸入热水再提起，让腹腔温度一致。', 3), stp(3, '整鸡浸入锅中，微火保持水面冒虾眼泡，浸约20分钟。', 20, '水不能大滚'), stp(4, '捞出立即放入冰水中浸凉，捞起晾干刷薄油。', 10), stp(5, '斩件装盘，姜葱沙姜切茸加盐，浇热油成蘸料。', 5)],
      },
      {
        id: 5, slug: 'cantonese', title: '豉汁蒸排骨', difficulty: 1, prepTime: 20, cookTime: 18, servings: 2,
        description: '广式茶楼必点的豉汁蒸排骨，豆豉香浓、排骨嫩滑，在家蒸一笼配茶正好。',
        tips: '排骨拌生粉和油锁住水分，蒸出来才嫩',
        ingredients: [ing('肋排', '400g', true), ing('阳江豆豉', '1大勺'), ing('蒜蓉', '2勺'), ing('生抽', '1勺'), ing('蚝油', '1勺'), ing('白糖', '半勺'), ing('生粉', '1勺'), ing('红椒粒', '少许')],
        steps: [stp(1, '排骨剁小段洗净血水，沥干。', 5), stp(2, '豆豉剁碎与蒜蓉爆香，加生抽蚝油糖拌匀。', 3), stp(3, '酱料与排骨拌匀，加生粉和少许油抓匀腌15分钟。', 15), stp(4, '铺盘撒红椒粒，水开后大火蒸18分钟。', 18), stp(5, '出锅撒葱花即可。', 1)],
      },
      {
        id: 6, slug: 'shandong', title: '糖醋里脊', difficulty: 3, prepTime: 20, cookTime: 15, servings: 3,
        description: '鲁菜经典糖醋味型，里脊外酥里嫩，糖醋汁明亮挂壁，酸甜开胃，老少皆宜。',
        tips: '复炸一次才够酥脆，糖醋汁比例 1 料酒 2 生抽 3 糖 4 醋',
        ingredients: [ing('猪里脊', '350g', true), ing('番茄酱', '3勺'), ing('白糖', '4勺'), ing('香醋', '4勺'), ing('料酒', '1勺'), ing('淀粉', '100g'), ing('鸡蛋', '1个'), ing('白芝麻', '少许')],
        steps: [stp(1, '里脊切条，加盐、料酒、蛋液腌10分钟。', 10), stp(2, '裹干淀粉，抖去多余浮粉。', 3), stp(3, '油温六成热下锅炸至定型捞出，升油温复炸30秒至金黄。', 8), stp(4, '锅留底油，下番茄酱、糖、醋、少许水熬至浓稠冒泡。', 3), stp(5, '倒入里脊快速翻匀，撒白芝麻出锅。', 1)],
      },
      {
        id: 7, slug: 'shandong', title: '葱爆羊肉', difficulty: 2, prepTime: 15, cookTime: 5, servings: 2,
        description: '鲁菜代表菜，羊肉滑嫩、大葱香甜，旺火快爆，酱香与葱香交融，下饭一绝。',
        tips: '全程大火快炒，羊肉变色即出锅',
        ingredients: [ing('羊后腿肉', '300g', true), ing('大葱', '2根', true), ing('生抽', '2勺'), ing('料酒', '1勺'), ing('米醋', '半勺'), ing('香油', '少许'), ing('蒜', '3瓣')],
        steps: [stp(1, '羊肉逆纹切薄片，加料酒、生抽、淀粉抓匀腌10分钟。', 10), stp(2, '大葱切斜段，蒜切片。', 2), stp(3, '大火热油，下羊肉快速滑散至变色盛出。', 2), stp(4, '余油爆香蒜片，下葱段炒出香味。', 1), stp(5, '倒回羊肉，烹入米醋和生抽，翻匀淋香油出锅。', 1)],
      },
      {
        id: 8, slug: 'jiangsu', title: '清炖狮子头', difficulty: 3, prepTime: 30, cookTime: 90, servings: 4,
        description: '淮扬名菜，肥瘦相间的肉圆细嫩如豆腐，清汤醇厚，入口即化，是功夫菜的代表作。',
        tips: '肉要手工细切粗斩，摔打上劲，小火慢炖',
        ingredients: [ing('猪前腿肉(肥四瘦六)', '500g', true), ing('马蹄', '6个'), ing('娃娃菜', '2棵'), ing('姜末', '1勺'), ing('蛋清', '1个'), ing('淀粉', '2勺'), ing('高汤', '适量'), ing('料酒', '1勺')],
        steps: [stp(1, '猪肉细切粗斩成石榴粒大小，马蹄切碎。', 20), stp(2, '肉糜加马蹄、姜末、蛋清、淀粉、料酒，顺一个方向搅打上劲。', 8), stp(3, '手上沾水，团成大丸子，反复摔打排出空气。', 5), stp(4, '砂锅高汤烧至微沸，下肉圆和娃娃菜。', 3), stp(5, '小火炖1.5小时，撇净浮油，加盐调味。', 90, '保持水面微微抖动即可')],
      },
      {
        id: 9, slug: 'jiangsu', title: '盐水鸭', difficulty: 3, prepTime: 120, cookTime: 30, servings: 4,
        description: '南京名菜，皮白肉嫩、肥而不腻、鲜香回甘，热盐搓、清卤复、吊坯风干是关键。',
        tips: '炒热的花椒盐擦遍鸭身，风干后再煮',
        ingredients: [ing('鸭子', '半只(约1kg)', true), ing('粗盐', '100g'), ing('花椒', '2勺'), ing('姜片', '5片'), ing('葱段', '3根'), ing('八角', '2个'), ing('料酒', '2勺')],
        steps: [stp(1, '粗盐加花椒小火炒至微黄出香。', 3), stp(2, '热盐均匀擦遍鸭身内外，腌2小时。', 120), stp(3, '清水加姜葱八角料酒烧开放凉成卤，鸭子浸入卤中2小时。', 120), stp(4, '取出挂通风处风干1小时。', 60), stp(5, '水中加姜葱，微火浸煮25分钟，关火再焖10分钟，斩件。', 35)],
      },
      {
        id: 10, slug: 'zhejiang', title: '西湖醋鱼', difficulty: 3, prepTime: 15, cookTime: 15, servings: 2,
        description: '杭州名菜，草鱼氽熟浇糖醋芡，鱼肉嫩美带蟹味，酸甜适口，不用一滴油。',
        tips: '鱼氽3分钟内捞出保持嫩度，芡汁要薄',
        ingredients: [ing('草鱼', '1条(约750g)', true), ing('绍兴黄酒', '2勺'), ing('生抽', '2勺'), ing('白糖', '3勺'), ing('香醋', '3勺'), ing('姜末', '2勺'), ing('淀粉', '2勺')],
        steps: [stp(1, '草鱼剖成两片，在其中一片上划几刀便于成熟。', 5), stp(2, '水中加姜片黄酒烧开，鱼片下锅氽约3分钟捞出装盘。', 4), stp(3, '取煮鱼汤适量，加生抽、糖、料酒、姜末烧开。', 2), stp(4, '淀粉加水调开勾薄芡，加香醋推匀。', 2), stp(5, '芡汁浇在鱼身上，撒姜末即成。', 1)],
      },
      {
        id: 11, slug: 'zhejiang', title: '东坡肉', difficulty: 3, prepTime: 15, cookTime: 150, servings: 4,
        description: '相传苏东坡所创，五花肉加黄酒慢煨，色泽红亮、酥烂不碎、香糯不腻。',
        tips: '全程黄酒代水，小火慢煨足时辰',
        ingredients: [ing('带皮五花肉', '600g', true), ing('绍兴黄酒', '300ml'), ing('生抽', '3勺'), ing('老抽', '1勺'), ing('冰糖', '50g'), ing('葱段', '3根'), ing('姜片', '5片')],
        steps: [stp(1, '五花肉切大方块，冷水下锅焯水定型。', 8), stp(2, '砂锅底铺葱姜，肉皮朝下码入。', 3), stp(3, '加黄酒、生抽、老抽、冰糖，大火烧开。', 3), stp(4, '转小火加盖煨1小时，翻面再煨半小时。', 90), stp(5, '肉皮朝上装盘，浇汁入蒸锅再蒸20分钟更酥烂。', 20)],
      },
      {
        id: 12, slug: 'fujian', title: '荔枝肉', difficulty: 3, prepTime: 20, cookTime: 15, servings: 3,
        description: '闽菜传统名菜，猪肉打花刀炸后卷缩形似荔枝，外酥里嫩，酸甜带着红糟香。',
        tips: '花刀深浅一致，炸后才会卷成荔枝形',
        ingredients: [ing('猪里脊', '350g', true), ing('红糟', '1勺'), ing('马蹄', '5个'), ing('白糖', '3勺'), ing('香醋', '2勺'), ing('生抽', '1勺'), ing('淀粉', '80g'), ing('蒜蓉', '1勺')],
        steps: [stp(1, '里脊切厚片，剞十字花刀再切块，用红糟、料酒腌15分钟。', 15), stp(2, '马蹄切块，与肉块一起裹淀粉。', 3), stp(3, '油温六成热下锅炸至金黄卷缩成荔枝状。', 6), stp(4, '糖、醋、生抽、淀粉调碗汁，爆香蒜蓉倒入烧开。', 2), stp(5, '倒入肉块和马蹄翻匀挂汁出锅。', 1)],
      },
      {
        id: 13, slug: 'fujian', title: '醉排骨', difficulty: 2, prepTime: 20, cookTime: 10, servings: 3,
        description: '福州名菜，排骨炸香后趁热拌入酱汁，上桌时仍在滋滋作响，故称"醉"。',
        tips: '酱汁先调好，排骨炸好趁热拌',
        ingredients: [ing('肋排', '500g', true), ing('白糖', '2勺'), ing('香醋', '2勺'), ing('生抽', '1勺'), ing('料酒', '1勺'), ing('蒜蓉', '2勺'), ing('葱花', '1勺'), ing('淀粉', '60g')],
        steps: [stp(1, '排骨剁小块，加料酒、盐腌20分钟。', 20), stp(2, '糖、醋、生抽、蒜蓉、葱花、香油调成酱汁。', 3), stp(3, '排骨裹干淀粉，六成油温炸至金黄酥脆。', 8), stp(4, '升高油温复炸20秒捞出。', 1), stp(5, '趁热倒入酱汁快速翻拌，让酱汁裹匀即可。', 1)],
      },
      {
        id: 14, slug: 'hunan', title: '剁椒鱼头', difficulty: 3, prepTime: 15, cookTime: 15, servings: 3,
        description: '湘菜头牌，胖鱼头铺满红剁椒蒸制，鲜辣而不燥，鱼肉细嫩，汤汁拌面一绝。',
        tips: '鱼头从背部剖开不切断，蒸好泼热油激香',
        ingredients: [ing('胖鱼头', '1个(约1kg)', true), ing('剁椒', '150g', true), ing('姜末', '1勺'), ing('蒜末', '2勺'), ing('蒸鱼豉油', '2勺'), ing('料酒', '2勺'), ing('葱花', '适量'), ing('热油', '3勺')],
        steps: [stp(1, '鱼头洗净从背部剖开，抹料酒和盐腌10分钟。', 10), stp(2, '剁椒加姜蒜末拌匀。', 2), stp(3, '鱼头切面朝上铺盘，均匀盖上剁椒。', 3), stp(4, '水开后大火蒸12分钟，关火虚蒸3分钟。', 15), stp(5, '淋蒸鱼豉油撒葱花，浇滚烫热油激香。', 2)],
      },
      {
        id: 15, slug: 'hunan', title: '辣椒炒肉', difficulty: 1, prepTime: 10, cookTime: 8, servings: 2,
        description: '湖南家常第一名，螺丝椒配土猪肉大火爆炒，椒香肉嫩，油汤拌饭能吃三碗。',
        tips: '辣椒先干煸出虎皮，肉要肥瘦分开炒',
        ingredients: [ing('前腿肉(肥瘦)', '300g', true), ing('螺丝椒', '200g', true), ing('蒜片', '3瓣'), ing('豆豉', '1小勺'), ing('生抽', '2勺'), ing('老抽', '半勺'), ing('盐', '适量')],
        steps: [stp(1, '肥肉切片炼出油脂，瘦肉切片用生抽抓一下。', 5), stp(2, '螺丝椒拍扁切段，干锅煸出虎皮盛出。', 4), stp(3, '瘦肉下锅滑炒至变色盛出。', 2), stp(4, '爆香蒜片豆豉，倒回辣椒和肉，加生抽老抽炒匀。', 2), stp(5, '沿锅边点少许水炝出锅气即可。', 1)],
      },
      {
        id: 16, slug: 'anhui', title: '臭鳜鱼', difficulty: 4, prepTime: 30, cookTime: 25, servings: 3,
        description: '徽菜代表作，鳜鱼轻度发酵后似臭非臭、闻臭吃香，蒜瓣肉紧实，咸鲜透亮。',
        tips: '腌制 25 度左右 6-7 天，煎透再烧',
        ingredients: [ing('淡盐腌制鳜鱼', '1条(约750g)', true), ing('五花肉丁', '50g'), ing('笋丁', '50g'), ing('干辣椒', '3个'), ing('姜片', '5片'), ing('黄酒', '2勺'), ing('老抽', '1勺'), ing('白糖', '半勺')],
        steps: [stp(1, '鲜鳜鱼抹盐，25度室温放置6-7天至轻微发酵（或买成品腌鱼）。', 8640), stp(2, '鱼身打花刀，热油煎至两面金黄。', 6), stp(3, '下肉丁、笋丁、干辣椒姜片爆香。', 2), stp(4, '加黄酒、老抽、糖和热水没过鱼身，中火烧15分钟。', 15), stp(5, '大火收汁浇在鱼身即可。', 3)],
      },
      {
        id: 17, slug: 'anhui', title: '毛豆腐', difficulty: 2, prepTime: 10, cookTime: 10, servings: 2,
        description: '徽州特色，豆腐发酵长出白茸茸菌丝，煎至金黄后红烧，外脆内滑，鲜味十足。',
        tips: '小火慢煎勿翻碎，酱汁收浓挂身',
        ingredients: [ing('毛豆腐', '6块', true), ing('葱花', '1勺'), ing('辣椒糊', '1勺'), ing('生抽', '2勺'), ing('白糖', '半勺'), ing('高汤', '100ml'), ing('菜籽油', '适量')],
        steps: [stp(1, '毛豆腐冲洗沥干。', 2), stp(2, '菜籽油小火将豆腐两面煎至金黄起壳。', 8, '耐心勿急翻'), stp(3, '加生抽、糖、辣椒糊和高汤。', 1), stp(4, '中火烧2分钟收浓汤汁。', 2), stp(5, '撒葱花装盘。', 1)],
      },
    ];

    // 菜系 id 映射
    const cuisineRecords: Record<string, number> = {};
    for (const c of await prisma.cuisine.findMany()) {
      cuisineRecords[c.slug] = c.id;
    }

    for (const r of extraRecipes) {
      await prisma.recipe.upsert({
        where: { id: r.id },
        update: {},
        create: {
          title: r.title,
          description: r.description,
          cuisineId: cuisineRecords[r.slug],
          difficulty: r.difficulty,
          prepTime: r.prepTime,
          cookTime: r.cookTime,
          servings: r.servings,
          tips: r.tips,
          status: 1,
          ingredients: {
            create: r.ingredients.map((i, idx) => ({ ...i, sortOrder: idx })),
          },
          steps: {
            create: r.steps.map((s) => ({ ...s })),
          },
        },
      });
    }

    // 按实际数量刷新各菜系 recipeCount
    const grouped = await prisma.recipe.groupBy({ by: ['cuisineId'], _count: { id: true } });
    for (const g of grouped) {
      if (g.cuisineId != null) {
        await prisma.cuisine.update({
          where: { id: g.cuisineId },
          data: { recipeCount: g._count.id },
        });
      }
    }

    console.log(`✅ 已插入示例菜谱：麻婆豆腐 + ${extraRecipes.length} 道八大菜系名菜`);
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
