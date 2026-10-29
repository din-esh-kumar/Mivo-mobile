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

export const DEFAULT_COMMUNITIES: CommunityDTO[] = [
  {
    id: 'comm-1',
    name: 'Engineering Core',
    slug: 'eng-core',
    description: 'Core engineering, mobile architecture & stage infrastructure',
    ownerId: '1',
    createdAt: new Date().toISOString(),
    channels: [
      { id: 'chan-gen', communityId: 'comm-1', name: 'general', type: 'TEXT', position: 0, createdAt: '' },
      { id: 'chan-dev', communityId: 'comm-1', name: 'dev-chat', type: 'TEXT', position: 1, createdAt: '' },
      { id: 'chan-ann', communityId: 'comm-1', name: 'announcements', type: 'ANNOUNCEMENT', position: 2, createdAt: '' },
      { id: 'chan-voice-1', communityId: 'comm-1', name: 'Daily Standup Huddle', type: 'VOICE', position: 3, createdAt: '' },
      { id: 'chan-voice-2', communityId: 'comm-1', name: 'Watercooler Voice', type: 'VOICE', position: 4, createdAt: '' },
      { id: 'chan-stage-1', communityId: 'comm-1', name: 'All-Hands Townhall', type: 'STAGE', position: 5, createdAt: '' },
    ],
  },
  {
    id: 'comm-2',
    name: 'Product & Design',
    slug: 'product',
    description: 'Design systems, UI/UX polish & product roadmaps',
    ownerId: '1',
    createdAt: new Date().toISOString(),
    channels: [
      { id: 'chan-p-gen', communityId: 'comm-2', name: 'general-design', type: 'TEXT', position: 0, createdAt: '' },
      { id: 'chan-p-crit', communityId: 'comm-2', name: 'design-critique', type: 'STAGE', position: 1, createdAt: '' },
    ],
  },
];

export const useCommunityStore = create<CommunityState>((set, get) => ({
  communities: DEFAULT_COMMUNITIES,
  activeCommunity: DEFAULT_COMMUNITIES[0],
  channels: DEFAULT_COMMUNITIES[0].channels || [],
  activeChannel: DEFAULT_COMMUNITIES[0].channels?.[0] || null,
  isLoading: false,

  loadUserCommunities: async () => {
    set({ isLoading: true });
    try {
      const res = await communitiesApi.getUserCommunities();
      if (res.success && res.data && res.data.length > 0) {
        const communities = res.data;
        const currentActive = get().activeCommunity;
        const activeCommunity =
          communities.find((c) => c.id === currentActive?.id) || communities[0];

        set({ communities, activeCommunity, isLoading: false });

        if (activeCommunity) {
          await get().selectCommunity(activeCommunity);
        }
      } else {
        // Retain defaults if server returns empty list
        const currentActive = get().activeCommunity || DEFAULT_COMMUNITIES[0];
        set({
          communities: DEFAULT_COMMUNITIES,
          activeCommunity: currentActive,
          channels: currentActive.channels || DEFAULT_COMMUNITIES[0].channels || [],
          isLoading: false,
        });
      }
    } catch {
      const currentActive = get().activeCommunity || DEFAULT_COMMUNITIES[0];
      set({
        communities: DEFAULT_COMMUNITIES,
        activeCommunity: currentActive,
        channels: currentActive.channels || DEFAULT_COMMUNITIES[0].channels || [],
        isLoading: false,
      });
    }
  },

  selectCommunity: async (community) => {
    set({ activeCommunity: community, isLoading: true });
    try {
      const res = await communitiesApi.getCommunityChannels(community.id);
      if (res.success && res.data && res.data.length > 0) {
        set({ channels: res.data, isLoading: false });
      } else {
        set({ channels: community.channels || [], isLoading: false });
      }
    } catch {
      set({ channels: community.channels || [], isLoading: false });
    }
  },

  selectChannel: (channel) => {
    set({ activeChannel: channel });
  },
}));

