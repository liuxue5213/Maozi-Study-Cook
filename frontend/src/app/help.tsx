import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * 帮助与反馈页面
 */
export default function HelpScreen() {
  const faqs = [
    { q: '如何创建菜谱？', a: '点击底部「拍照」识别食材，或手动填写菜谱信息创建。' },
    { q: '如何收藏菜谱？', a: '在菜谱详情页点击底部收藏按钮即可。' },
    { q: '如何记录打卡？', a: '在菜谱详情页点击「去做这道菜」，完成后点击「开始制作」。' },
    { q: '如何分享到交流圈？', a: '做完菜后可以拍照发布到交流圈，与厨友分享。' },
  ];

  return (
    <View className="flex-1 bg-cooking-background">
      <View className="bg-white px-4 py-4 border-b border-gray-100">
        <Text className="text-xl font-bold text-cooking-text">帮助与反馈</Text>
      </View>

      <ScrollView className="flex-1 px-4 py-4">
        <View className="bg-white rounded-xl p-4 mb-4">
          <Text className="text-base font-semibold text-cooking-text mb-3">
            常见问题
          </Text>
          {faqs.map((faq, idx) => (
            <View key={idx} className="mb-4">
              <Text className="text-cooking-text font-medium">{faq.q}</Text>
              <Text className="text-cooking-muted text-sm mt-1 leading-5">
                {faq.a}
              </Text>
            </View>
          ))}
        </View>

        <View className="bg-white rounded-xl p-4 mb-8">
          <Text className="text-base font-semibold text-cooking-text mb-3">
            联系我们
          </Text>
          <View className="flex-row items-center py-3">
            <Ionicons name="mail-outline" size={20} color="#f97316" />
            <Text className="text-cooking-text ml-3">support@maozicook.com</Text>
          </View>
          <View className="flex-row items-center py-3">
            <Ionicons name="logo-github" size={20} color="#f97316" />
            <Text className="text-cooking-text ml-3">github.com/maozi-study-cook</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
