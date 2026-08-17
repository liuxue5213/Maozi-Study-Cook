import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
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
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* 封面 */}
      <View style={styles.cover}>
        <Text style={styles.coverEmoji}>🍜</Text>
        <Text style={styles.coverTitle}>{cuisine.name}</Text>
        <Text style={styles.coverSubtitle}>{cuisine.nameEn}</Text>
      </View>

      {/* 介绍 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          菜系介绍
        </Text>
        <Text style={styles.bodyText}>
          {cuisine.description}
        </Text>
      </View>

      {/* 历史渊源 */}
      {cuisine.history && (
        <View style={[styles.section, styles.sectionSpacing]}>
          <Text style={styles.sectionTitle}>
            📜 历史渊源
          </Text>
          <Text style={styles.mutedText}>{cuisine.history}</Text>
        </View>
      )}

      {/* 特点特色 */}
      {cuisine.characteristics && (
        <View style={[styles.section, styles.sectionSpacing]}>
          <Text style={styles.sectionTitle}>
            ⭐ 菜系特点
          </Text>
          <Text style={styles.mutedText}>
            {cuisine.characteristics}
          </Text>
        </View>
      )}

      {/* 代表菜 */}
      {cuisine.famousDishes && (
        <View style={[styles.section, styles.sectionSpacing]}>
          <Text style={styles.sectionTitle}>
            🏆 代表菜品
          </Text>
          <View style={styles.tagContainer}>
            {JSON.parse(cuisine.famousDishes || '[]').map(
              (dish: string, idx: number) => (
                <View
                  key={idx}
                  style={styles.tag}
                >
                  <Text style={styles.tagText}>{dish}</Text>
                </View>
              ),
            )}
          </View>
        </View>
      )}

      {/* 菜谱列表 */}
      <View style={[styles.section, styles.sectionSpacing, styles.sectionLast]}>
        <Text style={styles.sectionTitle}>
          🍳 相关菜谱 ({cuisine.recipeCount || recipes.length})
        </Text>
        {recipes.length === 0 ? (
          <Text style={styles.emptyText}>
            暂无菜谱
          </Text>
        ) : (
          recipes.map((recipe: any) => (
            <TouchableOpacity
              key={recipe.id}
              style={styles.recipeCard}
              onPress={() => router.push(`/recipe/${recipe.id}`)}
            >
              <View style={styles.recipeEmojiBox}>
                <Text style={styles.recipeEmoji}>🍲</Text>
              </View>
              <View style={styles.recipeInfo}>
                <Text style={styles.recipeTitle}>
                  {recipe.title}
                </Text>
                <Text style={styles.recipeSub}>
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

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  cover: {
    width: '100%',
    height: 192,
    backgroundColor: '#f97316',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverEmoji: {
    fontSize: 60,
  },
  coverTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    marginTop: 8,
  },
  coverSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  section: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  sectionSpacing: {
    marginTop: 8,
  },
  sectionLast: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
  },
  bodyText: {
    color: '#1f2937',
    lineHeight: 24,
  },
  mutedText: {
    color: '#9ca3af',
    lineHeight: 24,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: 'rgba(249, 115, 22, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 9999,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    color: '#f97316',
  },
  emptyText: {
    color: '#9ca3af',
    textAlign: 'center',
    paddingVertical: 16,
  },
  recipeCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
  },
  recipeEmojiBox: {
    width: 64,
    height: 64,
    backgroundColor: '#fff',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recipeEmoji: {
    fontSize: 24,
  },
  recipeInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  recipeTitle: {
    color: '#1f2937',
    fontWeight: '600',
  },
  recipeSub: {
    color: '#9ca3af',
    fontSize: 14,
    marginTop: 4,
  },
});
