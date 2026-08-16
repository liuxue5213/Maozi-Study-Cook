import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../stores/authStore';

/**
 * 偏好设置页面
 */
export default function SettingsScreen() {
  const { user } = useAuthStore();
  const [nickname, setNickname] = useState(user?.nickname || '');
  const [bio, setBio] = useState(user?.bio || '');

  const tasteOptions = ['清淡鲜美', '经典下饭', '咸甜交织', '无辣不欢', '酸甜开胃'];
  const [selectedTastes, setSelectedTastes] = useState<string[]>([]);

  const toggleTaste = (taste: string) => {
    setSelectedTastes((prev) =>
      prev.includes(taste)
        ? prev.filter((t) => t !== taste)
        : [...prev, taste]
    );
  };

  return (
    <View className="flex-1 bg-cooking-background">
      <View className="bg-white px-4 py-4 border-b border-gray-100">
        <Text className="text-xl font-bold text-cooking-text">偏好设置</Text>
      </View>

      <ScrollView className="flex-1 px-4 py-4">
        {/* 个人资料 */}
        <View className="bg-white rounded-xl p-4 mb-4">
          <Text className="text-base font-semibold text-cooking-text mb-3">
            个人资料
          </Text>
          <View className="mb-3">
            <Text className="text-cooking-muted text-sm mb-1">昵称</Text>
            <TextInput
              className="bg-gray-50 rounded-lg px-4 py-3 text-cooking-text"
              value={nickname}
              onChangeText={setNickname}
              placeholder="请输入昵称"
            />
          </View>
          <View>
            <Text className="text-cooking-muted text-sm mb-1">个人简介</Text>
            <TextInput
              className="bg-gray-50 rounded-lg px-4 py-3 text-cooking-text"
              value={bio}
              onChangeText={setBio}
              placeholder="介绍一下自己"
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

        {/* 口味偏好 */}
        <View className="bg-white rounded-xl p-4 mb-4">
          <Text className="text-base font-semibold text-cooking-text mb-3">
            口味偏好
          </Text>
          <View className="flex-row flex-wrap">
            {tasteOptions.map((taste) => (
              <TouchableOpacity
                key={taste}
                className={`px-4 py-2 rounded-full mr-2 mb-2 ${
                  selectedTastes.includes(taste)
                    ? 'bg-cooking-main'
                    : 'bg-gray-100'
                }`}
                onPress={() => toggleTaste(taste)}
              >
                <Text
                  className={`text-sm ${
                    selectedTastes.includes(taste)
                      ? 'text-white'
                      : 'text-cooking-text'
                  }`}
                >
                  {taste}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 饮食目标 */}
        <View className="bg-white rounded-xl p-4 mb-8">
          <Text className="text-base font-semibold text-cooking-text mb-3">
            饮食目标
          </Text>
          {['认真吃好每一顿', '轻盈减脂', '清淡养生', '高蛋白增肌'].map(
            (goal) => (
              <TouchableOpacity
                key={goal}
                className="flex-row items-center py-3 border-b border-gray-50"
              >
                <View className="w-5 h-5 rounded-full border-2 border-cooking-main items-center justify-center">
                  <View className="w-3 h-3 rounded-full bg-cooking-main" />
                </View>
                <Text className="text-cooking-text ml-3">{goal}</Text>
              </TouchableOpacity>
            )
          )}
        </View>

        <TouchableOpacity className="bg-cooking-main py-4 rounded-2xl items-center mb-8">
          <Text className="text-white text-lg font-semibold">保存设置</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
