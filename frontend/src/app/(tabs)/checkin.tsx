import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../../stores/authStore';
import { communityService } from '../../services/communityService';

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
      <View className="flex-1 items-center justify-center bg-cooking-background">
        <Text className="text-5xl mb-4">📅</Text>
        <Text className="text-lg text-cooking-text">登录查看打卡记录</Text>
        <TouchableOpacity
          className="bg-cooking-main px-8 py-3 rounded-xl mt-4"
          onPress={() => router.push('/(auth)/login')}
        >
          <Text className="text-white font-semibold">立即登录</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-cooking-background">
      <View className="bg-white px-4 py-4 border-b border-gray-100">
        <Text className="text-xl font-bold text-cooking-text">打卡日历</Text>
        <Text className="text-cooking-muted text-sm mt-1">
          连续打卡 {calendar?.streak || 0} 天 · 累计 {calendar?.totalDays || 0} 天
        </Text>
      </View>

      <ScrollView className="flex-1 px-4 py-4">
        {/* 统计卡片 */}
        <View className="bg-gradient-to-r from-orange-400 to-red-500 rounded-2xl p-5 mb-4">
          <Text className="text-white text-lg font-bold">🔥 连续打卡</Text>
          <Text className="text-white text-4xl font-bold mt-2">
            {calendar?.streak || 0} <Text className="text-lg">天</Text>
          </Text>
          <Text className="text-white/80 text-sm mt-2">
            继续保持，坚持就是胜利！
          </Text>
        </View>

        {/* 日历网格 */}
        <View className="bg-white rounded-xl p-4">
          <Text className="text-base font-semibold text-cooking-text mb-3">
            {new Date().getFullYear()}年{new Date().getMonth() + 1}月
          </Text>
          <View className="flex-row flex-wrap">
            {['日', '一', '二', '三', '四', '五', '六'].map((day) => (
              <View key={day} className="w-[14.28%] items-center py-2">
                <Text className="text-cooking-muted text-xs">{day}</Text>
              </View>
            ))}
            {calendar?.calendar?.map((day: any, idx: number) => (
              <View key={idx} className="w-[14.28%] items-center py-1">
                <View
                  className={`w-8 h-8 rounded-full items-center justify-center ${
                    day.checked ? 'bg-cooking-main' : 'bg-gray-50'
                  }`}
                >
                  <Text
                    className={`text-sm ${
                      day.checked ? 'text-white' : 'text-cooking-text'
                    }`}
                  >
                    {new Date(day.date).getDate()}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* 打卡提示 */}
        <View className="bg-white rounded-xl p-4 mt-4 mb-8">
          <Text className="text-base font-semibold text-cooking-text mb-2">
            💡 打卡小贴士
          </Text>
          <Text className="text-cooking-muted text-sm leading-5">
            · 每做完一道菜即可打卡{'\n'}
            · 连续打卡可获得成就徽章{'\n'}
            · 打卡后可以分享到交流圈
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
