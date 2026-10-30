import '../setup';
import { test, describe } from 'node:test';
import assert from 'node:assert';
import { authApi } from '../../src/api/auth.api';

describe('API: auth.api', () => {
  test('login sends credentials to /auth/login', async () => {
    const originalFetch = globalThis.fetch;
    let endpoint = '';
    let body = '';

    globalThis.fetch = async (url, init) => {
      endpoint = String(url);
      body = String(init?.body);
      return new Response(
        JSON.stringify({
          success: true,
          data: {
            accessToken: 'test-jwt',
            user: { id: 'u1', email: 'alex@mivo.app', displayName: 'Alex' },
          },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    };

    try {
      const res = await authApi.login('alex@mivo.app', 'Secret123!');
      assert.ok(endpoint.includes('/auth/login'));
      assert.ok(body.includes('alex@mivo.app'));
      assert.strictEqual(res.success, true);
      assert.strictEqual(res.data?.accessToken, 'test-jwt');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  test('register sends payload to /auth/register', async () => {
    const originalFetch = globalThis.fetch;
    let endpoint = '';
    let body = '';

    globalThis.fetch = async (url, init) => {
      endpoint = String(url);
      body = String(init?.body);
      return new Response(
        JSON.stringify({
          success: true,
          data: {
            accessToken: 'reg-jwt',
            user: { id: 'u2', email: 'reg@mivo.app', displayName: 'Reg User' },
          },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    };

    try {
      const res = await authApi.register({
        email: 'reg@mivo.app',
        username: 'reguser',
        displayName: 'Reg User',
        password: 'Password123!',
      });
      assert.ok(endpoint.includes('/auth/register'));
      assert.ok(body.includes('reguser'));
      assert.strictEqual(res.success, true);
      assert.strictEqual(res.data?.user.displayName, 'Reg User');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  test('guestLogin sends display name to /auth/guest', async () => {
    const originalFetch = globalThis.fetch;
    let endpoint = '';

    globalThis.fetch = async (url) => {
      endpoint = String(url);
      return new Response(
        JSON.stringify({
          success: true,
          data: {
            accessToken: 'guest-jwt',
            user: { id: 'g1', displayName: 'Demo Visitor' },
          },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    };

    try {
      const res = await authApi.guestLogin('Demo Visitor');
      assert.ok(endpoint.includes('/auth/guest'));
      assert.strictEqual(res.success, true);
      assert.strictEqual(res.data?.user.displayName, 'Demo Visitor');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  test('getCurrentUser calls /auth/me', async () => {
    const originalFetch = globalThis.fetch;
    let endpoint = '';

    globalThis.fetch = async (url) => {
      endpoint = String(url);
      return new Response(
        JSON.stringify({
          success: true,
          data: { id: 'u1', username: 'current_user' },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    };

    try {
      const res = await authApi.getCurrentUser();
      assert.ok(endpoint.includes('/auth/me'));
      assert.strictEqual(res.success, true);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  test('updateStatus patches /users/me/status', async () => {
    const originalFetch = globalThis.fetch;
    let endpoint = '';
    let method = '';

    globalThis.fetch = async (url, init) => {
      endpoint = String(url);
      method = String(init?.method);
      return new Response(
        JSON.stringify({
          success: true,
          data: { id: 'u1', status: 'DND' },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    };

    try {
      const res = await authApi.updateStatus('DND', 'In a critical meeting');
      assert.ok(endpoint.includes('/users/me/status'));
      assert.strictEqual(method, 'PATCH');
      assert.strictEqual(res.success, true);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});

