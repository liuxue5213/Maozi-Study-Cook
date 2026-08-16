import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import '../../global.css';

// 防止启动屏自动隐藏
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    // 应用初始化完成后隐藏启动屏
    SplashScreen.hideAsync();
  }, []);

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="recipe/[id]"
          options={{
            headerShown: true,
            title: '菜谱详情',
            presentation: 'card',
          }}
        />
        <Stack.Screen
          name="post/[id]"
          options={{
            headerShown: true,
            title: '帖子详情',
            presentation: 'card',
          }}
        />
        <Stack.Screen
          name="camera"
          options={{
            headerShown: true,
            title: '拍照识别',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="cuisine/[slug]"
          options={{
            headerShown: true,
            title: '菜系详情',
          }}
        />
      </Stack>
    </>
  );
}
