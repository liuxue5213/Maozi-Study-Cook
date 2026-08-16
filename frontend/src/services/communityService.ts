import { apiClient } from './apiClient';

/**
 * 社区相关 API 服务
 */
export const communityService = {
  /**
   * 获取帖子列表
   */
  getPosts: (params?: {
    page?: number;
    pageSize?: number;
    type?: number;
    sortBy?: string;
  }) => {
    const { page = 1, pageSize = 20, ...rest } = params || {};
    return apiClient.get('/community/posts', {
      params: { page, pageSize, ...rest },
    });
  },

  /**
   * 获取帖子详情
   */
  getPost: (id: number) => apiClient.get(`/community/posts/${id}`),

  /**
   * 发布帖子
   */
  createPost: (data: {
    content: string;
    type?: number;
    recipeId?: number;
    images?: string[];
    isCheckin?: boolean;
  }) => apiClient.post('/community/posts', data),

  /**
   * 删除帖子
   */
  deletePost: (id: number) => apiClient.delete(`/community/posts/${id}`),

  /**
   * 点赞帖子
   */
  likePost: (id: number) => apiClient.post(`/community/posts/${id}/like`),

  /**
   * 获取评论列表
   */
  getComments: (postId: number, params?: { page?: number; pageSize?: number }) =>
    apiClient.get(`/community/posts/${postId}/comments`, { params }),

  /**
   * 发表评论
   */
  createComment: (postId: number, content: string, parentId?: number) =>
    apiClient.post(`/community/posts/${postId}/comments`, {
      content,
      parentId,
    }),

  /**
   * 创建打卡
   */
  createCheckIn: (data: {
    recipeId?: number;
    imageUrl?: string;
    note?: string;
  }) => apiClient.post('/community/checkin', data),

  /**
   * 获取打卡日历
   */
  getCheckInCalendar: (year: number, month: number) =>
    apiClient.get('/community/checkin/calendar', {
      params: { year, month },
    }),
};
