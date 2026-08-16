import React from 'react';
import { View, Text, ScrollView } from 'react-native';

/**
 * 关于我们页面
 */
export default function AboutScreen() {
  return (
    <View className="flex-1 bg-cooking-background">
      <View className="bg-white px-4 py-4 border-b border-gray-100">
        <Text className="text-xl font-bold text-cooking-text">关于我们</Text>
      </View>

      <ScrollView className="flex-1 px-4 py-4">
        <View className="bg-white rounded-xl p-6 items-center mb-4">
          <Text className="text-6xl mb-4">🥟</Text>
          <Text className="text-2xl font-bold text-cooking-text">帽子学做饭</Text>
          <Text className="text-cooking-muted text-sm mt-1">版本 1.0.0</Text>
        </View>

        <View className="bg-white rounded-xl p-4 mb-4">
          <Text className="text-base font-semibold text-cooking-text mb-3">
            项目介绍
          </Text>
          <Text className="text-cooking-muted text-sm leading-6">
            帽子学做饭是一个集烹饪学习、智能推荐、社交分享于一体的综合性平台。
            我们收录了国内外数百种菜系的经典菜谱，通过AI技术帮助用户识别食材、
            推荐菜谱，让每个人都能轻松学会做饭。
          </Text>
        </View>

        <View className="bg-white rounded-xl p-4 mb-4">
          <Text className="text-base font-semibold text-cooking-text mb-3">
            核心功能
          </Text>
          <Text className="text-cooking-muted text-sm leading-6">
            · 397+ 道经典菜谱，覆盖国内外菜系{'\n'}
            · AI 拍照识别食材，智能推荐菜谱{'\n'}
            · 分步烹饪指引，厨房计时器{'\n'}
            · 社区交流圈，分享烹饪成果{'\n'}
            · 打卡记录，养成烹饪好习惯
          </Text>
        </View>

        <View className="bg-white rounded-xl p-4 mb-8">
          <Text className="text-base font-semibold text-cooking-text mb-3">
            技术栈
          </Text>
          <Text className="text-cooking-muted text-sm leading-6">
            前端: React Native + Expo + TypeScript{'\n'}
            后端: NestJS + Prisma + MySQL{'\n'}
            AI: 通义千问视觉识别
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
