import { create } from 'zustand';
import { ConversationDTO, ChatMessageDTO, UserSummaryDTO } from '../types';
import { conversationsApi } from '../api/conversations.api';
import { socketClient } from '../socket/socket-client';
import { REALTIME_EVENTS } from '../constants/events';
import { useAuthStore } from './useAuthStore';

interface ConversationState {
  conversations: ConversationDTO[];
  activeConversation: ConversationDTO | null;
  messages: Record<string, ChatMessageDTO[]>; // key is channelId or conversationId
  typingUsers: Record<string, string[]>; // targetId -> list of usernames
  isLoading: boolean;
  loadConversations: () => Promise<void>;
  selectConversation: (conversation: ConversationDTO) => Promise<void>;
  loadChannelMessages: (channelId: string) => Promise<void>;
  loadConversationMessages: (conversationId: string) => Promise<void>;
  sendMessage: (targetId: string, content: string, isDm: boolean, replyToId?: string) => void;
  sendTyping: (targetId: string, isDm: boolean) => void;
  createDirectConversation: (recipientUserId: string) => Promise<{ success: boolean; data?: ConversationDTO; error?: string }>;
  setupSocketListeners: () => () => void;
}

export const DEFAULT_CONVERSATIONS: ConversationDTO[] = [
  {
    id: 'dm-1',
    type: 'DIRECT',
    participants: [
      {
        id: 'p1',
        userId: 'user-2',
        user: {
          id: 'user-2',
          username: 'sarah_pm',
          displayName: 'Sarah Jenkins',
          status: 'ONLINE',
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
    type: 'DIRECT',
    participants: [
      {
        id: 'p2',
        userId: 'user-3',
        user: {
          id: 'user-3',
          username: 'marcus_eng',
          displayName: 'Marcus Vance',
          status: 'IDLE',
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

export const useConversationStore = create<ConversationState>((set, get) => ({
  conversations: DEFAULT_CONVERSATIONS,
  activeConversation: null,
  messages: {},
  typingUsers: {},
  isLoading: false,

  loadConversations: async () => {
    set({ isLoading: true });
    try {
      const res = await conversationsApi.getUserConversations();
      if (res.success && res.data && res.data.length > 0) {
        set({ conversations: res.data, isLoading: false });
      } else {
        set({ conversations: DEFAULT_CONVERSATIONS, isLoading: false });
      }
    } catch {
      set({ conversations: DEFAULT_CONVERSATIONS, isLoading: false });
    }
  },

  selectConversation: async (conversation) => {
    set({ activeConversation: conversation });
    socketClient.joinConversation(conversation.id);
    await get().loadConversationMessages(conversation.id);
  },

  loadConversationMessages: async (conversationId: string) => {
    try {
      const res = await conversationsApi.getConversationMessages(conversationId);
      if (res.success && res.data) {
        set((state) => ({
          messages: {
            ...state.messages,
            [conversationId]: res.data || [],
          },
        }));
      }
    } catch (err) {
      console.warn('Failed to fetch conversation messages:', err);
    }
  },

  loadChannelMessages: async (channelId: string) => {
    try {
      const res = await conversationsApi.getChannelMessages(channelId);
      if (res.success && res.data) {
        set((state) => ({
          messages: {
            ...state.messages,
            [channelId]: res.data || [],
          },
        }));
      }
    } catch (err) {
      console.warn('Failed to fetch channel messages:', err);
    }
  },

  sendMessage: (targetId, content, isDm, replyToId) => {
    const currentUser = useAuthStore.getState().user;
    const author: UserSummaryDTO = {
      id: currentUser?.id || 'me',
      username: currentUser?.username || 'you',
      displayName: currentUser?.displayName || 'You',
      avatarUrl: currentUser?.avatarUrl,
      status: currentUser?.status || 'ONLINE',
    };

    const optimisticId = 'msg-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
    const existingMessages = get().messages[targetId] || [];
    const replyTarget = replyToId ? existingMessages.find((m) => m.id === replyToId) : null;

    const newMsg: ChatMessageDTO = {
      id: optimisticId,
      channelId: isDm ? undefined : targetId,
      conversationId: isDm ? targetId : undefined,
      authorId: author.id,
      author,
      content,
      replyToMessageId: replyToId,
      replyTo: replyTarget
        ? {
            id: replyTarget.id,
            content: replyTarget.content,
            author: replyTarget.author,
          }
        : null,
      createdAt: new Date().toISOString(),
    };

    // Optimistically update local message thread
    set((state) => ({
      messages: {
        ...state.messages,
        [targetId]: [...(state.messages[targetId] || []), newMsg],
      },
    }));

    // Send over socket
    if (isDm) {
      socketClient.sendDirectMessage(targetId, content, replyToId);
    } else {
      socketClient.sendChannelMessage(targetId, content, replyToId);
    }
  },

  sendTyping: (targetId, isDm) => {
    if (isDm) {
      socketClient.sendTyping(undefined, targetId);
    } else {
      socketClient.sendTyping(targetId, undefined);
    }
  },

  createDirectConversation: async (recipientUserId: string) => {
    try {
      const res = await conversationsApi.createDirectConversation(recipientUserId);
      if (res.success && res.data) {
        const newConv = res.data;
        set((state) => ({
          conversations: [newConv, ...state.conversations.filter((c) => c.id !== newConv.id)],
        }));
        return { success: true, data: newConv };
      }
      return { success: false, error: res.error?.message || 'Failed to start conversation' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to start conversation' };
    }
  },

  setupSocketListeners: () => {
    const unsubDm = socketClient.on(REALTIME_EVENTS.DM_NEW_MESSAGE, (msg: ChatMessageDTO) => {
      const convId = msg.conversationId;
      if (!convId) return;

      set((state) => {
        const existing = state.messages[convId] || [];
        if (existing.some((m) => m.id === msg.id)) return state;

        // Replace matching optimistic message if any
        const optIndex = existing.findIndex(
          (m) =>
            m.id.startsWith('msg-') &&
            m.authorId === msg.authorId &&
            m.content === msg.content
        );

        let updated: ChatMessageDTO[];
        if (optIndex !== -1) {
          updated = [...existing];
          updated[optIndex] = msg;
        } else {
          updated = [...existing, msg];
        }

        return {
          messages: {
            ...state.messages,
            [convId]: updated,
          },
        };
      });
    });

    const unsubChat = socketClient.on(REALTIME_EVENTS.CHAT_NEW_MESSAGE, (msg: ChatMessageDTO) => {
      const chanId = msg.channelId;
      if (!chanId) return;

      set((state) => {
        const existing = state.messages[chanId] || [];
        if (existing.some((m) => m.id === msg.id)) return state;

        // Replace matching optimistic message if any
        const optIndex = existing.findIndex(
          (m) =>
            m.id.startsWith('msg-') &&
            m.authorId === msg.authorId &&
            m.content === msg.content
        );

        let updated: ChatMessageDTO[];
        if (optIndex !== -1) {
          updated = [...existing];
          updated[optIndex] = msg;
        } else {
          updated = [...existing, msg];
        }

        return {
          messages: {
            ...state.messages,
            [chanId]: updated,
          },
        };
      });
    });

    const unsubTypingChat = socketClient.on(
      REALTIME_EVENTS.CHAT_TYPING,
      (data: { channelId: string; username: string }) => {
        if (!data?.channelId || !data?.username) return;
        set((state) => {
          const current = state.typingUsers[data.channelId] || [];
          if (current.includes(data.username)) return state;
          return {
            typingUsers: {
              ...state.typingUsers,
              [data.channelId]: [...current, data.username],
            },
          };
        });
      }
    );

    const unsubTypingDm = socketClient.on(
      REALTIME_EVENTS.DM_TYPING,
      (data: { conversationId: string; username: string }) => {
        if (!data?.conversationId || !data?.username) return;
        set((state) => {
          const current = state.typingUsers[data.conversationId] || [];
          if (current.includes(data.username)) return state;
          return {
            typingUsers: {
              ...state.typingUsers,
              [data.conversationId]: [...current, data.username],
            },
          };
        });
      }
    );

    return () => {
      unsubDm();
      unsubChat();
      unsubTypingChat();
      unsubTypingDm();
    };
  },
}));

