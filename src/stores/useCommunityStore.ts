import { create } from 'zustand';
import { CommunityDTO, ChannelDTO } from '../types';
import { communitiesApi } from '../api/communities.api';

interface CommunityState {
  communities: CommunityDTO[];
  activeCommunity: CommunityDTO | null;
  channels: ChannelDTO[];
  activeChannel: ChannelDTO | null;
  isLoading: boolean;
  loadUserCommunities: () => Promise<void>;
  selectCommunity: (community: CommunityDTO) => Promise<void>;
  selectChannel: (channel: ChannelDTO | null) => void;
}

export const useCommunityStore = create<CommunityState>((set, get) => ({
  communities: [],
  activeCommunity: null,
  channels: [],
  activeChannel: null,
  isLoading: false,

  loadUserCommunities: async () => {
    set({ isLoading: true });
    try {
      const res = await communitiesApi.getUserCommunities();
      if (res.success && res.data) {
        const communities = res.data;
        const currentActive = get().activeCommunity;
        const activeCommunity =
          communities.find((c) => c.id === currentActive?.id) || communities[0] || null;

        set({ communities, activeCommunity, isLoading: false });

        if (activeCommunity) {
          get().selectCommunity(activeCommunity);
        }
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  selectCommunity: async (community) => {
    set({ activeCommunity: community, isLoading: true });
    try {
      const res = await communitiesApi.getCommunityChannels(community.id);
      if (res.success && res.data) {
        set({ channels: res.data, isLoading: false });
      } else {
        set({ channels: [], isLoading: false });
      }
    } catch {
      set({ channels: [], isLoading: false });
    }
  },

  selectChannel: (channel) => {
    set({ activeChannel: channel });
  },
}));

