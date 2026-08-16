import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../stores/authStore';
import { communityService } from '../../services/communityService';

/**
 * 交流圈页面
 */
export default function CommunityScreen() {
  const { user, isAuthenticated } = useAuthStore();
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async (pageNum = 1, refresh = false) => {
    try {
      const res = await communityService.getPosts({
        page: pageNum,
        pageSize: 20,
        sortBy: 'hot',
      });
      const newPosts = res.data?.list || [];

      if (refresh || pageNum === 1) {
        setPosts(newPosts);
      } else {
        setPosts((prev) => [...prev, ...newPosts]);
      }

      setHasMore(newPosts.length === 20);
      setPage(pageNum);
    } catch (error) {
      console.error('加载帖子失败:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadPosts(1, true);
  }, []);

  const loadMore = () => {
    if (!isLoading && hasMore) {
      loadPosts(page + 1);
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-cooking-background">
      {/* 顶部 Tab */}
      <View className="flex-row px-4 pt-3 pb-2 bg-white border-b border-gray-100">
        {['推荐', '最新', '关注'].map((tab, idx) => (
          <TouchableOpacity
            key={tab}
            className={`px-4 py-2 mr-4 ${idx === 0 ? 'border-b-2 border-cooking-main' : ''}`}
          >
            <Text
              className={`text-sm ${
                idx === 0
                  ? 'text-cooking-main font-semibold'
                  : 'text-cooking-muted'
              }`}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={posts}
        keyExtractor={(item: any) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        renderItem={({ item }: { item: any }) => <PostCard post={item} />}
        ListEmptyComponent={
          <View className="py-20 items-center">
            <Text className="text-cooking-muted">暂无动态</Text>
          </View>
        }
        ListFooterComponent={
          hasMore ? (
            <View className="py-4 items-center">
              <ActivityIndicator size="small" color="#f97316" />
            </View>
          ) : null
        }
      />

      {/* 发布按钮 */}
      {isAuthenticated && (
        <TouchableOpacity
          className="absolute bottom-6 right-5 w-14 h-14 bg-cooking-main rounded-full items-center justify-center shadow-lg"
          onPress={() => router.push('/(tabs)/camera')}
        >
          <Ionicons name="add" size={28} color="white" />
        </TouchableOpacity>
      )}
    </View>
  );
}

/**
 * 帖子卡片组件
 */
function PostCard({ post }: { post: any }) {
  const handleLike = async () => {
    try {
      await communityService.likePost(post.id);
      // 乐观更新
    } catch (error) {
      console.error('点赞失败:', error);
    }
  };

  return (
    <TouchableOpacity
      className="bg-white px-4 py-4 mb-2"
      onPress={() => router.push(`/post/${post.id}`)}
    >
      {/* 用户信息 */}
      <View className="flex-row items-center mb-3">
        <View className="w-10 h-10 bg-cooking-main/10 rounded-full items-center justify-center">
          <Text className="text-lg">
            {post.user?.avatar ? '👤' : '👨‍🍳'}
          </Text>
        </View>
        <View className="ml-3">
          <Text className="text-cooking-text font-medium">
            {post.user?.nickname || '匿名用户'}
          </Text>
          <Text className="text-cooking-muted text-xs">
            {new Date(post.createdAt).toLocaleDateString()}
          </Text>
        </View>
        {post.isCheckin && (
          <View className="ml-auto bg-cooking-secondary/10 px-2 py-1 rounded">
            <Text className="text-cooking-secondary text-xs">打卡</Text>
          </View>
        )}
      </View>

      {/* 内容 */}
      <Text className="text-cooking-text leading-5 mb-3">{post.content}</Text>

      {/* 图片 */}
      {post.images?.length > 0 && (
        <View className="flex-row flex-wrap mb-3">
          {post.images.slice(0, 3).map((img: any, idx: number) => (
            <View
              key={idx}
              className={`w-[32%] h-24 bg-gray-100 rounded-lg mr-[2%] ${
                idx === 2 ? 'mr-0' : ''
              }`}
            >
              <View className="w-full h-full items-center justify-center">
                <Text className="text-2xl">🍲</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* 关联菜谱 */}
      {post.recipe && (
        <View className="bg-gray-50 rounded-lg px-3 py-2 mb-3 flex-row items-center">
          <Text className="text-cooking-muted text-sm">关联菜谱：</Text>
          <Text className="text-cooking-main text-sm ml-1">
            {post.recipe.title}
          </Text>
        </View>
      )}

      {/* 互动栏 */}
      <View className="flex-row items-center justify-around pt-2 border-t border-gray-50">
        <TouchableOpacity
          className="flex-row items-center"
          onPress={handleLike}
        >
          <Ionicons
            name={post.isLiked ? 'heart' : 'heart-outline'}
            size={18}
            color={post.isLiked ? '#ef4444' : '#9ca3af'}
          />
          <Text className="text-cooking-muted text-xs ml-1">
            {post.likeCount || 0}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity className="flex-row items-center">
          <Ionicons name="chatbubble-outline" size={18} color="#9ca3af" />
          <Text className="text-cooking-muted text-xs ml-1">
            {post.commentCount || 0}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity className="flex-row items-center">
          <Ionicons name="share-outline" size={18} color="#9ca3af" />
          <Text className="text-cooking-muted text-xs ml-1">分享</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}
