import { apiClient } from './apiClient';

/**
 * AI 服务 API（拍照识别 + 菜谱推荐）
 */
export const aiService = {
  /**
   * 拍照识别食材/菜品
   * @param base64Image base64 编码的图片
   * @param type 识别类型
   */
  recognize: (base64Image: string, type: 'food' | 'ingredient' | 'fridge' = 'ingredient') =>
    apiClient.post('/ai/recognize-base64', {
      image: base64Image,
      type,
    }),

  /**
   * AI 估算食材重量（克）
   */
  estimateWeight: (base64Image: string, ingredientName: string) =>
    apiClient.post('/ai/estimate-weight', {
      image: base64Image,
      ingredientName,
    }),

  /**
   * 根据食材推荐菜谱
   */
  recommend: (ingredients: string[], preferences?: any) =>
    apiClient.post('/ai/recommend', {
      ingredients,
      preferences,
    }),

  /**
   * 生成菜谱步骤
   */
  generateSteps: (title: string, ingredients: string[], difficulty: number = 1) =>
    apiClient.post('/ai/generate-steps', {
      title,
      ingredients,
      difficulty,
    }),
};
