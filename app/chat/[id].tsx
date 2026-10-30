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
  Modal,
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
  Mic,
  Image as ImageIcon,
  FileText,
  Code,
  Info,
  Users,
  Bell,
} from 'lucide-react-native';
import { triggerHaptic, triggerSelectionHaptic } from '../../src/utils/haptics';

const QUICK_EMOJIS = ['👍', '🔥', '🚀', '👏', '❤️', '🎉', '💡', '👀'];

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
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);

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

  const handleAddEmoji = (emoji: string) => {
    triggerSelectionHaptic();
    setInputContent((prev) => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleAttachSnippet = (type: 'audio' | 'code' | 'image' | 'doc') => {
    triggerHaptic();
    setShowAttachmentMenu(false);
    let sampleContent = '';
    switch (type) {
      case 'audio':
        sampleContent = '🎙️ [Voice Memo: 0:24 — WebRTC mesh sync notes]';
        break;
      case 'code':
        sampleContent = '```typescript\nconst stage = await mivo.joinStage("mesh-core");\n```';
        break;
      case 'image':
        sampleContent = '🖼️ [Screenshot: mobile_stage_layout.png — 1.4 MB]';
        break;
      case 'doc':
        sampleContent = '📄 [Document: Q4_Architecture_Spec.pdf — 840 KB]';
        break;
    }
    const replyId = replyingTo && replyingTo.id !== 'welcome-msg' ? replyingTo.id : undefined;
    sendMessage(id, sampleContent, isDm, replyId);
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

        <TouchableOpacity
          style={styles.headerTitleContainer}
          activeOpacity={0.8}
          onPress={() => {
            triggerSelectionHaptic();
            setShowInfoModal(true);
          }}
        >
          <Text style={styles.headerTitle} numberOfLines={1}>
            {isDm ? title : `#${title}`}
          </Text>
          <View style={styles.headerSubtitleRow}>
            <View style={styles.headerDot} />
            <Text style={styles.headerSubtitle}>
              {isDm ? 'Direct Conversation' : 'Unified Stage Channel'}
            </Text>
          </View>
        </TouchableOpacity>

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

        {/* Quick Emoji Strip Drawer */}
        {showEmojiPicker && (
          <View style={styles.emojiPickerBar}>
            {QUICK_EMOJIS.map((emoji) => (
              <TouchableOpacity
                key={emoji}
                onPress={() => handleAddEmoji(emoji)}
                style={styles.emojiBtn}
                activeOpacity={0.7}
              >
                <Text style={styles.emojiChar}>{emoji}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              onPress={() => setShowEmojiPicker(false)}
              style={styles.emojiClose}
            >
              <X size={14} color="#64748B" />
            </TouchableOpacity>
          </View>
        )}

        {/* Message Input Box */}
        <View style={styles.inputArea}>
          <TouchableOpacity
            style={styles.iconBtn}
            activeOpacity={0.7}
            onPress={() => {
              triggerSelectionHaptic();
              setShowAttachmentMenu(true);
            }}
          >
            <Paperclip size={19} color="#94A3B8" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconBtn}
            activeOpacity={0.7}
            onPress={() => {
              triggerSelectionHaptic();
              setShowEmojiPicker((prev) => !prev);
            }}
          >
            <Smile size={19} color={showEmojiPicker ? THEME.colors.primaryLight : '#94A3B8'} />
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

      {/* Attachment Action Sheet Modal */}
      <Modal
        visible={showAttachmentMenu}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAttachmentMenu(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setShowAttachmentMenu(false)}
        >
          <View style={styles.attachmentSheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Share Content in #{title}</Text>
            <View style={styles.attachmentGrid}>
              <TouchableOpacity
                style={styles.attachmentOption}
                onPress={() => handleAttachSnippet('audio')}
              >
                <View style={[styles.attachIconCircle, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                  <Mic size={22} color="#10B981" />
                </View>
                <Text style={styles.attachOptionLabel}>Voice Memo</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.attachmentOption}
                onPress={() => handleAttachSnippet('image')}
              >
                <View style={[styles.attachIconCircle, { backgroundColor: 'rgba(99, 102, 241, 0.15)' }]}>
                  <ImageIcon size={22} color="#818CF8" />
                </View>
                <Text style={styles.attachOptionLabel}>Photo / Media</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.attachmentOption}
                onPress={() => handleAttachSnippet('code')}
              >
                <View style={[styles.attachIconCircle, { backgroundColor: 'rgba(6, 182, 212, 0.15)' }]}>
                  <Code size={22} color="#06B6D4" />
                </View>
                <Text style={styles.attachOptionLabel}>Code Snippet</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.attachmentOption}
                onPress={() => handleAttachSnippet('doc')}
              >
                <View style={[styles.attachIconCircle, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
                  <FileText size={22} color="#F59E0B" />
                </View>
                <Text style={styles.attachOptionLabel}>Document</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Channel Information Modal */}
      <Modal
        visible={showInfoModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowInfoModal(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setShowInfoModal(false)}
        >
          <View style={styles.infoModalCard}>
            <View style={styles.infoModalHeader}>
              <Text style={styles.infoModalTitle}>{isDm ? title : `#${title}`}</Text>
              <TouchableOpacity onPress={() => setShowInfoModal(false)}>
                <X size={18} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <Text style={styles.infoModalSub}>
              {isDm
                ? 'Direct end-to-end synchronized team conversation'
                : 'Primary unified stage channel with voice, video, and screen sharing.'}
            </Text>

            <View style={styles.infoStatsRow}>
              <View style={styles.infoStatItem}>
                <Users size={16} color="#818CF8" />
                <Text style={styles.infoStatText}>12 Members</Text>
              </View>
              <View style={styles.infoStatItem}>
                <Radio size={16} color="#10B981" />
                <Text style={styles.infoStatText}>Stage Ready</Text>
              </View>
              <View style={styles.infoStatItem}>
                <Bell size={16} color="#F59E0B" />
                <Text style={styles.infoStatText}>Alerts On</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
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
  emojiPickerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#121B2F',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: '#1C273C',
    gap: 8,
  },
  emojiBtn: {
    padding: 4,
  },
  emojiChar: {
    fontSize: 20,
  },
  emojiClose: {
    marginLeft: 'auto',
    padding: 4,
  },
  inputArea: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0D1424',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#172033',
    gap: 6,
  },
  iconBtn: {
    padding: 7,
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  attachmentSheet: {
    backgroundColor: '#101726',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 36,
    borderTopWidth: 1,
    borderColor: '#232F45',
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#334155',
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 16,
  },
  attachmentGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  attachmentOption: {
    alignItems: 'center',
    gap: 8,
  },
  attachIconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attachOptionLabel: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#CBD5E1',
  },
  infoModalCard: {
    margin: 20,
    backgroundColor: '#101726',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#232F45',
    alignSelf: 'center',
    width: '90%',
  },
  infoModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  infoModalSub: {
    fontSize: 13,
    color: '#94A3B8',
    lineHeight: 19,
    marginBottom: 16,
  },
  infoStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  infoStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoStatText: {
    fontSize: 12,
    color: '#CBD5E1',
    fontWeight: '600',
  },
});
