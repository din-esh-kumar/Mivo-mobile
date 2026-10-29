import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { THEME } from '../../src/constants/theme';
import { useConversationStore } from '../../src/stores/useConversationStore';
import { useAuthStore } from '../../src/stores/useAuthStore';
import { ConversationDTO } from '../../src/types';
import { Avatar } from '../../src/components/Avatar';
import { Search, Plus, MessageSquare } from 'lucide-react-native';

export default function ConversationsScreen() {
  const router = useRouter();
  const currentUser = useAuthStore((s) => s.user);
  const { conversations, loadConversations, selectConversation } =
    useConversationStore();

  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadConversations();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadConversations();
    setRefreshing(false);
  };

  const getRecipient = (conv: ConversationDTO) => {
    const other = conv.participants?.find((p) => p.userId !== currentUser?.id);
    return other?.user || { displayName: conv.name || 'Chat', status: 'OFFLINE' };
  };

  // Sample conversations if empty
  const displayConversations =
    conversations.length > 0
      ? conversations
      : [
          {
            id: 'dm-1',
            type: 'DIRECT' as const,
            participants: [
              {
                id: 'p1',
                userId: 'user-2',
                user: {
                  id: 'user-2',
                  username: 'sarah_pm',
                  displayName: 'Sarah Jenkins',
                  status: 'ONLINE' as const,
                },
                joinedAt: '',
              },
            ],
            lastMessage: {
              id: 'm1',
              authorId: 'user-2',
              author: { id: 'user-2', username: 'sarah_pm', displayName: 'Sarah' },
              content: 'Hey, did you review the latest WebRTC mesh latency graphs?',
              createdAt: new Date().toISOString(),
            },
            unreadCount: 2,
            createdAt: '',
          },
          {
            id: 'dm-2',
            type: 'DIRECT' as const,
            participants: [
              {
                id: 'p2',
                userId: 'user-3',
                user: {
                  id: 'user-3',
                  username: 'marcus_eng',
                  displayName: 'Marcus Vance',
                  status: 'IDLE' as const,
                },
                joinedAt: '',
              },
            ],
            lastMessage: {
              id: 'm2',
              authorId: 'user-3',
              author: { id: 'user-3', username: 'marcus_eng', displayName: 'Marcus' },
              content: 'I merged the PR for the NestJS 11 Gateway.',
              createdAt: new Date(Date.now() - 3600000).toISOString(),
            },
            unreadCount: 0,
            createdAt: '',
          },
        ];

  const filteredConversations = displayConversations.filter((c) => {
    const recipient = getRecipient(c as ConversationDTO);
    return recipient.displayName
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

        <TouchableOpacity style={styles.newChatBtn}>
          <Plus size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <Search size={18} color={THEME.colors.textMuted} />
        <TextInput
          placeholder="Search direct messages..."
          placeholderTextColor={THEME.colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
        />
      </View>

      {/* Conversations List */}
      <FlatList
        data={filteredConversations as ConversationDTO[]}
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
                  {item.lastMessage && (
                    <Text style={styles.timeText}>
                      {new Date(item.lastMessage.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  )}
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
