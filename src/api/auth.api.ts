import { api } from './api-client';
import { AuthResponseDTO, UserProfileDTO } from '../types';

export const authApi = {
  login: async (email: string, password: string) => {
    return api.post<AuthResponseDTO>('/auth/login', { email, password });
  },

  register: async (payload: {
    email: string;
    username: string;
    displayName: string;
    password: string;
  }) => {
    return api.post<AuthResponseDTO>('/auth/register', payload);
  },

  getCurrentUser: async () => {
    return api.get<UserProfileDTO>('/auth/me');
  },

  updateStatus: async (status: string, customStatus?: string) => {
    return api.patch<UserProfileDTO>('/users/me/status', { status, customStatus });
  },
};

