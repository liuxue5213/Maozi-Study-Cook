import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services/authService';

interface User {
  id: number;
  uuid: string;
  username: string;
  email?: string;
  phone?: string;
  nickname?: string;
  avatar?: string;
  bio?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  login: (account: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  setTokens: (accessToken: string, refreshToken: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,

  /**
   * 登录
   */
  login: async (account: string, password: string) => {
    const response = await authService.login(account, password);
    const { user, accessToken, refreshToken } = response.data;

    // 持久化存储
    await AsyncStorage.setItem('accessToken', accessToken);
    await AsyncStorage.setItem('refreshToken', refreshToken);
    await AsyncStorage.setItem('user', JSON.stringify(user));

    // 更新 API 客户端的 Authorization header
    authService.setAuthToken(accessToken);

    set({
      user,
      accessToken,
      refreshToken,
      isAuthenticated: true,
    });
  },

  /**
   * 注册
   */
  register: async (data: any) => {
    const response = await authService.register(data);
    const { user, accessToken, refreshToken } = response.data;

    await AsyncStorage.setItem('accessToken', accessToken);
    await AsyncStorage.setItem('refreshToken', refreshToken);
    await AsyncStorage.setItem('user', JSON.stringify(user));

    authService.setAuthToken(accessToken);

    set({
      user,
      accessToken,
      refreshToken,
      isAuthenticated: true,
    });
  },

  /**
   * 退出登录
   */
  logout: async () => {
    try {
      await authService.logout();
    } catch {
      // 忽略网络错误
    }

    await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
    authService.setAuthToken(null);

    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
    });
  },

  /**
   * 检查认证状态（启动时调用）
   */
  checkAuth: async () => {
    try {
      const [accessToken, refreshToken, userStr] = await AsyncStorage.multiGet([
        'accessToken',
        'refreshToken',
        'user',
      ]);

      if (accessToken[1] && userStr[1]) {
        authService.setAuthToken(accessToken[1]);

        // 验证 token 是否有效（可选：调接口刷新）
        set({
          accessToken: accessToken[1],
          refreshToken: refreshToken[1],
          user: JSON.parse(userStr[1]),
          isAuthenticated: true,
          isLoading: false,
        });
        return;
      }
    } catch {
      // 解析失败，清除数据
      await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
    }

    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  /**
   * 设置 Token
   */
  setTokens: async (accessToken: string, refreshToken: string) => {
    await AsyncStorage.setItem('accessToken', accessToken);
    await AsyncStorage.setItem('refreshToken', refreshToken);
    authService.setAuthToken(accessToken);

    set({ accessToken, refreshToken });
  },
}));
