import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import {
  TextInput,
  Button,
  Text,
  ActivityIndicator,
  Avatar,
  Surface,
} from 'react-native-paper';
import {useRoute, useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useAuth} from '../contexts/AuthContext';
import {apiService} from '../services/ApiService';
import {colors, typography, spacing, borderRadius} from '../utils/theme';
import {NavigationParams, ChatMessage, ChatRoom} from '../types/index';

type ChatRoomNavigationProp = StackNavigationProp<NavigationParams, 'ChatRoom'>;
type ChatRoomRouteProp = {
  key: string;
  name: 'ChatRoom';
  params: {roomId: string};
};

const ChatRoomScreen: React.FC = () => {
  const navigation = useNavigation<ChatRoomNavigationProp>();
  const route = useRoute<ChatRoomRouteProp>();
  const {user} = useAuth();
  const {roomId} = route.params;

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [room, setRoom] = useState<ChatRoom | null>(null);
  const [messageText, setMessageText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    loadRoomAndMessages();
    // TODO: Set up WebSocket subscription for real-time updates
  }, [roomId]);

  const loadRoomAndMessages = async () => {
    try {
      setLoading(true);
      // Load room details and messages
      const rooms = await apiService.getChatRooms();
      const foundRoom = rooms.find((r) => r.id === roomId);
      if (foundRoom) {
        setRoom(foundRoom);
        navigation.setOptions({title: getRoomTitle(foundRoom)});
      }

      const loadedMessages = await apiService.getChatMessages(roomId, 50);
      setMessages(loadedMessages.reverse()); // Reverse to show oldest first
    } catch (error) {
      console.error('Failed to load chat room:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoomTitle = (chatRoom: ChatRoom): string => {
    if (chatRoom.name) return chatRoom.name;
    if (chatRoom.type === 'direct' && chatRoom.members.length > 0) {
      const otherMember = chatRoom.members.find((m) => m.userId !== user?.id);
      return otherMember?.userName || 'Direct Message';
    }
    if (chatRoom.type === 'unit' && chatRoom.unitName) {
      return chatRoom.unitName;
    }
    return 'Chat Room';
  };

  const sendMessage = async () => {
    if (!messageText.trim() || sending) return;

    const textToSend = messageText.trim();
    setMessageText('');
    setSending(true);

    try {
      const newMessage = await apiService.sendChatMessage(roomId, textToSend);
      setMessages((prev) => [...prev, newMessage]);
      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({animated: true});
      }, 100);
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessageText(textToSend); // Restore message on error
    } finally {
      setSending(false);
    }
  };

  const formatTime = (date: Date): string => {
    const now = new Date();
    const messageDate = new Date(date);
    const diff = now.getTime() - messageDate.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;

    const hours = messageDate.getHours();
    const minutesDisplay = messageDate.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;

    return `${displayHours}:${minutesDisplay.toString().padStart(2, '0')} ${ampm}`;
  };

  const isMyMessage = (message: ChatMessage): boolean => {
    return message.userId === user?.id;
  };

  const renderMessage = ({item: message}: {item: ChatMessage}) => {
    const myMessage = isMyMessage(message);
    const showAvatar = !myMessage;

    return (
      <View
        style={[
          styles.messageContainer,
          myMessage ? styles.myMessageContainer : styles.otherMessageContainer,
        ]}
      >
        {showAvatar && (
          <Avatar.Text
            size={32}
            label={message.userName.charAt(0).toUpperCase()}
            style={styles.messageAvatar}
          />
        )}
        <View
          style={[
            styles.messageBubble,
            myMessage ? styles.myMessageBubble : styles.otherMessageBubble,
          ]}
        >
          {!myMessage && (
            <Text style={styles.messageSender}>{message.userName}</Text>
          )}
          <Text
            style={[
              styles.messageText,
              myMessage ? styles.myMessageText : styles.otherMessageText,
            ]}
          >
            {message.message}
          </Text>
          <Text
            style={[
              styles.messageTime,
              myMessage ? styles.myMessageTime : styles.otherMessageTime,
            ]}
          >
            {formatTime(message.createdAt)}
            {message.isEdited && ' (edited)'}
          </Text>
        </View>
      </View>
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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        inverted={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({animated: false})}
      />

      <Surface style={styles.inputContainer}>
        <TextInput
          mode="outlined"
          placeholder="Type a message..."
          value={messageText}
          onChangeText={setMessageText}
          multiline
          maxLength={1000}
          style={styles.input}
          disabled={sending}
          onSubmitEditing={sendMessage}
          blurOnSubmit={false}
          right={
            <TextInput.Icon
              icon="send"
              onPress={sendMessage}
              disabled={!messageText.trim() || sending}
            />
          }
        />
      </Surface>
    </KeyboardAvoidingView>
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
  messagesList: {
    padding: spacing.md,
    paddingBottom: spacing.lg,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    alignItems: 'flex-end',
  },
  myMessageContainer: {
    justifyContent: 'flex-end',
  },
  otherMessageContainer: {
    justifyContent: 'flex-start',
  },
  messageAvatar: {
    marginRight: spacing.xs,
    backgroundColor: colors.primary,
  },
  messageBubble: {
    maxWidth: '75%',
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  myMessageBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: borderRadius.xs,
  },
  otherMessageBubble: {
    backgroundColor: colors.lightGray,
    borderBottomLeftRadius: borderRadius.xs,
  },
  messageSender: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    fontWeight: '600',
  },
  messageText: {
    ...typography.body,
  },
  myMessageText: {
    color: colors.surface,
  },
  otherMessageText: {
    color: colors.text,
  },
  messageTime: {
    ...typography.caption,
    marginTop: spacing.xs,
    fontSize: 10,
  },
  myMessageTime: {
    color: colors.surface,
    opacity: 0.8,
  },
  otherMessageTime: {
    color: colors.textSecondary,
  },
  inputContainer: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.mediumGray,
    elevation: 4,
  },
  input: {
    backgroundColor: colors.surface,
  },
});

export default ChatRoomScreen;

