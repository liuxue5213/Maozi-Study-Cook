import { apiClient } from './apiClient';

/**
 * 文件上传相关 API 服务
 */
export const uploadService = {
  /**
   * 上传单张图片
   * @param uri 本地图片 URI（expo-image-picker 返回的 asset.uri）
   * @returns 服务器上的相对路径，如 /uploads/xxx.jpg
   *
   * 注意：这里必须把 Content-Type 覆盖为 multipart/form-data。
   * 因为 apiClient 实例默认带 Content-Type: application/json，
   * axios 1.x 的 transformRequest 遇到「JSON Content-Type + FormData」会把
   * FormData 序列化成 JSON（请求体变成 "null"），导致上传失败。
   * 覆盖后原生端（RCTNetworking）会自动追加 boundary 并替换此请求头，
   * 不需要手动拼 boundary。
   */
  uploadImage: async (uri: string): Promise<string> => {
    const fd = new FormData();
    fd.append('file', { uri, name: 'photo.jpg', type: 'image/jpeg' } as any);

    const res = await apiClient.post('/upload/image', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    // 拦截器已统一解包，res 即 { code, data: { url } }
    return res.data.url;
  },
};
