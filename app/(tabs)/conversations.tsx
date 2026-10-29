import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { THEME } from '../../src/constants/theme';
import { useConversationStore } from '../../src/stores/useConversationStore';
import { useAuthStore } from '../../src/stores/useAuthStore';
import { ConversationDTO, UserSummaryDTO } from '../../src/types';
import { Avatar } from '../../src/components/Avatar';
import { Search, Plus, MessageSquare } from 'lucide-react-native';
import { showCrossPlatformPrompt, showCrossPlatformAlert } from '../../src/utils/dialog';

export default function ConversationsScreen() {
  const router = useRouter();
  const currentUser = useAuthStore((s) => s.user);
  const { conversations, loadConversations, selectConversation, createDirectConversation } =
    useConversationStore();

  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isClient, setIsClient] = useState(Platform.OS !== 'web');

  useEffect(() => {
    setIsClient(true);
    loadConversations();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadConversations();
    setRefreshing(false);
  };

  const formatMessageTime = (iso?: string | null) => {
    if (!iso || !isClient) return '';
    try {
      const d = new Date(iso);
      if (isNaN(d.getTime())) return '';
      const h = d.getHours().toString().padStart(2, '0');
      const m = d.getMinutes().toString().padStart(2, '0');
      return `${h}:${m}`;
    } catch {
      return '';
    }
  };

  const getRecipient = (conv: ConversationDTO): UserSummaryDTO => {
    const other = conv.participants?.find((p) => p.userId !== currentUser?.id);
    return (
      other?.user || {
        id: conv.id,
        username: conv.name || 'chat',
        displayName: conv.name || 'Team Chat',
        avatarUrl: conv.avatarUrl || null,
        status: 'OFFLINE',
      }
    );
  };

  const handleNewChat = () => {
    showCrossPlatformPrompt(
      'Start Direct Message',
      'Enter username or user ID to chat with (or select a recommended team contact):',
      async (text) => {
        if (!text?.trim()) return;
        const res = await createDirectConversation(text.trim());
        if (res.success && res.data) {
          handleOpenConversation(res.data);
        } else {
          // If server fails or offline, create a local direct conversation
          const localDm: ConversationDTO = {
            id: 'dm-' + text.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now().toString(36),
            type: 'DIRECT',
            participants: [
              {
                id: 'p-' + text.toLowerCase(),
                userId: 'user-' + text.toLowerCase(),
                user: {
                  id: 'user-' + text.toLowerCase(),
                  username: text.toLowerCase().replace(/\s+/g, '_'),
                  displayName: text,
                  status: 'ONLINE',
                },
                joinedAt: new Date().toISOString(),
              },
            ],
            lastMessage: {
              id: 'm-init-' + Date.now(),
              authorId: 'user-' + text.toLowerCase(),
              author: { id: 'user-' + text.toLowerCase(), username: text.toLowerCase(), displayName: text },
              content: 'Direct message channel initiated.',
              createdAt: new Date().toISOString(),
            },
            unreadCount: 0,
            createdAt: new Date().toISOString(),
          };
          useConversationStore.setState((state) => ({
            conversations: [localDm, ...state.conversations.filter((c) => c.id !== localDm.id)],
          }));
          handleOpenConversation(localDm);
        }
      },
      [
        {
          text: 'Elena Rostova (Lead AI)',
          onPress: async () => {
            const sampleDm: ConversationDTO = {
              id: 'dm-elena-' + Date.now().toString(36),
              type: 'DIRECT',
              participants: [
                {
                  id: 'p-elena',
                  userId: 'user-elena',
                  user: {
                    id: 'user-elena',
                    username: 'elena_ai',
                    displayName: 'Elena Rostova',
                    status: 'ONLINE',
                  },
                  joinedAt: new Date().toISOString(),
                },
              ],
              lastMessage: {
                id: 'm-elena-1',
                authorId: 'user-elena',
                author: { id: 'user-elena', username: 'elena_ai', displayName: 'Elena Rostova' },
                content: 'Hi! Let me know if you need to test the real-time audio stage.',
                createdAt: new Date().toISOString(),
              },
              unreadCount: 1,
              createdAt: new Date().toISOString(),
            };
            useConversationStore.setState((state) => ({
              conversations: [sampleDm, ...state.conversations.filter((c) => c.id !== sampleDm.id)],
            }));
            handleOpenConversation(sampleDm);
          },
        },
      ]
    );
  };

  const filteredConversations = conversations.filter((c) => {
    const recipient = getRecipient(c);
    return (recipient.displayName || '')
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
  });

  const handleOpenConversation = (conv: ConversationDTO) => {
    selectConversation(conv);
    const recipient = getRecipient(conv);
    router.push({
      pathname: '/chat/[id]',
      params: {
        id: conv.id,
        name: recipient.displayName,
        type: 'dm',
      },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <MessageSquare size={24} color={THEME.colors.primary} />
          <Text style={styles.headerTitle}>Direct Messages</Text>
        </View>

        <TouchableOpacity
          testID="new-chat-btn"
          style={styles.newChatBtn}
          onPress={handleNewChat}
          activeOpacity={0.8}
        >
          <Plus size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <Search size={18} color={THEME.colors.textMuted} />
        <TextInput
          testID="search-conversations-input"
          placeholder="Search direct messages..."
          placeholderTextColor={THEME.colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
        />
      </View>

      {/* Conversations List */}
      <FlatList
        data={filteredConversations}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={THEME.colors.primary}
          />
        }
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const recipient = getRecipient(item);
          const hasUnread = Boolean(item.unreadCount && item.unreadCount > 0);
          const formattedTime = formatMessageTime(item.lastMessage?.createdAt);

          return (
            <TouchableOpacity
              style={[styles.convItem, hasUnread && styles.convItemUnread]}
              onPress={() => handleOpenConversation(item)}
              activeOpacity={0.7}
            >
              <Avatar
                url={recipient.avatarUrl}
                name={recipient.displayName}
                size={48}
                status={recipient.status}
                showStatus
              />

              <View style={styles.convDetails}>
                <View style={styles.convTopRow}>
                  <Text style={styles.recipientName} numberOfLines={1}>
                    {recipient.displayName}
                  </Text>
                  {formattedTime ? (
                    <Text style={styles.timeText}>{formattedTime}</Text>
                  ) : null}
                </View>

                <View style={styles.convBottomRow}>
                  <Text
                    style={[
                      styles.lastMessageText,
                      hasUnread && styles.lastMessageUnread,
                    ]}
                    numberOfLines={1}
                  >
                    {item.lastMessage?.content || 'No messages yet'}
                  </Text>

                  {hasUnread && (
                    <View style={styles.unreadBadge}>
                      <Text style={styles.unreadBadgeText}>
                        {item.unreadCount}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  newChatBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: THEME.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.surface,
    marginHorizontal: 16,
    paddingHorizontal: 14,
    height: 44,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    gap: 10,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    color: THEME.colors.textPrimary,
    fontSize: 14,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  convItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.surface,
    padding: 12,
    borderRadius: THEME.borderRadius.lg,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    gap: 12,
  },
  convItemUnread: {
    borderColor: 'rgba(99, 102, 241, 0.4)',
    backgroundColor: '#121A2E',
  },
  convDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  convTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  recipientName: {
    color: THEME.colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  timeText: {
    color: THEME.colors.textMuted,
    fontSize: 11,
  },
  convBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lastMessageText: {
    color: THEME.colors.textSecondary,
    fontSize: 13,
    flex: 1,
    marginRight: 8,
  },
  lastMessageUnread: {
    color: THEME.colors.textPrimary,
    fontWeight: '600',
  },
  unreadBadge: {
    backgroundColor: THEME.colors.primary,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
});

