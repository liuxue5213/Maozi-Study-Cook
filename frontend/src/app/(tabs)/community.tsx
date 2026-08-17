import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Image,
  Share,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../stores/authStore';
import { communityService } from '../../services/communityService';
import { getImageUrl } from '../../utils/imageUtils';

/**
 * 交流圈页面
 */
export default function CommunityScreen() {
  const { isAuthenticated } = useAuthStore();
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  // tab: hot=推荐 new=最新 follow=关注
  const [activeTab, setActiveTab] = useState<'hot' | 'new' | 'follow'>('hot');

  useEffect(() => {
    loadPosts(1, true);
  }, [activeTab]);

  const loadPosts = async (pageNum = 1, refresh = false) => {
    try {
      const res = await communityService.getPosts({
        page: pageNum,
        pageSize: 20,
        sortBy: activeTab === 'new' ? 'new' : 'hot',
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
  }, [activeTab]);

  // 点赞后乐观更新列表中对应帖子
  const handleLikeUpdate = (postId: number, isLiked: boolean) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              isLiked,
              likeCount: Math.max(
                0,
                (p.likeCount || 0) + (isLiked ? 1 : -1)
              ),
            }
          : p
      )
    );
  };

  const loadMore = () => {
    if (!isLoading && hasMore) {
      loadPosts(page + 1);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 顶部 Tab */}
      <View style={styles.tabBar}>
        {(
          [
            { key: 'hot', label: '推荐' },
            { key: 'new', label: '最新' },
            { key: 'follow', label: '关注' },
          ] as const
        ).map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tabItem,
              activeTab === tab.key ? styles.tabItemActive : null,
            ]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text
              style={[
                styles.tabLabel,
                activeTab === tab.key
                  ? styles.tabLabelActive
                  : styles.tabLabelInactive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        style={styles.list}
        contentContainerStyle={styles.listContent}
        data={posts}
        keyExtractor={(item: any) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        renderItem={({ item }: { item: any }) => (
          <PostCard post={item} onLike={handleLikeUpdate} />
        )}
        ListEmptyComponent={
          <View style={styles.emptyComponent}>
            <Text style={styles.emptyText}>暂无动态</Text>
          </View>
        }
        ListFooterComponent={
          hasMore ? (
            <View style={styles.footerComponent}>
              <ActivityIndicator size="small" color="#f97316" />
            </View>
          ) : null
        }
      />

      {/* 发布按钮 */}
      {isAuthenticated && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push('/create-post')}
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
function PostCard({
  post,
  onLike,
}: {
  post: any;
  onLike?: (postId: number, isLiked: boolean) => void;
}) {
  const handleLike = async () => {
    try {
      const res = await communityService.likePost(post.id);
      // 乐观更新
      onLike?.(post.id, !!res.data?.isLiked);
    } catch (error) {
      console.error('点赞失败:', error);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({ message: post.content || '' });
    } catch (error) {
      console.error('分享失败:', error);
    }
  };

  return (
    <TouchableOpacity
      style={styles.postCard}
      onPress={() => router.push(`/post/${post.id}`)}
    >
      {/* 用户信息 */}
      <View style={styles.postUserRow}>
        <View style={styles.postAvatar}>
          <Text style={styles.postAvatarText}>
            {post.user?.avatar ? '👤' : '👨‍🍳'}
          </Text>
        </View>
        <View style={styles.postUserMeta}>
          <Text style={styles.postNickname}>
            {post.user?.nickname || '匿名用户'}
          </Text>
          <Text style={styles.postDate}>
            {new Date(post.createdAt).toLocaleDateString()}
          </Text>
        </View>
        {post.isCheckin && (
          <View style={styles.checkinBadge}>
            <Text style={styles.checkinBadgeText}>打卡</Text>
          </View>
        )}
      </View>

      {/* 内容 */}
      <Text style={styles.postContent}>{post.content}</Text>

      {/* 图片（九宫格，最多 9 张） */}
      {post.images?.length > 0 && (
        <View style={styles.postImages}>
          {post.images.slice(0, 9).map((img: any, idx: number) => (
            <Image
              key={idx}
              source={{ uri: getImageUrl(img.imageUrl) }}
              style={[
                styles.postImage,
                idx % 3 === 2 ? styles.postImageLast : null,
              ]}
              resizeMode="cover"
            />
          ))}
        </View>
      )}

      {/* 关联菜谱 */}
      {post.recipe && (
        <TouchableOpacity
          style={styles.postRecipe}
          onPress={() => router.push(`/recipe/${post.recipe.id}`)}
        >
          <Text style={styles.postRecipeLabel}>关联菜谱：</Text>
          <Text style={styles.postRecipeTitle}>
            {post.recipe.title}
          </Text>
        </TouchableOpacity>
      )}

      {/* 互动栏 */}
      <View style={styles.postActions}>
        <TouchableOpacity
          style={styles.postActionButton}
          onPress={handleLike}
        >
          <Ionicons
            name={post.isLiked ? 'heart' : 'heart-outline'}
            size={18}
            color={post.isLiked ? '#ef4444' : '#9ca3af'}
          />
          <Text style={styles.postActionText}>
            {post.likeCount || 0}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.postActionButton}
          onPress={() => router.push(`/post/${post.id}`)}
        >
          <Ionicons name="chatbubble-outline" size={18} color="#9ca3af" />
          <Text style={styles.postActionText}>
            {post.commentCount || 0}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.postActionButton}
          onPress={handleShare}
        >
          <Ionicons name="share-outline" size={18} color="#9ca3af" />
          <Text style={styles.postActionText}>分享</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  tabItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 16,
  },
  tabItemActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#f97316',
  },
  tabLabel: {
    fontSize: 14,
  },
  tabLabelActive: {
    color: '#f97316',
    fontWeight: '600',
  },
  tabLabelInactive: {
    color: '#9ca3af',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 90,
  },
  emptyComponent: {
    paddingVertical: 80,
    alignItems: 'center',
  },
  emptyText: {
    color: '#9ca3af',
  },
  footerComponent: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    backgroundColor: '#f97316',
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  postCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 8,
  },
  postUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  postAvatar: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(249, 115, 22, 0.1)',
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  postAvatarText: {
    fontSize: 18,
  },
  postUserMeta: {
    marginLeft: 12,
  },
  postNickname: {
    color: '#1f2937',
    fontWeight: '500',
  },
  postDate: {
    color: '#9ca3af',
    fontSize: 12,
  },
  checkinBadge: {
    marginLeft: 'auto',
    backgroundColor: 'rgba(5, 150, 105, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  checkinBadgeText: {
    color: '#059669',
    fontSize: 12,
  },
  postContent: {
    color: '#1f2937',
    lineHeight: 20,
    marginBottom: 12,
  },
  postImages: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  postImage: {
    width: '32%',
    aspectRatio: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    marginBottom: 8,
    marginRight: '2%',
  },
  postImageLast: {
    marginRight: 0,
  },
  postRecipe: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  postRecipeLabel: {
    color: '#9ca3af',
    fontSize: 14,
  },
  postRecipeTitle: {
    color: '#f97316',
    fontSize: 14,
    marginLeft: 4,
  },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f9fafb',
  },
  postActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postActionText: {
    color: '#9ca3af',
    fontSize: 12,
    marginLeft: 4,
  },
});
