import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import sharp from 'sharp';
import { PrismaService } from '../common/prisma/prisma.service';
import { matchIngredient } from '../recipes/recipes.service';

@Injectable()
export class AiService {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly visionModel: string;
  private readonly textModel: string;

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
    private prisma: PrismaService,
  ) {
    this.apiKey = this.configService.get<string>('ai.apiKey') || '';
    this.baseUrl = this.configService.get<string>('ai.baseUrl') || 'https://dashscope.aliyuncs.com/api/v1';
    this.visionModel = this.configService.get<string>('ai.visionModel') || 'qwen-vl-plus';
    this.textModel = this.configService.get<string>('ai.textModel') || 'qwen-plus';
  }

  /**
   * 拍照识别食材/菜品
   * @param imageBase64 base64 编码的图片
   * @param type 识别类型：food(菜品) / ingredient(食材) / fridge(冰箱)
   */
  async recognize(imageBase64: string, type: string = 'ingredient') {
    if (!this.apiKey) {
      throw new BadRequestException('AI 服务未配置，请在 .env 中设置 AI_API_KEY');
    }

    // 根据类型构建不同的 prompt（更详细的提示词提高识别准确率）
    const prompts: Record<string, string> = {
      food: `你是一位专业的中餐厨师。请识别这张图片中的菜品。
要求：
1. 识别菜品名称（具体到菜名，如"麻婆豆腐"而非"豆腐"）
2. 判断所属菜系（川菜/鲁菜/粤菜/苏菜/浙菜/闽菜/湘菜/徽菜/其他）
3. 列出主要食材
4. 给出置信度（0-1之间）

严格按以下 JSON 格式返回，不要返回其他内容：
{"items": [{"name": "菜品名", "cuisine": "菜系", "ingredients": ["食材1", "食材2"], "confidence": 0.95}]}`,

      ingredient: `你是一位专业的食材识别专家。请识别这张图片中的所有食材。
要求：
1. 逐一列出所有可见的食材（蔬菜、肉类、水产、调料、豆制品、主食等）
2. 标注食材分类（蔬菜/肉类/水产/调料/豆制品/主食/水果/其他）
3. 如果是加工食材（如"五花肉"、"嫩豆腐"），请标注具体名称
4. 给出置信度（0-1之间）

严格按以下 JSON 格式返回，不要返回其他内容：
{"items": [{"name": "食材名", "category": "蔬菜/肉类/水产/调料/豆制品/主食/水果/其他", "confidence": 0.95}]}`,

      fridge: `你是一位专业的食材识别专家。请识别这张冰箱照片中的所有食材。
要求：
1. 逐一列出冰箱中所有可见的食材（包括冷藏室和冷冻室）
2. 标注食材分类（蔬菜/肉类/水产/调料/豆制品/主食/水果/速冻食品/其他）
3. 如果食材有包装，尝试识别品牌和具体名称
4. 给出置信度（0-1之间）

严格按以下 JSON 格式返回，不要返回其他内容：
{"items": [{"name": "食材名", "category": "蔬菜/肉类/水产/调料/豆制品/主食/水果/速冻食品/其他", "confidence": 0.95}]}`,
    };

    const prompt = prompts[type] || prompts.ingredient;

    try {
      const response = await firstValueFrom(
        this.httpService.post<any>(
          `${this.baseUrl}/services/aigc/multimodal-generation/generation`,
          {
            model: this.visionModel,
            input: {
              messages: [
                {
                  role: 'user',
                  content: [
                    {
                      image: `data:image/jpeg;base64,${imageBase64}`,
                    },
                    {
                      text: prompt,
                    },
                  ],
                },
              ],
            },
          },
          {
            headers: {
              Authorization: `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json',
            },
            timeout: 30000,
          },
        ),
      );

      // 解析 AI 返回结果（兼容 string / array / object 多种返回格式）
      const output = response.data?.output?.choices?.[0]?.message?.content;
      const result = this.extractAiResult(output);

      return {
        items: Array.isArray(result?.items) ? result.items : [],
        raw: output,
      };
    } catch (error) {
      console.error('AI 识别失败:', error.response?.data || error.message);
      throw new BadRequestException('AI 识别失败，请稍后重试');
    }
  }

  /**
   * 根据食材推荐菜谱
   * @param ingredients 食材列表
   * @param preferences 用户偏好
   */
  async recommendRecipes(ingredients: string[], preferences?: any) {
    if (!this.apiKey) {
      throw new BadRequestException('AI 服务未配置');
    }

    // 先从本地数据库匹配
    const localMatches = await this.prisma.recipe.findMany({
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
      take: 10,
    });

    // 计算本地匹配度
    const localResults = localMatches
      .map((recipe) => {
        const mainIngredients = recipe.ingredients.filter((i) => i.isMain);
        const matchedMain = mainIngredients.filter((i) =>
          ingredients.some((ing) => matchIngredient(i.name, ing)),
        );
        const matchScore =
          mainIngredients.length > 0
            ? matchedMain.length / mainIngredients.length
            : 0;

        const missingIngredients = mainIngredients
          .filter(
            (i) =>
              !ingredients.some((ing) => matchIngredient(i.name, ing)),
          )
          .map((i) => i.name);

        return {
          recipeId: recipe.id,
          title: recipe.title,
          coverImage: recipe.coverImage,
          difficulty: recipe.difficulty,
          cookTime: recipe.cookTime,
          matchScore: Math.round(matchScore * 100) / 100,
          missingIngredients,
          source: 'local',
        };
      })
      .sort((a, b) => b.matchScore - a.matchScore);

    // 如果本地匹配不足，调用 AI 生成推荐
    if (localResults.length < 3) {
      const aiRecommendations = await this.generateRecommendationsWithAI(
        ingredients,
        preferences,
      );
      return [...localResults, ...aiRecommendations];
    }

    return localResults;
  }

  /**
   * 使用 AI 生成菜谱推荐
   */
  private async generateRecommendationsWithAI(
    ingredients: string[],
    preferences?: any,
  ) {
    const prompt = `现有食材：${ingredients.join('、')}。
${preferences?.taste ? `口味偏好：${preferences.taste.join('、')}。` : ''}
${preferences?.difficulty ? `难度限制：${preferences.difficulty}星以内。` : ''}
${preferences?.timeLimit ? `时间限制：${preferences.timeLimit}分钟以内。` : ''}

请根据现有食材推荐 3 道可以制作的菜品。返回 JSON 格式：
{
  "recommendations": [
    {
      "title": "菜名",
      "reason": "推荐理由",
      "difficulty": 1-5,
      "cookTime": 预计时间(分钟),
      "missingIngredients": ["缺少的食材"],
      "steps": ["步骤1", "步骤2"]
    }
  ]
}`;

    try {
      const response = await firstValueFrom(
        this.httpService.post<any>(
          `${this.baseUrl}/services/aigc/text-generation/generation`,
          {
            model: this.textModel,
            input: {
              messages: [
                {
                  role: 'user',
                  content: prompt,
                },
              ],
            },
          },
          {
            headers: {
              Authorization: `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json',
            },
            timeout: 30000,
          },
        ),
      );

      const output = response.data?.output?.choices?.[0]?.message?.content;
      const result = this.extractAiResult(output);

      const recommendations = Array.isArray(result?.recommendations)
        ? result.recommendations
        : [];

      return recommendations.map((rec: any) => ({
        ...rec,
        source: 'ai',
        matchScore: 0.5,
      }));
    } catch (error) {
      console.error('AI 推荐失败:', error.response?.data || error.message);
      return [];
    }
  }

  /**
   * AI 估算食材重量（克）
   * @param imageBase64 图片 base64
   * @param ingredientName 食材名称
   */
  async estimateWeight(imageBase64: string, ingredientName: string) {
    if (!this.apiKey) {
      throw new BadRequestException('AI 服务未配置，请在 .env 中设置 AI_API_KEY');
    }

    const prompt = `这是"${ingredientName}"的照片。请根据照片中食材的体积、密度和常见大小，估算其总重量（克）。
参考密度：叶菜约100-300g/份、根茎类约200-500g/份、肉类约200-500g/份、豆腐约300-500g/块。
严格按以下 JSON 格式返回，不要返回其他内容：
{"weight": 350, "confidence": 0.8}`;

    try {
      const response = await firstValueFrom(
        this.httpService.post<any>(
          `${this.baseUrl}/services/aigc/multimodal-generation/generation`,
          {
            model: this.visionModel,
            input: {
              messages: [
                {
                  role: 'user',
                  content: [
                    { image: `data:image/jpeg;base64,${imageBase64}` },
                    { text: prompt },
                  ],
                },
              ],
            },
          },
          {
            headers: {
              Authorization: `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json',
            },
            timeout: 30000,
          },
        ),
      );

      const output = response.data?.output?.choices?.[0]?.message?.content;
      const result = this.extractAiResult(output);
      const weight = Number(result?.weight);

      if (!weight || weight <= 0 || weight > 10000) {
        throw new BadRequestException('AI 未能估算出有效重量，请手动输入');
      }

      return {
        weight: Math.round(weight),
        confidence: result?.confidence ?? null,
      };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      console.error('AI 重量估算失败:', error.response?.data || error.message);
      throw new BadRequestException('AI 重量估算失败，请手动输入');
    }
  }

  /**
   * 生成菜谱步骤
   */
  async generateSteps(title: string, ingredients: string[], difficulty: number) {
    if (!this.apiKey) {
      throw new BadRequestException('AI 服务未配置');
    }

    const prompt = `请为"${title}"生成详细的烹饪步骤。
食材：${ingredients.join('、')}
难度：${difficulty}星

返回 JSON 格式：
{
  "steps": [
    {
      "stepNumber": 1,
      "description": "步骤描述",
      "duration": 预计时间(分钟),
      "tips": "小贴士"
    }
  ],
  "tips": "整体技巧提示"
}`;

    try {
      const response = await firstValueFrom(
        this.httpService.post<any>(
          `${this.baseUrl}/services/aigc/text-generation/generation`,
          {
            model: this.textModel,
            input: {
              messages: [
                {
                  role: 'user',
                  content: prompt,
                },
              ],
            },
          },
          {
            headers: {
              Authorization: `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json',
            },
            timeout: 30000,
          },
        ),
      );

      const output = response.data?.output?.choices?.[0]?.message?.content;
      return this.extractAiResult(output);
    } catch (error) {
      console.error('AI 生成步骤失败:', error.response?.data || error.message);
      throw new BadRequestException('生成步骤失败，请稍后重试');
    }
  }

  /**
   * 为指定菜谱生成封面图（服务器端 AI 生图）
   * @returns 相对路径 /uploads/recipe-covers/xxx.jpg
   */
  async generateRecipeCover(recipeId: number): Promise<string> {
    const recipe = await this.prisma.recipe.findUnique({
      where: { id: recipeId },
      include: { cuisine: { select: { name: true } } },
    });
    if (!recipe) {
      throw new BadRequestException('菜谱不存在');
    }

    const saved = await this.generateDishImage(
      recipe.title,
      recipe.description || undefined,
      recipe.cuisine?.name,
    );

    await this.prisma.recipe.update({
      where: { id: recipeId },
      data: { coverImage: saved.coverImage, coverThumb: saved.coverThumb },
    });

    return saved.coverImage;
  }

  /**
   * 生成菜品图片（ModelScope Z-Image-Turbo，异步任务 + 轮询）
   * @returns 主图 + 缩略图的相对路径
   */
  async generateDishImage(
    title: string,
    description?: string,
    cuisineName?: string,
  ): Promise<{ coverImage: string; coverThumb: string }> {
    const cuisine = cuisineName || '中餐';
    const desc = (description || '').slice(0, 60);
    const prompt = `Professional food photography of a delicious Chinese dish called "${title}", a traditional ${cuisine} cuisine. ${desc ? `The dish features ${desc}.` : ''} Beautifully plated on a ceramic plate with appetizing colors and textures, soft natural lighting from the side, shallow depth of field, dark rustic wooden table background, garnished with fresh herbs, steaming hot, ultra-realistic, 4K, high detail, food magazine style, no text, no watermark.`;

    const apiKey = process.env.MODELSCOPE_API_KEY || 'ms-dd0f5c6b-f3e3-4628-b94d-615e8ff78386';
    const base = 'https://api-inference.modelscope.cn/';
    const model = 'Tongyi-MAI/Z-Image-Turbo';
    const headers = {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    };

    try {
      // 1. 提交异步生成任务
      const submit = await firstValueFrom(
        this.httpService.post<any>(
          `${base}v1/images/generations`,
          { model, prompt },
          {
            headers: { ...headers, 'X-ModelScope-Async-Mode': 'true' },
            timeout: 30000,
          },
        ),
      );
      const taskId = submit.data?.task_id;
      if (!taskId) {
        throw new Error('no task_id');
      }

      // 2. 轮询等待（最多 5 分钟）
      for (let i = 0; i < 60; i++) {
        await new Promise((r) => setTimeout(r, 5000));
        const result = await firstValueFrom(
          this.httpService.get<any>(`${base}v1/tasks/${taskId}`, {
            headers: { ...headers, 'X-ModelScope-Task-Type': 'image_generation' },
            timeout: 30000,
          }),
        );

        if (result.data?.task_status === 'SUCCEED') {
          const imageUrl = result.data?.output_images?.[0];
          if (!imageUrl) {
            throw new Error('empty output_images');
          }
          return await this.saveImage(imageUrl);
        }        if (result.data?.task_status === 'FAILED') {
          throw new Error('generation FAILED');
        }
      }
      throw new Error('timeout');
    } catch (error) {
      console.error('AI 生成菜品图片失败:', error.message || error);
      throw new BadRequestException('图片生成失败，请稍后重试');
    }
  }

  /**
   * 下载生成结果并保存（主图 720px JPEG + 列表缩略图 400px JPEG）
   */
  private async saveImage(imageUrl: string): Promise<{ coverImage: string; coverThumb: string }> {
    const res = await firstValueFrom(
      this.httpService.get(imageUrl, {
        responseType: 'arraybuffer',
        timeout: 60000,
      }),
    );
    const buf = Buffer.from(res.data as ArrayBuffer);

    const fileName = `recipe-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
    const dir = join(this.findBackendRoot(), 'uploads', 'recipe-covers');
    const thumbDir = join(dir, 'thumbs');
    mkdirSync(dir, { recursive: true });
    mkdirSync(thumbDir, { recursive: true });

    await sharp(buf)
      .resize({ width: 720, withoutEnlargement: true })
      .jpeg({ quality: 82 })
      .toFile(join(dir, fileName));
    await sharp(buf)
      .resize({ width: 400, withoutEnlargement: true })
      .jpeg({ quality: 75 })
      .toFile(join(thumbDir, fileName));

    return {
      coverImage: `/uploads/recipe-covers/${fileName}`,
      coverThumb: `/uploads/recipe-covers/thumbs/${fileName}`,
    };
  }

  /**
   * 向上查找后端根目录（兼容 dist 与 dist/src 两种编译产物结构）
   */
  private findBackendRoot(): string {
    let dir = __dirname;
    for (let i = 0; i < 6; i++) {
      if (existsSync(join(dir, 'package.json'))) return dir;
      const parent = dirname(dir);
      if (parent === dir) break;
      dir = parent;
    }
    return process.cwd();
  }

  /**
   * 提取 AI 返回结果
   * 兼容三种格式：纯字符串 / 数组 [{text: '...'}] / 对象
   */
  private extractAiResult(output: any): any {
    if (!output) return {};

    // 数组格式：提取所有 text 拼接
    if (Array.isArray(output)) {
      const text = output
        .map((c: any) => (typeof c === 'string' ? c : c?.text || ''))
        .join('');
      return this.parseAiOutput(text);
    }

    // 字符串格式
    if (typeof output === 'string') {
      return this.parseAiOutput(output);
    }

    // 已是对象
    if (typeof output === 'object') {
      return output;
    }

    return {};
  }

  /**
   * 解析 AI 输出（处理 markdown 代码块包裹的情况）
   */
  private parseAiOutput(output: string) {
    if (!output) return {};

    // 尝试直接解析
    try {
      return JSON.parse(output);
    } catch {
      // 尝试去除 markdown 代码块
      const cleaned = output
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      try {
        return JSON.parse(cleaned);
      } catch {
        // 尝试提取 JSON 部分
        const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            return JSON.parse(jsonMatch[0]);
          } catch {
            return {};
          }
        }
        return {};
      }
    }
  }
}
