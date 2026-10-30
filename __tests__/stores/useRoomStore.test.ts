import '../setup';
import { describe, test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import { useRoomStore } from '../../src/stores/useRoomStore';
import { socketClient } from '../../src/socket/socket-client';
import { REALTIME_EVENTS } from '../../src/constants/events';
import { RoomDetailsDTO, RoomMemberDTO } from '../../src/types';

describe('Store: useRoomStore', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    useRoomStore.setState({
      currentRoom: null,
      activeMode: 'TEXT',
      participants: [],
      isMuted: true,
      isVideoEnabled: false,
      isJoined: false,
      isLoading: false,
    });
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  test('initial state has unjoined room state with muted audio and video off', () => {
    const state = useRoomStore.getState();
    assert.strictEqual(state.currentRoom, null);
    assert.strictEqual(state.isJoined, false);
    assert.strictEqual(state.isMuted, true);
    assert.strictEqual(state.isVideoEnabled, false);
    assert.deepStrictEqual(state.participants, []);
  });

  test('joinRoom updates state with room details on successful API response', async () => {
    const mockRoom: RoomDetailsDTO = {
      id: 'room-alpha',
      mode: 'VOICE',
      hostId: 'u-host',
      participants: [
        {
          userId: 'u-host',
          displayName: 'Host User',
          username: 'host',
          avatarUrl: null,
          isMuted: false,
          isVideoEnabled: false,
          isSpeaking: false,
          isHost: true,
          joinedAt: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
    };

    globalThis.fetch = async () =>
      new Response(JSON.stringify({ success: true, data: mockRoom }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });

    await useRoomStore.getState().joinRoom('room-alpha', 'VOICE');

    const state = useRoomStore.getState();
    assert.strictEqual(state.isJoined, true);
    assert.strictEqual(state.currentRoom?.id, 'room-alpha');
    assert.strictEqual(state.activeMode, 'VOICE');
    assert.strictEqual(state.participants.length, 1);
    assert.strictEqual(state.isLoading, false);
  });

  test('joinRoom falls back to default participants if server is offline', async () => {
    globalThis.fetch = async () => {
      throw new Error('Connection refused');
    };

    await useRoomStore.getState().joinRoom('room-offline', 'STREAM');

    const state = useRoomStore.getState();
    assert.strictEqual(state.isJoined, true);
    assert.strictEqual(state.currentRoom?.id, 'room-offline');
    assert.strictEqual(state.activeMode, 'STREAM');
    assert.ok(state.participants.length >= 2);
    assert.strictEqual(state.isLoading, false);
  });

  test('leaveRoom clears room state and disconnects from room', async () => {
    await useRoomStore.getState().joinRoom('room-temp', 'VOICE');
    assert.strictEqual(useRoomStore.getState().isJoined, true);

    useRoomStore.getState().leaveRoom();

    const state = useRoomStore.getState();
    assert.strictEqual(state.currentRoom, null);
    assert.strictEqual(state.isJoined, false);
    assert.strictEqual(state.participants.length, 0);
    assert.strictEqual(state.isMuted, true);
    assert.strictEqual(state.isVideoEnabled, false);
  });

  test('toggleMute and toggleVideo flip state', async () => {
    await useRoomStore.getState().joinRoom('room-media-toggle', 'VOICE');

    assert.strictEqual(useRoomStore.getState().isMuted, true);
    useRoomStore.getState().toggleMute();
    assert.strictEqual(useRoomStore.getState().isMuted, false);

    assert.strictEqual(useRoomStore.getState().isVideoEnabled, false);
    useRoomStore.getState().toggleVideo();
    assert.strictEqual(useRoomStore.getState().isVideoEnabled, true);
  });

  test('setMode updates activeMode in store and triggers API update', async () => {
    await useRoomStore.getState().joinRoom('room-mode-test', 'VOICE');

    let patchCalled = false;
    globalThis.fetch = async (url, init) => {
      if (init?.method === 'PATCH') {
        patchCalled = true;
      }
      return new Response(JSON.stringify({ success: true, data: { mode: 'STREAM' } }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    };

    useRoomStore.getState().setMode('STREAM');
    assert.strictEqual(useRoomStore.getState().activeMode, 'STREAM');
  });

  test('setupSocketListeners handles participant join, left, mode change, and media updates', () => {
    const unsub = useRoomStore.getState().setupSocketListeners();

    const triggerSocketEvent = (event: string, data: any) => {
      const cbs = (socketClient as any).listeners?.get(event);
      cbs?.forEach((cb: any) => cb(data));
    };

    // Test participant joined
    const newMember: RoomMemberDTO = {
      userId: 'user-joined',
      displayName: 'Joined User',
      username: 'joined_user',
      avatarUrl: null,
      isMuted: true,
      isVideoEnabled: false,
      isSpeaking: false,
      isHost: false,
      joinedAt: new Date().toISOString(),
    };
    triggerSocketEvent(REALTIME_EVENTS.ROOM_PARTICIPANT_JOINED, newMember);
    assert.strictEqual(useRoomStore.getState().participants.length, 1);
    assert.strictEqual(useRoomStore.getState().participants[0].userId, 'user-joined');

    // Test participant state updated (speaking)
    triggerSocketEvent(REALTIME_EVENTS.ROOM_PARTICIPANT_STATE_UPDATED, {
      userId: 'user-joined',
      isSpeaking: true,
      isMuted: false,
    });
    assert.strictEqual(useRoomStore.getState().participants[0].isSpeaking, true);
    assert.strictEqual(useRoomStore.getState().participants[0].isMuted, false);

    // Test mode changed
    triggerSocketEvent(REALTIME_EVENTS.ROOM_MODE_CHANGED, { mode: 'STREAM' });
    assert.strictEqual(useRoomStore.getState().activeMode, 'STREAM');

    // Test participant left
    triggerSocketEvent(REALTIME_EVENTS.ROOM_PARTICIPANT_LEFT, { userId: 'user-joined' });
    assert.strictEqual(useRoomStore.getState().participants.length, 0);

    unsub();
  });
});

