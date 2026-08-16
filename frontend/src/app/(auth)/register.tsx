import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
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
  // 页内错误提示（不用 Alert：Web/内嵌浏览器中 window.alert 常被拦截）
  const [errorMsg, setErrorMsg] = useState('');
  const { register } = useAuthStore();

  const handleRegister = async () => {
    setErrorMsg('');
    if (!form.username || !form.password) {
      setErrorMsg('请填写用户名和密码');
      return;
    }
    if (!form.email && !form.phone) {
      setErrorMsg('邮箱或手机号至少填写一个');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setErrorMsg('两次输入的密码不一致');
      return;
    }
    if (form.password.length < 6) {
      setErrorMsg('密码长度不能少于6位');
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
      // 注册成功直接进入首页
      router.replace('/(tabs)/home');
    } catch (error: any) {
      setErrorMsg(error.message || '注册失败，请稍后重试');
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
          <Text className="text-cooking-muted mt-1">加入帽子学做饭大家庭</Text>
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

        {/* 错误提示 */}
        {errorMsg ? (
          <View className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mt-4">
            <Text className="text-red-500 text-sm">{errorMsg}</Text>
          </View>
        ) : null}

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
