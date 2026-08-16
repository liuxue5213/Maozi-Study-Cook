import axios from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * API 基础 URL 配置
 * 根据运行环境自动选择
 */
const getBaseUrl = () => {
  if (Platform.OS === 'web') {
    if (__DEV__) {
      // Web 开发模式：直连本地后端（CORS 已放开）
      return 'http://localhost:3000/api';
    }
    // Web 生产：使用相对路径（通过 Nginx 代理）
    return '/api';
  }
  // 真机/模拟器：使用局域网地址或生产地址
  return __DEV__
    ? 'http://localhost:3000/api'
    : 'https://your-domain.com/api';
};

/**
 * Axios 实例
 */
export const apiClient = axios.create({
  baseURL: getBaseUrl(),
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * 请求拦截器
 */
apiClient.interceptors.request.use(
  async (config) => {
    // 自动注入 Token
    const token = await AsyncStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

/**
 * 响应拦截器
 */
apiClient.interceptors.response.use(
  (response) => {
    // 统一解包
    const res = response.data;
    if (res.code === 0) {
      return res;
    }
    return Promise.reject(new Error(res.message || '请求失败'));
  },
  async (error) => {
    const originalRequest = error.config;

    // Token 过期处理
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${getBaseUrl()}/auth/refresh`, {
            refreshToken,
          });

          const { accessToken, refreshToken: newRefreshToken } =
            response.data.data;

          await AsyncStorage.setItem('accessToken', accessToken);
          await AsyncStorage.setItem('refreshToken', newRefreshToken);

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return apiClient(originalRequest);
        }
      } catch {
        // 刷新失败，清除登录状态并跳转登录页
        await forceLogout();
      }
    }

    // 统一错误处理
    const message =
      error.response?.data?.message || error.message || '网络错误';
    return Promise.reject(new Error(message));
  },
);

/**
 * 强制登出（Token 失效时调用）
 * 动态导入避免循环依赖，硬编码路径保证 Web/RN 通用
 */
export async function forceLogout() {
  try {
    await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
  } catch {
    // 存储清理失败不影响跳转
  }

  // 使用 expo-router 跳转登录页（动态导入避免模块初始化顺序问题）
  try {
    const { router } = await import('expo-router');
    router.replace('/(auth)/login');
  } catch {
    // Web 端兜底：刷新页面让入口逻辑重新判断登录态
    if (typeof window !== 'undefined') {
      window.location.href = '/(auth)/login';
    }
  }
}
