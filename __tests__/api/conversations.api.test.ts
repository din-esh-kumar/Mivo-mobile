import '../setup';
import { test, describe } from 'node:test';
import assert from 'node:assert';
import { conversationsApi } from '../../src/api/conversations.api';

describe('API: conversations.api', () => {
  test('getUserConversations calls /conversations', async () => {
    const originalFetch = globalThis.fetch;
    let endpoint = '';

    globalThis.fetch = async (url) => {
      endpoint = String(url);
      return new Response(
        JSON.stringify({
          success: true,
          data: [{ id: 'conv-1', type: 'DIRECT' }],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    };

    try {
      const res = await conversationsApi.getUserConversations();
      assert.ok(endpoint.includes('/conversations'));
      assert.strictEqual(res.success, true);
      assert.strictEqual(res.data?.[0].id, 'conv-1');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  test('getConversationMessages formats query params limit & before', async () => {
    const originalFetch = globalThis.fetch;
    let endpoint = '';

    globalThis.fetch = async (url) => {
      endpoint = String(url);
      return new Response(
        JSON.stringify({
          success: true,
          data: [{ id: 'm1', content: 'hello' }],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    };

    try {
      const res = await conversationsApi.getConversationMessages('conv-99', 30, '2026-10-29');
      assert.ok(endpoint.includes('/conversations/conv-99/messages?limit=30&before=2026-10-29'));
      assert.strictEqual(res.success, true);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  test('getChannelMessages formats query params limit & before', async () => {
    const originalFetch = globalThis.fetch;
    let endpoint = '';

    globalThis.fetch = async (url) => {
      endpoint = String(url);
      return new Response(
        JSON.stringify({
          success: true,
          data: [{ id: 'm2', content: 'channel msg' }],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    };

    try {
      const res = await conversationsApi.getChannelMessages('chan-100', 50);
      assert.ok(endpoint.includes('/channels/chan-100/messages?limit=50'));
      assert.strictEqual(res.success, true);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  test('createDirectConversation posts recipientUserId', async () => {
    const originalFetch = globalThis.fetch;
    let body = '';

    globalThis.fetch = async (_url, init) => {
      body = String(init?.body);
      return new Response(
        JSON.stringify({
          success: true,
          data: { id: 'conv-new', type: 'DIRECT' },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    };

    try {
      const res = await conversationsApi.createDirectConversation('user-target-id');
      assert.ok(body.includes('user-target-id'));
      assert.strictEqual(res.success, true);
      assert.strictEqual(res.data?.id, 'conv-new');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});

