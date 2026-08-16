import { apiClient } from './apiClient';

/**
 * 认证相关 API 服务
 */
export const authService = {
  /**
   * 设置认证 Token
   */
  setAuthToken: (token: string | null) => {
    if (token) {
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete apiClient.defaults.headers.common['Authorization'];
    }
  },

  /**
   * 登录
   */
  login: (account: string, password: string) =>
    apiClient.post('/auth/login', { account, password }),

  /**
   * 注册
   */
  register: (data: {
    username: string;
    email?: string;
    phone?: string;
    password: string;
    nickname?: string;
  }) => apiClient.post('/auth/register', data),

  /**
   * 刷新 Token
   */
  refreshToken: (refreshToken: string) =>
    apiClient.post('/auth/refresh', { refreshToken }),

  /**
   * 退出登录
   */
  logout: () => apiClient.post('/auth/logout'),
};
