import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Platform,
  ActivityIndicator,
  Animated,
  StyleSheet,
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
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* ===== 顶部导航 ===== */}
        <View style={styles.navBar}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={26} color="#6b7280" />
          </TouchableOpacity>
          <Text style={styles.navTitle} numberOfLines={1}>
            {recipe.title}
          </Text>
          <Text style={styles.navServings}>
            {servings || baseServings}人份
          </Text>
        </View>

        {/* ===== 完成庆祝 ===== */}
        {isCompleted ? (
          <View style={styles.completedContainer}>
            <Text style={styles.completedEmoji}>🎉</Text>
            <Text style={styles.completedTitle}>
              恭喜完成！
            </Text>
            <Text style={styles.completedText}>
              你成功做出了「{recipe.title}」{'\n'}
              味道一定很棒，记得拍照分享哦！
            </Text>
            <View style={styles.completedButtons}>
              <TouchableOpacity
                style={styles.restartButton}
                onPress={handleRestart}
              >
                <Text style={styles.restartText}>再做一次</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.completeButton}
                onPress={onComplete}
              >
                <Text style={styles.completeButtonText}>完成打卡 ✓</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <>
            {/* ===== 进度条 ===== */}
            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>
                  步骤 {currentStep + 1} / {totalSteps}
                </Text>
                <Text style={styles.progressPercent}>
                  {Math.round(progress)}%
                </Text>
              </View>
              <View style={styles.progressTrack}>
                <View
                  style={[styles.progressBar, { width: `${progress}%` }]}
                />
              </View>
              {/* 步骤指示点 */}
              <View style={styles.dotsRow}>
                {steps.map((_: any, i: number) => (
                  <View
                    key={i}
                    style={[
                      styles.dot,
                      i <= currentStep ? styles.dotActive : styles.dotInactive,
                    ]}
                  />
                ))}
              </View>
            </View>

            {/* ===== 步骤内容（可滚动） ===== */}
            <Animated.View
              style={[
                styles.animatedContainer,
                { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
              ]}
            >
              <View style={styles.stepContent}>
                {/* 步骤序号 + 描述 */}
                <View style={styles.card}>
                  <View style={styles.cardHeader}>
                    <View style={styles.stepNumberBadge}>
                      <Text style={styles.stepNumberText}>
                        {step.stepNumber}
                      </Text>
                    </View>
                    {step.duration && (
                      <View style={styles.durationChip}>
                        <Text style={styles.durationText}>
                          ⏱ 建议 {step.duration} 分钟
                        </Text>
                      </View>
                    )}
                  </View>

                  <Text style={styles.stepDescription}>
                    {step.description}
                  </Text>

                  {step.tips && (
                    <View style={styles.tipsContainer}>
                      <Text style={styles.tipsEmoji}>💡</Text>
                      <Text style={styles.tipsText}>
                        {step.tips}
                      </Text>
                    </View>
                  )}
                </View>

                {/* 本步所需食材（精确用量） */}
                {stepIngredients.length > 0 && (
                  <View style={styles.card}>
                    <Text style={styles.ingCardTitle}>
                      📋 本步所需食材
                    </Text>
                    {stepIngredients.map((ing: any, idx: number) => (
                      <View
                        key={idx}
                        style={styles.ingRow}
                      >
                        <Text style={styles.ingName}>{ing.name}</Text>
                        <Text style={styles.ingAmount}>
                          {ing.scaledAmount}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* 计时器 */}
                <View style={styles.timerCard}>
                  <Text style={styles.timerLabel}>
                    ⏱ 厨房计时器
                  </Text>
                  <Text style={styles.timerText}>
                    {formatTime(timerSeconds)}
                  </Text>
                  <View style={styles.timerButtons}>
                    <TouchableOpacity
                      style={[
                        styles.timerButton,
                        timerRunning ? styles.timerButtonRunning : styles.timerButtonNormal,
                      ]}
                      onPress={toggleTimer}
                    >
                      <Text style={styles.timerButtonText}>
                        {timerRunning ? '⏸ 暂停' : timerSeconds > 0 ? '▶ 继续' : '▶ 开始'}
                      </Text>
                    </TouchableOpacity>
                    {timerSeconds > 0 && (
                      <TouchableOpacity
                        style={styles.resetButton}
                        onPress={() => {
                          setTimerSeconds(0);
                          setTimerRunning(false);
                          if (timerRef.current) clearInterval(timerRef.current);
                        }}
                      >
                        <Text style={styles.resetText}>重置</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  {stepDuration > 0 && timerSeconds >= stepDuration && (
                    <Text style={styles.timerDoneText}>✅ 时间到！</Text>
                  )}
                </View>
              </View>
            </Animated.View>

            {/* ===== 底部操作按钮 ===== */}
            <View
              style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}
            >
              {currentStep > 0 && (
                <TouchableOpacity
                  style={styles.prevButton}
                  onPress={() => {
                    if (timerRef.current) clearInterval(timerRef.current);
                    setTimerRunning(false);
                    setCurrentStep(currentStep - 1);
                  }}
                >
                  <Text style={styles.prevButtonText}>← 上一步</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.nextButton}
                onPress={handleNext}
              >
                <Text style={styles.nextButtonText}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  navTitle: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    flex: 1,
  },
  navServings: {
    color: '#9ca3af',
    fontSize: 14,
  },
  completedContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  completedEmoji: {
    fontSize: 60,
    marginBottom: 16,
  },
  completedTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  completedText: {
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 24,
  },
  completedButtons: {
    flexDirection: 'row',
  },
  restartButton: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 9999,
    marginRight: 16,
  },
  restartText: {
    color: '#1f2937',
    fontWeight: '500',
  },
  completeButton: {
    backgroundColor: '#f97316',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 9999,
  },
  completeButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  progressSection: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    color: '#9ca3af',
    fontSize: 12,
  },
  progressPercent: {
    color: '#f97316',
    fontSize: 12,
    fontWeight: '500',
  },
  progressTrack: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 9999,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#f97316',
    borderRadius: 9999,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 9999,
  },
  dotActive: {
    backgroundColor: '#f97316',
  },
  dotInactive: {
    backgroundColor: '#d1d5db',
  },
  animatedContainer: {
    flex: 1,
  },
  stepContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepNumberBadge: {
    width: 48,
    height: 48,
    backgroundColor: '#f97316',
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  durationChip: {
    marginLeft: 12,
    backgroundColor: '#fff7ed',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  durationText: {
    color: '#f97316',
    fontSize: 14,
  },
  stepDescription: {
    fontSize: 18,
    color: '#1f2937',
    lineHeight: 28,
  },
  tipsContainer: {
    backgroundColor: '#fefce8',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tipsEmoji: {
    fontSize: 18,
  },
  tipsText: {
    color: '#a16207',
    fontSize: 14,
    flex: 1,
    marginLeft: 8,
    lineHeight: 20,
  },
  ingCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
  },
  ingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f9fafb',
  },
  ingName: {
    color: '#1f2937',
  },
  ingAmount: {
    color: '#f97316',
    fontWeight: '700',
  },
  timerCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  timerLabel: {
    color: '#9ca3af',
    fontSize: 14,
    marginBottom: 8,
  },
  timerText: {
    fontSize: 36,
    fontWeight: '700',
    color: '#1f2937',
    fontFamily: 'monospace',
    marginBottom: 12,
  },
  timerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timerButton: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 9999,
  },
  timerButtonRunning: {
    backgroundColor: '#ef4444',
  },
  timerButtonNormal: {
    backgroundColor: '#f97316',
  },
  timerButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  resetButton: {
    marginLeft: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 9999,
    backgroundColor: '#f3f4f6',
  },
  resetText: {
    color: '#9ca3af',
  },
  timerDoneText: {
    color: '#16a34a',
    fontWeight: '700',
    marginTop: 8,
  },
  bottomBar: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  prevButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 9999,
    backgroundColor: '#f3f4f6',
    marginRight: 12,
  },
  prevButtonText: {
    color: '#1f2937',
    fontWeight: '500',
  },
  nextButton: {
    flex: 1,
    backgroundColor: '#f97316',
    paddingVertical: 16,
    borderRadius: 9999,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
