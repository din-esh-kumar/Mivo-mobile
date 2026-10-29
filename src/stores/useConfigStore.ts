import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, STORAGE_KEYS, normalizeUrl } from '../api/api-client';
import { socketClient } from '../socket/socket-client';

interface ConfigState {
  apiUrl: string;
  wsUrl: string;
  isLoaded: boolean;
  loadConfig: () => Promise<void>;
  updateEndpoints: (apiUrl: string, wsUrl: string) => Promise<void>;
  resetToDefaults: () => Promise<void>;
}

const DEFAULT_API = normalizeUrl(process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000/api/v1');
const DEFAULT_WS = normalizeUrl(process.env.EXPO_PUBLIC_WS_URL || 'http://localhost:4000');

export const useConfigStore = create<ConfigState>((set) => ({
  apiUrl: DEFAULT_API,
  wsUrl: DEFAULT_WS,
  isLoaded: false,

  loadConfig: async () => {
    try {
      const [savedApi, savedWs] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.API_URL),
        AsyncStorage.getItem(STORAGE_KEYS.WS_URL),
      ]);

      const apiUrl = savedApi ? normalizeUrl(savedApi) : DEFAULT_API;
      const wsUrl = savedWs ? normalizeUrl(savedWs) : DEFAULT_WS;

      api.setBaseUrl(apiUrl);
      await socketClient.setWsUrl(wsUrl);

      set({ apiUrl, wsUrl, isLoaded: true });
    } catch {
      set({ isLoaded: true });
    }
  },

  updateEndpoints: async (apiUrl: string, wsUrl: string) => {
    const cleanApi = normalizeUrl(apiUrl);
    const cleanWs = normalizeUrl(wsUrl);

    api.setBaseUrl(cleanApi);
    await socketClient.setWsUrl(cleanWs);

    await AsyncStorage.setItem(STORAGE_KEYS.API_URL, cleanApi);
    await AsyncStorage.setItem(STORAGE_KEYS.WS_URL, cleanWs);

    set({ apiUrl: cleanApi, wsUrl: cleanWs });
  },

  resetToDefaults: async () => {
    await AsyncStorage.removeItem(STORAGE_KEYS.API_URL);
    await AsyncStorage.removeItem(STORAGE_KEYS.WS_URL);

    api.setBaseUrl(DEFAULT_API);
    await socketClient.setWsUrl(DEFAULT_WS);

    set({ apiUrl: DEFAULT_API, wsUrl: DEFAULT_WS });
  },
}));

