import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../stores/authStore';

/**
 * 个人中心页面
 */
export default function ProfileScreen() {
  const { user, isAuthenticated, logout } = useAuthStore();
  // 两次点击确认退出（不依赖系统弹窗，Web/内嵌浏览器中 Alert 回调不可用）
  const [confirmingLogout, setConfirmingLogout] = useState(false);

  const handleLogout = async () => {
    if (!confirmingLogout) {
      // 第一次点击：进入确认状态，3 秒后自动恢复
      setConfirmingLogout(true);
      setTimeout(() => setConfirmingLogout(false), 3000);
      return;
    }
    setConfirmingLogout(false);
    await logout();
    router.replace('/(auth)/login');
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.loginPromptContainer}>
        <Text style={styles.loginPromptEmoji}>🥟</Text>
        <Text style={styles.loginPromptTitle}>登录解锁更多功能</Text>
        <Text style={styles.loginPromptSubtitle}>
          收藏菜谱、发布作品、记录打卡
        </Text>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => router.push('/(auth)/login')}
        >
          <Text style={styles.loginButtonText}>立即登录</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {/* 用户信息卡片 */}
      <View style={styles.userCard}>
        <View style={styles.userRow}>
          <View style={styles.avatarWrap}>
            <Text style={styles.avatarEmoji}>
              {user?.avatar ? '👤' : '👨‍🍳'}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userNickname}>
              {user?.nickname || user?.username}
            </Text>
            <Text style={styles.userBio}>
              {user?.bio || '这个人很懒，什么都没写~'}
            </Text>
          </View>
        </View>

        {/* 数据统计 */}
        <View style={styles.statRow}>
          <StatItem label="作品" value="0" />
          <StatItem label="收藏" value="0" />
          <StatItem label="连续打卡" value="0天" />
          <StatItem label="粉丝" value="0" />
        </View>
      </View>

      {/* 功能列表 */}
      <View style={styles.menuGroup}>
        <MenuItem
          icon="restaurant-outline"
          label="我的菜谱"
          onPress={() => router.push('/my-recipes')}
        />
        <MenuItem
          icon="heart-outline"
          label="我的收藏"
          onPress={() => router.push('/favorites')}
        />
        <MenuItem
          icon="calendar-outline"
          label="打卡日历"
          onPress={() => router.push('/checkin')}
        />
        <MenuItem
          icon="people-outline"
          label="我的关注"
          onPress={() => {}}
        />
      </View>

      <View style={styles.menuGroup}>
        <MenuItem
          icon="settings-outline"
          label="偏好设置"
          onPress={() => router.push('/settings')}
        />
        <MenuItem
          icon="help-circle-outline"
          label="帮助与反馈"
          onPress={() => router.push('/help')}
        />
        <MenuItem
          icon="information-circle-outline"
          label="关于我们"
          onPress={() => router.push('/about')}
        />
      </View>

      {/* 退出登录 */}
      <TouchableOpacity
        style={[
          styles.logoutButton,
          confirmingLogout ? styles.logoutButtonConfirming : styles.logoutButtonNormal,
        ]}
        onPress={handleLogout}
      >
        <Text
          style={[
            styles.logoutText,
            confirmingLogout ? styles.logoutTextConfirming : styles.logoutTextNormal,
          ]}
        >
          {confirmingLogout ? '再点一次确认退出' : '退出登录'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function MenuItem({
  icon,
  label,
  onPress,
}: {
  icon: string;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <Ionicons name={icon as any} size={22} color="#6b7280" />
      <Text style={styles.menuItemLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color="#d1d5db" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  contentContainer: {
    paddingBottom: 90,
  },
  loginPromptContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fafafa',
  },
  loginPromptEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  loginPromptTitle: {
    fontSize: 18,
    color: '#1f2937',
    marginBottom: 8,
  },
  loginPromptSubtitle: {
    color: '#9ca3af',
    marginBottom: 24,
  },
  loginButton: {
    backgroundColor: '#f97316',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
  },
  loginButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  userCard: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrap: {
    width: 64,
    height: 64,
    backgroundColor: 'rgba(249, 115, 22, 0.1)',
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: {
    fontSize: 30,
  },
  userInfo: {
    marginLeft: 16,
  },
  userNickname: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
  },
  userBio: {
    color: '#9ca3af',
    fontSize: 14,
    marginTop: 4,
  },
  statRow: {
    flexDirection: 'row',
    marginTop: 24,
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  statLabel: {
    color: '#9ca3af',
    fontSize: 12,
    marginTop: 4,
  },
  menuGroup: {
    marginTop: 8,
    backgroundColor: '#ffffff',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f9fafb',
  },
  menuItemLabel: {
    flex: 1,
    marginLeft: 12,
    color: '#1f2937',
  },
  logoutButton: {
    marginTop: 8,
    marginBottom: 32,
    paddingHorizontal: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  logoutButtonConfirming: {
    backgroundColor: '#ef4444',
  },
  logoutButtonNormal: {
    backgroundColor: '#ffffff',
  },
  logoutText: {
    fontWeight: '500',
  },
  logoutTextConfirming: {
    color: '#fff',
  },
  logoutTextNormal: {
    color: '#ef4444',
  },
});
