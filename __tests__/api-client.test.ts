import './setup';
import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert';
import { api, normalizeUrl } from '../src/api/api-client';

describe('ApiClient & normalizeUrl', () => {
  beforeEach(() => {
    api.setAccessToken(null);
    api.setBaseUrl('http://localhost:4000/api/v1');
  });

  test('normalizeUrl prepends http:// when protocol is missing', () => {
    assert.strictEqual(normalizeUrl('192.168.1.50:4000'), 'http://192.168.1.50:4000');
    assert.strictEqual(normalizeUrl('localhost:4000/api'), 'http://localhost:4000/api');
  });

  test('normalizeUrl strips trailing slashes', () => {
    assert.strictEqual(normalizeUrl('http://localhost:4000///'), 'http://localhost:4000');
    assert.strictEqual(normalizeUrl('https://mivo.app/api/v1/'), 'https://mivo.app/api/v1');
  });

  test('api token management works correctly', () => {
    assert.strictEqual(api.getAccessToken(), null);
    api.setAccessToken('test-jwt-token-xyz');
    assert.strictEqual(api.getAccessToken(), 'test-jwt-token-xyz');
    api.setAccessToken(null);
    assert.strictEqual(api.getAccessToken(), null);
  });

  test('api base url is normalized and stored', () => {
    api.setBaseUrl('10.0.2.2:4000/api/v1///');
    assert.strictEqual(api.getBaseUrl(), 'http://10.0.2.2:4000/api/v1');
  });

  test('api.request normalizes unwrapped raw JSON responses', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () =>
      new Response(JSON.stringify({ id: 'r1', name: 'General Stage' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });

    try {
      const res = await api.get<{ id: string; name: string }>('/rooms/r1');
      assert.strictEqual(res.success, true);
      assert.deepStrictEqual(res.data, { id: 'r1', name: 'General Stage' });
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  test('api.request preserves wrapped ApiResponse responses', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () =>
      new Response(
        JSON.stringify({
          success: true,
          data: { token: 'jwt123' },
          meta: { total: 1 },
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );

    try {
      const res = await api.post('/auth/login', { email: 'a@m.com', password: '123' });
      assert.strictEqual(res.success, true);
      assert.deepStrictEqual(res.data, { token: 'jwt123' });
      assert.strictEqual(res.meta?.total, 1);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  test('api.request parses NestJS error object with string error', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () =>
      new Response(
        JSON.stringify({
          statusCode: 401,
          message: 'Invalid email or password',
          error: 'Unauthorized',
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      );

    try {
      const res = await api.post('/auth/login', {});
      assert.strictEqual(res.success, false);
      assert.strictEqual(res.error?.code, 'Unauthorized');
      assert.strictEqual(res.error?.message, 'Invalid email or password');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  test('api.request handles validation error array safely', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () =>
      new Response(
        JSON.stringify({
          statusCode: 400,
          message: ['email must be an email', 'password is too short'],
          error: 'Bad Request',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );

    try {
      const res = await api.post('/auth/register', {});
      assert.strictEqual(res.success, false);
      assert.strictEqual(res.error?.code, 'Bad Request');
      assert.strictEqual(
        res.error?.message,
        'email must be an email, password is too short'
      );
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  test('api.request injects Authorization header when token is set', async () => {
    const originalFetch = globalThis.fetch;
    let capturedAuth: string | null = null;

    globalThis.fetch = async (_url, init) => {
      const headers = init?.headers as Record<string, string>;
      capturedAuth = headers?.['Authorization'] || null;
      return new Response(JSON.stringify({ success: true, data: { id: 'me' } }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    };

    try {
      api.setAccessToken('secret-token-abc');
      await api.get('/users/me');
      assert.strictEqual(capturedAuth, 'Bearer secret-token-abc');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});

