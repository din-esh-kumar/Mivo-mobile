import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { THEME } from '../constants/theme';
import { Avatar } from './Avatar';
import { RoomMemberDTO } from '../types';
import { MicOff, Crown, VideoOff, Wifi } from 'lucide-react-native';

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
            {/* Cinematic Camera Feed Simulation */}
            <View style={styles.videoBackdrop}>
              <View style={styles.lensGlint} />
              <View style={styles.videoCenterBadge}>
                <Avatar
                  url={member.avatarUrl}
                  name={member.displayName}
                  size={52}
                />
              </View>
            </View>

            {/* Video stream status tag */}
            <View style={styles.streamBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.videoSimulatedText}>[HD Video Stream]</Text>
            </View>
          </View>
        ) : (
          <View style={styles.audioContainer}>
            {isSpeaking && <View style={styles.speakingAura} />}
            <Avatar
              url={member.avatarUrl}
              name={member.displayName}
              size={68}
            />
            {isSpeaking && (
              <View style={styles.waveformContainer}>
                <View style={[styles.waveBar, { height: 6 }]} />
                <View style={[styles.waveBar, { height: 14 }]} />
                <View style={[styles.waveBar, { height: 9 }]} />
              </View>
            )}
          </View>
        )}
      </View>

      {/* Top Badges */}
      <View style={styles.topBar}>
        {member.isHost ? (
          <View style={styles.hostBadge}>
            <Crown size={11} color="#FBBF24" />
            <Text style={styles.hostBadgeText}>HOST</Text>
          </View>
        ) : (
          <View />
        )}

        <View style={styles.topRightIcons}>
          {!member.isVideoEnabled && (
            <View style={styles.iconTag}>
              <VideoOff size={11} color="#94A3B8" />
            </View>
          )}
        </View>
      </View>

      {/* Bottom Name & Mute Tag */}
      <View style={styles.bottomBar}>
        <View style={styles.namePill}>
          <Text style={styles.nameText} numberOfLines={1}>
            {member.displayName} {isCurrentUser && '(You)'}
          </Text>
        </View>

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
    backgroundColor: '#0F1626',
    borderRadius: THEME.borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#202B3F',
    justifyContent: 'space-between',
    padding: 8,
    margin: '1.5%',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  speakingRing: {
    borderColor: THEME.colors.accentGreen,
    shadowColor: THEME.colors.accentGreen,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.65,
    shadowRadius: 10,
    elevation: 6,
  },
  mediaContainer: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  speakingAura: {
    position: 'absolute',
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  waveformContainer: {
    position: 'absolute',
    bottom: -14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  waveBar: {
    width: 2.5,
    backgroundColor: THEME.colors.accentGreen,
    borderRadius: 2,
  },
  videoSimulated: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#080E1C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#121A2C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lensGlint: {
    position: 'absolute',
    top: -20,
    left: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  videoCenterBadge: {
    opacity: 0.85,
  },
  streamBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(9, 13, 22, 0.82)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.3)',
    gap: 5,
  },
  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#06B6D4',
  },
  videoSimulatedText: {
    color: '#06B6D4',
    fontSize: 9.5,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 2,
  },
  hostBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(245, 158, 11, 0.18)',
    paddingVertical: 2.5,
    paddingHorizontal: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  hostBadgeText: {
    color: '#FBBF24',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  topRightIcons: {
    flexDirection: 'row',
    gap: 4,
  },
  iconTag: {
    width: 20,
    height: 20,
    borderRadius: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 2,
  },
  namePill: {
    flex: 1,
    backgroundColor: 'rgba(9, 13, 22, 0.75)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: 6,
  },
  nameText: {
    color: '#F8FAFC',
    fontSize: 11.5,
    fontWeight: '600',
  },
  muteTag: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
