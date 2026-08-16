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

export default function LoginScreen() {
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuthStore();

  const handleLogin = async () => {
    if (!account || !password) {
      Alert.alert('提示', '请输入账号和密码');
      return;
    }

    setIsLoading(true);
    try {
      await login(account, password);
      router.replace('/(tabs)/home');
    } catch (error: any) {
      Alert.alert('登录失败', error.message || '请检查账号密码');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        className="flex-1 px-6 pt-20"
        contentContainerStyle={{ flexGrow: 1 }}
      >
        {/* Logo */}
        <View className="items-center mb-10">
          <Text className="text-5xl mb-2">🥟</Text>
          <Text className="text-2xl font-bold text-cooking-text">帽子学做饭</Text>
          <Text className="text-cooking-muted mt-1">登录开始你的烹饪之旅</Text>
        </View>

        {/* 表单 */}
        <View className="space-y-4">
          <View>
            <Text className="text-cooking-text mb-2 font-medium">账号</Text>
            <TextInput
              className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-gray-50 text-base"
              placeholder="用户名/邮箱/手机号"
              value={account}
              onChangeText={setAccount}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View>
            <Text className="text-cooking-text mb-2 font-medium">密码</Text>
            <TextInput
              className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-gray-50 text-base"
              placeholder="请输入密码"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity className="items-end">
            <Text className="text-cooking-main">忘记密码？</Text>
          </TouchableOpacity>
        </View>

        {/* 登录按钮 */}
        <TouchableOpacity
          className="w-full h-12 bg-cooking-main rounded-xl items-center justify-center mt-8"
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-lg font-semibold">登录</Text>
          )}
        </TouchableOpacity>

        {/* 注册入口 */}
        <View className="flex-row items-center justify-center mt-6">
          <Text className="text-cooking-muted">还没有账号？</Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
            <Text className="text-cooking-main font-medium ml-1">立即注册</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
