import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { recipeService } from '../../services/recipeService';
import { useAuthStore } from '../../stores/authStore';

/**
 * 菜谱详情页
 */
export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isAuthenticated } = useAuthStore();
  const [recipe, setRecipe] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCookModal, setShowCookModal] = useState(false);

  useEffect(() => {
    loadRecipe();
  }, [id]);

  const loadRecipe = async () => {
    try {
      const res = await recipeService.getDetail(Number(id));
      setRecipe(res.data);
    } catch (error) {
      console.error('加载菜谱失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFavorite = async () => {
    if (!isAuthenticated) {
      router.push('/(auth)/login');
      return;
    }
    try {
      const res = await recipeService.toggleFavorite(Number(id));
      setRecipe({ ...recipe, isFavorited: res.data.isFavorited });
    } catch (error) {
      console.error('收藏失败:', error);
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      router.push('/(auth)/login');
      return;
    }
    try {
      const res = await recipeService.toggleLike(Number(id));
      setRecipe({ ...recipe, isLiked: res.data.isLiked });
    } catch (error) {
      console.error('点赞失败:', error);
    }
  };

  const handleCook = async () => {
    if (!isAuthenticated) {
      router.push('/(auth)/login');
      return;
    }
    try {
      const res = await recipeService.incrementCookCount(Number(id));
      setRecipe({ ...recipe, cookCount: res.data.cookCount });
      setShowCookModal(false);
    } catch (error) {
      console.error('记录制作失败:', error);
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  if (!recipe) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-cooking-muted">菜谱不存在</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-cooking-background">
      <ScrollView className="flex-1">
        {/* 封面 */}
        <View className="w-full h-56 bg-gray-100 items-center justify-center">
          <Text className="text-6xl">🍲</Text>
        </View>

        {/* 基本信息 */}
        <View className="bg-white px-4 py-5">
          <Text className="text-2xl font-bold text-cooking-text">
            {recipe.title}
          </Text>
          {recipe.description && (
            <Text className="text-cooking-muted mt-2 leading-5">
              {recipe.description}
            </Text>
          )}

          {/* 标签信息 */}
          <View className="flex-row flex-wrap mt-4">
            {recipe.cuisine && (
              <View className="bg-cooking-main/10 px-3 py-1 rounded-full mr-2 mb-2">
                <Text className="text-cooking-main text-xs">
                  {recipe.cuisine.name}
                </Text>
              </View>
            )}
            <View className="bg-gray-100 px-3 py-1 rounded-full mr-2 mb-2">
              <Text className="text-cooking-text text-xs">
                难度{recipe.difficulty}⭐
              </Text>
            </View>
            {recipe.cookTime && (
              <View className="bg-gray-100 px-3 py-1 rounded-full mr-2 mb-2">
                <Text className="text-cooking-text text-xs">
                  ⏱ {recipe.cookTime}分钟
                </Text>
              </View>
            )}
          </View>

          {/* 统计 */}
          <View className="flex-row mt-4 text-sm text-cooking-muted">
            <Text>👁 {recipe.viewCount || 0} 次浏览</Text>
            <Text className="ml-4">🍳 {recipe.cookCount || 0} 人做过</Text>
            <Text className="ml-4">❤️ {recipe.likeCount || 0} 点赞</Text>
            <Text className="ml-4">⭐ {recipe.favoriteCount || 0} 收藏</Text>
          </View>
        </View>

        {/* 食材清单 */}
        <View className="bg-white mt-2 px-4 py-5">
          <Text className="text-lg font-bold text-cooking-text mb-3">
            🥬 所需食材
          </Text>
          <View className="flex-row flex-wrap">
            {recipe.ingredients?.map((ing: any, idx: number) => (
              <View
                key={idx}
                className={`w-[48%] p-3 rounded-lg mb-2 mr-[4%] ${
                  ing.isMain ? 'bg-orange-50' : 'bg-gray-50'
                }`}
              >
                <Text className="text-cooking-text font-medium">{ing.name}</Text>
                <Text className="text-cooking-muted text-sm">{ing.amount}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 烹饪步骤 */}
        <View className="bg-white mt-2 px-4 py-5">
          <Text className="text-lg font-bold text-cooking-text mb-3">
            👨‍🍳 烹饪步骤
          </Text>
          {recipe.steps?.map((step: any, idx: number) => (
            <View key={idx} className="flex-row mb-4">
              <View className="w-8 h-8 bg-cooking-main rounded-full items-center justify-center">
                <Text className="text-white font-bold text-sm">
                  {step.stepNumber}
                </Text>
              </View>
              <View className="flex-1 ml-3">
                <Text className="text-cooking-text leading-5">
                  {step.description}
                </Text>
                {step.duration && (
                  <Text className="text-cooking-muted text-xs mt-1">
                    ⏱ 约 {step.duration} 分钟
                  </Text>
                )}
                {step.tips && (
                  <Text className="text-cooking-main text-xs mt-1">
                    💡 {step.tips}
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* 小贴士 */}
        {recipe.tips && (
          <View className="bg-white mt-2 px-4 py-5 mb-4">
            <Text className="text-lg font-bold text-cooking-text mb-2">
              💡 小贴士
            </Text>
            <Text className="text-cooking-muted leading-5">{recipe.tips}</Text>
          </View>
        )}
      </ScrollView>

      {/* 底部操作栏 */}
      <View className="bg-white border-t border-gray-100 px-4 py-3 flex-row items-center">
        <TouchableOpacity
          className="flex-row items-center mr-6"
          onPress={handleLike}
        >
          <Ionicons
            name={recipe.isLiked ? 'heart' : 'heart-outline'}
            size={22}
            color={recipe.isLiked ? '#ef4444' : '#6b7280'}
          />
          <Text className="text-cooking-muted text-sm ml-1">点赞</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center"
          onPress={handleFavorite}
        >
          <Ionicons
            name={recipe.isFavorited ? 'star' : 'star-outline'}
            size={22}
            color={recipe.isFavorited ? '#f59e0b' : '#6b7280'}
          />
          <Text className="text-cooking-muted text-sm ml-1">收藏</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="ml-auto bg-cooking-main px-6 py-2 rounded-full"
          onPress={() => setShowCookModal(true)}
        >
          <Text className="text-white font-medium">去做这道菜</Text>
        </TouchableOpacity>
      </View>

      {/* 做菜功能弹窗 */}
      <Modal
        visible={showCookModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCookModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-xl font-bold text-cooking-text">
                🍳 开始做「{recipe.title}」
              </Text>
              <TouchableOpacity onPress={() => setShowCookModal(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {/* 功能列表 */}
            <Text className="text-base font-semibold text-cooking-text mb-4">
              做菜助手功能：
            </Text>

            <View className="space-y-3 mb-6">
              <CookFeatureItem
                icon="list-outline"
                title="分步烹饪指引"
                desc="跟着步骤一步步做，不易出错"
              />
              <CookFeatureItem
                icon="timer-outline"
                title="厨房计时器"
                desc="每步自动提醒，把握最佳火候"
              />
              <CookFeatureItem
                icon="checkmark-circle-outline"
                title="食材核对清单"
                desc="勾选已准备的食材，不漏买"
              />
              <CookFeatureItem
                icon="volume-high-outline"
                title="语音播报"
                desc="步骤语音播报，边听边做不脏手"
              />
              <CookFeatureItem
                icon="camera-outline"
                title="拍照打卡"
                desc="做完拍照记录，分享到交流圈"
              />
              <CookFeatureItem
                icon="restaurant-outline"
                title="营养分析"
                desc="查看菜品热量和营养成分"
              />
            </View>

            <TouchableOpacity
              className="bg-cooking-main py-4 rounded-2xl items-center"
              onPress={handleCook}
            >
              <Text className="text-white text-lg font-semibold">
                开始制作 🔥
              </Text>
            </TouchableOpacity>

            <Text className="text-center text-cooking-muted text-xs mt-3">
              点击「开始制作」记录你的做菜成果
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function CookFeatureItem({
  icon,
  title,
  desc,
}: {
  icon: string;
  title: string;
  desc: string;
}) {
  return (
    <View className="flex-row items-center bg-gray-50 rounded-xl p-3">
      <View className="w-10 h-10 bg-cooking-main/10 rounded-full items-center justify-center">
        <Ionicons name={icon as any} size={20} color="#f97316" />
      </View>
      <View className="ml-3 flex-1">
        <Text className="text-cooking-text font-medium">{title}</Text>
        <Text className="text-cooking-muted text-xs mt-0.5">{desc}</Text>
      </View>
    </View>
  );
}
