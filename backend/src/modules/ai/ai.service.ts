import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { PrismaService } from '../common/prisma/prisma.service';

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
    this.apiKey = this.configService.get('ai.apiKey');
    this.baseUrl = this.configService.get('ai.baseUrl');
    this.visionModel = this.configService.get('ai.visionModel');
    this.textModel = this.configService.get('ai.textModel');
  }

  /**
   * 拍照识别食材/菜品
   * @param imageBase64 base64 编码的图片
   * @param type 识别类型：food(菜品) / ingredient(食材) / fridge(冰箱)
   */
  async recognize(imageBase64: string, type: string = 'ingredient') {
    if (!this.apiKey) {
      throw new BadRequestException('AI 服务未配置');
    }

    // 根据类型构建不同的 prompt
    const prompts: Record<string, string> = {
      food: '请识别这张图片中的菜品名称。返回 JSON 格式：{"items": [{"name": "菜品名", "confidence": 0.95, "category": "菜系/分类"}]}',
      ingredient: '请识别这张图片中的食材（蔬菜、肉类、调料等）。返回 JSON 格式：{"items": [{"name": "食材名", "confidence": 0.95, "category": "蔬菜/肉类/水产/调料/豆制品/主食"}]}',
      fridge: '请识别这张冰箱照片中的所有食材。返回 JSON 格式：{"items": [{"name": "食材名", "confidence": 0.95, "category": "蔬菜/肉类/水产/调料/豆制品/主食"}]}',
    };

    const prompt = prompts[type] || prompts.ingredient;

    try {
      const response = await firstValueFrom(
        this.httpService.post(
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

      // 解析 AI 返回结果
      const output = response.data?.output?.choices?.[0]?.message?.content;
      let result;

      if (typeof output === 'string') {
        result = this.parseAiOutput(output);
      } else if (Array.isArray(output)) {
        // 通义千问返回格式可能是数组
        const textContent = output.find((c: any) => c.text);
        result = this.parseAiOutput(textContent?.text || '');
      }

      return {
        items: result?.items || [],
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
          ingredients.some(
            (ing) => i.name.includes(ing) || ing.includes(i.name),
          ),
        );
        const matchScore =
          mainIngredients.length > 0
            ? matchedMain.length / mainIngredients.length
            : 0;

        const missingIngredients = mainIngredients
          .filter(
            (i) =>
              !ingredients.some(
                (ing) => i.name.includes(ing) || ing.includes(i.name),
              ),
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
        this.httpService.post(
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
      const result = this.parseAiOutput(output);

      return (
        result?.recommendations?.map((rec: any) => ({
          ...rec,
          source: 'ai',
          matchScore: 0.5,
        })) || []
      );
    } catch (error) {
      console.error('AI 推荐失败:', error.response?.data || error.message);
      return [];
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
        this.httpService.post(
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
      return this.parseAiOutput(output);
    } catch (error) {
      console.error('AI 生成步骤失败:', error.response?.data || error.message);
      throw new BadRequestException('生成步骤失败，请稍后重试');
    }
  }

  /**
   * 解析 AI 输出（处理 markdown 代码块包裹的情况）
   */
  private parseAiOutput(output: string) {
    if (!output) return {};

    try {
      // 尝试直接解析
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
          return JSON.parse(jsonMatch[0]);
        }
        return {};
      }
    }
  }
}
