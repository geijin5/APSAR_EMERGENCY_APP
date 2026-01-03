import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import {
  List,
  Searchbar,
  ActivityIndicator,
  Text,
  Avatar,
  Surface,
} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useAuth} from '../contexts/AuthContext';
import {apiService} from '../services/ApiService';
import {colors, typography, spacing, borderRadius} from '../utils/theme';
import {NavigationParams, ChatRoom} from '../types/index';

type ChatListNavigationProp = StackNavigationProp<NavigationParams, 'Chat'>;

const ChatListScreen: React.FC = () => {
  const navigation = useNavigation<ChatListNavigationProp>();
  const {user} = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);

  useEffect(() => {
    loadChatRooms();
  }, []);

  const loadChatRooms = async () => {
    try {
      setLoading(true);
      const rooms = await apiService.getChatRooms();
      setChatRooms(rooms);
    } catch (error) {
      console.error('Failed to load chat rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadChatRooms();
    setRefreshing(false);
  };

  const getRoomTitle = (room: ChatRoom): string => {
    if (room.name) return room.name;
    if (room.type === 'direct' && room.members.length > 0) {
      const otherMember = room.members.find((m) => m.userId !== user?.id);
      return otherMember?.userName || 'Direct Message';
    }
    if (room.type === 'unit' && room.unitName) {
      return room.unitName;
    }
    return 'Chat Room';
  };

  const getRoomSubtitle = (room: ChatRoom): string => {
    if (room.lastMessage) {
      const prefix = room.lastMessage.userName === user?.name ? 'You: ' : '';
      return prefix + room.lastMessage.message;
    }
    if (room.members.length > 0) {
      const memberCount = room.members.length;
      return `${memberCount} member${memberCount > 1 ? 's' : ''}`;
    }
    return 'No messages yet';
  };

  const getRoomIcon = (room: ChatRoom): string => {
    switch (room.type) {
      case 'direct':
        return 'account';
      case 'group':
        return 'group';
      case 'unit':
        return 'account-group';
      case 'general':
        return 'forum';
      default:
        return 'chat';
    }
  };

  const formatTime = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const filteredRooms = chatRooms.filter((room) => {
    const title = getRoomTitle(room).toLowerCase();
    const subtitle = getRoomSubtitle(room).toLowerCase();
    const query = searchQuery.toLowerCase();
    return title.includes(query) || subtitle.includes(query);
  });

  const renderChatRoom = ({item: room}: {item: ChatRoom}) => {
    const unreadCount = room.unreadCount || 0;
    const lastMessageTime = room.lastMessage
      ? formatTime(room.lastMessage.createdAt)
      : '';

    return (
      <TouchableOpacity
        onPress={() =>
          navigation.navigate('ChatRoom' as any, {roomId: room.id})
        }
      >
        <Surface style={styles.chatRoomItem}>
          <View style={styles.chatRoomContent}>
            <Avatar.Icon
              size={48}
              icon={getRoomIcon(room)}
              style={[
                styles.avatar,
                unreadCount > 0 && styles.avatarUnread,
              ]}
            />
            <View style={styles.chatRoomInfo}>
              <View style={styles.chatRoomHeader}>
                <Text style={styles.chatRoomTitle} numberOfLines={1}>
                  {getRoomTitle(room)}
                </Text>
                {lastMessageTime && (
                  <Text style={styles.chatRoomTime}>{lastMessageTime}</Text>
                )}
              </View>
              <View style={styles.chatRoomSubtitleRow}>
                <Text style={styles.chatRoomSubtitle} numberOfLines={1}>
                  {getRoomSubtitle(room)}
                </Text>
                {unreadCount > 0 && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadBadgeText}>
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </Surface>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search chats..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
        iconColor={colors.textSecondary}
        inputStyle={styles.searchbarInput}
      />

      {filteredRooms.length === 0 ? (
        <View style={styles.emptyState}>
          <Icon name="chat-bubble-outline" size={64} color={colors.textSecondary} />
          <Text style={styles.emptyStateText}>
            {searchQuery ? 'No chats found' : 'No chats yet'}
          </Text>
          <Text style={styles.emptyStateSubtext}>
            {searchQuery
              ? 'Try a different search term'
              : 'Start a conversation or wait for messages'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredRooms}
          renderItem={renderChatRoom}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  searchbar: {
    margin: spacing.md,
    elevation: 2,
  },
  searchbarInput: {
    ...typography.body,
  },
  listContent: {
    padding: spacing.md,
  },
  chatRoomItem: {
    marginBottom: spacing.sm,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    elevation: 1,
  },
  chatRoomContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: colors.mediumGray,
  },
  avatarUnread: {
    backgroundColor: colors.primary,
  },
  chatRoomInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  chatRoomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  chatRoomTitle: {
    ...typography.body,
    fontWeight: '600',
    flex: 1,
    color: colors.text,
  },
  chatRoomTime: {
    ...typography.caption,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
  chatRoomSubtitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chatRoomSubtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    flex: 1,
  },
  unreadBadge: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.round,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
    marginLeft: spacing.sm,
  },
  unreadBadgeText: {
    ...typography.caption,
    color: colors.surface,
    fontWeight: 'bold',
    fontSize: 10,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyStateText: {
    ...typography.h4,
    color: colors.text,
    marginTop: spacing.md,
  },
  emptyStateSubtext: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});

export default ChatListScreen;

