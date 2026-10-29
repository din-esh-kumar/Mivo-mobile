import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS, normalizeUrl } from '../api/api-client';
import { REALTIME_EVENTS } from '../constants/events';
import { RoomCommunicationMode } from '../types';

const DEFAULT_WS_URL = process.env.EXPO_PUBLIC_WS_URL || 'http://localhost:4000';

class MobileSocketClient {
  private socket: Socket | null = null;
  private currentToken: string | null = null;
  private customWsUrl: string | null = null;
  private joinedRooms: Set<string> = new Set();
  private joinedDms: Set<string> = new Set();
  private isConnecting: boolean = false;
  private listeners: Map<string, Set<(...args: any[]) => void>> = new Map();

  async setWsUrl(url: string) {
    const cleanUrl = normalizeUrl(url);
    this.customWsUrl = cleanUrl;
    await AsyncStorage.setItem(STORAGE_KEYS.WS_URL, cleanUrl);

    if (this.socket) {
      const savedToken = this.currentToken;
      this.disconnect();
      if (savedToken) {
        this.connect(savedToken);
      }
    }
  }

  async getWsUrl(): Promise<string> {
    if (!this.customWsUrl) {
      const saved = await AsyncStorage.getItem(STORAGE_KEYS.WS_URL);
      if (saved) this.customWsUrl = normalizeUrl(saved);
    }
    return normalizeUrl(this.customWsUrl || DEFAULT_WS_URL);
  }

  async connect(token?: string): Promise<Socket> {
    if (token) {
      if (this.socket && this.currentToken && this.currentToken !== token) {
        this.socket.disconnect();
        this.socket = null;
      }
      this.currentToken = token;
    } else if (!this.currentToken) {
      this.currentToken = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
    }

    if (this.socket?.connected) {
      return this.socket;
    }

    if (this.isConnecting && this.socket) {
      return this.socket;
    }

    this.isConnecting = true;
    const wsUrl = await this.getWsUrl();

    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }

    const socketInstance = io(wsUrl, {
      auth: (cb) => {
        cb({ token: this.currentToken ? `Bearer ${this.currentToken}` : '' });
      },
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
    });

    this.socket = socketInstance;

    // Rebind all registered event listeners
    this.listeners.forEach((cbs, event) => {
      cbs.forEach((cb) => socketInstance.on(event, cb));
    });

    socketInstance.on('connect', () => {
      this.isConnecting = false;
      console.log('[Mobile Socket] Connected to Gateway ID:', socketInstance.id);

      // Re-join active channels/rooms upon reconnect
      this.joinedRooms.forEach((roomId) => {
        socketInstance.emit(REALTIME_EVENTS.ROOM_JOIN, { roomId });
      });

      this.joinedDms.forEach((conversationId) => {
        socketInstance.emit(REALTIME_EVENTS.DM_JOIN, { conversationId });
      });
    });

    socketInstance.on('disconnect', (reason) => {
      this.isConnecting = false;
      console.log('[Mobile Socket] Disconnected:', reason);
    });

    socketInstance.on('connect_error', (err) => {
      this.isConnecting = false;
      console.warn('[Mobile Socket] Connection Error:', err.message);
    });

    return socketInstance;
  }

  disconnect() {
    this.currentToken = null;
    this.isConnecting = false;
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
    this.joinedRooms.clear();
    this.joinedDms.clear();
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  isConnected(): boolean {
    return Boolean(this.socket?.connected);
  }

  on(event: string, callback: (...args: any[]) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
    this.socket?.on(event, callback);

    return () => this.off(event, callback);
  }

  off(event: string, callback: (...args: any[]) => void) {
    this.listeners.get(event)?.delete(callback);
    this.socket?.off(event, callback);
  }

  // Messaging methods
  sendChannelMessage(channelId: string, content: string, replyToMessageId?: string) {
    this.socket?.emit(REALTIME_EVENTS.CHAT_SEND_MESSAGE, {
      channelId,
      content,
      replyToMessageId,
    });
  }

  sendDirectMessage(conversationId: string, content: string, replyToMessageId?: string) {
    this.socket?.emit(REALTIME_EVENTS.DM_SEND_MESSAGE, {
      conversationId,
      content,
      replyToMessageId,
    });
  }

  joinConversation(conversationId: string) {
    this.joinedDms.add(conversationId);
    this.socket?.emit(REALTIME_EVENTS.DM_JOIN, { conversationId });
  }

  leaveConversation(conversationId: string) {
    this.joinedDms.delete(conversationId);
    this.socket?.emit(REALTIME_EVENTS.DM_LEAVE, { conversationId });
  }

  // Room & Media methods
  joinRoom(roomId: string) {
    this.joinedRooms.add(roomId);
    this.socket?.emit(REALTIME_EVENTS.ROOM_JOIN, { roomId });
  }

  leaveRoom(roomId: string) {
    this.joinedRooms.delete(roomId);
    this.socket?.emit(REALTIME_EVENTS.ROOM_LEAVE, { roomId });
  }

  changeRoomMode(roomId: string, mode: RoomCommunicationMode) {
    this.socket?.emit(REALTIME_EVENTS.ROOM_CHANGE_MODE, { roomId, mode });
  }

  updateMediaState(roomId: string, isMuted: boolean, isVideoEnabled: boolean) {
    this.socket?.emit(REALTIME_EVENTS.ROOM_UPDATE_MEDIA_STATE, {
      roomId,
      isMuted,
      isVideoEnabled,
    });
  }

  sendTyping(channelId?: string, conversationId?: string) {
    if (channelId) {
      this.socket?.emit(REALTIME_EVENTS.CHAT_TYPING, { channelId });
    } else if (conversationId) {
      this.socket?.emit(REALTIME_EVENTS.DM_TYPING, { conversationId });
    }
  }

  sendStopTyping(channelId?: string, conversationId?: string) {
    if (channelId) {
      this.socket?.emit(REALTIME_EVENTS.CHAT_STOP_TYPING, { channelId });
    } else if (conversationId) {
      this.socket?.emit(REALTIME_EVENTS.DM_STOP_TYPING, { conversationId });
    }
  }
}

export const socketClient = new MobileSocketClient();

