import { apiClient } from './apiClient';

/**
 * 菜谱相关 API 服务
 */
export const recipeService = {
  /**
   * 获取菜谱列表
   */
  getList: (params: {
    page?: number;
    pageSize?: number;
    cuisineId?: number;
    difficulty?: number;
    keyword?: string;
    sortBy?: string;
  }) => {
    const { page = 1, pageSize = 20, ...rest } = params;
    return apiClient.get('/recipes', {
      params: { page, pageSize, ...rest },
    });
  },

  /**
   * 获取菜谱详情
   */
  getDetail: (id: number) => apiClient.get(`/recipes/${id}`),

  /**
   * 按食材搜索菜谱
   */
  searchByIngredients: (ingredients: string[]) =>
    apiClient.get('/recipes/by-ingredients', {
      params: { ingredients: ingredients.join(',') },
    }),

  /**
   * 收藏/取消收藏
   */
  toggleFavorite: (id: number) => apiClient.post(`/recipes/${id}/favorite`),

  /**
   * 点赞/取消点赞
   */
  toggleLike: (id: number) => apiClient.post(`/recipes/${id}/like`),

  /**
   * 创建菜谱
   */
  create: (data: any) => apiClient.post('/recipes', data),
};
