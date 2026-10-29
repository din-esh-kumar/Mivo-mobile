import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { THEME } from '../../src/constants/theme';
import { useRoomStore } from '../../src/stores/useRoomStore';
import { useAuthStore } from '../../src/stores/useAuthStore';
import { useConversationStore } from '../../src/stores/useConversationStore';
import { ParticipantTile } from '../../src/components/ParticipantTile';
import { ModeSelector } from '../../src/components/ModeSelector';
import { MessageBubble } from '../../src/components/MessageBubble';
import { Avatar } from '../../src/components/Avatar';
import { RoomCommunicationMode } from '../../src/types';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Radio,
  MessageSquare,
  Users,
  Volume2,
  Send,
} from 'lucide-react-native';

export default function RoomStageScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    id: string;
    name?: string;
    mode?: RoomCommunicationMode;
  }>();

  const roomId = params.id as string;
  const roomName = params.name || 'Stage Room';

  const currentUser = useAuthStore((s) => s.user);
  const {
    currentRoom,
    activeMode,
    participants,
    isMuted,
    isVideoEnabled,
    joinRoom,
    leaveRoom,
    toggleMute,
    toggleVideo,
    setMode,
  } = useRoomStore();

  const { messages, loadChannelMessages, sendMessage } = useConversationStore();
  const [chatInput, setChatInput] = useState('');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    joinRoom(roomId, params.mode || 'VOICE');

    const interval = setInterval(() => {
      setElapsedSeconds((sec) => sec + 1);
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [roomId]);

  useEffect(() => {
    if (activeMode === 'TEXT') {
      loadChannelMessages(roomId);
    }
  }, [activeMode, roomId]);

  const handleSendText = () => {
    if (!chatInput.trim()) return;
    sendMessage(roomId, chatInput.trim(), false);
    setChatInput('');
  };

  const handleLeave = () => {
    leaveRoom();
    router.back();
  };

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60)
      .toString()
      .padStart(2, '0');
    const secs = (totalSec % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const myId = currentUser?.id || 'me';
  const allParticipants = [
    {
      userId: myId,
      displayName: currentUser?.displayName || 'You',
      username: currentUser?.username || 'you',
      avatarUrl: currentUser?.avatarUrl,
      isMuted,
      isVideoEnabled,
      isSpeaking: false,
      isHost:
        currentRoom?.hostId === myId ||
        !currentRoom?.hostId ||
        currentRoom?.hostId === 'current-user',
      joinedAt: '',
    },
    ...participants.filter((p) => p.userId !== myId && p.userId !== currentUser?.id),
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Header Bar */}
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          <Text style={styles.roomTitle} numberOfLines={1}>
            {roomName}
          </Text>
          <View style={styles.timerBadge}>
            <View style={styles.redDot} />
            <Text style={styles.timerText}>{formatTimer(elapsedSeconds)}</Text>
            <Text style={styles.participantCount}>
              • {allParticipants.length} active
            </Text>
          </View>
        </View>

        {/* Live Stage Pill */}
        <View style={styles.liveTag}>
          <Radio size={14} color="#FFFFFF" />
          <Text style={styles.liveTagText}>LIVE</Text>
        </View>
      </View>

      {/* Mode Morph Switcher */}
      <View style={styles.modeSelectorContainer}>
        <ModeSelector
          currentMode={activeMode}
          onSelectMode={(mode) => setMode(mode)}
        />
      </View>

      {/* Participants Content: Video/Audio Grid OR Inline Room Discussion */}
      {activeMode === 'TEXT' ? (
        <View style={styles.inlineChatContainer}>
          {/* Active Audio strip */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.audioStripContent}
            style={styles.audioStrip}
          >
            {allParticipants.map((member) => (
              <View key={member.userId} style={styles.audioStripItem}>
                <Avatar url={member.avatarUrl} name={member.displayName} size={32} />
                <Text style={styles.stripName} numberOfLines={1}>
                  {member.displayName}
                </Text>
                {member.isMuted && <MicOff size={11} color="#EF4444" />}
              </View>
            ))}
          </ScrollView>

          {/* Messages list */}
          <ScrollView
            contentContainerStyle={styles.inlineMessagesList}
            showsVerticalScrollIndicator={false}
          >
            {(messages[roomId] || []).length > 0 ? (
              (messages[roomId] || []).map((msg) => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  isCurrentUser={msg.authorId === currentUser?.id}
                />
              ))
            ) : (
              <View style={styles.emptyInlineBox}>
                <Text style={styles.emptyInlineTitle}>Stage Discussion</Text>
                <Text style={styles.emptyInlineSub}>
                  No text messages yet in #{roomName}. Type below to discuss while keeping audio live!
                </Text>
              </View>
            )}
          </ScrollView>

          {/* Inline Input Box */}
          <View style={styles.inlineInputArea}>
            <TextInput
              testID="inline-chat-input"
              placeholder={`Message #${roomName} while on stage...`}
              placeholderTextColor={THEME.colors.textMuted}
              value={chatInput}
              onChangeText={setChatInput}
              style={styles.inlineTextInput}
            />
            <TouchableOpacity
              testID="inline-chat-send-btn"
              style={[
                styles.inlineSendBtn,
                chatInput.trim().length > 0 && styles.inlineSendBtnActive,
              ]}
              onPress={handleSendText}
              disabled={!chatInput.trim()}
            >
              <Send size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        /* Participants Video / Audio Grid */
        <ScrollView
          contentContainerStyle={styles.gridContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.grid}>
            {allParticipants.map((member) => (
              <ParticipantTile
                key={member.userId}
                member={member}
                isCurrentUser={member.userId === currentUser?.id || member.userId === 'me'}
              />
            ))}
          </View>
        </ScrollView>
      )}

      {/* Bottom Media Controls Dock */}
      <View style={styles.controlsDock}>
        {/* Mic Toggle */}
        <TouchableOpacity
          testID="toggle-mic-btn"
          style={[styles.controlBtn, isMuted ? styles.controlBtnMuted : styles.controlBtnActive]}
          onPress={toggleMute}
          activeOpacity={0.8}
        >
          {isMuted ? (
            <MicOff size={22} color="#EF4444" />
          ) : (
            <Mic size={22} color="#FFFFFF" />
          )}
        </TouchableOpacity>

        {/* Video Toggle */}
        <TouchableOpacity
          testID="toggle-video-btn"
          style={[
            styles.controlBtn,
            isVideoEnabled ? styles.controlBtnActive : styles.controlBtnMuted,
          ]}
          onPress={toggleVideo}
          activeOpacity={0.8}
        >
          {isVideoEnabled ? (
            <Video size={22} color="#FFFFFF" />
          ) : (
            <VideoOff size={22} color="#94A3B8" />
          )}
        </TouchableOpacity>

        {/* In-Call Chat Overlay Button */}
        <TouchableOpacity
          testID="in-call-chat-btn"
          style={styles.controlBtnSecondary}
          onPress={() => {
            router.push({
              pathname: '/chat/[id]',
              params: { id: roomId, name: roomName, type: 'channel' },
            });
          }}
          activeOpacity={0.8}
        >
          <MessageSquare size={20} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Leave Room Button */}
        <TouchableOpacity
          testID="leave-room-btn"
          style={styles.leaveBtn}
          onPress={handleLeave}
          activeOpacity={0.8}
        >
          <PhoneOff size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#070A10',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  headerInfo: {
    flex: 1,
  },
  roomTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  redDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: THEME.colors.accentRed,
  },
  timerText: {
    color: THEME.colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  participantCount: {
    color: THEME.colors.textMuted,
    fontSize: 12,
  },
  liveTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.accentRed,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: THEME.borderRadius.full,
    gap: 4,
  },
  liveTagText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  modeSelectorContainer: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  gridContent: {
    padding: 10,
    paddingBottom: 90,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  controlsDock: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(22, 31, 48, 0.94)',
    borderRadius: THEME.borderRadius.full,
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  },
  controlBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlBtnActive: {
    backgroundColor: THEME.colors.primary,
  },
  controlBtnMuted: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
  },
  controlBtnSecondary: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  leaveBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: THEME.colors.accentRed,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: THEME.colors.accentRed,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  inlineChatContainer: {
    flex: 1,
    paddingBottom: 85,
  },
  audioStrip: {
    maxHeight: 60,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
    backgroundColor: THEME.colors.surface,
  },
  audioStripContent: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 12,
    alignItems: 'center',
  },
  audioStripItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.surfaceElevated,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: THEME.borderRadius.full,
    gap: 6,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  stripName: {
    color: THEME.colors.textPrimary,
    fontSize: 12,
    fontWeight: '500',
    maxWidth: 80,
  },
  inlineMessagesList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexGrow: 1,
  },
  emptyInlineBox: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    paddingHorizontal: 24,
  },
  emptyInlineTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
    marginBottom: 6,
  },
  emptyInlineSub: {
    fontSize: 13,
    color: THEME.colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  inlineInputArea: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 12,
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    gap: 8,
  },
  inlineTextInput: {
    flex: 1,
    color: THEME.colors.textPrimary,
    fontSize: 14,
    paddingVertical: 4,
  },
  inlineSendBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: THEME.colors.surfaceHover,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inlineSendBtnActive: {
    backgroundColor: THEME.colors.primary,
  },
});

