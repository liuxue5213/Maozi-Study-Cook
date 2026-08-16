import React, { useEffect, useState, useRef, useCallback } from 'react';
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
  TextInput,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { recipeService } from '../../services/recipeService';
import { aiService } from '../../services/aiService';
import { useAuthStore } from '../../stores/authStore';
import { getImageUrl } from '../../utils/imageUtils';
import InteractiveCookingMode from '../../components/InteractiveCookingMode';

/**
 * 菜谱详情页 — 专业教程模式
 *
 * 核心功能：
 * 1. 食材表格 + 份量计算器（按人数自动换算配料/调料重量）
 * 2. 烹饪模式（全屏分步导航 + 计时器 + 进度条）
 */
export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isAuthenticated } = useAuthStore();
  const [recipe, setRecipe] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 份量计算器状态
  const [servings, setServings] = useState(2);
  const [baseServings, setBaseServings] = useState(2);

  // 换算模式: 'servings' 按人数 | 'weight' 按主料重量
  const [calcMode, setCalcMode] = useState<'servings' | 'weight'>('servings');
  // 用户输入的主料实际重量（克），基准是第一个主料的基准克数
  const [customWeight, setCustomWeight] = useState('');
  // AI 识别中
  const [isAiWeightLoading, setIsAiWeightLoading] = useState(false);

  // 食材勾选
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set());

  // 烹饪模式状态
  const [showCookingMode, setShowCookingMode] = useState(false);

  useEffect(() => {
    loadRecipe();
  }, [id]);

  const loadRecipe = async () => {
    try {
      const res = await recipeService.getDetail(Number(id));
      setRecipe(res.data);
      setBaseServings(res.data.servings || 2);
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

  const handleCookComplete = async () => {
    if (!isAuthenticated) {
      router.push('/(auth)/login');
      return;
    }
    try {
      const res = await recipeService.incrementCookCount(Number(id));
      setRecipe({ ...recipe, cookCount: res.data.cookCount });
      setShowCookingMode(false);
      Alert.alert('🎉 恭喜完成！', '已记录你的做菜成果，继续加油！');
    } catch (error) {
      console.error('记录制作失败:', error);
    }
  };

  const adjustServings = (delta: number) => {
    const newServings = Math.max(1, Math.min(20, servings + delta));
    setServings(newServings);
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

  /**
   * 从用量字符串中解析出数值（克）
   * "400g" → 400, "2大勺" → null（勺无法精确换算）
   */
  const parseGrams = (amount: string): number | null => {
    const m = amount?.match(/^([\d.]+)\s*(g|克|克重)$/i);
    return m ? parseFloat(m[1]) : null;
  };

  // 第一个主料的基准克数（作为重量模式的锚点）
  const mainIngredients = recipe?.ingredients?.filter((i: any) => i.isMain) || [];
  const anchor = mainIngredients[0];
  const anchorGrams = anchor ? parseGrams(anchor.amount) : null;

  /**
   * 当前换算比例
   * - servings 模式: servings / baseServings
   * - weight 模式: customWeight / anchorGrams（基于第一个主料）
   */
  const getRatio = (): number => {
    if (calcMode === 'weight' && anchorGrams && customWeight) {
      const w = parseFloat(customWeight);
      if (w > 0) return w / anchorGrams;
      return 1;
    }
    return servings / baseServings;
  };

  /**
   * 计算食材用量（统一按 getRatio 换算）
   */
  const scaleAmount = (amount: string): string => {
    if (!amount || amount === '适量' || amount === '少许') {
      return amount;
    }
    const ratio = getRatio();
    if (ratio === 1) return amount;

    const match = amount.match(/^([\d.]+)\s*(.*)$/);
    if (!match) return amount;

    const num = parseFloat(match[1]);
    const unit = match[2] || '';
    const scaled = num * ratio;
    const rounded = scaled >= 10 ? Math.round(scaled) : Math.round(scaled * 10) / 10;

    return `${rounded}${unit}`;
  };

  /**
   * AI 拍照识别主料重量
   */
  const handleAiWeight = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
      base64: true,
    });
    if (result.canceled || !result.assets?.[0]?.base64) return;

    setIsAiWeightLoading(true);
    try {
      const res = await aiService.estimateWeight(
        result.assets[0].base64,
        anchor?.name || '食材',
      );
      const weight = res.data?.weight;
      if (weight) {
        setCustomWeight(String(weight));
      } else {
        Alert.alert('提示', 'AI 未能识别重量，请手动输入');
      }
    } catch (error: any) {
      Alert.alert('识别失败', error.message || '请手动输入克数');
    } finally {
      setIsAiWeightLoading(false);
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

  const subIngredients = recipe.ingredients?.filter((i: any) => !i.isMain) || [];


  return (
    <View className="flex-1 bg-cooking-background">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
        {/* 封面 */}
        <View className="w-full h-56 bg-gray-100">
          {recipe.coverImage ? (
            <Image
              source={{ uri: getImageUrl(recipe.coverImage) ?? '' }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <View className="w-full h-full items-center justify-center">
              <Text className="text-6xl">🍲</Text>
            </View>
          )}
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

          {/* 标签 */}
          <View className="flex-row flex-wrap mt-4">
            {recipe.cuisine && (
              <View className="bg-cooking-main/10 px-3 py-1 rounded-full mr-2 mb-2">
                <Text className="text-cooking-main text-xs">{recipe.cuisine.name}</Text>
              </View>
            )}
            <View className="bg-gray-100 px-3 py-1 rounded-full mr-2 mb-2">
              <Text className="text-cooking-text text-xs">难度{recipe.difficulty}⭐</Text>
            </View>
            {recipe.cookTime && (
              <View className="bg-gray-100 px-3 py-1 rounded-full mr-2 mb-2">
                <Text className="text-cooking-text text-xs">⏱ {recipe.cookTime}分钟</Text>
              </View>
            )}
          </View>

          {/* 统计 */}
          <View className="flex-row mt-4 bg-gray-50 rounded-xl py-3 px-2">
            <View className="flex-1 items-center">
              <Text className="text-cooking-text font-bold text-base">{recipe.viewCount || 0}</Text>
              <Text className="text-cooking-muted text-xs mt-0.5">浏览</Text>
            </View>
            <View className="w-px bg-gray-200" />
            <View className="flex-1 items-center">
              <Text className="text-cooking-text font-bold text-base">{recipe.cookCount || 0}</Text>
              <Text className="text-cooking-muted text-xs mt-0.5">人做过</Text>
            </View>
            <View className="w-px bg-gray-200" />
            <View className="flex-1 items-center">
              <Text className="text-cooking-text font-bold text-base">{recipe.likeCount || 0}</Text>
              <Text className="text-cooking-muted text-xs mt-0.5">点赞</Text>
            </View>
            <View className="w-px bg-gray-200" />
            <View className="flex-1 items-center">
              <Text className="text-cooking-text font-bold text-base">{recipe.favoriteCount || 0}</Text>
              <Text className="text-cooking-muted text-xs mt-0.5">收藏</Text>
            </View>
          </View>
        </View>

        {/* ===== 份量计算器（三种模式） ===== */}
        <View className="bg-white mt-2 px-4 py-5">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-bold text-cooking-text">👨‍🍳 份量计算</Text>
            {getRatio() !== 1 && (
              <View className="bg-cooking-main/10 px-3 py-1 rounded-full">
                <Text className="text-cooking-main text-xs font-medium">
                  ×{getRatio().toFixed(2)} 倍用量
                </Text>
              </View>
            )}
          </View>

          {/* 模式切换 Tab */}
          <View className="flex-row bg-gray-100 rounded-xl p-1 mb-4">
            <TouchableOpacity
              className={`flex-1 py-2 rounded-lg ${
                calcMode === 'servings' ? 'bg-white shadow-sm' : ''
              }`}
              onPress={() => setCalcMode('servings')}
            >
              <Text
                className={`text-center text-sm font-medium ${
                  calcMode === 'servings' ? 'text-cooking-text' : 'text-cooking-muted'
                }`}
              >
                👥 按人数
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 py-2 rounded-lg ${
                calcMode === 'weight' ? 'bg-white shadow-sm' : ''
              }`}
              onPress={() => setCalcMode('weight')}
            >
              <Text
                className={`text-center text-sm font-medium ${
                  calcMode === 'weight' ? 'text-cooking-text' : 'text-cooking-muted'
                }`}
              >
                ⚖️ 按主料重量
              </Text>
            </TouchableOpacity>
          </View>

          {/* 按人数模式 */}
          {calcMode === 'servings' && (
            <View>
              <View className="flex-row items-center justify-center bg-orange-50 rounded-2xl py-4">
                <TouchableOpacity
                  className="w-12 h-12 bg-white rounded-full items-center justify-center shadow-sm"
                  onPress={() => adjustServings(-1)}
                >
                  <Ionicons name="remove" size={24} color="#f97316" />
                </TouchableOpacity>
                <View className="mx-6 items-center">
                  <Text className="text-3xl font-bold text-cooking-text">{servings}</Text>
                  <Text className="text-cooking-muted text-xs mt-1">人份</Text>
                </View>
                <TouchableOpacity
                  className="w-12 h-12 bg-white rounded-full items-center justify-center shadow-sm"
                  onPress={() => adjustServings(1)}
                >
                  <Ionicons name="add" size={24} color="#f97316" />
                </TouchableOpacity>
              </View>
              <Text className="text-cooking-muted text-xs text-center mt-2">
                调整人数，食材用量自动换算（基准：{baseServings}人份）
              </Text>
            </View>
          )}

          {/* 按主料重量模式 */}
          {calcMode === 'weight' && (
            <View>
              {anchorGrams ? (
                <View>
                  <Text className="text-cooking-muted text-sm mb-2">
                    输入手头「{anchor.name}」的实际重量（菜谱基准：{anchorGrams}g）
                  </Text>
                  <View className="flex-row items-center bg-orange-50 rounded-2xl px-4">
                    <TextInput
                      className="flex-1 text-2xl font-bold text-cooking-text py-4"
                      value={customWeight}
                      onChangeText={(t) => setCustomWeight(t.replace(/[^\d.]/g, ''))}
                      placeholder={`${anchorGrams}`}
                      placeholderTextColor="#d1d5db"
                      keyboardType="numeric"
                      maxLength={5}
                    />
                    <Text className="text-xl font-bold text-cooking-muted">g</Text>
                    <TouchableOpacity
                      className="ml-3 bg-white rounded-full w-11 h-11 items-center justify-center shadow-sm"
                      onPress={handleAiWeight}
                      disabled={isAiWeightLoading}
                    >
                      {isAiWeightLoading ? (
                        <ActivityIndicator size="small" color="#f97316" />
                      ) : (
                        <Ionicons name="camera" size={22} color="#f97316" />
                      )}
                    </TouchableOpacity>
                  </View>
                  <Text className="text-cooking-muted text-xs text-center mt-2">
                    📷 点相机图标拍照，AI 自动估算重量（需配置 AI_API_KEY）
                  </Text>
                  {customWeight && parseFloat(customWeight) > 0 && (
                    <Text className="text-cooking-main text-xs text-center mt-1 font-medium">
                      其他食材和调料将按 {getRatio().toFixed(2)} 倍自动换算
                    </Text>
                  )}
                </View>
              ) : (
                <Text className="text-cooking-muted text-sm text-center py-4">
                  该菜谱主料未标明克数，暂不支持按重量换算
                </Text>
              )}
            </View>
          )}
        </View>

        {/* ===== 食材表格 ===== */}
        <View className="bg-white mt-2 px-4 py-5">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-bold text-cooking-text">🥬 所需食材</Text>
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
                {checkedIngredients.size === recipe.ingredients?.length ? '取消全选' : '全选'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* 主料表格 */}
          {mainIngredients.length > 0 && (
            <View className="mb-4">
              <View className="flex-row bg-gray-100 rounded-t-lg px-3 py-2">
                <Text className="flex-1 text-xs font-bold text-cooking-muted">主料</Text>
                <Text className="w-24 text-xs font-bold text-cooking-muted text-right">用量</Text>
              </View>
              {mainIngredients.map((ing: any, idx: number) => {
                const globalIdx = recipe.ingredients.indexOf(ing);
                return (
                  <IngredientRow
                    key={idx}
                    name={ing.name}
                    amount={scaleAmount(ing.amount)}
                    original={ing.amount}
                    checked={checkedIngredients.has(globalIdx)}
                    onToggle={() => toggleIngredient(globalIdx)}
                    isLast={idx === mainIngredients.length - 1}
                  />
                );
              })}
            </View>
          )}

          {/* 配料/调料表格 */}
          {subIngredients.length > 0 && (
            <View>
              <View className="flex-row bg-gray-100 rounded-t-lg px-3 py-2">
                <Text className="flex-1 text-xs font-bold text-cooking-muted">配料/调料</Text>
                <Text className="w-24 text-xs font-bold text-cooking-muted text-right">用量</Text>
              </View>
              {subIngredients.map((ing: any, idx: number) => {
                const globalIdx = recipe.ingredients.indexOf(ing);
                return (
                  <IngredientRow
                    key={idx}
                    name={ing.name}
                    amount={scaleAmount(ing.amount)}
                    original={ing.amount}
                    checked={checkedIngredients.has(globalIdx)}
                    onToggle={() => toggleIngredient(globalIdx)}
                    isLast={idx === subIngredients.length - 1}
                  />
                );
              })}
            </View>
          )}
        </View>

        {/* ===== 烹饪步骤 ===== */}
        <View className="bg-white mt-2 px-4 py-5">
          <Text className="text-lg font-bold text-cooking-text mb-4">👨‍🍳 烹饪步骤</Text>
          {recipe.steps?.map((step: any, idx: number) => (
            <View key={idx} className="flex-row mb-5">
              <View className="w-9 h-9 bg-cooking-main rounded-full items-center justify-center">
                <Text className="text-white font-bold text-sm">{step.stepNumber}</Text>
              </View>
              <View className="flex-1 ml-3">
                <Text className="text-cooking-text leading-5">{step.description}</Text>
                {step.duration && (
                  <View className="flex-row items-center mt-2">
                    <Ionicons name="time-outline" size={14} color="#f97316" />
                    <Text className="text-cooking-main text-xs ml-1">约 {step.duration} 分钟</Text>
                  </View>
                )}
                {step.tips && (
                  <View className="bg-yellow-50 rounded-lg px-3 py-2 mt-2">
                    <Text className="text-yellow-700 text-xs leading-4">💡 {step.tips}</Text>
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* 小贴士 */}
        {recipe.tips && (
          <View className="bg-white mt-2 px-4 py-5">
            <Text className="text-lg font-bold text-cooking-text mb-2">💡 大厨小贴士</Text>
            <Text className="text-cooking-muted leading-5">{recipe.tips}</Text>
          </View>
        )}
      </ScrollView>

      {/* 底部操作栏 */}
      <BottomActionBar
        recipe={recipe}
        onLike={handleLike}
        onFavorite={handleFavorite}
        onCook={() => setShowCookingMode(true)}
      />

      {/* ===== 交互式做菜模式（全屏沉浸） ===== */}
      <InteractiveCookingMode
        visible={showCookingMode}
        recipe={recipe}
        servings={servings}
        baseServings={baseServings}
        customWeight={customWeight}
        calcMode={calcMode}
        onClose={() => setShowCookingMode(false)}
        onComplete={handleCookComplete}
      />
    </View>
  );
}

/**
 * 食材行组件（表格样式）
 */
function IngredientRow({
  name,
  amount,
  original,
  checked,
  onToggle,
  isLast,
}: {
  name: string;
  amount: string;
  original: string;
  checked: boolean;
  onToggle: () => void;
  isLast: boolean;
}) {
  const isScaled = amount !== original;
  return (
    <TouchableOpacity
      className={`flex-row items-center px-3 py-3 ${
        !isLast ? 'border-b border-gray-100' : 'border-b border-gray-200'
      } ${checked ? 'bg-green-50' : 'bg-white'}`}
      onPress={onToggle}
    >
      <Ionicons
        name={checked ? 'checkmark-circle' : 'ellipse-outline'}
        size={18}
        color={checked ? '#22c55e' : '#d1d5db'}
      />
      <Text
        className={`flex-1 ml-2 text-sm ${
          checked ? 'text-green-600 line-through' : 'text-cooking-text'
        }`}
      >
        {name}
      </Text>
      <View className="w-24 items-end">
        {isScaled ? (
          <View>
            <Text className={`text-sm font-bold ${checked ? 'text-green-500' : 'text-cooking-main'}`}>
              {amount}
            </Text>
            <Text className="text-xs text-gray-400 line-through">{original}</Text>
          </View>
        ) : (
          <View className="flex-row items-center">
            <Text className={`text-sm ${checked ? 'text-green-500' : 'text-cooking-muted'}`}>
              {amount}
            </Text>
            {amount === '适量' && (
              <Text className="text-orange-400 text-xs ml-0.5">
                ≈
              </Text>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

/**
 * 底部操作栏
 */
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
      <TouchableOpacity className="flex-row items-center mr-6" onPress={onLike}>
        <Ionicons
          name={recipe.isLiked ? 'heart' : 'heart-outline'}
          size={22}
          color={recipe.isLiked ? '#ef4444' : '#6b7280'}
        />
        <Text className="text-cooking-muted text-sm ml-1">点赞</Text>
      </TouchableOpacity>

      <TouchableOpacity className="flex-row items-center" onPress={onFavorite}>
        <Ionicons
          name={recipe.isFavorited ? 'star' : 'star-outline'}
          size={22}
          color={recipe.isFavorited ? '#f59e0b' : '#6b7280'}
        />
        <Text className="text-cooking-muted text-sm ml-1">收藏</Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="ml-auto bg-cooking-main px-6 py-3 rounded-full"
        onPress={onCook}
      >
        <Text className="text-white font-semibold">🍳 开始做菜</Text>
      </TouchableOpacity>
    </View>
  );
}

