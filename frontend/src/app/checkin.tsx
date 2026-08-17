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
import { useAuthStore } from '../stores/authStore';
import { communityService } from '../services/communityService';

/**
 * 打卡日历页面
 */
export default function CheckinScreen() {
  const { isAuthenticated } = useAuthStore();
  const [calendar, setCalendar] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCalendar();
  }, []);

  const loadCalendar = async () => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }
    try {
      const now = new Date();
      const res = await communityService.getCheckInCalendar(
        now.getFullYear(),
        now.getMonth() + 1
      );
      setCalendar(res.data);
    } catch (error) {
      console.error('加载打卡日历失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.loginPromptContainer}>
        <Text style={styles.loginPromptEmoji}>📅</Text>
        <Text style={styles.loginPromptTitle}>登录查看打卡记录</Text>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => router.push('/(auth)/login')}
        >
          <Text style={styles.loginButtonText}>立即登录</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>打卡日历</Text>
        <Text style={styles.headerSubtitle}>
          连续打卡 {calendar?.streak || 0} 天 · 累计 {calendar?.totalDays || 0} 天
        </Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* 统计卡片 */}
        <View style={styles.streakCard}>
          <Text style={styles.streakCardTitle}>🔥 连续打卡</Text>
          <Text style={styles.streakCardValue}>
            {calendar?.streak || 0} <Text style={styles.streakCardUnit}>天</Text>
          </Text>
          <Text style={styles.streakCardTip}>
            继续保持，坚持就是胜利！
          </Text>
        </View>

        {/* 日历网格 */}
        <View style={styles.calendarCard}>
          <Text style={styles.calendarTitle}>
            {new Date().getFullYear()}年{new Date().getMonth() + 1}月
          </Text>
          <View style={styles.calendarGrid}>
            {['日', '一', '二', '三', '四', '五', '六'].map((day) => (
              <View key={day} style={styles.weekdayCell}>
                <Text style={styles.weekdayText}>{day}</Text>
              </View>
            ))}
            {calendar?.calendar?.map((day: any, idx: number) => (
              <View key={idx} style={styles.dayCell}>
                <View
                  style={[
                    styles.dayCircle,
                    day.checked ? styles.dayCircleChecked : styles.dayCircleUnchecked,
                  ]}
                >
                  <Text
                    style={[
                      styles.dayText,
                      day.checked ? styles.dayTextChecked : styles.dayTextUnchecked,
                    ]}
                  >
                    {new Date(day.date).getDate()}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* 打卡提示 */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>
            💡 打卡小贴士
          </Text>
          <Text style={styles.tipsContent}>
            · 每做完一道菜即可打卡{'\n'}
            · 连续打卡可获得成就徽章{'\n'}
            · 打卡后可以分享到交流圈
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  loginPromptContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fafafa',
  },
  loginPromptEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  loginPromptTitle: {
    fontSize: 18,
    color: '#1f2937',
  },
  loginButton: {
    backgroundColor: '#f97316',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 16,
  },
  loginButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
  },
  headerSubtitle: {
    color: '#9ca3af',
    fontSize: 14,
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  streakCard: {
    // 原为 orange-400 → red-500 渐变，RN 无渐变支持，取两色中间值近似
    backgroundColor: '#f56b40',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  streakCardTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  streakCardValue: {
    color: '#fff',
    fontSize: 36,
    fontWeight: '700',
    marginTop: 8,
  },
  streakCardUnit: {
    fontSize: 18,
  },
  streakCardTip: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginTop: 8,
  },
  calendarCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
  },
  calendarTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  weekdayCell: {
    width: '14.28%',
    alignItems: 'center',
    paddingVertical: 8,
  },
  weekdayText: {
    color: '#9ca3af',
    fontSize: 12,
  },
  dayCell: {
    width: '14.28%',
    alignItems: 'center',
    paddingVertical: 4,
  },
  dayCircle: {
    width: 32,
    height: 32,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircleChecked: {
    backgroundColor: '#f97316',
  },
  dayCircleUnchecked: {
    backgroundColor: '#f9fafb',
  },
  dayText: {
    fontSize: 14,
  },
  dayTextChecked: {
    color: '#fff',
  },
  dayTextUnchecked: {
    color: '#1f2937',
  },
  tipsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    marginBottom: 32,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  tipsContent: {
    color: '#9ca3af',
    fontSize: 14,
    lineHeight: 20,
  },
});
