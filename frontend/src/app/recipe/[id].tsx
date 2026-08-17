import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  StyleSheet,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { recipeService } from '../../services/recipeService';
import { communityService } from '../../services/communityService';
import { useAuthStore } from '../../stores/authStore';
import { getImageUrl } from '../../utils/imageUtils';
import { colors, textStyles, commonStyles } from '../../styles/theme';
import InteractiveCookingMode from '../../components/InteractiveCookingMode';

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams();
  const { isAuthenticated } = useAuthStore();
  const insets = useSafeAreaInsets();
  const [recipe, setRecipe] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [cookCount, setCookCount] = useState(0);
  const [isCooking, setIsCooking] = useState(false);

  useEffect(() => { loadRecipe(); }, [id]);

  const loadRecipe = async () => {
    try {
      const res = await recipeService.getDetail(Number(id));
      setRecipe(res.data);
      setIsLiked(!!res.data.isLiked);
      setIsFavorited(!!res.data.isFavorited);
      setLikeCount(res.data.likeCount || 0);
      setCookCount(res.data.cookCount || 0);
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  };

  // 服务器 AI 生成菜品封面图（约 20 秒）
  const handleGenerateCover = async () => {
    setIsGenerating(true);
    try {
      await recipeService.generateCover(Number(id));
      await loadRecipe();
    } catch (e: any) {
      console.error('生成封面失败:', e);
      Alert.alert('提示', e.message || '生成失败，请稍后重试');
    } finally {
      setIsGenerating(false);
    }
  };

  // 点赞 / 取消点赞
  const handleLike = async () => {
    if (!isAuthenticated) {
      Alert.alert('提示', '请先登录');
      return;
    }
    try {
      const res = await recipeService.toggleLike(Number(id));
      setIsLiked(res.data.isLiked);
      setLikeCount((c) => c + (res.data.isLiked ? 1 : -1));
    } catch (e: any) {
      Alert.alert('提示', e.message || '操作失败，请稍后重试');
    }
  };

  // 收藏 / 取消收藏
  const handleFavorite = async () => {
    if (!isAuthenticated) {
      Alert.alert('提示', '请先登录');
      return;
    }
    try {
      const res = await recipeService.toggleFavorite(Number(id));
      setIsFavorited(res.data.isFavorited);
      Alert.alert('提示', res.data.isFavorited ? '已加入收藏' : '已取消收藏');
    } catch (e: any) {
      Alert.alert('提示', e.message || '操作失败，请稍后重试');
    }
  };

  // 完成烹饪：记录做菜次数 + 创建打卡（连续打卡/打卡日历依赖这条记录）
  const handleCookComplete = async () => {
    setIsCooking(false);
    try {
      await recipeService.incrementCookCount(Number(id));
      setCookCount((c) => c + 1);
    } catch (e) {
      console.error('记录做菜次数失败:', e);
    }
    try {
      await communityService.createCheckIn({ recipeId: Number(id) });
    } catch (e) {
      console.error('创建打卡失败:', e);
    }
  };

  if (isLoading) return (
    <View style={[commonStyles.container, commonStyles.center]}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );

  if (!recipe) return (
    <View style={[commonStyles.container, commonStyles.center]}>
      <Text>菜谱不存在</Text>
    </View>
  );

  return (
    <View style={commonStyles.container}>
      <ScrollView style={{ flex: 1 }}>
        <View style={styles.cover}>
          {recipe.coverImage
            ? <Image source={{ uri: getImageUrl(recipe.coverImage) ?? '' }} style={styles.coverImg} />
            : (
              <View style={styles.coverPlaceholder}>
                <Text style={{ fontSize: 60 }}>🍲</Text>
                <TouchableOpacity
                  style={styles.generateBtn}
                  onPress={handleGenerateCover}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.generateBtnText}>🎨 AI 生成菜品图</Text>
                  )}
                </TouchableOpacity>
                {isGenerating ? <Text style={styles.generatingHint}>生成中，约 20 秒…</Text> : null}
              </View>
            )}
        </View>

        <View style={styles.section}>
          <Text style={styles.title}>{recipe.title}</Text>
          <View style={styles.stats}>
            <Text style={styles.statText}>👁 {recipe.viewCount || 0} 浏览</Text>
            <Text style={styles.statText}>🍳 {cookCount} 人做过</Text>
            <Text style={styles.statText}>❤️ {likeCount} 赞</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🥬 食材</Text>
          {recipe.ingredients?.map((ing: any, i: number) => (
            <View key={i} style={styles.ingredientRow}>
              <Text style={styles.ingredientName}>{ing.name}</Text>
              <Text style={styles.ingredientAmount}>{ing.amount}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👨‍🍳 步骤</Text>
          {recipe.steps?.map((step: any, i: number) => (
            <View key={i} style={styles.stepRow}>
              <View style={styles.stepNumber}><Text style={styles.stepNumText}>{step.stepNumber}</Text></View>
              <View style={styles.stepContent}>
                <Text style={styles.stepDesc}>{step.description}</Text>
                {step.duration && <Text style={styles.stepTime}>⏱ {step.duration}分钟</Text>}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 8 }]}>
        <TouchableOpacity style={styles.actionBtn} onPress={handleLike} activeOpacity={0.6}>
          <Ionicons
            name={isLiked ? 'heart' : 'heart-outline'}
            size={26}
            color={isLiked ? '#ef4444' : colors.muted}
          />
          <Text style={[styles.actionLabel, isLiked && styles.actionLabelActive]}>
            {likeCount}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={handleFavorite} activeOpacity={0.6}>
          <Ionicons
            name={isFavorited ? 'star' : 'star-outline'}
            size={26}
            color={isFavorited ? colors.primary : colors.muted}
          />
          <Text style={[styles.actionLabel, isFavorited && styles.actionLabelActive]}>
            {isFavorited ? '已收藏' : '收藏'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cookBtn} onPress={() => setIsCooking(true)} activeOpacity={0.8}>
          <Text style={styles.cookBtnText}>去做这道菜</Text>
        </TouchableOpacity>
      </View>

      {/* 互动烹饪模式 */}
      <InteractiveCookingMode
        visible={isCooking}
        recipe={recipe}
        servings={recipe.servings || 2}
        baseServings={recipe.servings || 2}
        customWeight=""
        calcMode="servings"
        onClose={() => setIsCooking(false)}
        onComplete={handleCookComplete}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  cover: { width: '100%', height: 224, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
  coverImg: { width: '100%', height: '100%' },
  coverPlaceholder: { alignItems: 'center' },
  generateBtn: { marginTop: 12, backgroundColor: colors.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
  generateBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  generatingHint: { marginTop: 8, color: colors.muted, fontSize: 12 },
  section: { backgroundColor: colors.card, marginTop: 8, padding: 16 },
  title: { ...textStyles.title },
  stats: { flexDirection: 'row', marginTop: 12 },
  statText: { ...textStyles.caption, marginRight: 16 },
  sectionTitle: { ...textStyles.subtitle, marginBottom: 12 },
  ingredientRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  ingredientName: { ...textStyles.body },
  ingredientAmount: { ...textStyles.caption },
  stepRow: { flexDirection: 'row', marginBottom: 16 },
  stepNumber: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  stepNumText: { color: '#fff', fontWeight: 'bold' },
  stepContent: { flex: 1, marginLeft: 12 },
  stepDesc: { ...textStyles.body },
  stepTime: { ...textStyles.caption, marginTop: 4 },
  bottomBar: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: colors.card, borderTopWidth: 1, borderTopColor: colors.border },
  actionBtn: { flexDirection: 'row', alignItems: 'center', marginRight: 20, minWidth: 56 },
  actionLabel: { marginLeft: 4, color: colors.muted, fontSize: 13 },
  actionLabelActive: { color: colors.text, fontWeight: '600' },
  cookBtn: { marginLeft: 'auto', backgroundColor: colors.primary, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 20 },
  cookBtnText: { color: '#fff', fontWeight: '600' },
});
