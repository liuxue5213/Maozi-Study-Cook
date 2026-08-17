import { Platform } from 'react-native';

/**
 * 获取图片完整 URL
 * 处理数据库中存储的相对路径，拼接为可访问的完整 URL
 *
 * - Web 开发: localhost:60135（直连后端）
 * - Web 生产: 相对路径（Nginx 代理 /uploads/ 到后端）
 * - APK 开发: localhost:60135
 * - APK 生产: 服务器 IP
 */
export const getImageUrl = (path?: string | null): string | undefined => {
  if (!path) return undefined;
  if (path.startsWith('http')) return path;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  if (Platform.OS === 'web') {
    return __DEV__ ? `http://localhost:60135${cleanPath}` : cleanPath;
  }
  return __DEV__
    ? `http://localhost:60135${cleanPath}`
    : `http://120.48.13.152:60135${cleanPath}`;
};

/**
 * 列表卡片取图：优先缩略图（约 30-60KB，加载快），没有则回退主图
 */
export const getThumbUrl = (recipe: {
  coverThumb?: string | null;
  coverImage?: string | null;
}): string | undefined => getImageUrl(recipe.coverThumb || recipe.coverImage);
