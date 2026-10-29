import { create } from 'zustand';
import { ConversationDTO, ChatMessageDTO } from '../types';
import { conversationsApi } from '../api/conversations.api';
import { socketClient } from '../socket/socket-client';
import { REALTIME_EVENTS } from '../constants/events';

interface ConversationState {
  conversations: ConversationDTO[];
  activeConversation: ConversationDTO | null;
  messages: Record<string, ChatMessageDTO[]>; // key is channelId or conversationId
  typingUsers: Record<string, string[]>;
  isLoading: boolean;
  loadConversations: () => Promise<void>;
  selectConversation: (conversation: ConversationDTO) => Promise<void>;
  loadChannelMessages: (channelId: string) => Promise<void>;
  sendMessage: (targetId: string, content: string, isDm: boolean, replyToId?: string) => void;
  setupSocketListeners: () => () => void;
}

export const useConversationStore = create<ConversationState>((set, get) => ({
  conversations: [],
  activeConversation: null,
  messages: {},
  typingUsers: {},
  isLoading: false,

  loadConversations: async () => {
    set({ isLoading: true });
    try {
      const res = await conversationsApi.getUserConversations();
      if (res.success && res.data) {
        set({ conversations: res.data, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  selectConversation: async (conversation) => {
    set({ activeConversation: conversation });
    socketClient.joinConversation(conversation.id);

    try {
      const res = await conversationsApi.getConversationMessages(conversation.id);
      if (res.success && res.data) {
        set((state) => ({
          messages: {
            ...state.messages,
            [conversation.id]: res.data || [],
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
    if (isDm) {
      socketClient.sendDirectMessage(targetId, content, replyToId);
    } else {
      socketClient.sendChannelMessage(targetId, content, replyToId);
    }
  },

  setupSocketListeners: () => {
    const unsubDm = socketClient.on(REALTIME_EVENTS.DM_NEW_MESSAGE, (msg: ChatMessageDTO) => {
      const convId = msg.conversationId;
      if (!convId) return;

      set((state) => {
        const existing = state.messages[convId] || [];
        // Avoid duplicate by id
        if (existing.some((m) => m.id === msg.id)) return state;

        return {
          messages: {
            ...state.messages,
            [convId]: [...existing, msg],
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

        return {
          messages: {
            ...state.messages,
            [chanId]: [...existing, msg],
          },
        };
      });
    });

    return () => {
      unsubDm();
      unsubChat();
    };
  },
}));

