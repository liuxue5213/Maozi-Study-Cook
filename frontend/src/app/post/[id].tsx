import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../stores/authStore';
import { communityService } from '../../services/communityService';
import { getImageUrl } from '../../utils/imageUtils';

/**
 * 帖子详情页
 */
export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, isAuthenticated } = useAuthStore();
  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPost();
    loadComments();
  }, [id]);

  const loadPost = async () => {
    try {
      const res = await communityService.getPost(Number(id));
      setPost(res.data);
    } catch (error) {
      console.error('加载帖子失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadComments = async () => {
    try {
      const res = await communityService.getComments(Number(id));
      setComments(res.data?.list || []);
    } catch (error) {
      console.error('加载评论失败:', error);
    }
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;
    try {
      await communityService.createComment(Number(id), commentText);
      setCommentText('');
      loadComments();
    } catch (error) {
      console.error('评论失败:', error);
    }
  };

  // 点赞（与列表一致的乐观更新逻辑）
  const handleLike = async () => {
    try {
      const res = await communityService.likePost(post.id);
      const isLiked = !!res.data?.isLiked;
      setPost((prev: any) =>
        prev
          ? {
              ...prev,
              isLiked,
              likeCount: Math.max(
                0,
                (prev.likeCount || 0) + (isLiked ? 1 : -1)
              ),
            }
          : prev
      );
    } catch (error) {
      console.error('点赞失败:', error);
    }
  };

  // 删除自己的帖子
  const handleDelete = () => {
    Alert.alert('确认删除?', '', [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: async () => {
          try {
            await communityService.deletePost(Number(id));
            router.back();
          } catch (error: any) {
            Alert.alert('删除失败', error.message || '请稍后重试');
          }
        },
      },
    ]);
  };

  if (isLoading || !post) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView}>
        {/* 帖子内容 */}
        <View style={styles.postCard}>
          <View style={styles.userRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarEmoji}>👨‍🍳</Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.nickname}>
                {post.user?.nickname || '匿名用户'}
              </Text>
              <Text style={styles.timeText}>
                {new Date(post.createdAt).toLocaleString()}
              </Text>
            </View>
          </View>

          <Text style={styles.contentText}>{post.content}</Text>

          {/* 帖子图片（真实渲染，每张全宽大图） */}
          {post.images?.length > 0 && (
            <View style={styles.imageList}>
              {post.images.map((img: any, idx: number) => (
                <Image
                  key={idx}
                  source={{ uri: getImageUrl(img.imageUrl) }}
                  style={styles.detailImage}
                  resizeMode="cover"
                />
              ))}
            </View>
          )}

          {/* 操作区：点赞 / 删除 */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleLike}
            >
              <Ionicons
                name={post.isLiked ? 'heart' : 'heart-outline'}
                size={22}
                color={post.isLiked ? '#ef4444' : '#9ca3af'}
              />
              <Text
                style={[
                  styles.actionText,
                  post.isLiked ? styles.actionTextLiked : null,
                ]}
              >
                {post.likeCount || 0}
              </Text>
            </TouchableOpacity>

            {user && post.userId === user.id && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleDelete}
              >
                <Ionicons name="trash-outline" size={22} color="#ef4444" />
                <Text style={styles.deleteText}>删除</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* 评论列表 */}
        <View style={[styles.postCard, styles.commentsCard]}>
          <Text style={styles.commentsTitle}>
            评论 ({comments.length})
          </Text>
          {comments.length === 0 ? (
            <Text style={styles.emptyText}>
              暂无评论，来说两句吧
            </Text>
          ) : (
            comments.map((comment: any) => (
              <View key={comment.id} style={styles.commentRow}>
                <View style={styles.commentAvatar}>
                  <Text>👤</Text>
                </View>
                <View style={styles.commentBody}>
                  <Text style={styles.commentNickname}>
                    {comment.user?.nickname}
                  </Text>
                  <Text style={styles.commentContent}>
                    {comment.content}
                  </Text>
                  <Text style={styles.commentTime}>
                    {new Date(comment.createdAt).toLocaleString()}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* 评论输入栏 */}
      <View style={styles.inputBar}>
        <TextInput
          style={styles.commentInput}
          placeholder={isAuthenticated ? '说点什么...' : '登录后评论'}
          placeholderTextColor="#9ca3af"
          value={commentText}
          onChangeText={setCommentText}
          editable={isAuthenticated}
        />
        <TouchableOpacity
          style={styles.sendButton}
          onPress={handleComment}
        >
          <Ionicons name="send" size={16} color="white" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  scrollView: {
    flex: 1,
  },
  postCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  commentsCard: {
    marginTop: 8,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(249, 115, 22, 0.1)',
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: {
    fontSize: 18,
  },
  userInfo: {
    marginLeft: 12,
  },
  nickname: {
    color: '#1f2937',
    fontWeight: '500',
  },
  timeText: {
    color: '#9ca3af',
    fontSize: 12,
  },
  contentText: {
    color: '#1f2937',
    lineHeight: 20,
  },
  imageList: {
    marginTop: 12,
  },
  detailImage: {
    width: '100%',
    aspectRatio: 4 / 3,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    marginBottom: 8,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f9fafb',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    color: '#9ca3af',
    fontSize: 14,
    marginLeft: 6,
  },
  actionTextLiked: {
    color: '#ef4444',
  },
  deleteText: {
    color: '#ef4444',
    fontSize: 14,
    marginLeft: 6,
  },
  commentsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
  },
  emptyText: {
    color: '#9ca3af',
    textAlign: 'center',
    paddingVertical: 24,
  },
  commentRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    backgroundColor: '#f3f4f6',
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  commentBody: {
    flex: 1,
    marginLeft: 12,
  },
  commentNickname: {
    color: '#1f2937',
    fontSize: 14,
    fontWeight: '500',
  },
  commentContent: {
    color: '#1f2937',
    fontSize: 14,
    marginTop: 4,
  },
  commentTime: {
    color: '#9ca3af',
    fontSize: 12,
    marginTop: 4,
  },
  inputBar: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentInput: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 9999,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 14,
  },
  sendButton: {
    marginLeft: 12,
    backgroundColor: '#f97316',
    width: 36,
    height: 36,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
