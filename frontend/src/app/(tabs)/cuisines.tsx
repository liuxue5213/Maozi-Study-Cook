import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { cuisineService } from '../../services/cuisineService';

/**
 * 菜系学习页面
 */
export default function CuisinesScreen() {
  const [cuisines, setCuisines] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCuisines();
  }, []);

  const loadCuisines = async () => {
    try {
      const res = await cuisineService.getList({ pageSize: 20 });
      setCuisines(res.data?.list || []);
    } catch (error) {
      console.error('加载菜系失败:', error);
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
    <ScrollView className="flex-1 bg-cooking-background px-4 pt-4">
      <Text className="text-xl font-bold text-cooking-text mb-1">
        中华菜系
      </Text>
      <Text className="text-cooking-muted text-sm mb-4">
        了解各大菜系的历史渊源、特色与代表菜品
      </Text>

      {cuisines.map((cuisine: any) => (
        <TouchableOpacity
          key={cuisine.id}
          className="bg-white rounded-xl p-4 mb-4 shadow-sm"
          onPress={() => router.push(`/cuisine/${cuisine.slug}`)}
        >
          <View className="flex-row items-center mb-3">
            <View className="w-12 h-12 bg-cooking-main/10 rounded-full items-center justify-center">
              <Text className="text-2xl">🍜</Text>
            </View>
            <View className="ml-3">
              <Text className="text-lg font-bold text-cooking-text">
                {cuisine.name}
              </Text>
              <Text className="text-cooking-muted text-xs">
                {cuisine.nameEn} · {cuisine.recipeCount || 0} 道菜谱
              </Text>
            </View>
          </View>

          <Text className="text-cooking-text text-sm leading-5" numberOfLines={3}>
            {cuisine.description}
          </Text>

          {cuisine.famousDishes && (
            <View className="flex-row flex-wrap mt-3">
              {JSON.parse(cuisine.famousDishes || '[]')
                .slice(0, 4)
                .map((dish: string, idx: number) => (
                  <View
                    key={idx}
                    className="bg-cooking-main/10 px-2 py-1 rounded-md mr-2 mb-2"
                  >
                    <Text className="text-cooking-main text-xs">{dish}</Text>
                  </View>
                ))}
            </View>
          )}
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}
