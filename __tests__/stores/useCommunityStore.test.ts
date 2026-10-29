import '../setup';
import { describe, test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import { useCommunityStore, DEFAULT_COMMUNITIES } from '../../src/stores/useCommunityStore';
import { CommunityDTO, ChannelDTO } from '../../src/types';

describe('Store: useCommunityStore', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    useCommunityStore.setState({
      communities: DEFAULT_COMMUNITIES,
      activeCommunity: DEFAULT_COMMUNITIES[0],
      channels: DEFAULT_COMMUNITIES[0].channels || [],
      activeChannel: DEFAULT_COMMUNITIES[0].channels?.[0] || null,
      isLoading: false,
    });
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  test('initial state has default fallback communities and active channel', () => {
    const state = useCommunityStore.getState();
    assert.ok(state.communities.length >= 2);
    assert.strictEqual(state.activeCommunity?.name, 'Engineering Core');
    assert.strictEqual(state.activeChannel?.name, 'general');
    assert.strictEqual(state.isLoading, false);
  });

  test('loadUserCommunities updates communities and triggers selectCommunity when server returns data', async () => {
    const mockCommunities: CommunityDTO[] = [
      {
        id: 'c-remote-1',
        name: 'Distributed Systems',
        slug: 'dist-sys',
        description: 'Systems design',
        ownerId: 'u-1',
        createdAt: '',
      },
    ];

    const mockChannels: ChannelDTO[] = [
      {
        id: 'chan-raft',
        communityId: 'c-remote-1',
        name: 'consensus-raft',
        type: 'TEXT',
        position: 0,
        createdAt: '',
      },
    ];

    globalThis.fetch = async (url) => {
      const u = String(url);
      if (u.includes('/communities/me')) {
        return new Response(JSON.stringify({ success: true, data: mockCommunities }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      if (u.includes('/channels')) {
        return new Response(JSON.stringify({ success: true, data: mockChannels }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return new Response('{}', { status: 200 });
    };

    await useCommunityStore.getState().loadUserCommunities();

    const state = useCommunityStore.getState();
    assert.strictEqual(state.communities.length, 1);
    assert.strictEqual(state.communities[0].name, 'Distributed Systems');
    assert.strictEqual(state.activeCommunity?.id, 'c-remote-1');
    assert.strictEqual(state.channels.length, 1);
    assert.strictEqual(state.channels[0].name, 'consensus-raft');
    assert.strictEqual(state.isLoading, false);
  });

  test('loadUserCommunities retains default communities when API fails', async () => {
    globalThis.fetch = async () => {
      throw new Error('Connection refused');
    };

    await useCommunityStore.getState().loadUserCommunities();

    const state = useCommunityStore.getState();
    assert.strictEqual(state.communities.length, DEFAULT_COMMUNITIES.length);
    assert.strictEqual(state.activeCommunity?.id, DEFAULT_COMMUNITIES[0].id);
    assert.strictEqual(state.isLoading, false);
  });

  test('selectCommunity fetches channels for the selected community', async () => {
    const targetCommunity: CommunityDTO = {
      id: 'comm-custom',
      name: 'Mobile Architects',
      slug: 'mobile-arch',
      ownerId: 'u-2',
      createdAt: '',
    };

    const targetChannels: ChannelDTO[] = [
      {
        id: 'chan-rn',
        communityId: 'comm-custom',
        name: 'react-native-0.88',
        type: 'TEXT',
        position: 0,
        createdAt: '',
      },
      {
        id: 'chan-expo',
        communityId: 'comm-custom',
        name: 'expo-sdk-58',
        type: 'VOICE',
        position: 1,
        createdAt: '',
      },
    ];

    globalThis.fetch = async () =>
      new Response(JSON.stringify({ success: true, data: targetChannels }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });

    await useCommunityStore.getState().selectCommunity(targetCommunity);

    const state = useCommunityStore.getState();
    assert.strictEqual(state.activeCommunity?.name, 'Mobile Architects');
    assert.strictEqual(state.channels.length, 2);
    assert.strictEqual(state.channels[1].name, 'expo-sdk-58');
  });

  test('selectChannel updates activeChannel pointer', () => {
    const channel: ChannelDTO = {
      id: 'chan-voice-standup',
      communityId: 'comm-1',
      name: 'Daily Standup Huddle',
      type: 'VOICE',
      position: 3,
      createdAt: '',
    };

    useCommunityStore.getState().selectChannel(channel);
    assert.strictEqual(useCommunityStore.getState().activeChannel?.name, 'Daily Standup Huddle');
    assert.strictEqual(useCommunityStore.getState().activeChannel?.type, 'VOICE');
  });
});

