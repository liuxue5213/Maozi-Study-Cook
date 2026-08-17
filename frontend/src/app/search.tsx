import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { recipeService } from '../services/recipeService';

/**
 * 搜索菜谱页面
 */
export default function SearchScreen() {
  const insets = useSafeAreaInsets();
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
    <View style={styles.container}>
      {/* 搜索栏 */}
      <View style={[styles.searchBar, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <View style={styles.searchInputWrap}>
          <Ionicons name="search" size={18} color="#9ca3af" />
          <TextInput
            style={styles.searchInput}
            placeholder="搜索菜名、食材..."
            value={keyword}
            onChangeText={setKeyword}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            autoFocus
          />
        </View>
        <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
          <Text style={styles.searchButtonText}>搜索</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {isLoading ? (
          <View style={styles.centerBlock}>
            <ActivityIndicator size="large" color="#f97316" />
          </View>
        ) : hasSearched && results.length === 0 ? (
          <View style={styles.centerBlock}>
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text style={styles.emptyText}>没有找到相关菜谱</Text>
          </View>
        ) : (
          results.map((recipe: any) => (
            <TouchableOpacity
              key={recipe.id}
              style={styles.resultCard}
              onPress={() => router.push(`/recipe/${recipe.id}`)}
            >
              <View style={styles.resultIcon}>
                <Text style={styles.resultEmoji}>🍲</Text>
              </View>
              <View style={styles.resultInfo}>
                <Text style={styles.resultTitle}>
                  {recipe.title}
                </Text>
                <Text style={styles.resultMeta}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  searchBar: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  backButton: {
    marginRight: 12,
  },
  searchInputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 9999,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#1f2937',
  },
  searchButton: {
    marginLeft: 12,
  },
  searchButtonText: {
    color: '#f97316',
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  centerBlock: {
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
  resultCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  resultIcon: {
    width: 64,
    height: 64,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultEmoji: {
    fontSize: 24,
  },
  resultInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  resultMeta: {
    color: '#9ca3af',
    fontSize: 14,
    marginTop: 4,
  },
});
