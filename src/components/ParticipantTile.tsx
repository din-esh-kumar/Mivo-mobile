import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { THEME } from '../constants/theme';
import { Avatar } from './Avatar';
import { RoomMemberDTO } from '../types';
import { MicOff, Crown, VideoOff } from 'lucide-react-native';

interface ParticipantTileProps {
  member: RoomMemberDTO;
  isCurrentUser?: boolean;
}

export const ParticipantTile: React.FC<ParticipantTileProps> = ({
  member,
  isCurrentUser = false,
}) => {
  const isSpeaking = Boolean(member.isSpeaking);

  return (
    <View style={[styles.container, isSpeaking && styles.speakingRing]}>
      {/* Video or Avatar Placeholder */}
      <View style={styles.mediaContainer}>
        {member.isVideoEnabled ? (
          <View style={styles.videoSimulated}>
            <Text style={styles.videoSimulatedText}>[HD Video Stream]</Text>
          </View>
        ) : (
          <Avatar
            url={member.avatarUrl}
            name={member.displayName}
            size={72}
          />
        )}
      </View>

      {/* Top Badges */}
      <View style={styles.topBar}>
        {member.isHost && (
          <View style={styles.hostBadge}>
            <Crown size={12} color="#FBBF24" />
          </View>
        )}
        {!member.isVideoEnabled && (
          <View style={styles.iconTag}>
            <VideoOff size={12} color="#94A3B8" />
          </View>
        )}
      </View>

      {/* Bottom Name & Mute Tag */}
      <View style={styles.bottomBar}>
        <Text style={styles.nameText} numberOfLines={1}>
          {member.displayName} {isCurrentUser && '(You)'}
        </Text>
        {member.isMuted && (
          <View style={styles.muteTag}>
            <MicOff size={11} color="#EF4444" />
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '47%',
    aspectRatio: 1,
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: THEME.colors.border,
    justifyContent: 'space-between',
    padding: 10,
    margin: '1.5%',
  },
  speakingRing: {
    borderColor: THEME.colors.accentGreen,
    shadowColor: THEME.colors.accentGreen,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 6,
  },
  mediaContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoSimulated: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: THEME.borderRadius.md,
  },
  videoSimulatedText: {
    color: '#06B6D4',
    fontSize: 11,
    fontWeight: '600',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 2,
  },
  hostBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 4,
    borderRadius: THEME.borderRadius.sm,
  },
  iconTag: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 4,
    borderRadius: THEME.borderRadius.sm,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: THEME.borderRadius.sm,
    zIndex: 2,
  },
  nameText: {
    color: THEME.colors.textPrimary,
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
    marginRight: 4,
  },
  muteTag: {
    marginLeft: 2,
  },
});

