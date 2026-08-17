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
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../../stores/authStore';

export default function LoginScreen() {
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { login } = useAuthStore();

  const handleLogin = async () => {
    setErrorMsg('');
    if (!account || !password) {
      setErrorMsg('请输入账号和密码');
      return;
    }

    setIsLoading(true);
    try {
      await login(account, password);
      router.replace('/(tabs)/home');
    } catch (error: any) {
      setErrorMsg(error.message || '登录失败，请检查账号密码');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Text style={styles.logoEmoji}>🥟</Text>
          <Text style={styles.logoTitle}>帽子学做饭</Text>
          <Text style={styles.logoSubtitle}>登录开始你的烹饪之旅</Text>
        </View>

        {/* 表单 */}
        <View style={styles.formContainer}>
          <View>
            <Text style={styles.label}>账号</Text>
            <TextInput
              style={styles.input}
              placeholder="用户名/邮箱/手机号"
              value={account}
              onChangeText={setAccount}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View>
            <Text style={styles.label}>密码</Text>
            <TextInput
              style={styles.input}
              placeholder="请输入密码"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity>
            <Text style={styles.forgotPassword}>忘记密码？</Text>
          </TouchableOpacity>
        </View>

        {/* 登录按钮 */}
        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.loginButtonText}>登录</Text>
          )}
        </TouchableOpacity>

        {/* 错误提示 */}
        {errorMsg ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        ) : null}

        {/* 注册入口 */}
        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>还没有账号？</Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
            <Text style={styles.registerLink}>立即注册</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  logoTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  logoSubtitle: {
    color: '#6b7280',
    fontSize: 14,
  },
  formContainer: {
    marginBottom: 16,
  },
  label: {
    color: '#1f2937',
    marginBottom: 8,
    fontWeight: '500',
    fontSize: 16,
  },
  input: {
    width: '100%',
    height: 48,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
    fontSize: 16,
    marginBottom: 16,
  },
  forgotPassword: {
    color: '#f97316',
    fontSize: 14,
    textAlign: 'right',
    marginTop: -8,
    marginBottom: 16,
  },
  loginButton: {
    width: '100%',
    height: 48,
    backgroundColor: '#f97316',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 16,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
  },
  registerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  registerText: {
    color: '#6b7280',
    fontSize: 14,
  },
  registerLink: {
    color: '#f97316',
    fontWeight: '500',
    marginLeft: 4,
  },
});
