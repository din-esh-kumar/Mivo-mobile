import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { THEME } from '../../src/constants/theme';
import { useRoomStore } from '../../src/stores/useRoomStore';
import { useAuthStore } from '../../src/stores/useAuthStore';
import { ParticipantTile } from '../../src/components/ParticipantTile';
import { ModeSelector } from '../../src/components/ModeSelector';
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

  // Ensure current user is in participants list for presentation
  const allParticipants = [
    {
      userId: currentUser?.id || 'me',
      displayName: currentUser?.displayName || 'You',
      username: currentUser?.username || 'you',
      avatarUrl: currentUser?.avatarUrl,
      isMuted,
      isVideoEnabled,
      isSpeaking: false,
      isHost: true,
      joinedAt: '',
    },
    ...participants.filter((p) => p.userId !== currentUser?.id),
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

      {/* Participants Video / Audio Grid */}
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

      {/* Bottom Media Controls Dock */}
      <View style={styles.controlsDock}>
        {/* Mic Toggle */}
        <TouchableOpacity
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
});

