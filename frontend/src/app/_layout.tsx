import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import '../../global.css';

// 防止启动屏自动隐藏
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    // 应用初始化完成后隐藏启动屏
    SplashScreen.hideAsync();
  }, []);

  return (
    <SafeAreaProvider>
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
        <Stack.Screen
          name="search"
          options={{
            headerShown: false,
            presentation: 'card',
          }}
        />
        <Stack.Screen
          name="favorites"
          options={{
            headerShown: true,
            title: '我的收藏',
          }}
        />
        <Stack.Screen
          name="checkin"
          options={{
            headerShown: true,
            title: '打卡日历',
          }}
        />
        <Stack.Screen
          name="my-recipes"
          options={{
            headerShown: true,
            title: '我的菜谱',
          }}
        />
        <Stack.Screen
          name="settings"
          options={{
            headerShown: true,
            title: '偏好设置',
          }}
        />
        <Stack.Screen
          name="help"
          options={{
            headerShown: true,
            title: '帮助与反馈',
          }}
        />
        <Stack.Screen
          name="about"
          options={{
            headerShown: true,
            title: '关于我们',
          }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}
