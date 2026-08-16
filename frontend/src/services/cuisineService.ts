import { apiClient } from './apiClient';

/**
 * 菜系相关 API 服务
 */
export const cuisineService = {
  /**
   * 获取菜系列表
   */
  getList: (params?: { page?: number; pageSize?: number }) =>
    apiClient.get('/cuisines', { params }),

  /**
   * 获取菜系详情
   */
  getDetail: (slug: string) => apiClient.get(`/cuisines/${slug}`),

  /**
   * 获取菜系下的菜谱
   */
  getRecipes: (
    slug: string,
    params?: { page?: number; pageSize?: number; difficulty?: number },
  ) => apiClient.get(`/cuisines/${slug}/recipes`, { params }),
};
