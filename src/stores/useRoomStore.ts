import { create } from 'zustand';
import { RoomDetailsDTO, RoomMemberDTO, RoomCommunicationMode } from '../types';
import { roomsApi } from '../api/rooms.api';
import { socketClient } from '../socket/socket-client';
import { REALTIME_EVENTS } from '../constants/events';

interface RoomState {
  currentRoom: RoomDetailsDTO | null;
  activeMode: RoomCommunicationMode;
  participants: RoomMemberDTO[];
  isMuted: boolean;
  isVideoEnabled: boolean;
  isJoined: boolean;
  isLoading: boolean;

  joinRoom: (roomId: string, defaultMode?: RoomCommunicationMode) => Promise<void>;
  leaveRoom: () => void;
  toggleMute: () => void;
  toggleVideo: () => void;
  setMode: (mode: RoomCommunicationMode) => void;
  setupSocketListeners: () => () => void;
}

export const useRoomStore = create<RoomState>((set, get) => ({
  currentRoom: null,
  activeMode: 'TEXT',
  participants: [],
  isMuted: true,
  isVideoEnabled: false,
  isJoined: false,
  isLoading: false,

  joinRoom: async (roomId: string, defaultMode = 'VOICE') => {
    // Optimistically set room and activeMode immediately for 0ms transition
    const fallbackParticipants: RoomMemberDTO[] = [
      {
        userId: 'peer-1',
        displayName: 'Sarah Jenkins',
        username: 'sarah_pm',
        avatarUrl: null,
        isMuted: false,
        isVideoEnabled: defaultMode === 'VIDEO' || defaultMode === 'STREAM',
        isSpeaking: true,
        isHost: false,
        joinedAt: new Date().toISOString(),
      },
      {
        userId: 'peer-2',
        displayName: 'Marcus Vance',
        username: 'marcus_eng',
        avatarUrl: null,
        isMuted: true,
        isVideoEnabled: false,
        isSpeaking: false,
        isHost: false,
        joinedAt: new Date().toISOString(),
      },
    ];

    set({
      currentRoom: {
        id: roomId,
        mode: defaultMode,
        hostId: 'current-user',
        participants: fallbackParticipants,
        createdAt: new Date().toISOString(),
      },
      activeMode: defaultMode,
      participants: fallbackParticipants,
      isJoined: true,
      isLoading: true,
    });

    try {
      socketClient.joinRoom(roomId);

      const res = await roomsApi.getRoomDetails(roomId);
      if (res.success && res.data) {
        const roomData = res.data;
        set((state) => ({
          currentRoom: roomData,
          activeMode: state.activeMode || roomData.mode || defaultMode,
          participants: roomData.participants || state.participants,
          isLoading: false,
        }));
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  leaveRoom: () => {
    const room = get().currentRoom;
    if (room) {
      socketClient.leaveRoom(room.id);
    }
    set({
      currentRoom: null,
      activeMode: 'TEXT',
      participants: [],
      isJoined: false,
      isMuted: true,
      isVideoEnabled: false,
    });
  },

  toggleMute: () => {
    const newMuted = !get().isMuted;
    set({ isMuted: newMuted });
    const room = get().currentRoom;
    if (room) {
      socketClient.updateMediaState(room.id, newMuted, get().isVideoEnabled);
    }
  },

  toggleVideo: () => {
    const newVideo = !get().isVideoEnabled;
    set({ isVideoEnabled: newVideo });
    const room = get().currentRoom;
    if (room) {
      socketClient.updateMediaState(room.id, get().isMuted, newVideo);
    }
  },

  setMode: (mode) => {
    set({ activeMode: mode });
    const room = get().currentRoom;
    if (room) {
      socketClient.changeRoomMode(room.id, mode);
      roomsApi.changeMode(room.id, mode).catch(() => {});
    }
  },

  setupSocketListeners: () => {
    const unsubJoin = socketClient.on(
      REALTIME_EVENTS.ROOM_PARTICIPANT_JOINED,
      (member: RoomMemberDTO) => {
        set((state) => ({
          participants: [...state.participants.filter((p) => p.userId !== member.userId), member],
        }));
      }
    );

    const unsubLeft = socketClient.on(
      REALTIME_EVENTS.ROOM_PARTICIPANT_LEFT,
      ({ userId }: { userId: string }) => {
        set((state) => ({
          participants: state.participants.filter((p) => p.userId !== userId),
        }));
      }
    );

    const unsubMode = socketClient.on(
      REALTIME_EVENTS.ROOM_MODE_CHANGED,
      ({ mode }: { mode: RoomCommunicationMode }) => {
        set({ activeMode: mode });
      }
    );

    const unsubState = socketClient.on(
      REALTIME_EVENTS.ROOM_PARTICIPANT_STATE_UPDATED,
      (updated: Partial<RoomMemberDTO> & { userId: string }) => {
        set((state) => ({
          participants: state.participants.map((p) =>
            p.userId === updated.userId ? { ...p, ...updated } : p
          ),
        }));
      }
    );

    return () => {
      unsubJoin();
      unsubLeft();
      unsubMode();
      unsubState();
    };
  },
}));

