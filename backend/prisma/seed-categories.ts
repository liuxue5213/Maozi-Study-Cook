import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const categories = [
  // 中国地方菜系
  { name: '东北菜', nameEn: 'Northeastern', slug: 'northeastern', description: '东北菜是中国东北地区的特色菜系，以炖菜见长，口味咸鲜，分量十足，有锅包肉、小鸡炖蘑菇、猪肉炖粉条等经典名菜。', history: '东北菜起源于满汉全席，融合了满、汉、朝等多民族饮食文化，因东北寒冷气候，以炖、煮为主，热量高、份量足。', characteristics: '咸鲜为主，火候足，份量大，炖菜见长，擅用大酱、酱油。', famousDishes: '["锅包肉","小鸡炖蘑菇","猪肉炖粉条","地三鲜","溜肉段"]', sortOrder: 9 },
  { name: '北京菜', nameEn: 'Beijing', slug: 'beijing', description: '北京菜以京味为主，融合满汉精华，有烤鸭、涮羊肉、京酱肉丝等，口味醇厚，做工精细。', history: '北京作为六朝古都，饮食文化融合了满、汉、回等多民族特色，明清时期宫廷菜与民间菜相互交融。', characteristics: '以烤、爆、溜见长，口味醇厚，做工精细，擅用芝麻酱。', famousDishes: '["北京烤鸭","涮羊肉","京酱肉丝","炸酱面","驴打滚"]', sortOrder: 10 },
  { name: '上海本帮菜', nameEn: 'Shanghai', slug: 'shanghai', description: '上海本帮菜浓油赤酱，咸甜适中，有红烧肉、糖醋小排、腌笃鲜等经典，讲究火候。', history: '本帮菜起源于上海本地民间，受苏浙菜系影响，形成了浓油赤酱、咸甜适中的独特风格。', characteristics: '浓油赤酱，咸甜适中，火候讲究，擅用糖和酱油。', famousDishes: '["红烧肉","糖醋小排","腌笃鲜","油爆虾","四喜烤麸"]', sortOrder: 11 },
  { name: '天津菜', nameEn: 'Tianjin', slug: 'tianjin', description: '天津菜以河海两鲜为特色，有狗不理包子、麻花、煎饼果子等，口味咸鲜，小吃丰富。', history: '天津地处九河下梢，河海两鲜丰富，饮食文化融合了码头文化和宫廷文化，小吃尤为出名。', characteristics: '咸鲜为主，河海两鲜，小吃丰富，擅用大料。', famousDishes: '["狗不理包子","十八街麻花","煎饼果子","锅巴菜","贴饽饽"]', sortOrder: 12 },
  { name: '云南菜', nameEn: 'Yunnan', slug: 'yunnan', description: '云南菜以少数民族风味为特色，食材丰富独特，有汽锅鸡、过桥米线、野生菌等，口味多样。', history: '云南有25个少数民族，各民族饮食文化交融，加上独特的地理气候，形成了丰富多样的饮食特色。', characteristics: '酸辣为主，食材独特，野生菌丰富，少数民族风味多样。', famousDishes: '["汽锅鸡","过桥米线","野生菌火锅","饵块","乳扇"]', sortOrder: 13 },
  { name: '贵州菜', nameEn: 'Guizhou', slug: 'guizhou', description: '贵州菜以酸辣闻名，有酸汤鱼、肠旺面、丝娃娃等，酸汤是灵魂，开胃解腻。', history: '贵州气候潮湿，苗族、侗族等少数民族以酸汤驱湿开胃，形成了独特的酸汤饮食文化。', characteristics: '酸辣为主，酸汤是灵魂，少数民族风味，擅用发酵。', famousDishes: '["酸汤鱼","肠旺面","丝娃娃","花江狗肉","豆腐圆子"]', sortOrder: 14 },
  { name: '广西菜', nameEn: 'Guangxi', slug: 'guangxi', description: '广西菜以米粉文化为核心，有螺蛳粉、桂林米粉、老友粉等，酸辣鲜香，风味独特。', history: '广西是多民族聚居地，米粉文化历史悠久，加上独特的地理环境，形成了丰富的地方小吃。', characteristics: '酸辣鲜香，米粉文化，柠檬鸭、螺蛳粉为代表，擅用酸笋。', famousDishes: '["螺蛳粉","桂林米粉","柠檬鸭","老友粉","啤酒鱼"]', sortOrder: 15 },
  { name: '海南菜', nameEn: 'Hainan', slug: 'hainan', description: '海南菜以海鲜和禽类为主，有文昌鸡、加积鸭、和乐蟹等，清淡鲜美，原汁原味。', history: '海南岛四面环海，物产丰富，饮食文化受黎族和南洋影响，以清淡鲜美著称。', characteristics: '清淡鲜美，海鲜丰富，原汁原味，椰子入菜。', famousDishes: '["文昌鸡","加积鸭","和乐蟹","东山羊","椰子鸡"]', sortOrder: 16 },
  { name: '河南菜', nameEn: 'Henan', slug: 'henan', description: '豫菜历史悠久，口味居中，有烩面、胡辣汤、道口烧鸡等，咸香醇厚，汤品丰富。', history: '河南是中华文明发源地，豫菜被称为"八大菜系之母"，口味居中，兼收并蓄。', characteristics: '咸香醇厚，汤品丰富，口味居中，面食发达。', famousDishes: '["烩面","胡辣汤","道口烧鸡","水席","灌汤包"]', sortOrder: 17 },
  { name: '湖北菜', nameEn: 'Hubei', slug: 'hubei', description: '湖北菜以淡水鱼鲜为特色，有清蒸武昌鱼、热干面、莲藕排骨汤等，口味鲜香。', history: '湖北地处长江中游，千湖之省，淡水鱼鲜丰富，九省通衢，饮食文化融合南北。', characteristics: '鲜香为主，淡水鱼鲜，粉蒸见长，汤品丰富。', famousDishes: '["清蒸武昌鱼","热干面","莲藕排骨汤","三鲜豆皮","面窝"]', sortOrder: 18 },
  { name: '江西菜', nameEn: 'Jiangxi', slug: 'jiangxi', description: '赣菜以辣味著称，有瓦罐汤、粉蒸肉、三杯鸡等，咸鲜辣香，火候足。', history: '江西地处江南，气候潮湿，赣菜以辣驱湿，加上瓦罐煨汤文化，形成了独特风味。', characteristics: '咸鲜辣香，瓦罐煨汤，粉蒸见长，火候足。', famousDishes: '["瓦罐汤","粉蒸肉","三杯鸡","藜蒿炒腊肉","白糖糕"]', sortOrder: 19 },
  { name: '新疆菜', nameEn: 'Xinjiang', slug: 'xinjiang', description: '新疆菜以牛羊肉和烤制为特色，有烤全羊、大盘鸡、手抓饭等，香料丰富，风味浓郁。', history: '新疆地处丝绸之路，融合了中亚和中原饮食文化，以牛羊肉为主，香料丰富。', characteristics: '烤制见长，牛羊肉为主，香料丰富，风味浓郁。', famousDishes: '["烤全羊","大盘鸡","手抓饭","烤包子","拉条子"]', sortOrder: 20 },
  { name: '西藏菜', nameEn: 'Tibetan', slug: 'tibetan', description: '藏菜适应高寒气候，有酥油茶、糌粑、风干牛肉等，热量高，风味独特。', history: '西藏高原气候寒冷，饮食以高热量为主，受藏传佛教影响，形成独特的高原饮食文化。', characteristics: '高热量，牦牛肉，酥油，青稞，适应高寒。', famousDishes: '["酥油茶","糌粑","风干牛肉","藏式火锅","牦牛肉"]', sortOrder: 21 },
  { name: '西北菜', nameEn: 'Northwestern', slug: 'northwestern', description: '西北菜包括陕西、甘肃、宁夏、青海等地，有羊肉泡馍、兰州拉面、肉夹馍等，面食发达。', history: '西北地区气候干燥，畜牧业发达，面食和牛羊肉是饮食核心，丝绸之路带来丰富文化交流。', characteristics: '面食发达，牛羊肉为主，酸辣香，风味粗犷。', famousDishes: '["羊肉泡馍","兰州拉面","肉夹馍","凉皮","臊子面"]', sortOrder: 22 },

  // 国际菜系
  { name: '日料', nameEn: 'Japanese', slug: 'japanese', description: '日本料理讲究食材本味和季节感，有寿司、刺身、天妇罗、拉面等，精致美观。', history: '日料起源于中国饮食文化，结合日本本土食材和审美，发展出独特的料理体系。', characteristics: '食材本味，季节感强，精致美观，生食文化。', famousDishes: '["寿司","刺身","天妇罗","拉面","鳗鱼饭"]', sortOrder: 30 },
  { name: '韩料', nameEn: 'Korean', slug: 'korean', description: '韩国料理以辣味和发酵为特色，有泡菜、拌饭、烤肉、参鸡汤等，色彩丰富。', history: '韩料受中国影响，结合朝鲜半岛气候，发展出以辣味和泡菜为代表的独特饮食文化。', characteristics: '辣味为主，泡菜文化，发酵丰富，色彩鲜艳。', famousDishes: '["泡菜","拌饭","烤肉","参鸡汤","部队锅"]', sortOrder: 31 },
  { name: '泰国菜', nameEn: 'Thai', slug: 'thai', description: '泰国菜酸辣甜咸平衡，有冬阴功汤、咖喱、炒河粉等，香料丰富，口味层次多。', history: '泰料融合了印度、中国和东南亚饮食文化，以酸辣甜咸四味平衡著称。', characteristics: '酸辣甜咸平衡，香料丰富，椰浆入菜，口味层次多。', famousDishes: '["冬阴功汤","泰式咖喱","炒河粉","芒果糯米饭","青木瓜沙拉"]', sortOrder: 32 },
  { name: '越南菜', nameEn: 'Vietnamese', slug: 'vietnamese', description: '越南菜清淡鲜美，有河粉、春卷、法包等，善用香草和鱼露，口味清爽。', history: '越料受中国和法国影响，以米粉文化为核心，善用香草和鱼露调味。', characteristics: '清淡鲜美，香草丰富，鱼露调味，米粉文化。', famousDishes: '["越南河粉","春卷","法包","滴漏咖啡","牛肉粉"]', sortOrder: 33 },
  { name: '印度菜', nameEn: 'Indian', slug: 'indian', description: '印度菜以香料和咖喱闻名，有咖喱鸡、飞饼、玛莎拉等，素食文化发达，口味浓郁。', history: '印料香料文化源远流长，受宗教影响素食发达，咖喱是灵魂。', characteristics: '香料丰富，咖喱灵魂，素食文化，口味浓郁。', famousDishes: '["咖喱鸡","飞饼","玛莎拉","印度奶茶","塔利套餐"]', sortOrder: 34 },
  { name: '法餐', nameEn: 'French', slug: 'french', description: '法餐讲究精致和仪式感，有鹅肝、蜗牛、牛排等，酱汁丰富，烹饪技法高超。', history: '法餐是西方料理的代表，讲究食材品质、烹饪技法和摆盘艺术。', characteristics: '精致讲究，酱汁丰富，烹饪技法高超，仪式感强。', famousDishes: '["鹅肝","蜗牛","牛排","马卡龙","可颂"]', sortOrder: 35 },
  { name: '意大利菜', nameEn: 'Italian', slug: 'italian', description: '意大利菜简单纯粹，有披萨、意面、烩饭等，食材本味，橄榄油和香草点睛。', history: '意料强调食材新鲜和简单烹饪，以面食和橄榄油为核心。', characteristics: '简单纯粹，食材本味，面食核心，橄榄油香草。', famousDishes: '["披萨","意面","烩饭","提拉米苏","意式浓缩"]', sortOrder: 36 },
  { name: '西餐', nameEn: 'Western', slug: 'western', description: '西餐涵盖欧美各国料理，有牛排、汉堡、沙拉、汤品等，烹饪方式多样。', history: '西餐泛指欧美各国料理体系，以烤、煎、炸为主，讲究营养搭配。', characteristics: '烤煎炸为主，营养搭配，分餐制，刀叉用餐。', famousDishes: '["牛排","汉堡","沙拉","浓汤","烤鸡"]', sortOrder: 37 },
  { name: '墨西哥菜', nameEn: 'Mexican', slug: 'mexican', description: '墨西哥菜色彩鲜艳，有塔可、玉米片、辣椒等，玉米和辣椒是灵魂，口味浓烈。', history: '墨料以玉米和辣椒为核心，融合西班牙和印第安饮食文化。', characteristics: '玉米辣椒灵魂，色彩鲜艳，口味浓烈，塔可为代表。', famousDishes: '["塔可","玉米片","墨西哥卷","辣椒酿肉","龙舌兰"]', sortOrder: 38 },

  // 其他品类
  { name: '家常菜', nameEn: 'Home-style', slug: 'home-style', description: '家常菜肴是日常家庭烹饪的菜品，简单易做，营养均衡，有番茄炒蛋、炒青菜、红烧鱼等。', history: '家常菜是中国家庭日常饮食的主体，因各地物产和口味差异，形成了丰富多样的家常菜谱。', characteristics: '简单易做，营养均衡，食材常见，口味家常。', famousDishes: '["番茄炒蛋","炒青菜","红烧鱼","蛋炒饭","土豆丝"]', sortOrder: 50 },
  { name: '街头小吃', nameEn: 'Street Food', slug: 'street-food', description: '街头小吃是各地特色小食，有臭豆腐、煎饼、烤串等，风味独特，方便快捷。', history: '街头小吃源于民间，是各地饮食文化的缩影，以方便快捷、风味独特著称。', characteristics: '方便快捷，风味独特，地方特色，价格亲民。', famousDishes: '["臭豆腐","煎饼","烤串","炸鸡","糖葫芦"]', sortOrder: 51 },
  { name: '烧烤', nameEn: 'BBQ', slug: 'bbq', description: '烧烤是食材直接炙烤的烹饪方式，有烤羊肉串、烤鸡翅、烤蔬菜等，烟火气十足。', history: '烧烤是人类最原始的烹饪方式之一，各地都有独特的烧烤文化。', characteristics: '直接炙烤，烟火气足，调料丰富，社交属性强。', famousDishes: '["烤羊肉串","烤鸡翅","烤蔬菜","烤鱼","烤玉米"]', sortOrder: 52 },
  { name: '火锅', nameEn: 'Hot Pot', slug: 'hot-pot', description: '火锅是中国特有的聚餐方式，有四川麻辣锅、潮汕牛肉锅、北京涮肉等，边涮边吃。', history: '火锅起源于中国，因地域差异形成了多种火锅流派，是社交聚餐的重要形式。', characteristics: '边涮边吃，汤底多样，食材丰富，社交属性强。', famousDishes: '["四川麻辣锅","潮汕牛肉锅","北京涮肉","椰子鸡火锅","菌汤锅"]', sortOrder: 53 },
  { name: '烘焙甜点', nameEn: 'Baking', slug: 'baking', description: '烘焙甜点包括蛋糕、面包、饼干等，有戚风蛋糕、曲奇、蛋挞等，甜蜜诱人。', history: '烘焙传入中国后迅速发展，结合本土口味，形成了丰富多样的烘焙甜点。', characteristics: '甜蜜诱人，造型精美，烤箱制作，糖油面粉。', famousDishes: '["戚风蛋糕","曲奇","蛋挞","面包","泡芙"]', sortOrder: 54 },
  { name: '饮品', nameEn: 'Beverages', slug: 'beverages', description: '饮品包括奶茶、咖啡、果汁、调酒等，有珍珠奶茶、手冲咖啡、莫吉托等，解渴提神。', history: '饮品文化随时代发展不断创新，从传统茶饮到现代咖啡奶茶，品类丰富。', characteristics: '解渴提神，口味多样，冷热皆宜，创意无限。', famousDishes: '["珍珠奶茶","手冲咖啡","莫吉托","柠檬茶","奶昔"]', sortOrder: 55 },
  { name: '汤品', nameEn: 'Soups', slug: 'soups', description: '汤品是餐桌上不可或缺的一道，有老火汤、清汤、浓汤等，滋补暖胃，营养丰富。', history: '中国人讲究"饭前喝汤"，汤品文化源远流长，各地都有特色汤品。', characteristics: '滋补暖胃，营养丰富，清浓皆宜，四季有别。', famousDishes: '["老火靓汤","罗宋汤","味噌汤","酸辣汤","紫菜蛋花汤"]', sortOrder: 56 },
  { name: '素食', nameEn: 'Vegetarian', slug: 'vegetarian', description: '素食以植物性食材为主，有素鸡、素鸭、斋菜等，清淡健康，营养丰富。', history: '素食文化在中国有千年历史，受佛教影响深远，现代素食更注重营养搭配。', characteristics: '植物性食材，清淡健康，营养搭配，环保理念。', famousDishes: '["素鸡","素鸭","斋菜","麻婆豆腐素","素馅饺子"]', sortOrder: 57 },
  { name: '海鲜', nameEn: 'Seafood', slug: 'seafood', description: '海鲜以鱼虾蟹贝为主，有清蒸大闸蟹、蒜蓉扇贝、红烧鲍鱼等，鲜美滋补。', history: '中国海岸线漫长，海鲜饮食文化丰富，以鲜味为核心。', characteristics: '鲜美滋补，清蒸见长，原汁原味，时令性强。', famousDishes: '["清蒸大闸蟹","蒜蓉扇贝","红烧鲍鱼","椒盐皮皮虾","葱姜炒花蛤"]', sortOrder: 58 },
];

async function main() {
  console.log('🏷️ 开始添加菜系分类...');
  let created = 0;
  for (const cat of categories) {
    await prisma.cuisine.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    created++;
  }
  console.log(`✅ 已添加 ${created} 个菜系分类`);
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
