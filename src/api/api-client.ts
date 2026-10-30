import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiResponse } from '../types';

export const STORAGE_KEYS = {
  TOKEN: 'mivo_mobile_access_token',
  USER: 'mivo_mobile_user_profile',
  API_URL: 'mivo_mobile_api_url',
  WS_URL: 'mivo_mobile_ws_url',
  SOUND_ENABLED: 'mivo_mobile_sound_enabled',
  HAPTICS_ENABLED: 'mivo_mobile_haptics_enabled',
};

const DEFAULT_API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export const normalizeUrl = (url: string): string => {
  let clean = url.trim().replace(/\/+$/, '');
  if (!/^https?:\/\//i.test(clean)) {
    clean = `http://${clean}`;
  }
  return clean;
};

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
      if (savedUrl) this.customBaseUrl = normalizeUrl(savedUrl);
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
    this.customBaseUrl = normalizeUrl(url);
    AsyncStorage.setItem(STORAGE_KEYS.API_URL, this.customBaseUrl).catch(() => {});
  }

  getBaseUrl(): string {
    return normalizeUrl(this.customBaseUrl || DEFAULT_API_URL);
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

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        let code = 'HTTP_ERROR';
        let message = `Server returned status ${response.status}`;
        let details: any = undefined;

        if (data) {
          if (typeof data.error === 'string') {
            code = data.error;
            message = Array.isArray(data.message)
              ? data.message.join(', ')
              : (data.message || data.error);
          } else if (data.error && typeof data.error === 'object') {
            code = data.error.code || 'HTTP_ERROR';
            message = data.error.message || message;
            details = data.error.details;
          } else if (data.message) {
            message = Array.isArray(data.message)
              ? data.message.join(', ')
              : data.message;
          }
        }

        return {
          success: false,
          error: {
            code,
            message,
            details,
          },
        };
      }

      // If server returned structured ApiResponse
      if (data && typeof data === 'object' && 'success' in data) {
        return data as ApiResponse<T>;
      }

      // If server returned raw data object/array directly on HTTP 200
      return {
        success: true,
        data: data as T,
      };
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
    } finally {
      clearTimeout(timeoutId);
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

