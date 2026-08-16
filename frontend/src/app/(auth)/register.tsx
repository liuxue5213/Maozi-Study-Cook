import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../../stores/authStore';

export default function RegisterScreen() {
  const [form, setForm] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    nickname: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuthStore();

  const handleRegister = async () => {
    if (!form.username || !form.password) {
      Alert.alert('提示', '请填写必填项');
      return;
    }
    if (!form.email && !form.phone) {
      Alert.alert('提示', '邮箱或手机号至少填写一个');
      return;
    }
    if (form.password !== form.confirmPassword) {
      Alert.alert('提示', '两次密码不一致');
      return;
    }
    if (form.password.length < 6) {
      Alert.alert('提示', '密码长度不能少于6位');
      return;
    }

    setIsLoading(true);
    try {
      await register({
        username: form.username,
        email: form.email || undefined,
        phone: form.phone || undefined,
        password: form.password,
        nickname: form.nickname || form.username,
      });
      Alert.alert('成功', '注册成功', [
        { text: '确定', onPress: () => router.replace('/(tabs)/home') },
      ]);
    } catch (error: any) {
      Alert.alert('注册失败', error.message || '请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView className="flex-1 px-6 pt-16">
        <View className="items-center mb-8">
          <Text className="text-4xl mb-2">🥟</Text>
          <Text className="text-xl font-bold text-cooking-text">创建账号</Text>
          <Text className="text-cooking-muted mt-1">加入麦子学厨大家庭</Text>
        </View>

        <View className="space-y-4">
          <InputField
            label="用户名 *"
            placeholder="请输入用户名"
            value={form.username}
            onChangeText={(v) => setForm({ ...form, username: v })}
          />
          <InputField
            label="昵称"
            placeholder="请输入昵称"
            value={form.nickname}
            onChangeText={(v) => setForm({ ...form, nickname: v })}
          />
          <InputField
            label="邮箱"
            placeholder="请输入邮箱（选填）"
            value={form.email}
            onChangeText={(v) => setForm({ ...form, email: v })}
            keyboardType="email-address"
          />
          <InputField
            label="手机号"
            placeholder="请输入手机号（选填）"
            value={form.phone}
            onChangeText={(v) => setForm({ ...form, phone: v })}
            keyboardType="phone-pad"
          />
          <InputField
            label="密码 *"
            placeholder="请输入密码（至少6位）"
            value={form.password}
            onChangeText={(v) => setForm({ ...form, password: v })}
            secureTextEntry
          />
          <InputField
            label="确认密码 *"
            placeholder="请再次输入密码"
            value={form.confirmPassword}
            onChangeText={(v) => setForm({ ...form, confirmPassword: v })}
            secureTextEntry
          />
        </View>

        <TouchableOpacity
          className="w-full h-12 bg-cooking-main rounded-xl items-center justify-center mt-8"
          onPress={handleRegister}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-lg font-semibold">注册</Text>
          )}
        </TouchableOpacity>

        <View className="flex-row items-center justify-center mt-6 mb-8">
          <Text className="text-cooking-muted">已有账号？</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text className="text-cooking-main font-medium ml-1">去登录</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function InputField({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (v: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
}) {
  return (
    <View>
      <Text className="text-cooking-text mb-2 font-medium">{label}</Text>
      <TextInput
        className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-gray-50 text-base"
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize="none"
        autoCorrect={false}
      />
    </View>
  );
}
