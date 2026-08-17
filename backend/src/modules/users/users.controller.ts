import { Controller, Get, Put, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取当前用户信息' })
  async getProfile(@CurrentUser('id') userId: number) {
    return this.usersService.getProfile(userId);
  }

  @Put('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新个人资料' })
  async updateProfile(@CurrentUser('id') userId: number, @Body() data: any) {
    return this.usersService.updateProfile(userId, data);
  }

  @Get('me/favorites')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取我的收藏' })
  async getFavorites(@CurrentUser('id') userId: number) {
    return this.usersService.getFavorites(userId);
  }

  @Get('me/recipes')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取我创建的菜谱' })
  async getMyRecipes(@CurrentUser('id') userId: number) {
    return this.usersService.getMyRecipes(userId);
  }

  @Get('me/preferences')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取我的偏好设置' })
  async getPreferences(@CurrentUser('id') userId: number) {
    return this.usersService.getPreferences(userId);
  }

  @Put('me/preferences')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新偏好设置' })
  async updatePreferences(@CurrentUser('id') userId: number, @Body() data: any) {
    return this.usersService.updatePreferences(userId, data);
  }

  @Get(':uuid/profile')
  @ApiOperation({ summary: '获取用户主页' })
  async getPublicProfile(@Param('uuid') uuid: string) {
    return this.usersService.getPublicProfile(uuid);
  }

  @Put(':uuid/follow')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '关注用户' })
  async follow(@CurrentUser('id') userId: number, @Param('uuid') uuid: string) {
    return this.usersService.follow(userId, uuid);
  }

  @Put(':uuid/unfollow')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '取消关注' })
  async unfollow(@CurrentUser('id') userId: number, @Param('uuid') uuid: string) {
    return this.usersService.unfollow(userId, uuid);
  }
}
