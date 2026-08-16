import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Alert,
  Platform,
  Image,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { recipeService } from '../../services/recipeService';
import { useAuthStore } from '../../stores/authStore';

/**
 * 菜谱详情页 — 完整教程模式
 */
export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isAuthenticated } = useAuthStore();
  const [recipe, setRecipe] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCookModal, setShowCookModal] = useState(false);
  const [servings, setServings] = useState(2);
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadRecipe();
  }, [id]);

  const loadRecipe = async () => {
    try {
      const res = await recipeService.getDetail(Number(id));
      setRecipe(res.data);
      setServings(res.data.servings || 2);
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
      Alert.alert('🎉 恭喜！', '已记录你的做菜成果，继续加油！');
    } catch (error) {
      console.error('记录制作失败:', error);
    }
  };

  const toggleIngredient = (idx: number) => {
    setCheckedIngredients((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        next.add(idx);
      }
      return next;
    });
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
        {recipe.coverImage ? (
          <Image
            source={{ uri: recipe.coverImage }}
            className="w-full h-56"
            resizeMode="cover"
            defaultSource={require('../../assets/icon.png')}
          />
        ) : (
          <View className="w-full h-56 bg-gray-100 items-center justify-center">
            <Text className="text-6xl">🍲</Text>
          </View>
        )}

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
            {recipe.prepTime && (
              <View className="bg-gray-100 px-3 py-1 rounded-full mr-2 mb-2">
                <Text className="text-cooking-text text-xs">
                  🔪 备餐{recipe.prepTime}分钟
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

        {/* 食材清单（可勾选） */}
        <View className="bg-white mt-2 px-4 py-5">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-bold text-cooking-text">
              🥬 所需食材
            </Text>
            <View className="flex-row items-center">
              <Text className="text-cooking-muted text-sm mr-2">
                {checkedIngredients.size}/{recipe.ingredients?.length || 0}
              </Text>
              <TouchableOpacity
                onPress={() =>
                  setCheckedIngredients(
                    checkedIngredients.size === recipe.ingredients?.length
                      ? new Set()
                      : new Set(recipe.ingredients?.map((_: any, i: number) => i) || [])
                  )
                }
              >
                <Text className="text-cooking-main text-sm">
                  {checkedIngredients.size === recipe.ingredients?.length
                    ? '取消全选'
                    : '全选'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <View className="flex-row flex-wrap">
            {recipe.ingredients?.map((ing: any, idx: number) => (
              <TouchableOpacity
                key={idx}
                className={`w-[48%] p-3 rounded-lg mb-2 mr-[4%] ${
                  checkedIngredients.has(idx)
                    ? 'bg-green-50 border border-green-200'
                    : ing.isMain
                    ? 'bg-orange-50'
                    : 'bg-gray-50'
                }`}
                onPress={() => toggleIngredient(idx)}
              >
                <View className="flex-row items-center">
                  <Ionicons
                    name={
                      checkedIngredients.has(idx)
                        ? 'checkmark-circle'
                        : 'ellipse-outline'
                    }
                    size={16}
                    color={checkedIngredients.has(idx) ? '#22c55e' : '#d1d5db'}
                  />
                  <Text
                    className={`ml-2 font-medium ${
                      checkedIngredients.has(idx)
                        ? 'text-green-600 line-through'
                        : 'text-cooking-text'
                    }`}
                  >
                    {ing.name}
                  </Text>
                </View>
                <Text
                  className={`text-sm mt-1 ${
                    checkedIngredients.has(idx)
                      ? 'text-green-500'
                      : 'text-cooking-muted'
                  }`}
                >
                  {ing.amount}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 烹饪步骤（详细版） */}
        <View className="bg-white mt-2 px-4 py-5">
          <Text className="text-lg font-bold text-cooking-text mb-4">
            👨‍🍳 烹饪步骤
          </Text>
          {recipe.steps?.map((step: any, idx: number) => (
            <View key={idx} className="flex-row mb-5">
              <View className="w-9 h-9 bg-cooking-main rounded-full items-center justify-center">
                <Text className="text-white font-bold text-sm">
                  {step.stepNumber}
                </Text>
              </View>
              <View className="flex-1 ml-3">
                <Text className="text-cooking-text leading-5">
                  {step.description}
                </Text>
                {step.duration && (
                  <View className="flex-row items-center mt-2">
                    <Ionicons name="time-outline" size={14} color="#f97316" />
                    <Text className="text-cooking-main text-xs ml-1">
                      约 {step.duration} 分钟
                    </Text>
                  </View>
                )}
                {step.tips && (
                  <View className="bg-yellow-50 rounded-lg px-3 py-2 mt-2 flex-row items-start">
                    <Text className="text-yellow-600 text-xs mr-1">💡</Text>
                    <Text className="text-yellow-700 text-xs flex-1 leading-4">
                      {step.tips}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* 小贴士 */}
        {recipe.tips && (
          <View className="bg-white mt-2 px-4 py-5">
            <Text className="text-lg font-bold text-cooking-text mb-2">
              💡 大厨小贴士
            </Text>
            <Text className="text-cooking-muted leading-5">{recipe.tips}</Text>
          </View>
        )}

        {/* 营养信息（估算） */}
        <View className="bg-white mt-2 px-4 py-5 mb-4">
          <Text className="text-lg font-bold text-cooking-text mb-3">
            🥗 营养信息（估算）
          </Text>
          <View className="flex-row justify-around">
            <NutritionItem label="热量" value="~350" unit="kcal" />
            <NutritionItem label="蛋白质" value="~25" unit="g" />
            <NutritionItem label="脂肪" value="~15" unit="g" />
            <NutritionItem label="碳水" value="~30" unit="g" />
          </View>
          <Text className="text-cooking-muted text-xs mt-3 text-center">
            * 以上为估算值，实际因食材用量和烹饪方式而异
          </Text>
        </View>
      </ScrollView>

      {/* 底部操作栏（安全区适配，避免与虚拟按键重叠） */}
      <BottomActionBar
        recipe={recipe}
        onLike={handleLike}
        onFavorite={handleFavorite}
        onCook={() => setShowCookModal(true)}
      />

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

function NutritionItem({
  label,
  value,
  unit,
}: {
  label: string;
  value: string;
  unit: string;
}) {
  return (
    <View className="items-center">
      <Text className="text-lg font-bold text-cooking-text">{value}</Text>
      <Text className="text-cooking-muted text-xs">
        {unit}
      </Text>
      <Text className="text-cooking-muted text-xs mt-1">{label}</Text>
    </View>
  );
}

function BottomActionBar({
  recipe,
  onLike,
  onFavorite,
  onCook,
}: {
  recipe: any;
  onLike: () => void;
  onFavorite: () => void;
  onCook: () => void;
}) {
  const insets = useSafeAreaInsets();
  const bottomPad = Platform.OS === 'web' ? 12 : Math.max(insets.bottom, 10);

  return (
    <View
      style={{ paddingBottom: bottomPad }}
      className="bg-white border-t border-gray-100 px-4 pt-3 flex-row items-center"
    >
      <TouchableOpacity
        className="flex-row items-center mr-6"
        onPress={onLike}
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
        onPress={onFavorite}
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
        onPress={onCook}
      >
        <Text className="text-white font-medium">去做这道菜</Text>
      </TouchableOpacity>
    </View>
  );
}
