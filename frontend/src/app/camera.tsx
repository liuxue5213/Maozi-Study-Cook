import { Redirect } from 'expo-router';

/**
 * 拍照页面（独立页面，从 Tab 进入）
 * 重定向到 Tab 内的 camera 页面
 */
export default function CameraPage() {
  return <Redirect href="/(tabs)/camera" />;
}
