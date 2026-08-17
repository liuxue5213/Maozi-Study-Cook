import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { aiService } from '../../services/aiService';

/**
 * 拍照识别页面
 */
export default function CameraScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [recognizing, setRecognizing] = useState(false);
  const [recognizedItems, setRecognizedItems] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'ingredient' | 'food' | 'fridge'>('ingredient');

  /**
   * 选择图片（相册）
   */
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      recognizeImage(result.assets[0].base64 || '', activeTab);
    }
  };

  /**
   * 拍照
   */
  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('提示', '需要相机权限才能拍照');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      recognizeImage(result.assets[0].base64 || '', activeTab);
    }
  };

  /**
   * AI 识别
   */
  const recognizeImage = async (base64: string, type: string) => {
    setRecognizing(true);
    setRecognizedItems([]);
    setRecommendations([]);

    try {
      const res = await aiService.recognize(base64, type as any);
      const items = res.data?.items || [];
      setRecognizedItems(items);

      // 自动推荐
      if (items.length > 0 && type !== 'food') {
        const ingredientNames = items.map((i: any) => i.name);
        const recRes = await aiService.recommend(ingredientNames);
        setRecommendations(recRes.data || []);
      } else if (items.length === 0) {
        Alert.alert(
          '识别结果为空',
          '未能识别出图片中的内容，请尝试光线更充足、食材更清晰的照片',
        );
      }
    } catch (error: any) {
      Alert.alert('识别失败', error.message || '请稍后重试');
    } finally {
      setRecognizing(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {/* 识别类型选择 */}
      <View style={styles.tabBar}>
        {[
          { key: 'ingredient', label: '识别食材' },
          { key: 'food', label: '识别菜品' },
          { key: 'fridge', label: '开冰箱' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tabButton,
              activeTab === tab.key ? styles.tabButtonActive : styles.tabButtonInactive,
            ]}
            onPress={() => setActiveTab(tab.key as any)}
          >
            <Text
              style={[
                styles.tabButtonText,
                activeTab === tab.key ? styles.tabButtonTextActive : styles.tabButtonTextInactive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 图片区域 */}
      <View style={styles.imageSection}>
        {imageUri ? (
          <View style={styles.imageWrap}>
            <Image
              source={{ uri: imageUri }}
              style={styles.image}
              resizeMode="cover"
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setImageUri(null);
                setRecognizedItems([]);
                setRecommendations([]);
              }}
            >
              <Ionicons name="close" size={18} color="white" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="image-outline" size={48} color="#d1d5db" />
            <Text style={styles.imagePlaceholderText}>选择或拍摄一张照片</Text>
          </View>
        )}

        {/* 操作按钮 */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.albumButton}
            onPress={pickImage}
          >
            <Ionicons name="images-outline" size={20} color="#f97316" />
            <Text style={styles.albumButtonText}>相册选择</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cameraButton}
            onPress={takePhoto}
          >
            <Ionicons name="camera-outline" size={20} color="white" />
            <Text style={styles.cameraButtonText}>拍照</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 识别中 */}
      {recognizing && (
        <View style={styles.recognizing}>
          <ActivityIndicator size="large" color="#f97316" />
          <Text style={styles.recognizingText}>AI 识别中...</Text>
        </View>
      )}

      {/* 识别结果 */}
      {recognizedItems.length > 0 && !recognizing && (
        <View style={styles.resultSection}>
          <Text style={styles.resultTitle}>
            识别结果
          </Text>
          <View style={styles.itemList}>
            {recognizedItems.map((item: any, idx: number) => (
              <View
                key={idx}
                style={styles.itemChip}
              >
                <Text style={styles.itemName}>{item.name}</Text>
                {item.category && (
                  <Text style={styles.itemCategory}>
                    {item.category}
                  </Text>
                )}
              </View>
            ))}
          </View>
        </View>
      )}

      {/* 推荐菜谱 */}
      {recommendations.length > 0 && !recognizing && (
        <View style={styles.recommendSection}>
          <Text style={styles.resultTitle}>
            🍳 可以做的菜
          </Text>
          {recommendations.map((rec: any, idx: number) => (
            <TouchableOpacity
              key={idx}
              style={styles.recommendCard}
              onPress={() =>
                rec.recipeId && router.push(`/recipe/${rec.recipeId}`)
              }
            >
              <View style={styles.recommendHeader}>
                <Text style={styles.recommendTitle}>
                  {rec.title}
                </Text>
                {rec.matchScore && (
                  <Text style={styles.recommendScore}>
                    {Math.round(rec.matchScore * 100)}% 匹配
                  </Text>
                )}
              </View>
              {rec.reason && (
                <Text style={styles.recommendReason}>
                  {rec.reason}
                </Text>
              )}
              {rec.missingIngredients?.length > 0 && (
                <Text style={styles.recommendMissing}>
                  缺: {rec.missingIngredients.join('、')}
                </Text>
              )}
              <View style={styles.recommendMetaRow}>
                {rec.difficulty && <Text style={styles.recommendMeta}>难度{rec.difficulty}⭐</Text>}
                {rec.cookTime && <Text style={styles.recommendMetaTime}>⏱ {rec.cookTime}分钟</Text>}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* 识别成功但无推荐 */}
      {recognizedItems.length > 0 &&
        recommendations.length === 0 &&
        !recognizing && (
          <View style={styles.emptySection}>
            <View style={styles.emptyCard}>
              <Text style={styles.emptyIcon}>🤔</Text>
              <Text style={styles.emptyTitle}>
                暂时没有找到匹配的菜谱
              </Text>
              <Text style={styles.emptyDesc}>
                识别出的食材组合暂无推荐{'\n'}
                你可以自己动手创建这道菜！
              </Text>
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() =>
                  router.push({
                    pathname: '/create-recipe',
                    params: {
                      ingredients: recognizedItems
                        .map((i: any) => i.name)
                        .join(','),
                    },
                  })
                }
              >
                <Text style={styles.emptyButtonText}>
                  ✏️ 创建这道菜
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  contentContainer: {
    paddingBottom: 90,
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  tabButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 9999,
    marginRight: 12,
  },
  tabButtonActive: {
    backgroundColor: '#f97316',
  },
  tabButtonInactive: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  tabButtonText: {
    fontSize: 14,
  },
  tabButtonTextActive: {
    color: '#fff',
  },
  tabButtonTextInactive: {
    color: '#1f2937',
  },
  imageSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  imageWrap: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 256,
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 9999,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholder: {
    width: '100%',
    height: 256,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#e5e7eb',
  },
  imagePlaceholderText: {
    color: '#9ca3af',
    marginTop: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 16,
  },
  albumButton: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#f97316',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  albumButtonText: {
    color: '#f97316',
    marginLeft: 8,
  },
  cameraButton: {
    flex: 1,
    backgroundColor: '#f97316',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  cameraButtonText: {
    color: '#fff',
    marginLeft: 8,
  },
  recognizing: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    alignItems: 'center',
  },
  recognizingText: {
    color: '#9ca3af',
    marginTop: 12,
  },
  resultSection: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
  },
  itemList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  itemChip: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemName: {
    color: '#1f2937',
    fontWeight: '500',
  },
  itemCategory: {
    color: '#9ca3af',
    fontSize: 12,
    marginLeft: 8,
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  recommendSection: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  recommendCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  recommendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recommendTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  recommendScore: {
    color: '#f97316',
    fontSize: 14,
  },
  recommendReason: {
    color: '#9ca3af',
    fontSize: 14,
    marginTop: 4,
  },
  recommendMissing: {
    color: '#f97316',
    fontSize: 12,
    marginTop: 8,
  },
  recommendMetaRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  recommendMeta: {
    fontSize: 12,
    color: '#9ca3af',
  },
  recommendMetaTime: {
    fontSize: 12,
    color: '#9ca3af',
    marginLeft: 12,
  },
  emptySection: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    alignItems: 'center',
  },
  emptyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 32,
    alignItems: 'center',
    width: '100%',
  },
  emptyIcon: {
    fontSize: 30,
    marginBottom: 8,
  },
  emptyTitle: {
    color: '#1f2937',
    fontWeight: '500',
    marginBottom: 4,
  },
  emptyDesc: {
    color: '#9ca3af',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  emptyButton: {
    backgroundColor: '#f97316',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 9999,
  },
  emptyButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
