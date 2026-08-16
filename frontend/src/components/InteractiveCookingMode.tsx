import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Platform,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * 交互式做菜模式
 *
 * 核心特性：
 * - 全屏沉浸式引导，一次只显示一个步骤
 * - 软件控制流程，用户点击"完成这一步"进入下一步
 * - 每步显示：序号 + 详细描述 + 本步所需食材(精确用量) + 计时器
 * - 顶部进度条 + 步骤指示器
 * - 完成后庆祝动画 + 记录制作次数
 */
export default function InteractiveCookingMode({
  visible,
  recipe,
  servings,
  baseServings,
  customWeight,
  calcMode,
  onClose,
  onComplete,
}: {
  visible: boolean;
  recipe: any;
  servings: number;
  baseServings: number;
  customWeight: string;
  calcMode: 'servings' | 'weight';
  onClose: () => void;
  onComplete: () => void;
}) {
  const insets = useSafeAreaInsets();
  const [currentStep, setCurrentStep] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const steps = recipe?.steps || [];
  const totalSteps = steps.length;
  const step = steps[currentStep];

  // 换算比例
  const getRatio = (): number => {
    if (calcMode === 'weight' && customWeight) {
      const mainIng = recipe?.ingredients?.filter((i: any) => i.isMain) || [];
      const anchor = mainIng[0];
      if (anchor) {
        const m = anchor.amount?.match(/^([\d.]+)/);
        if (m) {
          const anchorGrams = parseFloat(m[1]);
          return parseFloat(customWeight) / anchorGrams;
        }
      }
    }
    return servings / baseServings;
  };

  const ratio = getRatio();

  const scaleAmount = (amount: string): string => {
    if (!amount || amount === '适量' || amount === '少许') return amount;
    if (ratio === 1) return amount;
    const match = amount.match(/^([\d.]+)\s*(.*)$/);
    if (!match) return amount;
    const num = parseFloat(match[1]);
    const unit = match[2] || '';
    const scaled = num * ratio;
    const rounded = scaled >= 10 ? Math.round(scaled) : Math.round(scaled * 10) / 10;
    return `${rounded}${unit}`;
  };

  // 本步所需的食材（从描述中智能提取匹配的食材名）
  const getStepIngredients = useCallback(() => {
    if (!step || !recipe?.ingredients) return [];
    const desc = step.description || '';
    return recipe.ingredients
      .filter((ing: any) => {
        const name = ing.name;
        // 模糊匹配：描述中出现了食材名或其关键字
        if (desc.includes(name)) return true;
        // 2字以上食材，检查是否包含
        if (name.length >= 2 && desc.includes(name.slice(0, 2))) return true;
        return false;
      })
      .map((ing: any) => ({
        ...ing,
        scaledAmount: scaleAmount(ing.amount),
      }));
  }, [step, recipe, ratio]);

  // 重置状态
  useEffect(() => {
    if (visible) {
      setCurrentStep(0);
      setTimerSeconds(0);
      setTimerRunning(false);
      setIsCompleted(false);
      fadeAnim.setValue(0);
      slideAnim.setValue(0);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [visible]);

  // 步骤变化时重置计时器
  useEffect(() => {
    setTimerSeconds(0);
    setTimerRunning(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    // 入场动画
    slideAnim.setValue(30);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  }, [currentStep]);

  // 清理计时器
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // 计时器逻辑
  const toggleTimer = useCallback(() => {
    if (timerRunning) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setTimerRunning(false);
    } else {
      setTimerRunning(true);
      timerRef.current = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
  }, [timerRunning]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleNext = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setTimerRunning(false);

    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const handleRestart = () => {
    setCurrentStep(0);
    setTimerSeconds(0);
    setTimerRunning(false);
    setIsCompleted(false);
  };

  if (!visible || !step) return null;

  const progress = ((currentStep + 1) / totalSteps) * 100;
  const stepIngredients = getStepIngredients();
  const stepDuration = step.duration ? step.duration * 60 : 0;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-cooking-background" style={{ paddingTop: insets.top }}>
        {/* ===== 顶部导航 ===== */}
        <View className="flex-row items-center px-4 py-3 bg-white border-b border-gray-100">
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={26} color="#6b7280" />
          </TouchableOpacity>
          <Text className="ml-3 text-base font-bold text-cooking-text flex-1" numberOfLines={1}>
            {recipe.title}
          </Text>
          <Text className="text-cooking-muted text-sm">
            {servings || baseServings}人份
          </Text>
        </View>

        {/* ===== 完成庆祝 ===== */}
        {isCompleted ? (
          <View className="flex-1 items-center justify-center px-6">
            <Text className="text-6xl mb-4">🎉</Text>
            <Text className="text-2xl font-bold text-cooking-text mb-2">
              恭喜完成！
            </Text>
            <Text className="text-cooking-muted text-center mb-6">
              你成功做出了「{recipe.title}」{'\n'}
              味道一定很棒，记得拍照分享哦！
            </Text>
            <View className="flex-row">
              <TouchableOpacity
                className="bg-gray-100 px-6 py-3 rounded-full mr-4"
                onPress={handleRestart}
              >
                <Text className="text-cooking-text font-medium">再做一次</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-cooking-main px-8 py-3 rounded-full"
                onPress={onComplete}
              >
                <Text className="text-white font-semibold">完成打卡 ✓</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <>
            {/* ===== 进度条 ===== */}
            <View className="bg-white px-4 pb-3">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-cooking-muted text-xs">
                  步骤 {currentStep + 1} / {totalSteps}
                </Text>
                <Text className="text-cooking-main text-xs font-medium">
                  {Math.round(progress)}%
                </Text>
              </View>
              <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <View
                  className="h-full bg-cooking-main rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </View>
              {/* 步骤指示点 */}
              <View className="flex-row justify-between mt-2">
                {steps.map((_: any, i: number) => (
                  <View
                    key={i}
                    className={`w-2 h-2 rounded-full ${
                      i <= currentStep ? 'bg-cooking-main' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </View>
            </View>

            {/* ===== 步骤内容（可滚动） ===== */}
            <Animated.View
              className="flex-1"
              style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
            >
              <View className="flex-1 px-4 py-4">
                {/* 步骤序号 + 描述 */}
                <View className="bg-white rounded-2xl p-5 mb-4">
                  <View className="flex-row items-center mb-3">
                    <View className="w-12 h-12 bg-cooking-main rounded-full items-center justify-center">
                      <Text className="text-white text-xl font-bold">
                        {step.stepNumber}
                      </Text>
                    </View>
                    {step.duration && (
                      <View className="ml-3 bg-orange-50 px-3 py-1 rounded-full">
                        <Text className="text-cooking-main text-sm">
                          ⏱ 建议 {step.duration} 分钟
                        </Text>
                      </View>
                    )}
                  </View>

                  <Text className="text-lg text-cooking-text leading-7">
                    {step.description}
                  </Text>

                  {step.tips && (
                    <View className="bg-yellow-50 rounded-xl px-4 py-3 mt-3 flex-row items-start">
                      <Text className="text-lg">💡</Text>
                      <Text className="text-yellow-700 text-sm flex-1 ml-2 leading-5">
                        {step.tips}
                      </Text>
                    </View>
                  )}
                </View>

                {/* 本步所需食材（精确用量） */}
                {stepIngredients.length > 0 && (
                  <View className="bg-white rounded-2xl p-5 mb-4">
                    <Text className="text-sm font-bold text-cooking-text mb-3">
                      📋 本步所需食材
                    </Text>
                    {stepIngredients.map((ing: any, idx: number) => (
                      <View
                        key={idx}
                        className="flex-row items-center justify-between py-2 border-b border-gray-50"
                      >
                        <Text className="text-cooking-text">{ing.name}</Text>
                        <Text className="text-cooking-main font-bold">
                          {ing.scaledAmount}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* 计时器 */}
                <View className="bg-white rounded-2xl p-5 items-center">
                  <Text className="text-cooking-muted text-sm mb-2">
                    ⏱ 厨房计时器
                  </Text>
                  <Text className="text-4xl font-bold text-cooking-text font-mono mb-3">
                    {formatTime(timerSeconds)}
                  </Text>
                  <View className="flex-row items-center">
                    <TouchableOpacity
                      className={`px-6 py-2 rounded-full ${
                        timerRunning ? 'bg-red-500' : 'bg-cooking-main'
                      }`}
                      onPress={toggleTimer}
                    >
                      <Text className="text-white font-medium">
                        {timerRunning ? '⏸ 暂停' : timerSeconds > 0 ? '▶ 继续' : '▶ 开始'}
                      </Text>
                    </TouchableOpacity>
                    {timerSeconds > 0 && (
                      <TouchableOpacity
                        className="ml-3 px-4 py-2 rounded-full bg-gray-100"
                        onPress={() => {
                          setTimerSeconds(0);
                          setTimerRunning(false);
                          if (timerRef.current) clearInterval(timerRef.current);
                        }}
                      >
                        <Text className="text-cooking-muted">重置</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  {stepDuration > 0 && timerSeconds >= stepDuration && (
                    <Text className="text-green-600 font-bold mt-2">✅ 时间到！</Text>
                  )}
                </View>
              </View>
            </Animated.View>

            {/* ===== 底部操作按钮 ===== */}
            <View
              className="bg-white border-t border-gray-100 px-4 py-4 flex-row items-center"
              style={{ paddingBottom: Math.max(insets.bottom, 16) }}
            >
              {currentStep > 0 && (
                <TouchableOpacity
                  className="px-5 py-3 rounded-full bg-gray-100 mr-3"
                  onPress={() => {
                    if (timerRef.current) clearInterval(timerRef.current);
                    setTimerRunning(false);
                    setCurrentStep(currentStep - 1);
                  }}
                >
                  <Text className="text-cooking-text font-medium">← 上一步</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                className="flex-1 bg-cooking-main py-4 rounded-full items-center"
                onPress={handleNext}
              >
                <Text className="text-white text-lg font-semibold">
                  {currentStep === totalSteps - 1 ? '🎉 完成烹饪' : '✓ 完成这一步'}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </Modal>
  );
}
