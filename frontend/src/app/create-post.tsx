import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Switch,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '../stores/authStore';
import { uploadService } from '../services/uploadService';
import { communityService } from '../services/communityService';
import { recipeService } from '../services/recipeService';

const MAX_IMAGES = 3;

/**
 * 发布动态页面
 * 从交流圈 FAB 进入，支持文字内容 + 最多 3 张配图、
 * 可选关联菜谱、打卡动态开关
 */
export default function CreatePostScreen() {
  const { isAuthenticated } = useAuthStore();
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [showRecipePicker, setShowRecipePicker] = useState(false);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [isLoadingRecipes, setIsLoadingRecipes] = useState(false);
  const [selectedRecipeId, setSelectedRecipeId] = useState<number | null>(null);
  const [isCheckin, setIsCheckin] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 从相册选择一张图片（最多 3 张）
  const pickImage = async () => {
    if (images.length >= MAX_IMAGES) {
      Alert.alert('提示', `最多只能添加 ${MAX_IMAGES} 张图片`);
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      setImages([...images, result.assets[0].uri]);
    }
  };

  // 移除已选图片
  const removeImage = (idx: number) => {
    setImages(images.filter((_, i) => i !== idx));
  };

  // 展开/收起菜谱选择，首次展开时加载菜谱列表
  const toggleRecipePicker = async () => {
    const next = !showRecipePicker;
    setShowRecipePicker(next);
    if (next && recipes.length === 0) {
      setIsLoadingRecipes(true);
      try {
        const res = await recipeService.getList({ pageSize: 50 });
        setRecipes(res.data?.list || []);
      } catch (error: any) {
        Alert.alert('提示', error.message || '菜谱加载失败，请稍后重试');
      } finally {
        setIsLoadingRecipes(false);
      }
    }
  };

  // 点选菜谱（再次点击同一项取消关联）
  const selectRecipe = (id: number) => {
    setSelectedRecipeId(selectedRecipeId === id ? null : id);
  };

  const selectedRecipe = recipes.find((r) => r.id === selectedRecipeId);

  // 发布：先逐张上传图片拿相对路径，再创建帖子
  const handleSubmit = async () => {
    if (!isAuthenticated) {
      router.push('/(auth)/login');
      return;
    }

    if (!content.trim() && images.length === 0) {
      Alert.alert('提示', '请输入内容或至少添加一张图片');
      return;
    }

    setIsSubmitting(true);
    try {
      // 逐张上传，收集服务器相对路径
      const uploadedImages: string[] = [];
      for (const uri of images) {
        const url = await uploadService.uploadImage(uri);
        uploadedImages.push(url);
      }

      await communityService.createPost({
        content: content.trim(),
        images: uploadedImages.length > 0 ? uploadedImages : undefined,
        recipeId: selectedRecipeId ?? undefined,
        isCheckin,
      });

      Alert.alert('发布成功', '你的动态已发布', [
        { text: '确定', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert('发布失败', error.message || '请稍后重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      {/* 内容输入 */}
      <View style={styles.card}>
        <TextInput
          style={styles.contentInput}
          placeholder="分享你的烹饪心得…"
          placeholderTextColor="#9ca3af"
          value={content}
          onChangeText={setContent}
          multiline
          textAlignVertical="top"
        />
      </View>

      {/* 添加图片 */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>添加图片</Text>
        <View style={styles.imageRow}>
          {images.map((uri, idx) => (
            <View key={`${uri}-${idx}`} style={styles.imageWrap}>
              <Image source={{ uri }} style={styles.imageThumb} />
              <TouchableOpacity
                style={styles.imageRemove}
                onPress={() => removeImage(idx)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close" size={12} color="#fff" />
              </TouchableOpacity>
            </View>
          ))}
          {images.length < MAX_IMAGES && (
            <TouchableOpacity style={styles.imageAdd} onPress={pickImage}>
              <Ionicons name="camera-outline" size={22} color="#9ca3af" />
              <Text style={styles.imageAddText}>
                {images.length}/{MAX_IMAGES}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* 关联菜谱 */}
      <View style={styles.card}>
        <TouchableOpacity
          style={styles.recipeButton}
          onPress={toggleRecipePicker}
          activeOpacity={0.7}
        >
          <Ionicons name="restaurant-outline" size={18} color="#f97316" />
          <Text style={styles.recipeButtonText}>关联菜谱</Text>
          {selectedRecipe ? (
            <Text style={styles.recipeSelectedText} numberOfLines={1}>
              {selectedRecipe.title}
            </Text>
          ) : (
            <Text style={styles.recipeHintText}>可选</Text>
          )}
          <Ionicons
            name={showRecipePicker ? 'chevron-up' : 'chevron-down'}
            size={18}
            color="#9ca3af"
          />
        </TouchableOpacity>

        {showRecipePicker && (
          <View style={styles.recipeList}>
            {isLoadingRecipes ? (
              <ActivityIndicator color="#f97316" style={styles.recipeLoading} />
            ) : recipes.length === 0 ? (
              <Text style={styles.recipeEmptyText}>暂无可关联的菜谱</Text>
            ) : (
              recipes.map((r) => {
                const selected = r.id === selectedRecipeId;
                return (
                  <TouchableOpacity
                    key={r.id}
                    style={[
                      styles.recipeItem,
                      selected && styles.recipeItemSelected,
                    ]}
                    onPress={() => selectRecipe(r.id)}
                  >
                    <Text
                      style={[
                        styles.recipeItemText,
                        selected && styles.recipeItemTextSelected,
                      ]}
                      numberOfLines={1}
                    >
                      {r.title}
                    </Text>
                    {selected && (
                      <Ionicons name="checkmark" size={16} color="#f97316" />
                    )}
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        )}
      </View>

      {/* 打卡动态开关 */}
      <View style={styles.card}>
        <View style={styles.switchRow}>
          <View style={styles.switchLabelWrap}>
            <Text style={styles.switchLabel}>打卡动态</Text>
            <Text style={styles.switchHint}>开启后将同时记录为今日打卡</Text>
          </View>
          <Switch
            value={isCheckin}
            onValueChange={setIsCheckin}
            trackColor={{ false: '#e5e7eb', true: '#fdba74' }}
            thumbColor={isCheckin ? '#f97316' : '#fff'}
          />
        </View>
      </View>

      {/* 发布按钮 */}
      <TouchableOpacity
        style={[styles.submitButton, isSubmitting && styles.submitDisabled]}
        onPress={handleSubmit}
        disabled={isSubmitting}
        activeOpacity={0.8}
      >
        {isSubmitting ? (
          <View style={styles.submitRow}>
            <ActivityIndicator size="small" color="#fff" />
            <Text style={[styles.submitText, styles.submitLoadingText]}>
              发布中…
            </Text>
          </View>
        ) : (
          <Text style={styles.submitText}>发布</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  contentInput: {
    minHeight: 120,
    fontSize: 16,
    lineHeight: 22,
    color: '#1f2937',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  imageRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  imageWrap: {
    width: 64,
    height: 64,
    marginRight: 10,
    marginBottom: 10,
  },
  imageThumb: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  imageRemove: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 18,
    height: 18,
    borderRadius: 9999,
    backgroundColor: 'rgba(31, 41, 55, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageAdd: {
    width: 64,
    height: 64,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageAddText: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  recipeButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recipeButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 6,
  },
  recipeSelectedText: {
    flex: 1,
    marginLeft: 8,
    marginRight: 8,
    fontSize: 14,
    color: '#f97316',
  },
  recipeHintText: {
    flex: 1,
    marginLeft: 8,
    marginRight: 8,
    fontSize: 13,
    color: '#9ca3af',
  },
  recipeList: {
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  recipeLoading: {
    paddingVertical: 16,
  },
  recipeEmptyText: {
    paddingVertical: 12,
    textAlign: 'center',
    fontSize: 14,
    color: '#9ca3af',
  },
  recipeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
    marginBottom: 4,
  },
  recipeItemSelected: {
    borderColor: '#f97316',
    backgroundColor: '#fff7ed',
  },
  recipeItemText: {
    flex: 1,
    fontSize: 14,
    color: '#1f2937',
    marginRight: 8,
  },
  recipeItemTextSelected: {
    color: '#f97316',
    fontWeight: '600',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchLabelWrap: {
    flex: 1,
    marginRight: 16,
  },
  switchLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
  },
  switchHint: {
    fontSize: 13,
    color: '#9ca3af',
    marginTop: 2,
  },
  submitButton: {
    backgroundColor: '#f97316',
    borderRadius: 20,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  submitDisabled: {
    backgroundColor: '#fdba74',
  },
  submitRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  submitText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  submitLoadingText: {
    marginLeft: 8,
  },
});
