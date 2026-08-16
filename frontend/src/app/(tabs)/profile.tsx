import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../stores/authStore';

/**
 * 个人中心页面
 */
export default function ProfileScreen() {
  const { user, isAuthenticated, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert('确认退出', '确定要退出登录吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '确定',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  if (!isAuthenticated) {
    return (
      <View className="flex-1 items-center justify-center bg-cooking-background">
        <Text className="text-5xl mb-4">🥟</Text>
        <Text className="text-lg text-cooking-text mb-2">登录解锁更多功能</Text>
        <Text className="text-cooking-muted mb-6">
          收藏菜谱、发布作品、记录打卡
        </Text>
        <TouchableOpacity
          className="bg-cooking-main px-8 py-3 rounded-xl"
          onPress={() => router.push('/(auth)/login')}
        >
          <Text className="text-white font-semibold">立即登录</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-cooking-background">
      {/* 用户信息卡片 */}
      <View className="bg-white px-4 py-6">
        <View className="flex-row items-center">
          <View className="w-16 h-16 bg-cooking-main/10 rounded-full items-center justify-center">
            <Text className="text-3xl">
              {user?.avatar ? '👤' : '👨‍🍳'}
            </Text>
          </View>
          <View className="ml-4">
            <Text className="text-xl font-bold text-cooking-text">
              {user?.nickname || user?.username}
            </Text>
            <Text className="text-cooking-muted text-sm mt-1">
              {user?.bio || '这个人很懒，什么都没写~'}
            </Text>
          </View>
        </View>

        {/* 数据统计 */}
        <View className="flex-row mt-6 justify-around">
          <StatItem label="作品" value="0" />
          <StatItem label="收藏" value="0" />
          <StatItem label="连续打卡" value="0天" />
          <StatItem label="粉丝" value="0" />
        </View>
      </View>

      {/* 功能列表 */}
      <View className="mt-2 bg-white">
        <MenuItem
          icon="restaurant-outline"
          label="我的菜谱"
          onPress={() => {}}
        />
        <MenuItem
          icon="heart-outline"
          label="我的收藏"
          onPress={() => {}}
        />
        <MenuItem
          icon="calendar-outline"
          label="打卡日历"
          onPress={() => {}}
        />
        <MenuItem
          icon="people-outline"
          label="我的关注"
          onPress={() => {}}
        />
      </View>

      <View className="mt-2 bg-white">
        <MenuItem
          icon="settings-outline"
          label="偏好设置"
          onPress={() => {}}
        />
        <MenuItem
          icon="help-circle-outline"
          label="帮助与反馈"
          onPress={() => {}}
        />
        <MenuItem
          icon="information-circle-outline"
          label="关于我们"
          onPress={() => {}}
        />
      </View>

      {/* 退出登录 */}
      <TouchableOpacity
        className="bg-white mt-2 mb-8 px-4 py-4 items-center"
        onPress={handleLogout}
      >
        <Text className="text-red-500 font-medium">退出登录</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <View className="items-center">
      <Text className="text-lg font-bold text-cooking-text">{value}</Text>
      <Text className="text-cooking-muted text-xs mt-1">{label}</Text>
    </View>
  );
}

function MenuItem({
  icon,
  label,
  onPress,
}: {
  icon: string;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      className="flex-row items-center px-4 py-4 border-b border-gray-50"
      onPress={onPress}
    >
      <Ionicons name={icon as any} size={22} color="#6b7280" />
      <Text className="flex-1 ml-3 text-cooking-text">{label}</Text>
      <Ionicons name="chevron-forward" size={18} color="#d1d5db" />
    </TouchableOpacity>
  );
}
