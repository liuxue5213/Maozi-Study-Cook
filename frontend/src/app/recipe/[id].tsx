import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  StyleSheet,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { recipeService } from '../../services/recipeService';
import { useAuthStore } from '../../stores/authStore';
import { getImageUrl } from '../../utils/imageUtils';
import { colors, textStyles, commonStyles } from '../../styles/theme';

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams();
  const { isAuthenticated } = useAuthStore();
  const insets = useSafeAreaInsets();
  const [recipe, setRecipe] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { loadRecipe(); }, [id]);

  const loadRecipe = async () => {
    try {
      const res = await recipeService.getDetail(Number(id));
      setRecipe(res.data);
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
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
            : <Text style={{ fontSize: 60 }}>🍲</Text>}
        </View>

        <View style={styles.section}>
          <Text style={styles.title}>{recipe.title}</Text>
          <View style={styles.stats}>
            <Text style={styles.statText}>👁 {recipe.viewCount || 0} 浏览</Text>
            <Text style={styles.statText}>🍳 {recipe.cookCount || 0} 人做过</Text>
            <Text style={styles.statText}>❤️ {recipe.likeCount || 0} 赞</Text>
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
        <TouchableOpacity><Ionicons name="heart-outline" size={24} color={colors.muted} /></TouchableOpacity>
        <TouchableOpacity><Ionicons name="star-outline" size={24} color={colors.muted} /></TouchableOpacity>
        <TouchableOpacity style={styles.cookBtn}>
          <Text style={styles.cookBtnText}>去做这道菜</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cover: { width: '100%', height: 224, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
  coverImg: { width: '100%', height: '100%' },
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
  cookBtn: { marginLeft: 'auto', backgroundColor: colors.primary, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 20 },
  cookBtnText: { color: '#fff', fontWeight: '600' },
});
