import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { recipeService } from '../services/recipeService';

/**
 * 搜索菜谱页面
 */
export default function SearchScreen() {
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!keyword.trim()) return;
    setIsLoading(true);
    setHasSearched(true);
    try {
      const res = await recipeService.getList({ keyword, pageSize: 50 });
      setResults(res.data?.list || []);
    } catch (error) {
      console.error('搜索失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-cooking-background">
      {/* 搜索栏 */}
      <View className="bg-white px-4 py-3 flex-row items-center border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <View className="flex-1 flex-row items-center bg-gray-100 rounded-full px-4 py-2">
          <Ionicons name="search" size={18} color="#9ca3af" />
          <TextInput
            className="flex-1 ml-2 text-base text-cooking-text"
            placeholder="搜索菜名、食材..."
            value={keyword}
            onChangeText={setKeyword}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            autoFocus
          />
        </View>
        <TouchableOpacity onPress={handleSearch} className="ml-3">
          <Text className="text-cooking-main font-medium">搜索</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-4 py-4">
        {isLoading ? (
          <View className="py-20 items-center">
            <ActivityIndicator size="large" color="#f97316" />
          </View>
        ) : hasSearched && results.length === 0 ? (
          <View className="py-20 items-center">
            <Text className="text-5xl mb-4">🔍</Text>
            <Text className="text-cooking-muted">没有找到相关菜谱</Text>
          </View>
        ) : (
          results.map((recipe: any) => (
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
                  {recipe.cuisine?.name || ''} · 难度{recipe.difficulty}⭐ · ⏱ {recipe.cookTime || 30}分钟
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}
