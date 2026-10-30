import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  ScrollView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { THEME } from '../../src/constants/theme';
import { useConversationStore } from '../../src/stores/useConversationStore';
import { useAuthStore } from '../../src/stores/useAuthStore';
import { ConversationDTO, UserSummaryDTO } from '../../src/types';
import { Avatar } from '../../src/components/Avatar';
import { Search, Plus, MessageSquare, X, CheckCheck } from 'lucide-react-native';
import { showCrossPlatformPrompt } from '../../src/utils/dialog';
import { triggerHaptic } from '../../src/utils/haptics';

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
      const now = new Date();
      const diffMs = now.getTime() - d.getTime();
      const diffMins = Math.floor(diffMs / 60000);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m`;

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

  const handleOpenConversation = (conv: ConversationDTO) => {
    triggerHaptic();
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

  const handleNewChat = () => {
    triggerHaptic();
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

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <View style={styles.headerIconBubble}>
            <MessageSquare size={20} color={THEME.colors.primary} />
          </View>
          <View>
            <Text style={styles.headerTitle}>Direct Messages</Text>
            <Text style={styles.headerSubtitle}>
              {conversations.length} active discussion{conversations.length === 1 ? '' : 's'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          testID="new-chat-btn"
          style={styles.newChatBtn}
          onPress={handleNewChat}
          activeOpacity={0.8}
        >
          <Plus size={18} color="#FFFFFF" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      {/* Active Teammates Strip (Presence Bar) */}
      {!searchQuery && conversations.length > 0 && (
        <View style={styles.activeBar}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.activeBarContent}
          >
            {conversations.slice(0, 6).map((c) => {
              const r = getRecipient(c);
              return (
                <TouchableOpacity
                  key={`presence-${c.id}`}
                  style={styles.presenceItem}
                  activeOpacity={0.75}
                  onPress={() => handleOpenConversation(c)}
                >
                  <View style={styles.presenceAvatarWrap}>
                    <Avatar
                      url={r.avatarUrl}
                      name={r.displayName}
                      size={46}
                      status={r.status || 'ONLINE'}
                      showStatus
                    />
                  </View>
                  <Text style={styles.presenceName} numberOfLines={1}>
                    {(r.displayName || '').split(' ')[0]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Search Input */}
      <View style={styles.searchWrapper}>
        <View style={styles.searchContainer}>
          <Search size={16} color="#64748B" style={styles.searchIcon} />
          <TextInput
            testID="search-conversations-input"
            placeholder="Search direct messages..."
            placeholderTextColor="#64748B"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              style={styles.searchClearBtn}
            >
              <X size={14} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>
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
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No conversations found</Text>
            <Text style={styles.emptySub}>
              {searchQuery
                ? `No messages matched "${searchQuery}"`
                : 'Start a new conversation with your teammates'}
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const recipient = getRecipient(item);
          const hasUnread = Boolean(item.unreadCount && item.unreadCount > 0);
          const formattedTime = formatMessageTime(item.lastMessage?.createdAt);

          return (
            <TouchableOpacity
              style={[styles.convItem, hasUnread && styles.convItemUnread]}
              onPress={() => handleOpenConversation(item)}
              activeOpacity={0.75}
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
                  <Text style={[styles.recipientName, hasUnread && styles.recipientNameBold]} numberOfLines={1}>
                    {recipient.displayName}
                  </Text>
                  {formattedTime ? (
                    <Text style={[styles.timeText, hasUnread && styles.timeTextUnread]}>
                      {formattedTime}
                    </Text>
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
    backgroundColor: '#080B11',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#172033',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIconBubble: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#F8FAFC',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 1,
  },
  newChatBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: THEME.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: THEME.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 3,
  },
  activeBar: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#141D2E',
    backgroundColor: '#0B0F1A',
  },
  activeBarContent: {
    paddingHorizontal: 16,
    gap: 14,
  },
  presenceItem: {
    alignItems: 'center',
    width: 58,
  },
  presenceAvatarWrap: {
    padding: 2,
  },
  presenceName: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 4,
    fontWeight: '500',
  },
  searchWrapper: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#101625',
    borderWidth: 1,
    borderColor: '#1D273B',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#F8FAFC',
    fontSize: 14,
    height: '100%',
  },
  searchClearBtn: {
    padding: 4,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 32,
  },
  convItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
    marginBottom: 6,
    backgroundColor: '#0F1626',
    borderWidth: 1,
    borderColor: '#1A2438',
  },
  convItemUnread: {
    backgroundColor: '#121B2F',
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  convDetails: {
    flex: 1,
    marginLeft: 12,
  },
  convTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  recipientName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#F8FAFC',
    flex: 1,
    letterSpacing: -0.2,
  },
  recipientNameBold: {
    fontWeight: '700',
  },
  timeText: {
    fontSize: 11.5,
    color: '#64748B',
    marginLeft: 8,
  },
  timeTextUnread: {
    color: THEME.colors.primaryLight,
    fontWeight: '600',
  },
  convBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lastMessageText: {
    fontSize: 13,
    color: '#94A3B8',
    flex: 1,
    marginRight: 8,
  },
  lastMessageUnread: {
    color: '#E2E8F0',
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
    fontSize: 11,
    fontWeight: '700',
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F8FAFC',
  },
  emptySub: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 6,
    textAlign: 'center',
  },
});
