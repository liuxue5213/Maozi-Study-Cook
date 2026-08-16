import { Controller, Post, Body, UseGuards, UploadedFile, UseInterceptors, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('ai')
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('recognize')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '拍照识别食材/菜品' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image'))
  async recognize(
    @UploadedFile() file: Express.Multer.File,
    @Body('type') type: string = 'ingredient',
    @CurrentUser('id') userId: number,
  ) {
    if (!file) {
      throw new BadRequestException('请上传图片');
    }

    // 将图片转为 base64
    const base64 = file.buffer.toString('base64');
    const result = await this.aiService.recognize(base64, type);

    return result;
  }

  @Post('recognize-base64')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '拍照识别（Base64 方式）' })
  async recognizeBase64(
    @Body('image') imageBase64: string,
    @Body('type') type: string = 'ingredient',
    @CurrentUser('id') userId: number,
  ) {
    if (!imageBase64) {
      throw new BadRequestException('请提供图片数据');
    }

    // 去除 data:image 前缀
    const base64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    return this.aiService.recognize(base64, type);
  }

  @Post('recommend')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '根据食材推荐菜谱' })
  async recommend(
    @Body('ingredients') ingredients: string[],
    @Body('preferences') preferences?: any,
    @CurrentUser('id') userId: number = 0,
  ) {
    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      throw new BadRequestException('请提供食材列表');
    }

    return this.aiService.recommendRecipes(ingredients, preferences);
  }

  @Post('estimate-weight')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'AI 估算食材重量（克）' })
  async estimateWeight(
    @Body('image') imageBase64: string,
    @Body('ingredientName') ingredientName: string = '食材',
    @CurrentUser('id') userId: number = 0,
  ) {
    if (!imageBase64) {
      throw new BadRequestException('请提供图片数据');
    }
    const base64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    return this.aiService.estimateWeight(base64, ingredientName);
  }

  @Post('generate-steps')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '生成菜谱步骤' })
  async generateSteps(
    @Body('title') title: string,
    @Body('ingredients') ingredients: string[],
    @Body('difficulty') difficulty: number = 1,
    @CurrentUser('id') userId: number = 0,
  ) {
    if (!title) {
      throw new BadRequestException('请提供菜名');
    }
    if (!ingredients || !Array.isArray(ingredients)) {
      throw new BadRequestException('请提供食材列表');
    }

    return this.aiService.generateSteps(title, ingredients, difficulty);
  }
}
