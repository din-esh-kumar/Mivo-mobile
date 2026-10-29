export const REALTIME_EVENTS = {
  // Client to Server
  PRESENCE_HEARTBEAT: 'presence:heartbeat',
  PRESENCE_UPDATE: 'presence:update',
  ROOM_JOIN: 'room:join',
  ROOM_LEAVE: 'room:leave',
  ROOM_CHANGE_MODE: 'room:change_mode',
  ROOM_UPDATE_MEDIA_STATE: 'room:update_media_state',

  // Server to Client / Broadcast
  CONNECTION_ACK: 'connection:ack',
  PRESENCE_USER_UPDATED: 'presence:user_updated',
  ROOM_JOINED: 'room:joined',
  ROOM_PARTICIPANT_JOINED: 'room:participant_joined',
  ROOM_PARTICIPANT_LEFT: 'room:participant_left',
  ROOM_MODE_CHANGED: 'room:mode_changed',
  ROOM_PARTICIPANT_STATE_UPDATED: 'room:participant_state_updated',

  // Host & Moderation Controls
  ROOM_HOST_ACTION: 'room:host_action',
  ROOM_HOST_TRANSFERRED: 'room:host_transferred',

  // Meeting Recording & Consent
  ROOM_RECORDING_START: 'room:recording_start',
  ROOM_RECORDING_STOP: 'room:recording_stop',
  ROOM_RECORDING_STATE_CHANGED: 'room:recording_state_changed',

  // Realtime Messaging (Channels)
  CHAT_SEND_MESSAGE: 'chat:send_message',
  CHAT_NEW_MESSAGE: 'chat:new_message',
  CHAT_THREAD_NEW_MESSAGE: 'chat:thread_new_message',
  CHAT_THREAD_UPDATED: 'chat:thread_updated',
  CHAT_TYPING: 'chat:typing',
  CHAT_STOP_TYPING: 'chat:stop_typing',
  CHAT_REACTION_ADD: 'chat:reaction_add',
  CHAT_REACTION_ADDED: 'chat:reaction_added',

  // Direct & Group Messaging
  DM_JOIN: 'dm:join',
  DM_LEAVE: 'dm:leave',
  DM_SEND_MESSAGE: 'dm:send_message',
  DM_NEW_MESSAGE: 'dm:new_message',
  DM_THREAD_NEW_MESSAGE: 'dm:thread_new_message',
  DM_THREAD_UPDATED: 'dm:thread_updated',
  DM_TYPING: 'dm:typing',
  DM_STOP_TYPING: 'dm:stop_typing',
  DM_REACTION_ADD: 'dm:reaction_add',
  DM_REACTION_ADDED: 'dm:reaction_added',

  // Audio/Video Calling
  CALL_INVITE: 'call:invite',
  CALL_INCOMING: 'call:incoming',
  CALL_ACCEPT: 'call:accept',
  CALL_ACCEPTED: 'call:accepted',
  CALL_DECLINE: 'call:decline',
  CALL_DECLINED: 'call:declined',
  CALL_END: 'call:end',
  CALL_ENDED: 'call:ended',
} as const;

