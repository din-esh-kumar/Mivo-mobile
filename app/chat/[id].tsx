import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { THEME } from '../../src/constants/theme';
import { useConversationStore } from '../../src/stores/useConversationStore';
import { useAuthStore } from '../../src/stores/useAuthStore';
import { useRoomStore } from '../../src/stores/useRoomStore';
import { socketClient } from '../../src/socket/socket-client';
import { ChatMessageDTO } from '../../src/types';
import { MessageBubble } from '../../src/components/MessageBubble';
import { Avatar } from '../../src/components/Avatar';
import {
  ArrowLeft,
  Send,
  Paperclip,
  Radio,
  X,
  Smile,
  Sparkles,
} from 'lucide-react-native';
import { triggerHaptic, triggerSelectionHaptic } from '../../src/utils/haptics';

export default function ChatScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    id: string;
    name?: string;
    type?: 'channel' | 'dm';
  }>();

  const id = params.id as string;
  const title = params.name || 'Chat';
  const isDm = params.type === 'dm';

  const currentUser = useAuthStore((s) => s.user);
  const {
    messages,
    typingUsers,
    loadChannelMessages,
    loadConversationMessages,
    sendMessage,
    sendTyping,
  } = useConversationStore();
  const joinRoom = useRoomStore((s) => s.joinRoom);

  const [inputContent, setInputContent] = useState('');
  const [replyingTo, setReplyingTo] = useState<ChatMessageDTO | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isDm) {
      loadConversationMessages(id);
      socketClient.joinConversation(id);
      return () => {
        socketClient.leaveConversation(id);
      };
    } else {
      loadChannelMessages(id);
      socketClient.joinRoom(id);
      return () => {
        socketClient.leaveRoom(id);
      };
    }
  }, [id, isDm]);

  const activeTyping = (typingUsers[id] || []).filter(
    (name) => name !== currentUser?.username && name !== currentUser?.displayName
  );

  const storedMessages = messages[id];
  const chatMessages: ChatMessageDTO[] =
    storedMessages && storedMessages.length > 0
      ? storedMessages
      : [
          {
            id: 'welcome-msg',
            authorId: 'system',
            author: { id: 'sys', username: 'mivo_bot', displayName: 'Mivo Assistant' },
            content: isDm
              ? `This is the start of your direct conversation with ${title}. Send a message to say hello!`
              : `Welcome to the beginning of #${title}. Send a message to start collaborating!`,
            createdAt: new Date().toISOString(),
          },
        ];

  const handleInputChange = (text: string) => {
    setInputContent(text);
    if (text.length > 0) {
      if (!typingTimeoutRef.current) {
        sendTyping(id, isDm);
        typingTimeoutRef.current = setTimeout(() => {
          typingTimeoutRef.current = null;
        }, 3000);
      }
    }
  };

  const handleSend = () => {
    if (!inputContent.trim()) return;

    triggerHaptic();
    const replyId = replyingTo && replyingTo.id !== 'welcome-msg' ? replyingTo.id : undefined;
    sendMessage(id, inputContent.trim(), isDm, replyId);
    setInputContent('');
    setReplyingTo(null);

    // Scroll to end
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleLaunchRoom = () => {
    triggerHaptic();
    joinRoom(id, 'VOICE');
    router.push({
      pathname: '/room/[id]',
      params: { id, name: title, mode: 'VOICE' },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Navigation Bar */}
      <View style={styles.header}>
        <TouchableOpacity
          testID="chat-back-btn"
          style={styles.backBtn}
          onPress={() => {
            triggerHaptic();
            router.back();
          }}
          activeOpacity={0.7}
        >
          <ArrowLeft size={22} color="#F8FAFC" />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {isDm ? title : `#${title}`}
          </Text>
          <View style={styles.headerSubtitleRow}>
            <View style={styles.headerDot} />
            <Text style={styles.headerSubtitle}>
              {isDm ? 'Direct Conversation' : 'Unified Stage Channel'}
            </Text>
          </View>
        </View>

        {/* Room Stage Trigger */}
        <TouchableOpacity
          testID="chat-huddle-btn"
          style={styles.stageBtn}
          onPress={handleLaunchRoom}
          activeOpacity={0.8}
        >
          <Radio size={15} color={THEME.colors.accentGreen} />
          <Text style={styles.stageBtnText}>Huddle</Text>
        </TouchableOpacity>
      </View>

      {/* Messages Stream */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
        style={styles.keyboardContainer}
      >
        <FlatList
          ref={flatListRef}
          data={chatMessages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <MessageBubble
              message={item}
              isCurrentUser={item.authorId === currentUser?.id}
              onReply={item.id !== 'welcome-msg' ? (msg) => setReplyingTo(msg) : undefined}
            />
          )}
        />

        {/* Typing indicator */}
        {activeTyping.length > 0 && (
          <View style={styles.typingContainer}>
            <View style={styles.typingDots}>
              <View style={[styles.typingDot, styles.dot1]} />
              <View style={[styles.typingDot, styles.dot2]} />
              <View style={[styles.typingDot, styles.dot3]} />
            </View>
            <Text style={styles.typingText}>
              {activeTyping.join(', ')} {activeTyping.length === 1 ? 'is' : 'are'} typing...
            </Text>
          </View>
        )}

        {/* Reply Preview Bar */}
        {replyingTo && (
          <View style={styles.replyBar}>
            <View style={styles.replyBarAccent} />
            <View style={styles.replyContent}>
              <Text style={styles.replyingToText}>
                Replying to {replyingTo.author?.displayName || 'User'}:
              </Text>
              <Text style={styles.replySnippet} numberOfLines={1}>
                {replyingTo.content}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setReplyingTo(null)}
              style={styles.replyCloseBtn}
            >
              <X size={16} color="#94A3B8" />
            </TouchableOpacity>
          </View>
        )}

        {/* Message Input Box */}
        <View style={styles.inputArea}>
          <TouchableOpacity
            style={styles.iconBtn}
            activeOpacity={0.7}
            onPress={triggerSelectionHaptic}
          >
            <Paperclip size={19} color="#64748B" />
          </TouchableOpacity>

          <View style={styles.textInputWrapper}>
            <TextInput
              testID="chat-text-input"
              placeholder={`Message ${isDm ? title : `#${title}`}...`}
              placeholderTextColor="#64748B"
              value={inputContent}
              onChangeText={handleInputChange}
              multiline
              style={styles.textInput}
            />
          </View>

          <TouchableOpacity
            testID="chat-send-btn"
            style={[
              styles.sendBtn,
              inputContent.trim().length > 0 && styles.sendBtnActive,
            ]}
            onPress={handleSend}
            disabled={!inputContent.trim()}
            activeOpacity={0.8}
          >
            <Send size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#080B11',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#172033',
    backgroundColor: '#0D1424',
    gap: 12,
  },
  backBtn: {
    padding: 6,
    borderRadius: 8,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F8FAFC',
    letterSpacing: -0.3,
  },
  headerSubtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 1,
  },
  headerDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: THEME.colors.accentGreen,
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#94A3B8',
  },
  stageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.35)',
    paddingVertical: 6,
    paddingHorizontal: 11,
    borderRadius: THEME.borderRadius.full,
    gap: 6,
  },
  stageBtnText: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  keyboardContainer: {
    flex: 1,
  },
  messagesList: {
    paddingVertical: 12,
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
    gap: 8,
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  typingDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: THEME.colors.accentGreen,
  },
  dot1: { opacity: 0.4 },
  dot2: { opacity: 0.7 },
  dot3: { opacity: 1 },
  typingText: {
    color: THEME.colors.accentGreen,
    fontSize: 11.5,
    fontWeight: '500',
  },
  replyBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#121B2F',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  replyBarAccent: {
    width: 3,
    height: '100%',
    backgroundColor: THEME.colors.primary,
    borderRadius: 1.5,
    marginRight: 10,
  },
  replyContent: {
    flex: 1,
    marginRight: 8,
  },
  replyingToText: {
    color: THEME.colors.primaryLight,
    fontSize: 11,
    fontWeight: '700',
  },
  replySnippet: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 1,
  },
  replyCloseBtn: {
    padding: 6,
  },
  inputArea: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0D1424',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#172033',
    gap: 8,
  },
  iconBtn: {
    padding: 8,
    borderRadius: 8,
  },
  textInputWrapper: {
    flex: 1,
    backgroundColor: '#131C30',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#232F46',
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 8 : 4,
  },
  textInput: {
    color: '#F8FAFC',
    fontSize: 14.5,
    maxHeight: 100,
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnActive: {
    backgroundColor: THEME.colors.primary,
    shadowColor: THEME.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 3,
  },
});
