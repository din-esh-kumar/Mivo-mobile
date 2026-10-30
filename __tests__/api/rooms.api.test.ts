import '../setup';
import { test, describe } from 'node:test';
import assert from 'node:assert';
import { roomsApi } from '../../src/api/rooms.api';

describe('API: rooms.api', () => {
  test('getRoomDetails calls /rooms/:id', async () => {
    const originalFetch = globalThis.fetch;
    let endpoint = '';

    globalThis.fetch = async (url) => {
      endpoint = String(url);
      return new Response(
        JSON.stringify({
          success: true,
          data: { id: 'room-50', mode: 'VOICE', participants: [] },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    };

    try {
      const res = await roomsApi.getRoomDetails('room-50');
      assert.ok(endpoint.includes('/rooms/room-50'));
      assert.strictEqual(res.success, true);
      assert.strictEqual(res.data?.mode, 'VOICE');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  test('changeMode patches /rooms/:id/mode', async () => {
    const originalFetch = globalThis.fetch;
    let endpoint = '';
    let method = '';
    let body = '';

    globalThis.fetch = async (url, init) => {
      endpoint = String(url);
      method = String(init?.method);
      body = String(init?.body);
      return new Response(
        JSON.stringify({
          success: true,
          data: { id: 'room-50', mode: 'STREAM' },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    };

    try {
      const res = await roomsApi.changeMode('room-50', 'STREAM');
      assert.ok(endpoint.includes('/rooms/room-50/mode'));
      assert.strictEqual(method, 'PATCH');
      assert.ok(body.includes('STREAM'));
      assert.strictEqual(res.success, true);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});

