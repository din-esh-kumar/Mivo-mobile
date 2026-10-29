import '../setup';
import { test, describe } from 'node:test';
import assert from 'node:assert';
import { communitiesApi } from '../../src/api/communities.api';

describe('API: communities.api', () => {
  test('getUserCommunities calls /communities/me', async () => {
    const originalFetch = globalThis.fetch;
    let endpoint = '';

    globalThis.fetch = async (url) => {
      endpoint = String(url);
      return new Response(
        JSON.stringify({
          success: true,
          data: [{ id: 'comm-1', name: 'Engineering Core' }],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    };

    try {
      const res = await communitiesApi.getUserCommunities();
      assert.ok(endpoint.includes('/communities/me'));
      assert.strictEqual(res.success, true);
      assert.strictEqual(res.data?.[0].name, 'Engineering Core');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  test('getCommunityChannels calls /communities/:id/channels', async () => {
    const originalFetch = globalThis.fetch;
    let endpoint = '';

    globalThis.fetch = async (url) => {
      endpoint = String(url);
      return new Response(
        JSON.stringify({
          success: true,
          data: [{ id: 'chan-1', name: 'general', type: 'TEXT' }],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    };

    try {
      const res = await communitiesApi.getCommunityChannels('comm-42');
      assert.ok(endpoint.includes('/communities/comm-42/channels'));
      assert.strictEqual(res.success, true);
      assert.strictEqual(res.data?.[0].name, 'general');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  test('getChannel calls /channels/:id', async () => {
    const originalFetch = globalThis.fetch;
    let endpoint = '';

    globalThis.fetch = async (url) => {
      endpoint = String(url);
      return new Response(
        JSON.stringify({
          success: true,
          data: { id: 'chan-gen', name: 'general', type: 'TEXT' },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    };

    try {
      const res = await communitiesApi.getChannel('chan-gen');
      assert.ok(endpoint.includes('/channels/chan-gen'));
      assert.strictEqual(res.success, true);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});

