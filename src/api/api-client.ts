import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiResponse } from '../types';

export const STORAGE_KEYS = {
  TOKEN: 'mivo_mobile_access_token',
  USER: 'mivo_mobile_user_profile',
  API_URL: 'mivo_mobile_api_url',
  WS_URL: 'mivo_mobile_ws_url',
};

const DEFAULT_API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000/api';

class MobileApiClient {
  private customBaseUrl: string | null = null;
  private accessToken: string | null = null;

  async init() {
    try {
      const [token, savedUrl] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.TOKEN),
        AsyncStorage.getItem(STORAGE_KEYS.API_URL),
      ]);
      if (token) this.accessToken = token;
      if (savedUrl) this.customBaseUrl = savedUrl;
    } catch {
      // ignore storage read failure on startup
    }
  }

  setAccessToken(token: string | null) {
    this.accessToken = token;
    if (token) {
      AsyncStorage.setItem(STORAGE_KEYS.TOKEN, token).catch(() => {});
    } else {
      AsyncStorage.removeItem(STORAGE_KEYS.TOKEN).catch(() => {});
    }
  }

  getAccessToken() {
    return this.accessToken;
  }

  setBaseUrl(url: string) {
    this.customBaseUrl = url.replace(/\/+$/, '');
    AsyncStorage.setItem(STORAGE_KEYS.API_URL, this.customBaseUrl).catch(() => {});
  }

  getBaseUrl(): string {
    return this.customBaseUrl || DEFAULT_API_URL;
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const base = this.getBaseUrl();
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${base}${cleanEndpoint}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        return {
          success: false,
          error: data?.error || {
            code: 'HTTP_ERROR',
            message: data?.message || `Server returned ${response.status}`,
          },
        };
      }

      return data as ApiResponse<T>;
    } catch (err: any) {
      const isTimeout = err?.name === 'AbortError';
      return {
        success: false,
        error: {
          code: isTimeout ? 'TIMEOUT_ERROR' : 'NETWORK_ERROR',
          message: isTimeout
            ? 'Connection timed out. Check server URL and network.'
            : err?.message || 'Unable to reach Mivo server',
        },
      };
    }
  }

  get<T>(endpoint: string, options?: RequestInit) {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  post<T>(endpoint: string, body?: any, options?: RequestInit) {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  patch<T>(endpoint: string, body?: any, options?: RequestInit) {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  delete<T>(endpoint: string, options?: RequestInit) {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const api = new MobileApiClient();

