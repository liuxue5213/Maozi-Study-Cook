import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../stores/authStore';
import { recipeService } from '../../services/recipeService';
import { cuisineService } from '../../services/cuisineService';

/**
 * 首页 - 推荐内容、热门菜谱、菜系入口
 */
export default function HomeScreen() {
  const { user, checkAuth } = useAuthStore();
  const [hotRecipes, setHotRecipes] = useState([]);
  const [cuisines, setCuisines] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [recipesRes, cuisinesRes] = await Promise.all([
        recipeService.getList({ pageSize: 10, sortBy: 'hot' }),
        cuisineService.getList({ pageSize: 8 }),
      ]);
      setHotRecipes(recipesRes.data?.list || []);
      setCuisines(cuisinesRes.data?.list || []);
    } catch (error) {
      console.error('加载首页数据失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-cooking-background">
      {/* 欢迎区域 */}
      <View className="bg-cooking-main px-5 pt-6 pb-8 rounded-b-3xl">
        <Text className="text-white text-lg">
          {user?.nickname ? `你好，${user.nickname} 👋` : '你好，厨友 👋'}
        </Text>
        <Text className="text-white/80 text-sm mt-1">
          {user?.nickname ? `今天想学做什么菜？` : '登录开始你的烹饪之旅'}
        </Text>

          {/* 快捷入口 */}
          <View className="flex-row mt-5 space-x-4">
            <QuickAction
              icon="camera"
              label="拍照识别"
              onPress={() => router.push('/camera')}
            />
            <QuickAction
              icon="search"
              label="搜索菜谱"
              onPress={() => router.push('/(tabs)/cuisines')}
            />
            <QuickAction
              icon="calendar"
              label="今日打卡"
              onPress={() => router.push('/(tabs)/community')}
            />
          </View>
      </View>

      {/* 菜系分类 */}
      <View className="px-4 mt-6">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-lg font-bold text-cooking-text">八大菜系</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/cuisines')}>
            <Text className="text-cooking-main text-sm">查看全部</Text>
          </TouchableOpacity>
        </View>
        <View className="flex-row flex-wrap justify-between">
          {cuisines.map((cuisine: any) => (
            <TouchableOpacity
              key={cuisine.id}
              className="w-[23%] bg-white rounded-xl p-3 items-center mb-3 shadow-sm"
              onPress={() => router.push(`/cuisine/${cuisine.slug}`)}
            >
              <Text className="text-2xl mb-1">🍜</Text>
              <Text className="text-xs text-cooking-text text-center">
                {cuisine.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* 热门菜谱 */}
      <View className="px-4 mt-4 pb-6">
        <Text className="text-lg font-bold text-cooking-text mb-3">
          🔥 热门菜谱
        </Text>
        {hotRecipes.map((recipe: any) => (
          <TouchableOpacity
            key={recipe.id}
            className="bg-white rounded-xl p-4 mb-3 flex-row shadow-sm"
            onPress={() => router.push(`/recipe/${recipe.id}`)}
          >
            {recipe.coverImage ? (
              <Image
                source={{ uri: recipe.coverImage }}
                className="w-20 h-20 rounded-lg"
                resizeMode="cover"
              />
            ) : (
              <View className="w-20 h-20 bg-gray-100 rounded-lg items-center justify-center">
                <Text className="text-3xl">🍲</Text>
              </View>
            )}
            <View className="flex-1 ml-3 justify-center">
              <Text className="text-base font-semibold text-cooking-text">
                {recipe.title}
              </Text>
              <Text className="text-cooking-muted text-sm mt-1">
                {recipe.cuisine?.name || ''} · 难度{recipe.difficulty}⭐
              </Text>
              <Text className="text-cooking-muted text-xs mt-1">
                ⏱ {recipe.cookTime || 30}分钟 · 👁 {recipe.viewCount || 0}次浏览 · 🍳 {recipe.cookCount || 0}人做过
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

function QuickAction({
  icon,
  label,
  onPress,
}: {
  icon: string;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      className="flex-1 bg-white/20 rounded-xl py-3 items-center"
      onPress={onPress}
    >
      <Ionicons name={icon as any} size={22} color="white" />
      <Text className="text-white text-xs mt-1">{label}</Text>
    </TouchableOpacity>
  );
}
