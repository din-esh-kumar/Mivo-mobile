import { api } from './api-client';
import { CommunityDTO, ChannelDTO } from '../types';

export const communitiesApi = {
  getUserCommunities: async () => {
    return api.get<CommunityDTO[]>('/communities/me');
  },

  getCommunityChannels: async (communityId: string) => {
    return api.get<ChannelDTO[]>(`/communities/${communityId}/channels`);
  },

  getChannel: async (channelId: string) => {
    return api.get<ChannelDTO>(`/channels/${channelId}`);
  },
};

