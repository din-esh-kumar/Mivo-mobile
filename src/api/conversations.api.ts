import { api } from './api-client';
import { ConversationDTO, ChatMessageDTO } from '../types';

export const conversationsApi = {
  getUserConversations: async () => {
    return api.get<ConversationDTO[]>('/conversations');
  },

  getConversationMessages: async (conversationId: string, limit = 50, before?: string) => {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (before) params.append('before', before);
    return api.get<ChatMessageDTO[]>(`/conversations/${conversationId}/messages?${params}`);
  },

  getChannelMessages: async (channelId: string, limit = 50, before?: string) => {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (before) params.append('before', before);
    return api.get<ChatMessageDTO[]>(`/channels/${channelId}/messages?${params}`);
  },

  createDirectConversation: async (recipientUserId: string) => {
    return api.post<ConversationDTO>('/conversations', { recipientUserId });
  },
};

