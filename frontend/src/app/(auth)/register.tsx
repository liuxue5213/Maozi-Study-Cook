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
  const [errorMsg, setErrorMsg] = useState('');
  const { register } = useAuthStore();

  const handleRegister = async () => {
    setErrorMsg('');
    if (!form.username || !form.password) {
      setErrorMsg('请填写用户名和密码');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setErrorMsg('两次输入的密码不一致');
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
      router.replace('/(tabs)/home');
    } catch (error: any) {
      setErrorMsg(error.message || '注册失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoEmoji}>🥟</Text>
          <Text style={styles.logoTitle}>创建账号</Text>
          <Text style={styles.logoSubtitle}>加入帽子学做饭大家庭</Text>
        </View>

        <View style={styles.formContainer}>
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
          style={styles.registerButton}
          onPress={handleRegister}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.registerButtonText}>注册</Text>
          )}
        </TouchableOpacity>

        {errorMsg ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        ) : null}

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>已有账号？</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.loginLink}>去登录</Text>
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
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        style={styles.input}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 64,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoEmoji: {
    fontSize: 36,
    marginBottom: 8,
  },
  logoTitle: {
    fontSize: 20,
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
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
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
  },
  registerButton: {
    width: '100%',
    height: 48,
    backgroundColor: '#f97316',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
  },
  registerButtonText: {
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
  loginContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 32,
  },
  loginText: {
    color: '#6b7280',
    fontSize: 14,
  },
  loginLink: {
    color: '#f97316',
    fontWeight: '500',
    marginLeft: 4,
  },
});
