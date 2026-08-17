import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../stores/authStore';
import { recipeService } from '../services/recipeService';

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
      <View style={styles.loginPromptContainer}>
        <Text style={styles.loginPromptEmoji}>⭐</Text>
        <Text style={styles.loginPromptTitle}>登录查看收藏</Text>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => router.push('/(auth)/login')}
        >
          <Text style={styles.loginButtonText}>立即登录</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>我的收藏</Text>
        <Text style={styles.headerSubtitle}>
          共收藏 {favorites.length} 道菜谱
        </Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {favorites.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>📚</Text>
            <Text style={styles.emptyText}>还没有收藏任何菜谱</Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => router.push('/(tabs)/home')}
            >
              <Text style={styles.emptyButtonText}>去发现菜谱</Text>
            </TouchableOpacity>
          </View>
        ) : (
          favorites.map((recipe: any) => (
            <TouchableOpacity
              key={recipe.id}
              style={styles.recipeCard}
              onPress={() => router.push(`/recipe/${recipe.id}`)}
            >
              <View style={styles.recipeThumb}>
                <Text style={styles.recipeThumbEmoji}>🍲</Text>
              </View>
              <View style={styles.recipeInfo}>
                <Text style={styles.recipeTitle}>
                  {recipe.title}
                </Text>
                <Text style={styles.recipeSubtitle}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  loginPromptContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fafafa',
  },
  loginPromptEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  loginPromptTitle: {
    fontSize: 18,
    color: '#1f2937',
  },
  loginButton: {
    backgroundColor: '#f97316',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 16,
  },
  loginButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
  },
  headerSubtitle: {
    color: '#9ca3af',
    fontSize: 14,
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  emptyContainer: {
    paddingVertical: 80,
    alignItems: 'center',
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    color: '#9ca3af',
  },
  emptyButton: {
    backgroundColor: '#f97316',
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 12,
    marginTop: 16,
  },
  emptyButtonText: {
    color: '#fff',
    fontWeight: '500',
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
  recipeThumb: {
    width: 64,
    height: 64,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recipeThumbEmoji: {
    fontSize: 24,
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
  recipeSubtitle: {
    color: '#9ca3af',
    fontSize: 14,
    marginTop: 4,
  },
});
