import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../api/api-client';
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
    this.customWsUrl = url.replace(/\/+$/, '');
    await AsyncStorage.setItem(STORAGE_KEYS.WS_URL, this.customWsUrl);
    if (this.socket) {
      this.disconnect();
      this.connect();
    }
  }

  async getWsUrl(): Promise<string> {
    if (!this.customWsUrl) {
      const saved = await AsyncStorage.getItem(STORAGE_KEYS.WS_URL);
      if (saved) this.customWsUrl = saved;
    }
    return this.customWsUrl || DEFAULT_WS_URL;
  }

  async connect(token?: string): Promise<Socket> {
    if (token) this.currentToken = token;
    else if (!this.currentToken) {
      this.currentToken = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
    }

    if (this.socket?.connected) return this.socket;

    const wsUrl = await this.getWsUrl();

    this.socket = io(wsUrl, {
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

    // Rebind any existing event listeners
    this.listeners.forEach((cbs, event) => {
      cbs.forEach((cb) => this.socket?.on(event, cb));
    });

    this.socket.on('connect', () => {
      this.isConnecting = false;
      console.log('[Mobile Socket] Connected to Mivo Gateway ID:', this.socket?.id);

      // Re-join active channels/rooms upon reconnect
      this.joinedRooms.forEach((roomId) => {
        this.socket?.emit(REALTIME_EVENTS.ROOM_JOIN, { roomId });
      });

      this.joinedDms.forEach((conversationId) => {
        this.socket?.emit(REALTIME_EVENTS.DM_JOIN, { conversationId });
      });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('[Mobile Socket] Disconnected:', reason);
    });

    this.socket.on('connect_error', (err) => {
      console.warn('[Mobile Socket] Connection Error:', err.message);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
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
}

export const socketClient = new MobileSocketClient();
