import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { cuisineService } from '../../services/cuisineService';

/**
 * 菜系详情页
 */
export default function CuisineDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const [cuisine, setCuisine] = useState<any>(null);
  const [recipes, setRecipes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [slug]);

  const loadData = async () => {
    try {
      const [cuisineRes, recipesRes] = await Promise.all([
        cuisineService.getDetail(slug),
        cuisineService.getRecipes(slug, { pageSize: 10 }),
      ]);
      setCuisine(cuisineRes.data);
      setRecipes(recipesRes.data?.list || []);
    } catch (error) {
      console.error('加载菜系详情失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !cuisine) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-cooking-background">
      {/* 封面 */}
      <View className="w-full h-48 bg-gradient-to-br from-orange-400 to-red-500 items-center justify-center">
        <Text className="text-6xl">🍜</Text>
        <Text className="text-white text-2xl font-bold mt-2">{cuisine.name}</Text>
        <Text className="text-white/80 text-sm">{cuisine.nameEn}</Text>
      </View>

      {/* 介绍 */}
      <View className="bg-white px-4 py-5">
        <Text className="text-lg font-bold text-cooking-text mb-3">
          菜系介绍
        </Text>
        <Text className="text-cooking-text leading-6">
          {cuisine.description}
        </Text>
      </View>

      {/* 历史渊源 */}
      {cuisine.history && (
        <View className="bg-white mt-2 px-4 py-5">
          <Text className="text-lg font-bold text-cooking-text mb-3">
            📜 历史渊源
          </Text>
          <Text className="text-cooking-muted leading-6">{cuisine.history}</Text>
        </View>
      )}

      {/* 特点特色 */}
      {cuisine.characteristics && (
        <View className="bg-white mt-2 px-4 py-5">
          <Text className="text-lg font-bold text-cooking-text mb-3">
            ⭐ 菜系特点
          </Text>
          <Text className="text-cooking-muted leading-6">
            {cuisine.characteristics}
          </Text>
        </View>
      )}

      {/* 代表菜 */}
      {cuisine.famousDishes && (
        <View className="bg-white mt-2 px-4 py-5">
          <Text className="text-lg font-bold text-cooking-text mb-3">
            🏆 代表菜品
          </Text>
          <View className="flex-row flex-wrap">
            {JSON.parse(cuisine.famousDishes || '[]').map(
              (dish: string, idx: number) => (
                <View
                  key={idx}
                  className="bg-cooking-main/10 px-4 py-2 rounded-full mr-2 mb-2"
                >
                  <Text className="text-cooking-main">{dish}</Text>
                </View>
              ),
            )}
          </View>
        </View>
      )}

      {/* 菜谱列表 */}
      <View className="bg-white mt-2 px-4 py-5 mb-4">
        <Text className="text-lg font-bold text-cooking-text mb-3">
          🍳 相关菜谱 ({cuisine.recipeCount || recipes.length})
        </Text>
        {recipes.length === 0 ? (
          <Text className="text-cooking-muted text-center py-4">
            暂无菜谱
          </Text>
        ) : (
          recipes.map((recipe: any) => (
            <TouchableOpacity
              key={recipe.id}
              className="bg-gray-50 rounded-xl p-4 mb-3 flex-row"
              onPress={() => router.push(`/recipe/${recipe.id}`)}
            >
              <View className="w-16 h-16 bg-white rounded-lg items-center justify-center">
                <Text className="text-2xl">🍲</Text>
              </View>
              <View className="flex-1 ml-3 justify-center">
                <Text className="text-cooking-text font-semibold">
                  {recipe.title}
                </Text>
                <Text className="text-cooking-muted text-sm mt-1">
                  难度{recipe.difficulty}⭐ · ⏱ {recipe.cookTime || 30}分钟
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
  );
}
