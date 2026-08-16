import { Controller, Get, Post, Delete, Param, Body, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CommunityService } from './community.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('community')
@Controller('community')
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  // ==================== 帖子 ====================

  @Get('posts')
  @Public()
  @ApiOperation({ summary: '获取帖子列表' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiQuery({ name: 'type', required: false, type: Number })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  async getPosts(
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 20,
    @Query('type') type?: number,
    @Query('sortBy') sortBy?: string,
  ) {
    return this.communityService.getPosts({
      page: +page,
      pageSize: +pageSize,
      type: type ? +type : undefined,
      sortBy,
    });
  }

  @Get('posts/:id')
  @Public()
  @ApiOperation({ summary: '获取帖子详情' })
  async getPost(@Param('id') id: number, @Req() req) {
    const userId = req.user?.id;
    return this.communityService.getPost(+id, userId);
  }

  @Post('posts')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '发布帖子' })
  async createPost(@CurrentUser('id') userId: number, @Body() data: any) {
    return this.communityService.createPost(userId, data);
  }

  @Delete('posts/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除帖子' })
  async deletePost(@CurrentUser('id') userId: number, @Param('id') id: number) {
    return this.communityService.deletePost(userId, +id);
  }

  @Post('posts/:id/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '点赞帖子' })
  async likePost(@CurrentUser('id') userId: number, @Param('id') id: number) {
    return this.communityService.toggleLike(userId, +id);
  }

  // ==================== 评论 ====================

  @Get('posts/:id/comments')
  @Public()
  @ApiOperation({ summary: '获取评论列表' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  async getComments(
    @Param('id') postId: number,
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 20,
  ) {
    return this.communityService.getComments(+postId, +page, +pageSize);
  }

  @Post('posts/:id/comments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '发表评论' })
  async createComment(
    @CurrentUser('id') userId: number,
    @Param('id') postId: number,
    @Body('content') content: string,
    @Body('parentId') parentId?: number,
  ) {
    return this.communityService.createComment(userId, +postId, content, parentId);
  }

  // ==================== 打卡 ====================

  @Post('checkin')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '创建打卡' })
  async createCheckIn(@CurrentUser('id') userId: number, @Body() data: any) {
    return this.communityService.createCheckIn(userId, data);
  }

  @Get('checkin/calendar')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取打卡日历' })
  @ApiQuery({ name: 'year', required: true, type: Number })
  @ApiQuery({ name: 'month', required: true, type: Number })
  async getCheckInCalendar(
    @CurrentUser('id') userId: number,
    @Query('year') year: number,
    @Query('month') month: number,
  ) {
    return this.communityService.getCheckInCalendar(userId, +year, +month);
  }
}
