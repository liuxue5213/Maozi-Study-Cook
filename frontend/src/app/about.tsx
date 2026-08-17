import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

/**
 * 关于我们页面
 */
export default function AboutScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>关于我们</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.heroCard}>
          <Text style={styles.heroEmoji}>🥟</Text>
          <Text style={styles.appName}>帽子学做饭</Text>
          <Text style={styles.version}>版本 1.0.0</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            项目介绍
          </Text>
          <Text style={styles.bodyText}>
            帽子学做饭是一个集烹饪学习、智能推荐、社交分享于一体的综合性平台。
            我们收录了国内外数百种菜系的经典菜谱，通过AI技术帮助用户识别食材、
            推荐菜谱，让每个人都能轻松学会做饭。
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            核心功能
          </Text>
          <Text style={styles.bodyText}>
            · 397+ 道经典菜谱，覆盖国内外菜系{'\n'}
            · AI 拍照识别食材，智能推荐菜谱{'\n'}
            · 分步烹饪指引，厨房计时器{'\n'}
            · 社区交流圈，分享烹饪成果{'\n'}
            · 打卡记录，养成烹饪好习惯
          </Text>
        </View>

        <View style={styles.lastCard}>
          <Text style={styles.sectionTitle}>
            技术栈
          </Text>
          <Text style={styles.bodyText}>
            前端: React Native + Expo + TypeScript{'\n'}
            后端: NestJS + Prisma + MySQL{'\n'}
            AI: 通义千问视觉识别
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
  heroCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  heroEmoji: {
    fontSize: 60,
    marginBottom: 16,
  },
  appName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
  },
  version: {
    color: '#9ca3af',
    fontSize: 14,
    marginTop: 4,
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
  bodyText: {
    color: '#9ca3af',
    fontSize: 14,
    lineHeight: 24,
  },
});
