import { Controller, Get, Param, Post, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { CuisinesService } from './cuisines.service';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('cuisines')
@Controller('cuisines')
export class CuisinesController {
  constructor(private readonly cuisinesService: CuisinesService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: '获取菜系列表' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  async findAll(
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 20,
  ) {
    return this.cuisinesService.findAll(+page, +pageSize);
  }

  @Get(':slug')
  @Public()
  @ApiOperation({ summary: '获取菜系详情' })
  async findOne(@Param('slug') slug: string) {
    return this.cuisinesService.findOne(slug);
  }

  @Get(':slug/recipes')
  @Public()
  @ApiOperation({ summary: '获取菜系下的菜谱' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiQuery({ name: 'difficulty', required: false, type: Number })
  async getRecipes(
    @Param('slug') slug: string,
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 20,
    @Query('difficulty') difficulty?: number,
  ) {
    return this.cuisinesService.getRecipes(slug, +page, +pageSize, difficulty ? +difficulty : undefined);
  }

  @Post()
  @ApiOperation({ summary: '创建菜系（管理员）' })
  async create(@Body() data: any) {
    return this.cuisinesService.create(data);
  }
}
