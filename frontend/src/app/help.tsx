import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
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
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>帮助与反馈</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            常见问题
          </Text>
          {faqs.map((faq, idx) => (
            <View key={idx} style={styles.faqItem}>
              <Text style={styles.faqQuestion}>{faq.q}</Text>
              <Text style={styles.faqAnswer}>
                {faq.a}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.lastCard}>
          <Text style={styles.sectionTitle}>
            联系我们
          </Text>
          <View style={styles.contactRow}>
            <Ionicons name="mail-outline" size={20} color="#f97316" />
            <Text style={styles.contactText}>support@maozicook.com</Text>
          </View>
          <View style={styles.contactRow}>
            <Ionicons name="logo-github" size={20} color="#f97316" />
            <Text style={styles.contactText}>github.com/maozi-study-cook</Text>
          </View>
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
  header: {
    backgroundColor: '#fff',
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
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  lastCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  faqItem: {
    marginBottom: 16,
  },
  faqQuestion: {
    color: '#1f2937',
    fontWeight: '500',
  },
  faqAnswer: {
    color: '#9ca3af',
    fontSize: 14,
    marginTop: 4,
    lineHeight: 20,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  contactText: {
    color: '#1f2937',
    marginLeft: 12,
  },
});
