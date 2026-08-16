import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../../stores/authStore';
import { recipeService } from '../../services/recipeService';

/**
 * 我的收藏页面
 */
export default function FavoritesScreen() {
  const { isAuthenticated } = useAuthStore();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }
    try {
      const res = await recipeService.getFavorites();
      setFavorites(res.data?.list || []);
    } catch (error) {
      console.error('加载收藏失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <View className="flex-1 items-center justify-center bg-cooking-background">
        <Text className="text-5xl mb-4">⭐</Text>
        <Text className="text-lg text-cooking-text">登录查看收藏</Text>
        <TouchableOpacity
          className="bg-cooking-main px-8 py-3 rounded-xl mt-4"
          onPress={() => router.push('/(auth)/login')}
        >
          <Text className="text-white font-semibold">立即登录</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-cooking-background">
      <View className="bg-white px-4 py-4 border-b border-gray-100">
        <Text className="text-xl font-bold text-cooking-text">我的收藏</Text>
        <Text className="text-cooking-muted text-sm mt-1">
          共收藏 {favorites.length} 道菜谱
        </Text>
      </View>

      <ScrollView className="flex-1 px-4 py-4">
        {favorites.length === 0 ? (
          <View className="py-20 items-center">
            <Text className="text-5xl mb-4">📚</Text>
            <Text className="text-cooking-muted">还没有收藏任何菜谱</Text>
            <TouchableOpacity
              className="bg-cooking-main px-6 py-2 rounded-xl mt-4"
              onPress={() => router.push('/(tabs)/home')}
            >
              <Text className="text-white font-medium">去发现菜谱</Text>
            </TouchableOpacity>
          </View>
        ) : (
          favorites.map((recipe: any) => (
            <TouchableOpacity
              key={recipe.id}
              className="bg-white rounded-xl p-4 mb-3 flex-row shadow-sm"
              onPress={() => router.push(`/recipe/${recipe.id}`)}
            >
              <View className="w-16 h-16 bg-gray-100 rounded-lg items-center justify-center">
                <Text className="text-2xl">🍲</Text>
              </View>
              <View className="flex-1 ml-3 justify-center">
                <Text className="text-base font-semibold text-cooking-text">
                  {recipe.title}
                </Text>
                <Text className="text-cooking-muted text-sm mt-1">
                  {recipe.cuisine?.name || ''} · 难度{recipe.difficulty}⭐
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}
