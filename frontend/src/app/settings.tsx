import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../stores/authStore';

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
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>偏好设置</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* 个人资料 */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            个人资料
          </Text>
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>昵称</Text>
            <TextInput
              style={styles.input}
              value={nickname}
              onChangeText={setNickname}
              placeholder="请输入昵称"
            />
          </View>
          <View>
            <Text style={styles.label}>个人简介</Text>
            <TextInput
              style={styles.input}
              value={bio}
              onChangeText={setBio}
              placeholder="介绍一下自己"
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

        {/* 口味偏好 */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            口味偏好
          </Text>
          <View style={styles.tagWrap}>
            {tasteOptions.map((taste) => (
              <TouchableOpacity
                key={taste}
                style={[
                  styles.tag,
                  selectedTastes.includes(taste)
                    ? styles.tagActive
                    : styles.tagInactive,
                ]}
                onPress={() => toggleTaste(taste)}
              >
                <Text
                  style={[
                    styles.tagText,
                    selectedTastes.includes(taste)
                      ? styles.tagTextActive
                      : styles.tagTextInactive,
                  ]}
                >
                  {taste}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 饮食目标 */}
        <View style={styles.lastCard}>
          <Text style={styles.sectionTitle}>
            饮食目标
          </Text>
          {['认真吃好每一顿', '轻盈减脂', '清淡养生', '高蛋白增肌'].map(
            (goal) => (
              <TouchableOpacity
                key={goal}
                style={styles.goalRow}
              >
                <View style={styles.radioOuter}>
                  <View style={styles.radioInner} />
                </View>
                <Text style={styles.goalText}>{goal}</Text>
              </TouchableOpacity>
            )
          )}
        </View>

        <TouchableOpacity style={styles.saveButton}>
          <Text style={styles.saveButtonText}>保存设置</Text>
        </TouchableOpacity>
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
  fieldGroup: {
    marginBottom: 12,
  },
  label: {
    color: '#9ca3af',
    fontSize: 14,
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#1f2937',
  },
  tagWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 9999,
    marginRight: 8,
    marginBottom: 8,
  },
  tagActive: {
    backgroundColor: '#f97316',
  },
  tagInactive: {
    backgroundColor: '#f3f4f6',
  },
  tagText: {
    fontSize: 14,
  },
  tagTextActive: {
    color: '#fff',
  },
  tagTextInactive: {
    color: '#1f2937',
  },
  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f9fafb',
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 9999,
    borderWidth: 2,
    borderColor: '#f97316',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 9999,
    backgroundColor: '#f97316',
  },
  goalText: {
    color: '#1f2937',
    marginLeft: 12,
  },
  saveButton: {
    backgroundColor: '#f97316',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 32,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
