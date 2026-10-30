import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfileDTO } from '../types';
import { api, STORAGE_KEYS } from '../api/api-client';
import { authApi } from '../api/auth.api';
import { socketClient } from '../socket/socket-client';

interface AuthState {
  user: UserProfileDTO | null;
  token: string | null;
  isLoading: boolean;
  isInitialized: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  register: (payload: { email: string; username: string; displayName: string; password: string }) => Promise<{ success: boolean; error?: string }>;
  loginAsGuest: (displayName?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
  updateStatus: (status: 'ONLINE' | 'IDLE' | 'DND' | 'OFFLINE', customStatus?: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: false,
  isInitialized: false,

  initialize: async () => {
    try {
      await api.init();
      const token = api.getAccessToken();
      const userJson = await AsyncStorage.getItem(STORAGE_KEYS.USER);

      if (token && userJson) {
        const user = JSON.parse(userJson);
        set({ user, token, isInitialized: true });
        socketClient.connect(token);

        // Refresh profile in background
        authApi.getCurrentUser().then(async (res) => {
          if (res.success && res.data) {
            set({ user: res.data });
            await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(res.data));
          } else if (
            res.error?.code === 'UNAUTHORIZED' ||
            (res.error?.code === 'HTTP_ERROR' && res.error?.message?.includes('401'))
          ) {
            // Token expired or invalid on backend
            await get().logout();
          }
        }).catch(() => {});
      } else {
        set({ isInitialized: true });
      }
    } catch {
      set({ isInitialized: true });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const res = await authApi.login(email, password);
      if (res.success && res.data) {
        const token = res.data.accessToken || res.data.tokens?.accessToken;
        const user = res.data.user;
        if (!token) {
          set({ isLoading: false });
          return { success: false, error: 'No access token received from server' };
        }
        api.setAccessToken(token);
        await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
        
        set({ user, token, isLoading: false });
        socketClient.connect(token);
        return { success: true };
      }
      set({ isLoading: false });
      return { success: false, error: res.error?.message || 'Invalid credentials' };
    } catch (err: any) {
      set({ isLoading: false });
      return { success: false, error: err.message || 'Login failed' };
    }
  },

  register: async (payload) => {
    set({ isLoading: true });
    try {
      const res = await authApi.register(payload);
      if (res.success && res.data) {
        const token = res.data.accessToken || res.data.tokens?.accessToken;
        const user = res.data.user;
        if (!token) {
          set({ isLoading: false });
          return { success: false, error: 'No access token received from server' };
        }
        api.setAccessToken(token);
        await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));

        set({ user, token, isLoading: false });
        socketClient.connect(token);
        return { success: true };
      }
      set({ isLoading: false });
      return { success: false, error: res.error?.message || 'Registration failed' };
    } catch (err: any) {
      set({ isLoading: false });
      return { success: false, error: err.message || 'Registration failed' };
    }
  },

  loginAsGuest: async (displayName?: string) => {
    set({ isLoading: true });
    try {
      const name = displayName?.trim() || 'Demo User';
      const res = await authApi.guestLogin(name);
      if (res.success && res.data) {
        const token = res.data.accessToken || res.data.tokens?.accessToken;
        const user = res.data.user;
        if (!token) {
          set({ isLoading: false });
          return { success: false, error: 'No access token received from server' };
        }
        api.setAccessToken(token);
        await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));

        set({ user, token, isLoading: false });
        socketClient.connect(token);
        return { success: true };
      }

      // If backend responded with error or server is unreachable, fall back to offline demo session
      const offlineGuest: UserProfileDTO = {
        id: 'guest-' + Math.random().toString(36).substring(2, 9),
        username: name.toLowerCase().replace(/\s+/g, '_'),
        displayName: name,
        email: `${name.toLowerCase().replace(/\s+/g, '')}@mivo.local`,
        status: 'ONLINE',
        createdAt: new Date().toISOString(),
      };
      const offlineToken = 'mivo-demo-guest-token';
      api.setAccessToken(offlineToken);
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(offlineGuest));

      set({ user: offlineGuest, token: offlineToken, isLoading: false });
      socketClient.connect(offlineToken);
      return { success: true };
    } catch {
      const name = displayName?.trim() || 'Demo User';
      const offlineGuest: UserProfileDTO = {
        id: 'guest-' + Math.random().toString(36).substring(2, 9),
        username: 'demo_user',
        displayName: name,
        email: 'demo@mivo.local',
        status: 'ONLINE',
        createdAt: new Date().toISOString(),
      };
      const offlineToken = 'mivo-demo-guest-token';
      api.setAccessToken(offlineToken);
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(offlineGuest));

      set({ user: offlineGuest, token: offlineToken, isLoading: false });
      socketClient.connect(offlineToken);
      return { success: true };
    }
  },

  logout: async () => {
    api.setAccessToken(null);
    await AsyncStorage.removeItem(STORAGE_KEYS.USER);
    socketClient.disconnect();
    set({ user: null, token: null });
  },

  updateStatus: async (status, customStatus) => {
    const res = await authApi.updateStatus(status, customStatus);
    if (res.success && res.data) {
      set({ user: res.data });
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(res.data));
    }
  },
}));

