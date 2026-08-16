import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { recipeService } from '../services/recipeService';
import { useAuthStore } from '../stores/authStore';

/**
 * 自建菜品页面
 * 用户可手动创建菜谱并保存到数据库
 * 支持从拍照识别传入食材自动填充
 */
export default function CreateRecipeScreen() {
  const { isAuthenticated } = useAuthStore();
  const params = useLocalSearchParams<{ ingredients?: string }>();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState(1);
  const [prepTime, setPrepTime] = useState('');
  const [cookTime, setCookTime] = useState('');
  const [servings, setServings] = useState('2');
  const [tips, setTips] = useState('');

  // 食材列表（从拍照识别自动填充）
  const [ingredients, setIngredients] = useState<{ name: string; amount: string; isMain: boolean }[]>([]);

  // 步骤列表
  const [steps, setSteps] = useState([{ description: '', duration: '', tips: '' }]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // 从拍照识别传入的食材自动填充
  useEffect(() => {
    if (params.ingredients) {
      const items = params.ingredients.split(',').filter(Boolean);
      setIngredients(items.map((name) => ({ name: name.trim(), amount: '', isMain: true })));
    } else {
      setIngredients([{ name: '', amount: '', isMain: true }]);
    }
  }, [params.ingredients]);

  // 添加食材
  const addIngredient = (isMain: boolean) => {
    setIngredients([...ingredients, { name: '', amount: '', isMain }]);
  };

  // 删除食材
  const removeIngredient = (idx: number) => {
    if (ingredients.length <= 1) return;
    setIngredients(ingredients.filter((_, i) => i !== idx));
  };

  // 更新食材
  const updateIngredient = (idx: number, field: string, value: string) => {
    const next = [...ingredients];
    next[idx] = { ...next[idx], [field]: value };
    setIngredients(next);
  };

  // 添加步骤
  const addStep = () => {
    setSteps([...steps, { description: '', duration: '', tips: '' }]);
  };

  // 删除步骤
  const removeStep = (idx: number) => {
    if (steps.length <= 1) return;
    setSteps(steps.filter((_, i) => i !== idx));
  };

  // 更新步骤
  const updateStep = (idx: number, field: string, value: string) => {
    const next = [...steps];
    next[idx] = { ...next[idx], [field]: value };
    setSteps(next);
  };

  // 提交
  const handleSubmit = async () => {
    if (!isAuthenticated) {
      router.push('/(auth)/login');
      return;
    }

    // 验证
    if (!title.trim()) {
      Alert.alert('提示', '请输入菜名');
      return;
    }
    const validIngredients = ingredients.filter((i) => i.name.trim());
    if (validIngredients.length === 0) {
      Alert.alert('提示', '请至少添加一种食材');
      return;
    }
    const validSteps = steps.filter((s) => s.description.trim());
    if (validSteps.length === 0) {
      Alert.alert('提示', '请至少添加一个步骤');
      return;
    }

    setIsSubmitting(true);
    try {
      await recipeService.create({
        title: title.trim(),
        description: description.trim(),
        difficulty,
        prepTime: prepTime ? parseInt(prepTime) : undefined,
        cookTime: cookTime ? parseInt(cookTime) : undefined,
        servings: servings ? parseInt(servings) : 2,
        tips: tips.trim(),
        ingredients: validIngredients.map((i) => ({
          name: i.name.trim(),
          amount: i.amount.trim() || '适量',
          isMain: i.isMain,
        })),
        steps: validSteps.map((s, idx) => ({
          stepNumber: idx + 1,
          description: s.description.trim(),
          duration: s.duration ? parseInt(s.duration) : undefined,
          tips: s.tips?.trim() || undefined,
        })),
      });

      Alert.alert('🎉 创建成功', '你的菜谱已保存到数据库', [
        { text: '确定', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert('创建失败', error.message || '请稍后重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-cooking-background">
      {/* 顶部导航 */}
      <View className="bg-white px-4 py-3 flex-row items-center border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text className="ml-3 text-lg font-bold text-cooking-text">
          创建菜品
        </Text>
      </View>

      <ScrollView className="flex-1 px-4 py-4">
        {/* 基本信息 */}
        <View className="bg-white rounded-2xl p-4 mb-4">
          <Text className="text-base font-bold text-cooking-text mb-3">
            📝 基本信息
          </Text>

          <View className="mb-3">
            <Text className="text-cooking-muted text-sm mb-1">菜名 *</Text>
            <TextInput
              className="bg-gray-50 rounded-xl px-4 py-3 text-base"
              placeholder="如：番茄炒蛋"
              value={title}
              onChangeText={setTitle}
            />
          </View>

          <View className="mb-3">
            <Text className="text-cooking-muted text-sm mb-1">简介</Text>
            <TextInput
              className="bg-gray-50 rounded-xl px-4 py-3 text-base"
              placeholder="简单描述这道菜..."
              value={description}
              onChangeText={setDescription}
              multiline
            />
          </View>

          <View className="flex-row mb-3">
            <View className="flex-1 mr-3">
              <Text className="text-cooking-muted text-sm mb-1">难度</Text>
              <View className="flex-row">
                {[1, 2, 3, 4, 5].map((d) => (
                  <TouchableOpacity
                    key={d}
                    onPress={() => setDifficulty(d)}
                    className={`w-9 h-9 rounded-full items-center justify-center mr-2 ${
                      d <= difficulty ? 'bg-cooking-main' : 'bg-gray-100'
                    }`}
                  >
                    <Text className={d <= difficulty ? 'text-white' : 'text-cooking-muted'}>
                      ⭐
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View className="flex-1">
              <Text className="text-cooking-muted text-sm mb-1">份量</Text>
              <TextInput
                className="bg-gray-50 rounded-xl px-4 py-3 text-base"
                placeholder="2"
                value={servings}
                onChangeText={setServings}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View className="flex-row">
            <View className="flex-1 mr-3">
              <Text className="text-cooking-muted text-sm mb-1">备餐时间(分)</Text>
              <TextInput
                className="bg-gray-50 rounded-xl px-4 py-3 text-base"
                placeholder="15"
                value={prepTime}
                onChangeText={setPrepTime}
                keyboardType="numeric"
              />
            </View>
            <View className="flex-1">
              <Text className="text-cooking-muted text-sm mb-1">烹饪时间(分)</Text>
              <TextInput
                className="bg-gray-50 rounded-xl px-4 py-3 text-base"
                placeholder="20"
                value={cookTime}
                onChangeText={setCookTime}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View className="mt-3">
            <Text className="text-cooking-muted text-sm mb-1">技巧贴士</Text>
            <TextInput
              className="bg-gray-50 rounded-xl px-4 py-3 text-base"
              placeholder="分享你的烹饪小技巧..."
              value={tips}
              onChangeText={setTips}
              multiline
            />
          </View>
        </View>

        {/* 食材 */}
        <View className="bg-white rounded-2xl p-4 mb-4">
          <Text className="text-base font-bold text-cooking-text mb-3">
            🥬 食材清单
          </Text>

          {ingredients.map((ing, idx) => (
            <View key={idx} className="flex-row items-center mb-2">
              <TextInput
                className="flex-1 bg-gray-50 rounded-lg px-3 py-2 text-sm mr-2"
                placeholder="食材名"
                value={ing.name}
                onChangeText={(v) => updateIngredient(idx, 'name', v)}
              />
              <TextInput
                className="w-20 bg-gray-50 rounded-lg px-3 py-2 text-sm mr-2"
                placeholder="用量"
                value={ing.amount}
                onChangeText={(v) => updateIngredient(idx, 'amount', v)}
              />
              <TouchableOpacity
                className={`px-2 py-1 rounded mr-2 ${ing.isMain ? 'bg-orange-100' : 'bg-gray-100'}`}
                onPress={() => updateIngredient(idx, 'isMain', (!ing.isMain).toString())}
              >
                <Text className={`text-xs ${ing.isMain ? 'text-cooking-main' : 'text-cooking-muted'}`}>
                  {ing.isMain ? '主料' : '配料'}
                </Text>
              </TouchableOpacity>
              {ingredients.length > 1 && (
                <TouchableOpacity onPress={() => removeIngredient(idx)}>
                  <Ionicons name="close-circle" size={20} color="#ef4444" />
                </TouchableOpacity>
              )}
            </View>
          ))}

          <View className="flex-row mt-2">
            <TouchableOpacity
              className="px-3 py-2 rounded-lg bg-orange-50 mr-2"
              onPress={() => addIngredient(true)}
            >
              <Text className="text-cooking-main text-sm">+ 主料</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="px-3 py-2 rounded-lg bg-gray-50"
              onPress={() => addIngredient(false)}
            >
              <Text className="text-cooking-muted text-sm">+ 配料/调料</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 步骤 */}
        <View className="bg-white rounded-2xl p-4 mb-4">
          <Text className="text-base font-bold text-cooking-text mb-3">
            👨‍🍳 烹饪步骤
          </Text>

          {steps.map((step, idx) => (
            <View key={idx} className="mb-3 pb-3 border-b border-gray-50">
              <View className="flex-row items-center mb-2">
                <View className="w-7 h-7 bg-cooking-main rounded-full items-center justify-center">
                  <Text className="text-white text-sm font-bold">{idx + 1}</Text>
                </View>
                <Text className="text-cooking-text font-medium ml-2">
                  步骤 {idx + 1}
                </Text>
                {steps.length > 1 && (
                  <TouchableOpacity onPress={() => removeStep(idx)} className="ml-auto">
                    <Ionicons name="close-circle" size={18} color="#ef4444" />
                  </TouchableOpacity>
                )}
              </View>
              <TextInput
                className="bg-gray-50 rounded-lg px-3 py-2 text-sm mb-2"
                placeholder="描述这一步的操作..."
                value={step.description}
                onChangeText={(v) => updateStep(idx, 'description', v)}
                multiline
              />
              <View className="flex-row">
                <TextInput
                  className="flex-1 bg-gray-50 rounded-lg px-3 py-2 text-sm mr-2"
                  placeholder="耗时(分)"
                  value={step.duration}
                  onChangeText={(v) => updateStep(idx, 'duration', v)}
                  keyboardType="numeric"
                />
                <TextInput
                  className="flex-1 bg-gray-50 rounded-lg px-3 py-2 text-sm"
                  placeholder="小贴士"
                  value={step.tips}
                  onChangeText={(v) => updateStep(idx, 'tips', v)}
                />
              </View>
            </View>
          ))}

          <TouchableOpacity
            className="px-3 py-2 rounded-lg bg-gray-50 self-start"
            onPress={addStep}
          >
            <Text className="text-cooking-muted text-sm">+ 添加步骤</Text>
          </TouchableOpacity>
        </View>

        {/* 提交按钮 */}
        <TouchableOpacity
          className={`py-4 rounded-2xl items-center mb-8 ${
            isSubmitting ? 'bg-gray-400' : 'bg-cooking-main'
          }`}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-lg font-semibold">发布菜品</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
