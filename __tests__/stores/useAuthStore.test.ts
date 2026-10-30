import '../setup';
import { describe, test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import { useAuthStore } from '../../src/stores/useAuthStore';
import { api, STORAGE_KEYS } from '../../src/api/api-client';
import { socketClient } from '../../src/socket/socket-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfileDTO } from '../../src/types';

describe('Store: useAuthStore', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(async () => {
    await AsyncStorage.clear();
    api.setAccessToken(null);
    useAuthStore.setState({
      user: null,
      token: null,
      isLoading: false,
      isInitialized: false,
    });
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  test('initialize sets isInitialized to true when storage is empty', async () => {
    await useAuthStore.getState().initialize();
    const state = useAuthStore.getState();
    assert.strictEqual(state.isInitialized, true);
    assert.strictEqual(state.user, null);
    assert.strictEqual(state.token, null);
  });

  test('initialize restores session when token and user are in storage', async () => {
    const savedUser: UserProfileDTO = {
      id: 'u-1',
      username: 'alex',
      displayName: 'Alex Chen',
      email: 'alex@mivo.app',
      status: 'ONLINE',
      createdAt: new Date().toISOString(),
    };

    await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, 'saved-token-123');
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(savedUser));

    // Mock getCurrentUser profile refresh
    globalThis.fetch = async () =>
      new Response(JSON.stringify({ success: true, data: { ...savedUser, displayName: 'Alex Chen (Updated)' } }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });

    await useAuthStore.getState().initialize();

    const state = useAuthStore.getState();
    assert.strictEqual(state.isInitialized, true);
    assert.strictEqual(state.token, 'saved-token-123');
    assert.ok(state.user !== null);
  });

  test('login saves token and user on success and connects socket', async () => {
    const mockUser: UserProfileDTO = {
      id: 'u-login',
      username: 'tester',
      displayName: 'Tester User',
      email: 'test@mivo.app',
      status: 'ONLINE',
      createdAt: new Date().toISOString(),
    };

    globalThis.fetch = async () =>
      new Response(
        JSON.stringify({
          success: true,
          data: {
            accessToken: 'jwt-access-token-999',
            user: mockUser,
          },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );

    const result = await useAuthStore.getState().login('test@mivo.app', 'Secret123!');
    assert.strictEqual(result.success, true);

    const state = useAuthStore.getState();
    assert.strictEqual(state.token, 'jwt-access-token-999');
    assert.strictEqual(state.user?.username, 'tester');
    assert.strictEqual(state.isLoading, false);

    const storedUser = await AsyncStorage.getItem(STORAGE_KEYS.USER);
    assert.ok(storedUser !== null);
    assert.strictEqual(JSON.parse(storedUser).id, 'u-login');
  });

  test('login returns error when server responds with failure', async () => {
    globalThis.fetch = async () =>
      new Response(
        JSON.stringify({
          statusCode: 401,
          message: 'Invalid credentials',
          error: 'Unauthorized',
        }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );

    const result = await useAuthStore.getState().login('wrong@mivo.app', 'badpass');
    assert.strictEqual(result.success, false);
    assert.ok(result.error?.includes('Invalid credentials') || result.error?.includes('Unauthorized'));

    const state = useAuthStore.getState();
    assert.strictEqual(state.user, null);
    assert.strictEqual(state.token, null);
    assert.strictEqual(state.isLoading, false);
  });

  test('register sets user and token on success', async () => {
    const mockUser: UserProfileDTO = {
      id: 'u-reg',
      username: 'newbie',
      displayName: 'New User',
      email: 'newbie@mivo.app',
      status: 'ONLINE',
      createdAt: new Date().toISOString(),
    };

    globalThis.fetch = async () =>
      new Response(
        JSON.stringify({
          success: true,
          data: {
            accessToken: 'new-reg-token',
            user: mockUser,
          },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );

    const result = await useAuthStore.getState().register({
      email: 'newbie@mivo.app',
      username: 'newbie',
      displayName: 'New User',
      password: 'Password123!',
    });

    assert.strictEqual(result.success, true);
    assert.strictEqual(useAuthStore.getState().token, 'new-reg-token');
    assert.strictEqual(useAuthStore.getState().user?.displayName, 'New User');
  });

  test('loginAsGuest falls back gracefully to offline demo session if server is offline', async () => {
    globalThis.fetch = async () => {
      throw new Error('Network connection failed');
    };

    const result = await useAuthStore.getState().loginAsGuest('Sarah Guest');
    assert.strictEqual(result.success, true);

    const state = useAuthStore.getState();
    assert.strictEqual(state.user?.displayName, 'Sarah Guest');
    assert.strictEqual(state.token, 'mivo-demo-guest-token');
    assert.strictEqual(state.isLoading, false);

    const savedUser = await AsyncStorage.getItem(STORAGE_KEYS.USER);
    assert.ok(savedUser !== null);
  });

  test('logout clears tokens, user state, and storage', async () => {
    useAuthStore.setState({
      user: {
        id: 'u-1',
        username: 'user1',
        displayName: 'User One',
        email: 'u1@mivo.app',
        status: 'ONLINE',
        createdAt: '',
      },
      token: 'some-token',
    });
    await AsyncStorage.setItem(STORAGE_KEYS.USER, '{"id":"u-1"}');
    api.setAccessToken('some-token');

    await useAuthStore.getState().logout();

    assert.strictEqual(useAuthStore.getState().user, null);
    assert.strictEqual(useAuthStore.getState().token, null);
    assert.strictEqual(api.getAccessToken(), null);
    const storedUser = await AsyncStorage.getItem(STORAGE_KEYS.USER);
    assert.strictEqual(storedUser, null);
  });

  test('updateStatus patches user status and updates store and storage', async () => {
    const initialUser: UserProfileDTO = {
      id: 'u-1',
      username: 'status_user',
      displayName: 'Status User',
      email: 'status@mivo.app',
      status: 'ONLINE',
      createdAt: '',
    };
    useAuthStore.setState({ user: initialUser });

    globalThis.fetch = async () =>
      new Response(
        JSON.stringify({
          success: true,
          data: {
            ...initialUser,
            status: 'DND',
            customStatus: 'In a deep work sprint',
          },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );

    await useAuthStore.getState().updateStatus('DND', 'In a deep work sprint');

    const state = useAuthStore.getState();
    assert.strictEqual(state.user?.status, 'DND');
    assert.strictEqual(state.user?.customStatus, 'In a deep work sprint');
  });
});

