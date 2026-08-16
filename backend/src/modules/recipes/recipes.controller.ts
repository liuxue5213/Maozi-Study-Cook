import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { RecipesService } from './recipes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('recipes')
@Controller('recipes')
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: '获取菜谱列表' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiQuery({ name: 'cuisineId', required: false, type: Number })
  @ApiQuery({ name: 'difficulty', required: false, type: Number })
  @ApiQuery({ name: 'keyword', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  async findAll(
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 20,
    @Query('cuisineId') cuisineId?: number,
    @Query('difficulty') difficulty?: number,
    @Query('keyword') keyword?: string,
    @Query('sortBy') sortBy?: string,
  ) {
    return this.recipesService.findAll({
      page: +page,
      pageSize: +pageSize,
      cuisineId: cuisineId ? +cuisineId : undefined,
      difficulty: difficulty ? +difficulty : undefined,
      keyword,
      sortBy,
    });
  }

  @Get('by-ingredients')
  @Public()
  @ApiOperation({ summary: '按食材搜索菜谱' })
  @ApiQuery({ name: 'ingredients', required: true, type: String, description: '食材名称，逗号分隔' })
  async findByIngredients(@Query('ingredients') ingredients: string) {
    const ingList = ingredients.split(',').map((s) => s.trim());
    return this.recipesService.findByIngredients(ingList);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: '获取菜谱详情' })
  async findOne(@Param('id') id: number, @Req() req) {
    // 从 token 中获取 userId（如果有）
    const userId = req.user?.id;
    return this.recipesService.findOne(+id, userId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '创建菜谱' })
  async create(@CurrentUser('id') userId: number, @Body() data: any) {
    return this.recipesService.create(userId, data);
  }

  @Post(':id/favorite')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '收藏菜谱' })
  async favorite(@CurrentUser('id') userId: number, @Param('id') id: number) {
    return this.recipesService.toggleFavorite(userId, +id);
  }

  @Post(':id/cook')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '记录制作次数（做过这道菜）' })
  async incrementCookCount(@Param('id') id: number) {
    return this.recipesService.incrementCookCount(+id);
  }

  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '点赞菜谱' })
  async like(@CurrentUser('id') userId: number, @Param('id') id: number) {
    return this.recipesService.toggleLike(userId, +id);
  }
}
