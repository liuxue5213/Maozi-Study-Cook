import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

/**
 * 食材匹配工具：
 * 1. 精确匹配优先（"鸡" 不应匹配 "鸡翅"）
 * 2. 允许合理的形态变体（"土豆"/"马铃薯"、"猪肉"/"瘦肉"）
 * 3. 禁止单字无差别子串匹配
 */
export function matchIngredient(source: string, target: string): boolean {
  if (!source || !target) return false;
  const s = source.trim();
  const t = target.trim();
  if (!s || !t) return false;

  // 精确相等
  if (s === t) return true;

  // 常见食材别名归一化表
  const aliasGroups: string[][] = [
    ['土豆', '马铃薯', '洋芋'],
    ['西红柿', '番茄'],
    ['青椒', '柿子椒', '甜椒'],
    ['猪肉', '瘦肉', '里脊', '五花肉'],
    ['鸡蛋', '土鸡蛋', '蛋'],
    ['豆腐', '嫩豆腐', '老豆腐', '北豆腐', '南豆腐'],
    ['大蒜', '蒜', '蒜头'],
    ['小葱', '香葱', '葱'],
  ];

  const normalize = (name: string): string[] => {
    const result = [name];
    for (const group of aliasGroups) {
      if (group.some((alias) => name.includes(alias))) {
        result.push(...group);
      }
    }
    return result;
  };

  const sSet = new Set(normalize(s));
  const tSet = new Set(normalize(t));

  // 别名组交集
  for (const item of sSet) {
    if (tSet.has(item)) return true;
  }

  // 双向包含仅允许：长的一方长度 >= 3 且短的一方长度 >= 2
  // 避免 "鸡" 匹配 "鸡翅"、"肉" 匹配 "牛肉" 这类误匹配
  const shorter = s.length <= t.length ? s : t;
  const longer = s.length <= t.length ? t : s;
  if (shorter.length >= 2 && longer.includes(shorter)) {
    // 排除特定部位词误匹配：部位词必须精确匹配
    const partWords = ['翅', '爪', '肝', '排', '骨', '肚', '舌', '皮', '尾', '头', '心', '肠', '血'];
    if (partWords.some((w) => shorter.endsWith(w) || longer.endsWith(w))) {
      // 部位词参与匹配时要求另一方不是泛称
      const generic = ['肉', '鸡肉', '猪肉', '牛肉', '羊肉', '鸭肉'];
      if (generic.includes(shorter)) return false;
    }
    return true;
  }

  return false;
}

@Injectable()
export class RecipesService {
  constructor(private prisma: PrismaService) {}

