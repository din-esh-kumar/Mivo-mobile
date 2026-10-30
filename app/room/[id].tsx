import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
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
  Send,
  Users,
} from 'lucide-react-native';
import { triggerHaptic } from '../../src/utils/haptics';

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
    triggerHaptic();
    sendMessage(roomId, chatInput.trim(), false);
    setChatInput('');
  };

  const handleLeave = () => {
    triggerHaptic();
    leaveRoom();
    router.back();
  };

  const handleToggleMute = () => {
    triggerHaptic();
    toggleMute();
  };

  const handleToggleVideo = () => {
    triggerHaptic();
    toggleVideo();
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
          <Radio size={13} color="#FFFFFF" />
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
                <Avatar url={member.avatarUrl} name={member.displayName} size={28} />
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
              placeholderTextColor="#64748B"
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
              activeOpacity={0.8}
            >
              <Send size={15} color="#FFFFFF" />
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
          onPress={handleToggleMute}
          activeOpacity={0.82}
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
          onPress={handleToggleVideo}
          activeOpacity={0.82}
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
            triggerHaptic();
            router.push({
              pathname: '/chat/[id]',
              params: { id: roomId, name: roomName, type: 'channel' },
            });
          }}
          activeOpacity={0.82}
        >
          <MessageSquare size={20} color="#CBD5E1" />
        </TouchableOpacity>

        {/* Leave Room Button */}
        <TouchableOpacity
          testID="leave-room-btn"
          style={styles.leaveBtn}
          onPress={handleLeave}
          activeOpacity={0.82}
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
    borderBottomColor: '#172033',
    backgroundColor: '#0D1424',
  },
  headerInfo: {
    flex: 1,
  },
  roomTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F8FAFC',
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  redDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: THEME.colors.accentRed,
  },
  timerText: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '600',
  },
  participantCount: {
    color: '#64748B',
    fontSize: 12,
  },
  liveTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.accentRed,
    paddingVertical: 4,
    paddingHorizontal: 9,
    borderRadius: THEME.borderRadius.full,
    gap: 5,
    shadowColor: THEME.colors.accentRed,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 3,
  },
  liveTagText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  modeSelectorContainer: {
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#0B0F1A',
    borderBottomWidth: 1,
    borderBottomColor: '#172033',
  },
  gridContent: {
    padding: 10,
    paddingBottom: 95,
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
    backgroundColor: 'rgba(16, 23, 38, 0.94)',
    borderRadius: THEME.borderRadius.full,
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 18,
    elevation: 8,
  },
  controlBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlBtnActive: {
    backgroundColor: THEME.colors.primary,
    shadowColor: THEME.colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  controlBtnMuted: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
  },
  controlBtnSecondary: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  leaveBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
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
    paddingBottom: 90,
  },
  audioStrip: {
    maxHeight: 58,
    borderBottomWidth: 1,
    borderBottomColor: '#172033',
    backgroundColor: '#0D1424',
  },
  audioStripContent: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    gap: 10,
    alignItems: 'center',
  },
  audioStripItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#131C2E',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: THEME.borderRadius.full,
    gap: 6,
    borderWidth: 1,
    borderColor: '#212D45',
  },
  stripName: {
    color: '#F8FAFC',
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
    color: '#F8FAFC',
    marginBottom: 6,
  },
  emptyInlineSub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
  inlineInputArea: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#101625',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 12,
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1,
    borderColor: '#202B3F',
    gap: 8,
  },
  inlineTextInput: {
    flex: 1,
    color: '#F8FAFC',
    fontSize: 14,
    paddingVertical: 4,
  },
  inlineSendBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inlineSendBtnActive: {
    backgroundColor: THEME.colors.primary,
  },
});
