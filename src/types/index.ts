// ==========================================
// Mivo Mobile Core Domain Types
// ==========================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
}

export type UserStatus = 'ONLINE' | 'IDLE' | 'DND' | 'OFFLINE';

export interface UserSummaryDTO {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string | null;
  status?: UserStatus;
  customStatus?: string | null;
  isAiAgent?: boolean;
}

export interface UserProfileDTO extends UserSummaryDTO {
  email: string;
  bio?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokensDTO {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
}

export interface AuthResponseDTO {
  user: UserProfileDTO;
  tokens: AuthTokensDTO;
}

export interface CommunityDTO {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  avatarUrl?: string | null;
  ownerId: string;
  memberCount?: number;
  channels?: ChannelDTO[];
  createdAt: string;
}

export type ChannelType = 'TEXT' | 'VOICE' | 'STAGE' | 'ANNOUNCEMENT';

export interface ChannelDTO {
  id: string;
  communityId: string;
  name: string;
  topic?: string | null;
  type: ChannelType;
  position: number;
  activeRoomId?: string | null;
  createdAt: string;
}

export type RoomCommunicationMode =
  | 'TEXT'
  | 'VOICE'
  | 'VIDEO'
  | 'SCREEN_SHARE'
  | 'STREAM'
  | 'CANVAS'
  | 'CODE';

export interface RoomMemberDTO {
  userId: string;
  displayName: string;
  username: string;
  avatarUrl?: string | null;
  isMuted: boolean;
  isDeafened?: boolean;
  isVideoEnabled: boolean;
  isScreenSharing?: boolean;
  isSpeaking?: boolean;
  isHost?: boolean;
  joinedAt: string;
}

export interface RoomDetailsDTO {
  id: string;
  channelId?: string | null;
  communityId?: string | null;
  conversationId?: string | null;
  name?: string;
  mode: RoomCommunicationMode;
  hostId: string;
  activeRecording?: boolean;
  participants: RoomMemberDTO[];
  createdAt: string;
}

export interface ChatMessageDTO {
  id: string;
  channelId?: string | null;
  conversationId?: string | null;
  authorId: string;
  author: UserSummaryDTO;
  content: string;
  attachments?: Array<{
    id: string;
    url: string;
    name: string;
    size: number;
    mimeType: string;
  }>;
  reactions?: Record<string, string[]>; // emoji -> array of userIds
  replyToMessageId?: string | null;
  replyTo?: {
    id: string;
    content: string;
    author: UserSummaryDTO;
  } | null;
  isEdited?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export type ConversationType = 'DIRECT' | 'GROUP';

export interface ConversationParticipantDTO {
  id: string;
  userId: string;
  user: UserSummaryDTO;
  hasUnread?: boolean;
  joinedAt: string;
}

export interface ConversationDTO {
  id: string;
  type: ConversationType;
  name?: string | null;
  avatarUrl?: string | null;
  participants: ConversationParticipantDTO[];
  lastMessage?: ChatMessageDTO | null;
  lastMessageAt?: string | null;
  unreadCount?: number;
  createdAt: string;
}

export interface RealtimeTypingEvent {
  channelId?: string;
  conversationId?: string;
  userId: string;
  username: string;
}

export interface RealtimePresenceEvent {
  userId: string;
  status: UserStatus;
  customStatus?: string | null;
}
