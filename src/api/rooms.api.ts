import { api } from './api-client';
import { RoomDetailsDTO, RoomCommunicationMode } from '../types';

export const roomsApi = {
  getRoomDetails: async (roomId: string) => {
    return api.get<RoomDetailsDTO>(`/rooms/${roomId}`);
  },

  changeMode: async (roomId: string, mode: RoomCommunicationMode) => {
    return api.patch<RoomDetailsDTO>(`/rooms/${roomId}/mode`, { mode });
  },
};
