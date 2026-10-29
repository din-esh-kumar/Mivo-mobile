import './setup';
import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert';
import { useConfigStore } from '../src/stores/useConfigStore';
import { useAuthStore } from '../src/stores/useAuthStore';
import { useCommunityStore } from '../src/stores/useCommunityStore';
import { useConversationStore } from '../src/stores/useConversationStore';
import { useRoomStore } from '../src/stores/useRoomStore';
import { mockStorage } from './setup';
import { api } from '../src/api/api-client';
import { socketClient } from '../src/socket/socket-client';
import { REALTIME_EVENTS } from '../src/constants/events';
import { ChatMessageDTO } from '../src/types';

describe('Zustand Stores', () => {
  beforeEach(async () => {
    await mockStorage.clear();
    api.setAccessToken(null);
    socketClient.disconnect();
  });

  describe('useConfigStore', () => {
    test('updateEndpoints normalizes protocol and sets base URLs', async () => {
      await useConfigStore.getState().updateEndpoints('192.168.1.100:4000/api', '192.168.1.100:4000/');
      const state = useConfigStore.getState();
      assert.strictEqual(state.apiUrl, 'http://192.168.1.100:4000/api');
      assert.strictEqual(state.wsUrl, 'http://192.168.1.100:4000');
      assert.strictEqual(api.getBaseUrl(), 'http://192.168.1.100:4000/api');
    });

    test('resetToDefaults restores default endpoints', async () => {
      await useConfigStore.getState().resetToDefaults();
      const state = useConfigStore.getState();
      assert.ok(state.apiUrl.includes(':4000'));
      assert.ok(state.wsUrl.includes(':4000'));
    });
  });

  describe('useAuthStore', () => {
    test('loginAsGuest falls back to local demo user when server is unreachable', async () => {
      // Mock fetch to simulate offline network error
      const originalFetch = globalThis.fetch;
      globalThis.fetch = async () => {
        throw new Error('Failed to connect to backend server');
      };

      try {
        const result = await useAuthStore.getState().loginAsGuest('Test Explorer');
        assert.strictEqual(result.success, true);

        const state = useAuthStore.getState();
        assert.ok(state.user);
        assert.strictEqual(state.user.displayName, 'Test Explorer');
        assert.ok(state.token);
        assert.strictEqual(api.getAccessToken(), state.token);
      } finally {
        globalThis.fetch = originalFetch;
      }
    });

    test('logout clears user, token, and api credentials', async () => {
      await useAuthStore.getState().logout();
      const state = useAuthStore.getState();
      assert.strictEqual(state.user, null);
      assert.strictEqual(state.token, null);
      assert.strictEqual(api.getAccessToken(), null);
    });
  });

  describe('useCommunityStore', () => {
    test('initial state provides fallback communities and channels', () => {
      const state = useCommunityStore.getState();
      assert.ok(state.communities.length > 0);
      assert.ok(state.activeCommunity);
      assert.ok(state.channels.length > 0);
    });

    test('selectCommunity updates active community and channels', async () => {
      const state = useCommunityStore.getState();
      const targetCommunity = state.communities[1] || state.communities[0];

      await useCommunityStore.getState().selectCommunity(targetCommunity);
      const updated = useCommunityStore.getState();
      assert.strictEqual(updated.activeCommunity?.id, targetCommunity.id);
    });
  });

  describe('useConversationStore', () => {
    test('sendMessage adds optimistic message to state immediately', () => {
      useAuthStore.setState({
        user: {
          id: 'u-self',
          displayName: 'Myself',
          username: 'myself',
          email: 'me@mivo.local',
          status: 'ONLINE',
          createdAt: '',
        },
      });

      useConversationStore.getState().sendMessage('conv-1', 'Hello optimistic world!', true);
      const msgs = useConversationStore.getState().messages['conv-1'];
      assert.ok(msgs);
      assert.strictEqual(msgs.length, 1);
      assert.strictEqual(msgs[0].content, 'Hello optimistic world!');
      assert.strictEqual(msgs[0].author.displayName, 'Myself');
    });

    test('setupSocketListeners handles incoming DM messages and avoids duplicates', () => {
      const cleanup = useConversationStore.getState().setupSocketListeners();

      const incomingMsg: ChatMessageDTO = {
        id: 'server-msg-1',
        conversationId: 'conv-test-socket',
        authorId: 'u-sarah',
        author: { id: 'u-sarah', username: 'sarah', displayName: 'Sarah' },
        content: 'Hey from real-time socket!',
        createdAt: new Date().toISOString(),
      };

      const listeners = (socketClient as any).listeners.get(REALTIME_EVENTS.DM_NEW_MESSAGE);
      assert.ok(listeners);

      // Trigger socket event twice
      listeners.forEach((cb: any) => cb(incomingMsg));
      listeners.forEach((cb: any) => cb(incomingMsg));

      const msgs = useConversationStore.getState().messages['conv-test-socket'];
      assert.ok(msgs);
      // Deduplicated: should only have 1 entry
      assert.strictEqual(msgs.length, 1);
      assert.strictEqual(msgs[0].id, 'server-msg-1');

      cleanup();
    });
  });

  describe('useRoomStore', () => {
    test('joinRoom initializes active mode and participants', async () => {
      await useRoomStore.getState().joinRoom('room-test', 'VOICE');
      const state = useRoomStore.getState();
      assert.strictEqual(state.isJoined, true);
      assert.strictEqual(state.activeMode, 'VOICE');
      assert.strictEqual(state.currentRoom?.id, 'room-test');
      assert.ok(state.participants.length > 0);
    });

    test('toggleMute and toggleVideo flip media state', () => {
      const initialMuted = useRoomStore.getState().isMuted;
      useRoomStore.getState().toggleMute();
      assert.strictEqual(useRoomStore.getState().isMuted, !initialMuted);

      const initialVideo = useRoomStore.getState().isVideoEnabled;
      useRoomStore.getState().toggleVideo();
      assert.strictEqual(useRoomStore.getState().isVideoEnabled, !initialVideo);
    });

    test('setMode changes communication mode', () => {
      useRoomStore.getState().setMode('STREAM');
      assert.strictEqual(useRoomStore.getState().activeMode, 'STREAM');
      useRoomStore.getState().setMode('VIDEO');
      assert.strictEqual(useRoomStore.getState().activeMode, 'VIDEO');
    });

    test('leaveRoom resets room state', () => {
      useRoomStore.getState().leaveRoom();
      const state = useRoomStore.getState();
      assert.strictEqual(state.currentRoom, null);
      assert.strictEqual(state.isJoined, false);
      assert.strictEqual(state.participants.length, 0);
    });
  });
});

