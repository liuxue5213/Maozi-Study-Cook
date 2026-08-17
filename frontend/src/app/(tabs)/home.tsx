import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Image,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../stores/authStore';
import { recipeService } from '../../services/recipeService';
import { cuisineService } from '../../services/cuisineService';
import { getImageUrl } from '../../utils/imageUtils';

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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {/* 欢迎区域 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {user?.nickname ? `你好，${user.nickname} 👋` : '你好，厨友 👋'}
        </Text>
        <Text style={styles.headerSubtitle}>
          {user?.nickname ? `今天想学做什么菜？` : '登录开始你的烹饪之旅'}
        </Text>

        {/* 快捷入口 */}
        <View style={styles.quickActions}>
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
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>八大菜系</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/cuisines')}>
            <Text style={styles.sectionLink}>查看全部</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.cuisineGrid}>
          {cuisines.map((cuisine: any) => (
            <TouchableOpacity
              key={cuisine.id}
              style={styles.cuisineItem}
              onPress={() => router.push(`/cuisine/${cuisine.slug}`)}
            >
              <Text style={styles.cuisineIcon}>🍜</Text>
              <Text style={styles.cuisineName}>
                {cuisine.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* 热门菜谱 */}
      <View style={styles.hotSection}>
        <Text style={styles.hotSectionTitle}>
          🔥 热门菜谱
        </Text>
        {hotRecipes.map((recipe: any) => (
          <TouchableOpacity
            key={recipe.id}
            style={styles.recipeCard}
            onPress={() => router.push(`/recipe/${recipe.id}`)}
          >
            {recipe.coverImage ? (
              <Image
                source={{ uri: getImageUrl(recipe.coverImage) ?? '' }}
                style={styles.recipeImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.recipeImagePlaceholder}>
                <Text style={styles.recipeImagePlaceholderIcon}>🍲</Text>
              </View>
            )}
            <View style={styles.recipeInfo}>
              <Text style={styles.recipeTitle}>
                {recipe.title}
              </Text>
              <Text style={styles.recipeMeta}>
                {recipe.cuisine?.name || ''} · 难度{recipe.difficulty}⭐
              </Text>
              <Text style={styles.recipeStats}>
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
      style={styles.quickAction}
      onPress={onPress}
    >
      <Ionicons name={icon as any} size={22} color="white" />
      <Text style={styles.quickActionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  contentContainer: {
    paddingBottom: 90,
  },
  header: {
    backgroundColor: '#f97316',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 32,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginTop: 4,
  },
  quickActions: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 16,
  },
  quickAction: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  quickActionLabel: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  sectionLink: {
    color: '#f97316',
    fontSize: 14,
  },
  cuisineGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  cuisineItem: {
    width: '23%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  cuisineIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  cuisineName: {
    fontSize: 12,
    color: '#1f2937',
    textAlign: 'center',
  },
  hotSection: {
    paddingHorizontal: 16,
    marginTop: 16,
    paddingBottom: 24,
  },
  hotSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
  },
  recipeCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  recipeImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  recipeImagePlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recipeImagePlaceholderIcon: {
    fontSize: 30,
  },
  recipeInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  recipeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  recipeMeta: {
    color: '#9ca3af',
    fontSize: 14,
    marginTop: 4,
  },
  recipeStats: {
    color: '#9ca3af',
    fontSize: 12,
    marginTop: 4,
  },
});