  /**
   * 获取菜谱列表（支持搜索和筛选）
   */
  async findAll(params: {
    page?: number;
    pageSize?: number;
    cuisineId?: number;
    difficulty?: number;
    keyword?: string;
    sortBy?: string;
  }) {
    const {
      page = 1,
      pageSize = 20,
      cuisineId,
      difficulty,
      keyword,
      sortBy = 'hot',
    } = params;

    const where: any = { status: 1 };

    if (cuisineId) {
      where.cuisineId = cuisineId;
    }

    if (difficulty) {
      where.difficulty = difficulty;
    }

    if (keyword) {
      where.OR = [
        { title: { contains: keyword } },
        { description: { contains: keyword } },
      ];
    }

    // 排序
    let orderBy: any = { viewCount: 'desc' };
    switch (sortBy) {
      case 'new':
        orderBy = { createdAt: 'desc' };
        break;
      case 'time':
        orderBy = { cookTime: 'asc' };
        break;
      case 'hot':
      default:
        orderBy = { viewCount: 'desc' };
        break;
    }

    const [list, total] = await Promise.all([
      this.prisma.recipe.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          title: true,
          description: true,
          coverImage: true,
          difficulty: true,
          prepTime: true,
          cookTime: true,
          servings: true,
          viewCount: true,
          likeCount: true,
          favoriteCount: true,
          cuisine: {
            select: { id: true, name: true, slug: true },
          },
        },
      }),
      this.prisma.recipe.count({ where }),
    ]);

    return {
      list,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  /**
   * 获取菜谱详情
   */
  async findOne(id: number, userId?: number) {
    const recipe = await this.prisma.recipe.findUnique({
      where: { id },
      include: {
        cuisine: {
          select: { id: true, name: true, slug: true },
        },
        ingredients: {
          orderBy: { sortOrder: 'asc' },
        },
        steps: {
          orderBy: { stepNumber: 'asc' },
        },
        creator: {
          select: { id: true, uuid: true, nickname: true, avatar: true },
        },
      },
    });

    if (!recipe || recipe.status !== 1) {
      throw new NotFoundException('菜谱不存在');
    }

    // 增加浏览次数
    await this.prisma.recipe.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    // 检查当前用户是否已收藏/点赞
    let isFavorited = false;
    let isLiked = false;

    if (userId) {
      const [favorite, like] = await Promise.all([
        this.prisma.favorite.findUnique({
          where: { userId_recipeId: { userId, recipeId: id } },
        }),
        this.prisma.like.findUnique({
          where: {
            userId_targetType_targetId: {
              userId,
              targetType: 'recipe',
              targetId: id,
            },
          },
        }),
      ]);
      isFavorited = !!favorite;
      isLiked = !!like;
    }

    return {
      ...recipe,
      isFavorited,
      isLiked,
    };
  }

  /**
   * 按食材搜索菜谱
   */
  async findByIngredients(ingredients: string[]) {
    const recipes = await this.prisma.recipe.findMany({
      where: {
        status: 1,
        ingredients: {
          some: {
            name: { in: ingredients },
          },
        },
      },
      select: {
        id: true,
        title: true,
        coverImage: true,
        difficulty: true,
        cookTime: true,
        ingredients: {
          select: { name: true, amount: true, isMain: true },
        },
      },
      take: 20,
    });

    // 计算匹配度
    return recipes
      .map((recipe) => {
        const mainIngredients = recipe.ingredients.filter((i) => i.isMain);
        const matchedMain = mainIngredients.filter((i) =>
          ingredients.some((ing) => matchIngredient(i.name, ing)),
        );
        const matchScore =
          mainIngredients.length > 0
            ? matchedMain.length / mainIngredients.length
            : 0;

        return {
          ...recipe,
          matchScore: Math.round(matchScore * 100) / 100,
          matchedCount: matchedMain.length,
          totalMain: mainIngredients.length,
        };
      })
      .sort((a, b) => b.matchScore - a.matchScore);
  }

  /**
   * 收藏/取消收藏
   */
  async toggleFavorite(userId: number, recipeId: number) {
    const recipe = await this.prisma.recipe.findUnique({
      where: { id: recipeId },
    });

    if (!recipe) {
      throw new NotFoundException('菜谱不存在');
    }

    const existing = await this.prisma.favorite.findUnique({
      where: { userId_recipeId: { userId, recipeId } },
    });

    if (existing) {
      await this.prisma.favorite.delete({
        where: { id: existing.id },
      });
      await this.prisma.recipe.update({
        where: { id: recipeId },
        data: { favoriteCount: { decrement: 1 } },
      });
      return { isFavorited: false };
    }

    await this.prisma.favorite.create({
      data: { userId, recipeId },
    });
    await this.prisma.recipe.update({
      where: { id: recipeId },
      data: { favoriteCount: { increment: 1 } },
    });
    return { isFavorited: true };
  }

  /**
   * 点赞/取消点赞
   */
  async toggleLike(userId: number, recipeId: number) {
    const recipe = await this.prisma.recipe.findUnique({
      where: { id: recipeId },
    });

    if (!recipe) {
      throw new NotFoundException('菜谱不存在');
    }

    const existing = await this.prisma.like.findUnique({
      where: {
        userId_targetType_targetId: {
          userId,
          targetType: 'recipe',
          targetId: recipeId,
        },
      },
    });

    if (existing) {
      await this.prisma.like.delete({ where: { id: existing.id } });
      await this.prisma.recipe.update({
        where: { id: recipeId },
        data: { likeCount: { decrement: 1 } },
      });
      return { isLiked: false };
    }

    await this.prisma.like.create({
      data: {
        userId,
        targetType: 'recipe',
        targetId: recipeId,
      },
    });
    await this.prisma.recipe.update({
      where: { id: recipeId },
      data: { likeCount: { increment: 1 } },
    });
    return { isLiked: true };
  }

  /**
   * 创建菜谱
   */
  async create(userId: number, data: any) {
    const recipe = await this.prisma.recipe.create({
      data: {
        title: data.title,
        description: data.description,
        cuisineId: data.cuisineId,
        coverImage: data.coverImage,
        difficulty: data.difficulty || 1,
        prepTime: data.prepTime,
        cookTime: data.cookTime,
        servings: data.servings || 2,
        tips: data.tips,
        status: data.status ?? 1,
        createdBy: userId,
        ingredients: {
          create: data.ingredients?.map((ing: any, idx: number) => ({
            name: ing.name,
            amount: ing.amount,
            isMain: ing.isMain || false,
            sortOrder: idx,
          })),
        },
        steps: {
          create: data.steps?.map((step: any, idx: number) => ({
            stepNumber: idx + 1,
            description: step.description,
            imageUrl: step.imageUrl,
            duration: step.duration,
            tips: step.tips,
          })),
        },
      },
    });

    return recipe;
  }
}
