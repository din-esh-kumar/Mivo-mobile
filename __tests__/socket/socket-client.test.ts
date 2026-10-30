import '../setup';
import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert';
import { socketClient } from '../../src/socket/socket-client';
import { REALTIME_EVENTS } from '../../src/constants/events';

describe('Socket: socket-client', () => {
  beforeEach(() => {
    socketClient.disconnect();
  });

  test('getWsUrl returns normalized default WS URL', async () => {
    const url = await socketClient.getWsUrl();
    assert.match(url, /^https?:\/\//);
    assert.strictEqual(url.endsWith('/'), false);
  });

  test('setWsUrl normalizes endpoint and stores it', async () => {
    await socketClient.setWsUrl('192.168.1.15:4000///');
    const url = await socketClient.getWsUrl();
    assert.strictEqual(url, 'http://192.168.1.15:4000');
  });

  test('event listeners can be registered, invoked, and cleaned up', () => {
    let callCount = 0;
    const testPayload = { id: 'm1', content: 'Hello test' };

    const unsubscribe = socketClient.on(REALTIME_EVENTS.CHAT_NEW_MESSAGE, (msg) => {
      callCount++;
      assert.deepStrictEqual(msg, testPayload);
    });

    const listenersMap = (socketClient as any).listeners.get(REALTIME_EVENTS.CHAT_NEW_MESSAGE);
    assert.ok(listenersMap);
    assert.strictEqual(listenersMap.size, 1);

    listenersMap.forEach((cb: any) => cb(testPayload));
    assert.strictEqual(callCount, 1);

    unsubscribe();
    assert.strictEqual(listenersMap.size, 0);
  });

  test('disconnect clears tokens, rooms, and state', () => {
    socketClient.joinRoom('room-alpha');
    socketClient.joinConversation('conv-beta');

    assert.strictEqual((socketClient as any).joinedRooms.has('room-alpha'), true);
    assert.strictEqual((socketClient as any).joinedDms.has('conv-beta'), true);

    socketClient.disconnect();

    assert.strictEqual((socketClient as any).joinedRooms.size, 0);
    assert.strictEqual((socketClient as any).joinedDms.size, 0);
    assert.strictEqual(socketClient.isConnected(), false);
  });

  test('room and dm methods track active targets', () => {
    socketClient.joinRoom('room-123');
    assert.strictEqual((socketClient as any).joinedRooms.has('room-123'), true);
    socketClient.leaveRoom('room-123');
    assert.strictEqual((socketClient as any).joinedRooms.has('room-123'), false);

    socketClient.joinConversation('dm-456');
    assert.strictEqual((socketClient as any).joinedDms.has('dm-456'), true);
    socketClient.leaveConversation('dm-456');
    assert.strictEqual((socketClient as any).joinedDms.has('dm-456'), false);
  });
});

