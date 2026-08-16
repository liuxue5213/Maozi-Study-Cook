import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../stores/authStore';
import { communityService } from '../../services/communityService';

/**
 * 帖子详情页
 */
export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isAuthenticated } = useAuthStore();
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

  if (isLoading || !post) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-cooking-background"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView className="flex-1">
        {/* 帖子内容 */}
        <View className="bg-white px-4 py-4">
          <View className="flex-row items-center mb-3">
            <View className="w-10 h-10 bg-cooking-main/10 rounded-full items-center justify-center">
              <Text className="text-lg">👨‍🍳</Text>
            </View>
            <View className="ml-3">
              <Text className="text-cooking-text font-medium">
                {post.user?.nickname || '匿名用户'}
              </Text>
              <Text className="text-cooking-muted text-xs">
                {new Date(post.createdAt).toLocaleString()}
              </Text>
            </View>
          </View>

          <Text className="text-cooking-text leading-5">{post.content}</Text>

          {post.images?.length > 0 && (
            <View className="flex-row flex-wrap mt-3">
              {post.images.map((img: any, idx: number) => (
                <View
                  key={idx}
                  className="w-[32%] h-24 bg-gray-100 rounded-lg mr-[2%] mb-2 items-center justify-center"
                >
                  <Text className="text-2xl">🍲</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* 评论列表 */}
        <View className="bg-white mt-2 px-4 py-4">
          <Text className="text-base font-bold text-cooking-text mb-3">
            评论 ({comments.length})
          </Text>
          {comments.length === 0 ? (
            <Text className="text-cooking-muted text-center py-6">
              暂无评论，来说两句吧
            </Text>
          ) : (
            comments.map((comment: any) => (
              <View key={comment.id} className="flex-row mb-4">
                <View className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center">
                  <Text>👤</Text>
                </View>
                <View className="flex-1 ml-3">
                  <Text className="text-cooking-text text-sm font-medium">
                    {comment.user?.nickname}
                  </Text>
                  <Text className="text-cooking-text text-sm mt-1">
                    {comment.content}
                  </Text>
                  <Text className="text-cooking-muted text-xs mt-1">
                    {new Date(comment.createdAt).toLocaleString()}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* 评论输入栏 */}
      <View className="bg-white border-t border-gray-100 px-4 py-3 flex-row items-center">
        <TextInput
          className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm"
          placeholder={isAuthenticated ? '说点什么...' : '登录后评论'}
          placeholderTextColor="#9ca3af"
          value={commentText}
          onChangeText={setCommentText}
          editable={isAuthenticated}
        />
        <TouchableOpacity
          className="ml-3 bg-cooking-main w-9 h-9 rounded-full items-center justify-center"
          onPress={handleComment}
        >
          <Ionicons name="send" size={16} color="white" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
