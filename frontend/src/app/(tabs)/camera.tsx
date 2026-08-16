import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
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
      }
    } catch (error: any) {
      Alert.alert('识别失败', error.message || '请稍后重试');
    } finally {
      setRecognizing(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-cooking-background">
      {/* 识别类型选择 */}
      <View className="flex-row px-4 pt-4 pb-2">
        {[
          { key: 'ingredient', label: '识别食材' },
          { key: 'food', label: '识别菜品' },
          { key: 'fridge', label: '开冰箱' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            className={`px-4 py-2 rounded-full mr-3 ${
              activeTab === tab.key
                ? 'bg-cooking-main'
                : 'bg-white border border-gray-200'
            }`}
            onPress={() => setActiveTab(tab.key as any)}
          >
            <Text
              className={`text-sm ${
                activeTab === tab.key ? 'text-white' : 'text-cooking-text'
              }`}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 图片区域 */}
      <View className="px-4 py-4">
        {imageUri ? (
          <View className="rounded-xl overflow-hidden">
            <Image
              source={{ uri: imageUri }}
              className="w-full h-64"
              resizeMode="cover"
            />
            <TouchableOpacity
              className="absolute top-3 right-3 bg-black/50 rounded-full w-8 h-8 items-center justify-center"
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
          <View className="w-full h-64 bg-white rounded-xl items-center justify-center border-2 border-dashed border-gray-200">
            <Ionicons name="image-outline" size={48} color="#d1d5db" />
            <Text className="text-cooking-muted mt-2">选择或拍摄一张照片</Text>
          </View>
        )}

        {/* 操作按钮 */}
        <View className="flex-row mt-4 space-x-4">
          <TouchableOpacity
            className="flex-1 bg-white border border-cooking-main rounded-xl py-3 items-center flex-row justify-center"
            onPress={pickImage}
          >
            <Ionicons name="images-outline" size={20} color="#f97316" />
            <Text className="text-cooking-main ml-2">相册选择</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 bg-cooking-main rounded-xl py-3 items-center flex-row justify-center"
            onPress={takePhoto}
          >
            <Ionicons name="camera-outline" size={20} color="white" />
            <Text className="text-white ml-2">拍照</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 识别中 */}
      {recognizing && (
        <View className="px-4 py-6 items-center">
          <ActivityIndicator size="large" color="#f97316" />
          <Text className="text-cooking-muted mt-3">AI 识别中...</Text>
        </View>
      )}

      {/* 识别结果 */}
      {recognizedItems.length > 0 && !recognizing && (
        <View className="px-4 pb-4">
          <Text className="text-lg font-bold text-cooking-text mb-3">
            识别结果
          </Text>
          <View className="flex-row flex-wrap">
            {recognizedItems.map((item: any, idx: number) => (
              <View
                key={idx}
                className="bg-white rounded-lg px-3 py-2 mr-2 mb-2 flex-row items-center"
              >
                <Text className="text-cooking-text font-medium">{item.name}</Text>
                {item.category && (
                  <Text className="text-cooking-muted text-xs ml-2 bg-gray-100 px-2 py-0.5 rounded">
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
        <View className="px-4 pb-6">
          <Text className="text-lg font-bold text-cooking-text mb-3">
            🍳 可以做的菜
          </Text>
          {recommendations.map((rec: any, idx: number) => (
            <TouchableOpacity
              key={idx}
              className="bg-white rounded-xl p-4 mb-3 shadow-sm"
              onPress={() =>
                rec.recipeId && router.push(`/recipe/${rec.recipeId}`)
              }
            >
              <View className="flex-row items-center justify-between">
                <Text className="text-base font-semibold text-cooking-text">
                  {rec.title}
                </Text>
                {rec.matchScore && (
                  <Text className="text-cooking-main text-sm">
                    {Math.round(rec.matchScore * 100)}% 匹配
                  </Text>
                )}
              </View>
              {rec.reason && (
                <Text className="text-cooking-muted text-sm mt-1">
                  {rec.reason}
                </Text>
              )}
              {rec.missingIngredients?.length > 0 && (
                <Text className="text-orange-500 text-xs mt-2">
                  缺: {rec.missingIngredients.join('、')}
                </Text>
              )}
              <View className="flex-row mt-2 text-xs text-cooking-muted">
                {rec.difficulty && <Text>难度{rec.difficulty}⭐</Text>}
                {rec.cookTime && <Text className="ml-3">⏱ {rec.cookTime}分钟</Text>}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
