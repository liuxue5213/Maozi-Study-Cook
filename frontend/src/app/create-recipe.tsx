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
  StyleSheet,
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
    <View style={styles.container}>
      {/* 顶部导航 */}
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>
          创建菜品
        </Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* 基本信息 */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            📝 基本信息
          </Text>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>菜名 *</Text>
            <TextInput
              style={styles.input}
              placeholder="如：番茄炒蛋"
              value={title}
              onChangeText={setTitle}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>简介</Text>
            <TextInput
              style={styles.input}
              placeholder="简单描述这道菜..."
              value={description}
              onChangeText={setDescription}
              multiline
            />
          </View>

          <View style={styles.rowGroup}>
            <View style={styles.halfCol}>
              <Text style={styles.label}>难度</Text>
              <View style={styles.row}>
                {[1, 2, 3, 4, 5].map((d) => (
                  <TouchableOpacity
                    key={d}
                    onPress={() => setDifficulty(d)}
                    style={[
                      styles.starButton,
                      d <= difficulty ? styles.starActive : styles.starInactive,
                    ]}
                  >
                    <Text style={d <= difficulty ? styles.starTextActive : styles.starTextInactive}>
                      ⭐
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={styles.flexHalf}>
              <Text style={styles.label}>份量</Text>
              <TextInput
                style={styles.input}
                placeholder="2"
                value={servings}
                onChangeText={setServings}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.halfCol}>
              <Text style={styles.label}>备餐时间(分)</Text>
              <TextInput
                style={styles.input}
                placeholder="15"
                value={prepTime}
                onChangeText={setPrepTime}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.flexHalf}>
              <Text style={styles.label}>烹饪时间(分)</Text>
              <TextInput
                style={styles.input}
                placeholder="20"
                value={cookTime}
                onChangeText={setCookTime}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.fieldGroupTop}>
            <Text style={styles.label}>技巧贴士</Text>
            <TextInput
              style={styles.input}
              placeholder="分享你的烹饪小技巧..."
              value={tips}
              onChangeText={setTips}
              multiline
            />
          </View>
        </View>

        {/* 食材 */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            🥬 食材清单
          </Text>

          {ingredients.map((ing, idx) => (
            <View key={idx} style={styles.ingredientRow}>
              <TextInput
                style={styles.ingredientNameInput}
                placeholder="食材名"
                value={ing.name}
                onChangeText={(v) => updateIngredient(idx, 'name', v)}
              />
              <TextInput
                style={styles.ingredientAmountInput}
                placeholder="用量"
                value={ing.amount}
                onChangeText={(v) => updateIngredient(idx, 'amount', v)}
              />
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  ing.isMain ? styles.toggleMain : styles.toggleSub,
                ]}
                onPress={() => updateIngredient(idx, 'isMain', (!ing.isMain).toString())}
              >
                <Text style={[styles.toggleText, ing.isMain ? styles.toggleTextMain : styles.toggleTextMuted]}>
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

          <View style={styles.addRow}>
            <TouchableOpacity
              style={styles.addMainButton}
              onPress={() => addIngredient(true)}
            >
              <Text style={styles.addMainText}>+ 主料</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.addSubButton}
              onPress={() => addIngredient(false)}
            >
              <Text style={styles.addSubText}>+ 配料/调料</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 步骤 */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            👨‍🍳 烹饪步骤
          </Text>

          {steps.map((step, idx) => (
            <View key={idx} style={styles.stepItem}>
              <View style={styles.stepHeader}>
                <View style={styles.stepNumberBadge}>
                  <Text style={styles.stepNumberText}>{idx + 1}</Text>
                </View>
                <Text style={styles.stepLabel}>
                  步骤 {idx + 1}
                </Text>
                {steps.length > 1 && (
                  <TouchableOpacity onPress={() => removeStep(idx)} style={styles.mlAuto}>
                    <Ionicons name="close-circle" size={18} color="#ef4444" />
                  </TouchableOpacity>
                )}
              </View>
              <TextInput
                style={styles.stepInput}
                placeholder="描述这一步的操作..."
                value={step.description}
                onChangeText={(v) => updateStep(idx, 'description', v)}
                multiline
              />
              <View style={styles.row}>
                <TextInput
                  style={styles.stepHalfInputLeft}
                  placeholder="耗时(分)"
                  value={step.duration}
                  onChangeText={(v) => updateStep(idx, 'duration', v)}
                  keyboardType="numeric"
                />
                <TextInput
                  style={styles.stepHalfInputRight}
                  placeholder="小贴士"
                  value={step.tips}
                  onChangeText={(v) => updateStep(idx, 'tips', v)}
                />
              </View>
            </View>
          ))}

          <TouchableOpacity
            style={styles.addStepButton}
            onPress={addStep}
          >
            <Text style={styles.addSubText}>+ 添加步骤</Text>
          </TouchableOpacity>
        </View>

        {/* 提交按钮 */}
        <TouchableOpacity
          style={[styles.submitButton, isSubmitting ? styles.submitDisabled : styles.submitActive]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.submitText}>发布菜品</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  navBar: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  navTitle: {
    marginLeft: 12,
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
  },
  fieldGroup: {
    marginBottom: 12,
  },
  fieldGroupTop: {
    marginTop: 12,
  },
  label: {
    color: '#9ca3af',
    fontSize: 14,
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  rowGroup: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
  },
  halfCol: {
    flex: 1,
    marginRight: 12,
  },
  flexHalf: {
    flex: 1,
  },
  starButton: {
    width: 36,
    height: 36,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  starActive: {
    backgroundColor: '#f97316',
  },
  starInactive: {
    backgroundColor: '#f3f4f6',
  },
  starTextActive: {
    color: '#fff',
  },
  starTextInactive: {
    color: '#9ca3af',
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ingredientNameInput: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    marginRight: 8,
  },
  ingredientAmountInput: {
    width: 80,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    marginRight: 8,
  },
  toggleButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
  },
  toggleMain: {
    backgroundColor: '#ffedd5',
  },
  toggleSub: {
    backgroundColor: '#f3f4f6',
  },
  toggleText: {
    fontSize: 12,
  },
  toggleTextMain: {
    color: '#f97316',
  },
  toggleTextMuted: {
    color: '#9ca3af',
  },
  addRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  addMainButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#fff7ed',
    marginRight: 8,
  },
  addMainText: {
    color: '#f97316',
    fontSize: 14,
  },
  addSubButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f9fafb',
  },
  addSubText: {
    color: '#9ca3af',
    fontSize: 14,
  },
  stepItem: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f9fafb',
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepNumberBadge: {
    width: 28,
    height: 28,
    backgroundColor: '#f97316',
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  stepLabel: {
    color: '#1f2937',
    fontWeight: '500',
    marginLeft: 8,
  },
  mlAuto: {
    marginLeft: 'auto',
  },
  stepInput: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    marginBottom: 8,
  },
  stepHalfInputLeft: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    marginRight: 8,
  },
  stepHalfInputRight: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
  },
  addStepButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f9fafb',
    alignSelf: 'flex-start',
  },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 32,
  },
  submitActive: {
    backgroundColor: '#f97316',
  },
  submitDisabled: {
    backgroundColor: '#9ca3af',
  },
  submitText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
