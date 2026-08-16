import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

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
          ingredients.some(
            (ing) => i.name.includes(ing) || ing.includes(i.name),
          ),
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
