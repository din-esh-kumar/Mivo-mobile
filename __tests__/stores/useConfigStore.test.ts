import '../setup';
import { describe, test, beforeEach } from 'node:test';
import assert from 'node:assert';
import { useConfigStore } from '../../src/stores/useConfigStore';
import { api, STORAGE_KEYS } from '../../src/api/api-client';
import { socketClient } from '../../src/socket/socket-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

describe('Store: useConfigStore', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    await useConfigStore.getState().resetToDefaults();
  });

  test('initial state has default endpoints and isLoaded flag', () => {
    const state = useConfigStore.getState();
    assert.ok(state.apiUrl.includes('/api/v1'));
    assert.ok(state.wsUrl.startsWith('http://') || state.wsUrl.startsWith('https://'));
  });

  test('loadConfig falls back to defaults when storage is empty', async () => {
    await useConfigStore.getState().loadConfig();
    const state = useConfigStore.getState();
    assert.strictEqual(state.isLoaded, true);
    assert.ok(state.apiUrl.includes('/api/v1'));
  });

  test('loadConfig reads saved values from AsyncStorage', async () => {
    await AsyncStorage.setItem(STORAGE_KEYS.API_URL, 'http://192.168.1.100:4000/api/v1');
    await AsyncStorage.setItem(STORAGE_KEYS.WS_URL, 'http://192.168.1.100:4000');

    await useConfigStore.getState().loadConfig();
    const state = useConfigStore.getState();

    assert.strictEqual(state.apiUrl, 'http://192.168.1.100:4000/api/v1');
    assert.strictEqual(state.wsUrl, 'http://192.168.1.100:4000');
    assert.strictEqual(api.getBaseUrl(), 'http://192.168.1.100:4000/api/v1');
    assert.strictEqual(await socketClient.getWsUrl(), 'http://192.168.1.100:4000');
  });

  test('updateEndpoints normalizes URLs, updates api/socket, and persists to AsyncStorage', async () => {
    await useConfigStore.getState().updateEndpoints('prod.mivo.app:443/api/v1/', 'prod.mivo.app:443/');
    const state = useConfigStore.getState();

    assert.strictEqual(state.apiUrl, 'http://prod.mivo.app:443/api/v1');
    assert.strictEqual(state.wsUrl, 'http://prod.mivo.app:443');

    const savedApi = await AsyncStorage.getItem(STORAGE_KEYS.API_URL);
    const savedWs = await AsyncStorage.getItem(STORAGE_KEYS.WS_URL);
    assert.strictEqual(savedApi, 'http://prod.mivo.app:443/api/v1');
    assert.strictEqual(savedWs, 'http://prod.mivo.app:443');
  });

  test('resetToDefaults clears custom overrides and resets endpoints to default', async () => {
    await useConfigStore.getState().updateEndpoints('custom.mivo.app', 'custom.mivo.app');
    await useConfigStore.getState().resetToDefaults();

    const state = useConfigStore.getState();
    assert.ok(state.apiUrl.includes('/api/v1'));
    assert.strictEqual(api.getBaseUrl(), state.apiUrl);
    assert.strictEqual(await socketClient.getWsUrl(), state.wsUrl);
  });
});
