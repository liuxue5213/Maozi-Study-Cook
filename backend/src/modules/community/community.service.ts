import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class CommunityService {
  constructor(private prisma: PrismaService) {}

  /**
   * 获取帖子列表
   */
  async getPosts(params: {
    page?: number;
    pageSize?: number;
    type?: number;
    sortBy?: string;
    userId?: number;
  }) {
    const { page = 1, pageSize = 20, type, sortBy = 'hot', userId } = params;

    const where: any = { status: 1 };
    if (type) where.type = type;
    if (userId) where.userId = userId;

    // 排序
    let orderBy: any = { createdAt: 'desc' };
    if (sortBy === 'hot') {
      orderBy = [{ likeCount: 'desc' }, { createdAt: 'desc' }];
    }

    const [list, total] = await Promise.all([
      this.prisma.post.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          user: {
            select: { id: true, uuid: true, nickname: true, avatar: true },
          },
          recipe: {
            select: { id: true, title: true, coverImage: true },
          },
          images: {
            orderBy: { sortOrder: 'asc' },
            take: 9,
          },
          _count: {
            select: { comments: true, likes: true },
          },
        },
      }),
      this.prisma.post.count({ where }),
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
   * 获取帖子详情
   */
  async getPost(id: number, currentUserId?: number) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, uuid: true, nickname: true, avatar: true },
        },
        recipe: {
          select: { id: true, title: true, coverImage: true },
        },
        images: {
          orderBy: { sortOrder: 'asc' },
        },
        _count: {
          select: { comments: true, likes: true },
        },
      },
    });

    if (!post || post.status !== 1) {
      throw new NotFoundException('帖子不存在');
    }

    // 检查当前用户是否点赞
    let isLiked = false;
    if (currentUserId) {
      const like = await this.prisma.like.findUnique({
        where: {
          userId_targetType_targetId: {
            userId: currentUserId,
            targetType: 'post',
            targetId: id,
          },
        },
      });
      isLiked = !!like;
    }

    return { ...post, isLiked };
  }

  /**
   * 发布帖子
   */
  async createPost(userId: number, data: any) {
    const post = await this.prisma.post.create({
      data: {
        userId,
        recipeId: data.recipeId,
        content: data.content,
        type: data.type || 1,
        isCheckin: data.isCheckin || false,
        images: data.images
          ? {
              create: data.images.map((url: string, idx: number) => ({
                imageUrl: url,
                sortOrder: idx,
              })),
            }
          : undefined,
      },
      include: {
        user: {
          select: { id: true, uuid: true, nickname: true, avatar: true },
        },
        images: true,
      },
    });

    return post;
  }

  /**
   * 删除帖子
   */
  async deletePost(userId: number, postId: number) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('帖子不存在');
    }

    if (post.userId !== userId) {
      throw new BadRequestException('无权删除他人帖子');
    }

    await this.prisma.post.delete({
      where: { id: postId },
    });

    return { message: '删除成功' };
  }

  /**
   * 点赞/取消点赞帖子
   */
  async toggleLike(userId: number, postId: number) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('帖子不存在');
    }

    const existing = await this.prisma.like.findUnique({
      where: {
        userId_targetType_targetId: {
          userId,
          targetType: 'post',
          targetId: postId,
        },
      },
    });

    if (existing) {
      await this.prisma.like.delete({ where: { id: existing.id } });
      await this.prisma.post.update({
        where: { id: postId },
        data: { likeCount: { decrement: 1 } },
      });
      return { isLiked: false };
    }

    await this.prisma.like.create({
      data: {
        userId,
        targetType: 'post',
        targetId: postId,
      },
    });
    await this.prisma.post.update({
      where: { id: postId },
      data: { likeCount: { increment: 1 } },
    });
    return { isLiked: true };
  }

  /**
   * 获取评论列表
   */
  async getComments(postId: number, page = 1, pageSize = 20) {
    const [list, total] = await Promise.all([
      this.prisma.comment.findMany({
        where: { postId, status: 1 },
        orderBy: { createdAt: 'asc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          user: {
            select: { id: true, uuid: true, nickname: true, avatar: true },
          },
        },
      }),
      this.prisma.comment.count({ where: { postId, status: 1 } }),
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
   * 发表评论
   */
  async createComment(userId: number, postId: number, content: string, parentId?: number) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('帖子不存在');
    }

    const comment = await this.prisma.comment.create({
      data: {
        postId,
        userId,
        content,
        parentId,
      },
      include: {
        user: {
          select: { id: true, uuid: true, nickname: true, avatar: true },
        },
      },
    });

    // 更新帖子评论数
    await this.prisma.post.update({
      where: { id: postId },
      data: { commentCount: { increment: 1 } },
    });

    return comment;
  }

  /**
   * 创建打卡
   */
  async createCheckIn(userId: number, data: any) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 检查今日是否已打卡
    const existing = await this.prisma.checkIn.findUnique({
      where: {
        userId_checkinDate: {
          userId,
          checkinDate: today,
        },
      },
    });

    if (existing) {
      throw new BadRequestException('今日已打卡');
    }

    const checkIn = await this.prisma.checkIn.create({
      data: {
        userId,
        recipeId: data.recipeId,
        postId: data.postId,
        imageUrl: data.imageUrl,
        note: data.note,
        checkinDate: today,
      },
    });

    return checkIn;
  }

  /**
   * 获取打卡日历
   */
  async getCheckInCalendar(userId: number, year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const checkIns = await this.prisma.checkIn.findMany({
      where: {
        userId,
        checkinDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        checkinDate: true,
        recipeId: true,
        note: true,
      },
    });

    // 计算连续打卡天数
    const streak = await this.calculateStreak(userId);

    // 生成日历数据
    const daysInMonth = endDate.getDate();
    const calendar = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      const checkIn = checkIns.find(
        (c) => c.checkinDate.getDate() === day,
      );
      calendar.push({
        date: date.toISOString().split('T')[0],
        checked: !!checkIn,
        note: checkIn?.note,
      });
    }

    return {
      streak,
      totalDays: checkIns.length,
      calendar,
    };
  }

  /**
   * 计算连续打卡天数
   */
  private async calculateStreak(userId: number): Promise<number> {
    const checkIns = await this.prisma.checkIn.findMany({
      where: { userId },
      orderBy: { checkinDate: 'desc' },
      select: { checkinDate: true },
    });

    if (checkIns.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < checkIns.length; i++) {
      const expectedDate = new Date(today);
      expectedDate.setDate(expectedDate.getDate() - i);

      if (
        checkIns[i].checkinDate.toISOString().split('T')[0] ===
        expectedDate.toISOString().split('T')[0]
      ) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }
}
