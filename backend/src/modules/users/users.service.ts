import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  /**
   * 获取用户收藏的菜谱
   */
  async getFavorites(userId: number) {
    const favorites = await this.prisma.favorite.findMany({
      where: { userId },
      include: {
        recipe: {
          include: {
            cuisine: { select: { id: true, name: true, slug: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return favorites.map((f) => f.recipe);
  }

  /**
   * 获取用户创建的菜谱
   */
  async getMyRecipes(userId: number) {
    return this.prisma.recipe.findMany({
      where: { createdBy: userId, status: 1 },
      include: {
        cuisine: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * 获取当前用户信息
   */
  async getProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        uuid: true,
        username: true,
        email: true,
        phone: true,
        nickname: true,
        avatar: true,
        bio: true,
        gender: true,
        birthday: true,
        createdAt: true,
        _count: {
          select: {
            posts: true,
            following: true,
            followers: true,
            favorites: true,
            checkIns: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    return user;
  }

  /**
   * 更新个人资料
   */
  async updateProfile(userId: number, data: any) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        nickname: data.nickname,
        avatar: data.avatar,
        bio: data.bio,
        gender: data.gender,
        birthday: data.birthday ? new Date(data.birthday) : undefined,
      },
      select: {
        id: true,
        uuid: true,
        username: true,
        nickname: true,
        avatar: true,
        bio: true,
        gender: true,
        birthday: true,
      },
    });

    return user;
  }

  /**
   * 获取用户偏好设置
   */
  async getPreferences(userId: number) {
    const preferences = await this.prisma.userPreference.findUnique({
      where: { userId },
    });

    return preferences || {};
  }

  /**
   * 更新偏好设置
   */
  async updatePreferences(userId: number, data: any) {
    const preferences = await this.prisma.userPreference.upsert({
      where: { userId },
      update: {
        dietGoal: data.dietGoal,
        tastePreferences: data.tastePreferences,
        allergies: data.allergies,
        dislikedIngredients: data.dislikedIngredients,
      },
      create: {
        userId,
        dietGoal: data.dietGoal,
        tastePreferences: data.tastePreferences,
        allergies: data.allergies,
        dislikedIngredients: data.dislikedIngredients,
      },
    });

    return preferences;
  }

  /**
   * 获取用户主页
   */
  async getPublicProfile(uuid: string) {
    const user = await this.prisma.user.findUnique({
      where: { uuid },
      select: {
        id: true,
        uuid: true,
        username: true,
        nickname: true,
        avatar: true,
        bio: true,
        createdAt: true,
        _count: {
          select: {
            posts: true,
            following: true,
            followers: true,
            checkIns: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    return user;
  }

  /**
   * 关注用户
   */
  async follow(userId: number, targetUuid: string) {
    const target = await this.prisma.user.findUnique({
      where: { uuid: targetUuid },
    });

    if (!target) {
      throw new NotFoundException('用户不存在');
    }

    if (target.id === userId) {
      throw new NotFoundException('不能关注自己');
    }

    await this.prisma.userFollows.upsert({
      where: {
        followerId_followingId: {
          followerId: userId,
          followingId: target.id,
        },
      },
      update: {},
      create: {
        followerId: userId,
        followingId: target.id,
      },
    });

    return { message: '关注成功' };
  }

  /**
   * 取消关注
   */
  async unfollow(userId: number, targetUuid: string) {
    const target = await this.prisma.user.findUnique({
      where: { uuid: targetUuid },
    });

    if (!target) {
      throw new NotFoundException('用户不存在');
    }

    await this.prisma.userFollows.deleteMany({
      where: {
        followerId: userId,
        followingId: target.id,
      },
    });

    return { message: '已取消关注' };
  }
}
