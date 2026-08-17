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
      <Text style={styles.pageTitle}>
        中华菜系
      </Text>
      <Text style={styles.pageSubtitle}>
        了解各大菜系的历史渊源、特色与代表菜品
      </Text>

      {cuisines.map((cuisine: any) => (
        <TouchableOpacity
          key={cuisine.id}
          style={styles.cuisineCard}
          onPress={() => router.push(`/cuisine/${cuisine.slug}`)}
        >
          <View style={styles.cuisineHeader}>
            <View style={styles.cuisineIconWrap}>
              <Text style={styles.cuisineIcon}>🍜</Text>
            </View>
            <View style={styles.cuisineNameWrap}>
              <Text style={styles.cuisineName}>
                {cuisine.name}
              </Text>
              <Text style={styles.cuisineSub}>
                {cuisine.nameEn} · {cuisine.recipeCount || 0} 道菜谱
              </Text>
            </View>
          </View>

          <Text style={styles.cuisineDesc} numberOfLines={3}>
            {cuisine.description}
          </Text>

          {cuisine.famousDishes && (
            <View style={styles.famousDishes}>
              {JSON.parse(cuisine.famousDishes || '[]')
                .slice(0, 4)
                .map((dish: string, idx: number) => (
                  <View
                    key={idx}
                    style={styles.dishTag}
                  >
                    <Text style={styles.dishTagText}>{dish}</Text>
                  </View>
                ))}
            </View>
          )}
        </TouchableOpacity>
      ))}
    </ScrollView>
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
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  contentContainer: {
    paddingBottom: 90,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  pageSubtitle: {
    color: '#9ca3af',
    fontSize: 14,
    marginBottom: 16,
  },
  cuisineCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  cuisineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cuisineIconWrap: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(249, 115, 22, 0.1)',
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cuisineIcon: {
    fontSize: 24,
  },
  cuisineNameWrap: {
    marginLeft: 12,
  },
  cuisineName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  cuisineSub: {
    color: '#9ca3af',
    fontSize: 12,
  },
  cuisineDesc: {
    color: '#1f2937',
    fontSize: 14,
    lineHeight: 20,
  },
  famousDishes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
  },
  dishTag: {
    backgroundColor: 'rgba(249, 115, 22, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  dishTagText: {
    color: '#f97316',
    fontSize: 12,
  },
});
