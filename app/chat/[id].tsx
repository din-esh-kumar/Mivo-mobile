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
import { ChatMessageDTO } from '../../src/types';
import { MessageBubble } from '../../src/components/MessageBubble';
import {
  ArrowLeft,
  Send,
  Paperclip,
  Volume2,
  Radio,
  X,
  Smile,
} from 'lucide-react-native';

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
  const { messages, loadChannelMessages, selectConversation, sendMessage } =
    useConversationStore();
  const joinRoom = useRoomStore((s) => s.joinRoom);

  const [inputContent, setInputContent] = useState('');
  const [replyingTo, setReplyingTo] = useState<ChatMessageDTO | null>(null);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (isDm) {
      // select DM
    } else {
      loadChannelMessages(id);
    }
  }, [id, isDm]);

  const chatMessages = messages[id] || [
    {
      id: 'welcome-msg',
      authorId: 'system',
      author: { id: 'sys', username: 'mivo_bot', displayName: 'Mivo System' },
      content: `Welcome to the beginning of #${title}. Send a message to start collaborating!`,
      createdAt: new Date().toISOString(),
    },
  ];

  const handleSend = () => {
    if (!inputContent.trim()) return;

    sendMessage(id, inputContent.trim(), isDm, replyingTo?.id);
    setInputContent('');
    setReplyingTo(null);

    // Scroll to end
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleLaunchRoom = () => {
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
          style={styles.backBtn}
          onPress={() => router.back()}
        >
          <ArrowLeft size={22} color={THEME.colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {isDm ? title : `#${title}`}
          </Text>
          <Text style={styles.headerSubtitle}>
            {isDm ? 'Direct Conversation' : 'Unified Stage Channel'}
          </Text>
        </View>

        {/* Room Stage Trigger */}
        <TouchableOpacity
          style={styles.stageBtn}
          onPress={handleLaunchRoom}
          activeOpacity={0.8}
        >
          <Radio size={16} color={THEME.colors.accentGreen} />
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
          renderItem={({ item }) => (
            <MessageBubble
              message={item}
              isCurrentUser={item.authorId === currentUser?.id}
              onReply={(msg) => setReplyingTo(msg)}
            />
          )}
        />

        {/* Reply Preview Bar */}
        {replyingTo && (
          <View style={styles.replyBar}>
            <View style={styles.replyContent}>
              <Text style={styles.replyingToText}>
                Replying to {replyingTo.author.displayName}:
              </Text>
              <Text style={styles.replySnippet} numberOfLines={1}>
                {replyingTo.content}
              </Text>
            </View>
            <TouchableOpacity onPress={() => setReplyingTo(null)}>
              <X size={18} color={THEME.colors.textSecondary} />
            </TouchableOpacity>
          </View>
        )}

        {/* Message Input Box */}
        <View style={styles.inputArea}>
          <TouchableOpacity style={styles.iconBtn}>
            <Paperclip size={20} color={THEME.colors.textMuted} />
          </TouchableOpacity>

          <TextInput
            placeholder={`Message ${isDm ? title : `#${title}`}...`}
            placeholderTextColor={THEME.colors.textMuted}
            value={inputContent}
            onChangeText={setInputContent}
            multiline
            style={styles.textInput}
          />

          <TouchableOpacity
            style={[
              styles.sendBtn,
              inputContent.trim().length > 0 && styles.sendBtnActive,
            ]}
            onPress={handleSend}
            disabled={!inputContent.trim()}
          >
            <Send size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
    backgroundColor: THEME.colors.surface,
    gap: 12,
  },
  backBtn: {
    padding: 4,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
  },
  stageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: THEME.colors.accentGreen,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: THEME.borderRadius.full,
    gap: 6,
  },
  stageBtnText: {
    color: THEME.colors.accentGreen,
    fontSize: 12,
    fontWeight: '700',
  },
  keyboardContainer: {
    flex: 1,
  },
  messagesList: {
    paddingVertical: 12,
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  replyBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: THEME.colors.surfaceElevated,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.border,
  },
  replyContent: {
    flex: 1,
    marginRight: 8,
  },
  replyingToText: {
    color: THEME.colors.primary,
    fontSize: 11,
    fontWeight: '600',
  },
  replySnippet: {
    color: THEME.colors.textSecondary,
    fontSize: 12,
  },
  inputArea: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.border,
    gap: 8,
  },
  iconBtn: {
    padding: 6,
  },
  textInput: {
    flex: 1,
    color: THEME.colors.textPrimary,
    fontSize: 15,
    maxHeight: 100,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: THEME.colors.surfaceHover,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnActive: {
    backgroundColor: THEME.colors.primary,
  },
});

