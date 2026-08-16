import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class CuisinesService {
  constructor(private prisma: PrismaService) {}

  /**
   * 获取所有菜系列表
   */
  async findAll(page = 1, pageSize = 20) {
    const [list, total] = await Promise.all([
      this.prisma.cuisine.findMany({
        where: {},
        orderBy: { sortOrder: 'asc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          name: true,
          nameEn: true,
          slug: true,
          description: true,
          imageUrl: true,
          recipeCount: true,
          sortOrder: true,
        },
      }),
      this.prisma.cuisine.count(),
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
   * 获取菜系详情
   */
  async findOne(slug: string) {
    const cuisine = await this.prisma.cuisine.findUnique({
      where: { slug },
    });

    if (!cuisine) {
      throw new NotFoundException('菜系不存在');
    }

    return cuisine;
  }

  /**
   * 获取菜系下的菜谱
   */
  async getRecipes(slug: string, page = 1, pageSize = 20, difficulty?: number) {
    const cuisine = await this.prisma.cuisine.findUnique({
      where: { slug },
    });

    if (!cuisine) {
      throw new NotFoundException('菜系不存在');
    }

    const where: any = {
      cuisineId: cuisine.id,
      status: 1,
    };

    if (difficulty) {
      where.difficulty = difficulty;
    }

    const [list, total] = await Promise.all([
      this.prisma.recipe.findMany({
        where,
        orderBy: { viewCount: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          title: true,
          coverImage: true,
          difficulty: true,
          cookTime: true,
          viewCount: true,
          likeCount: true,
        },
      }),
      this.prisma.recipe.count({ where }),
    ]);

    return {
      cuisine: {
        id: cuisine.id,
        name: cuisine.name,
        slug: cuisine.slug,
      },
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
   * 创建菜系（管理员）
   */
  async create(data: any) {
    return this.prisma.cuisine.create({
      data: {
        name: data.name,
        nameEn: data.nameEn,
        slug: data.slug,
        description: data.description,
        history: data.history,
        characteristics: data.characteristics,
        famousDishes: data.famousDishes,
        imageUrl: data.imageUrl,
        sortOrder: data.sortOrder || 0,
      },
    });
  }
}
