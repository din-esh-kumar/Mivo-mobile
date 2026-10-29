import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { THEME } from '../../src/constants/theme';
import { useCommunityStore } from '../../src/stores/useCommunityStore';
import { useRoomStore } from '../../src/stores/useRoomStore';
import { ChannelDTO } from '../../src/types';
import {
  Hash,
  Volume2,
  Video,
  Radio,
  ChevronRight,
  Users,
  Compass,
} from 'lucide-react-native';

export default function ChannelsScreen() {
  const router = useRouter();
  const {
    communities,
    activeCommunity,
    channels,
    isLoading,
    loadUserCommunities,
    selectCommunity,
    selectChannel,
  } = useCommunityStore();
  const joinRoom = useRoomStore((s) => s.joinRoom);

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadUserCommunities();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserCommunities();
    setRefreshing(false);
  };

  const handleOpenChannel = (channel: ChannelDTO) => {
    selectChannel(channel);
    router.push({
      pathname: '/chat/[id]',
      params: { id: channel.id, name: channel.name, type: 'channel' },
    });
  };

  const handleJoinVoiceOrStage = (channel: ChannelDTO) => {
    selectChannel(channel);
    const roomId = channel.activeRoomId || channel.id;
    const mode = channel.type === 'STAGE' ? 'STREAM' : 'VOICE';
    joinRoom(roomId, mode);
    router.push({
      pathname: '/room/[id]',
      params: { id: roomId, name: channel.name, mode },
    });
  };

  const textChannels = channels.filter(
    (c) => c.type === 'TEXT' || c.type === 'ANNOUNCEMENT'
  );
  const voiceChannels = channels.filter((c) => c.type === 'VOICE');
  const stageChannels = channels.filter((c) => c.type === 'STAGE');

  const hasLoadedChannels = channels.length > 0;

  // Fallback demo data if backend hasn't populated yet
  const displayCommunities = communities.length > 0 ? communities : [
    { id: 'comm-1', name: 'Engineering Core', slug: 'eng-core', ownerId: '1', createdAt: '' },
    { id: 'comm-2', name: 'Product & Design', slug: 'product', ownerId: '1', createdAt: '' },
  ];

  const displayTextChannels = hasLoadedChannels
    ? textChannels
    : [
        { id: 'chan-gen', communityId: 'comm-1', name: 'general', type: 'TEXT' as const, position: 0, createdAt: '' },
        { id: 'chan-dev', communityId: 'comm-1', name: 'dev-chat', type: 'TEXT' as const, position: 1, createdAt: '' },
        { id: 'chan-ann', communityId: 'comm-1', name: 'announcements', type: 'ANNOUNCEMENT' as const, position: 2, createdAt: '' },
      ];

  const displayVoiceChannels = hasLoadedChannels
    ? voiceChannels
    : [
        { id: 'chan-voice-1', communityId: 'comm-1', name: 'Daily Standup Huddle', type: 'VOICE' as const, position: 3, createdAt: '' },
        { id: 'chan-voice-2', communityId: 'comm-1', name: 'Watercooler Voice', type: 'VOICE' as const, position: 4, createdAt: '' },
      ];

  const displayStageChannels = hasLoadedChannels
    ? stageChannels
    : [
        { id: 'chan-stage-1', communityId: 'comm-1', name: 'All-Hands Townhall', type: 'STAGE' as const, position: 5, createdAt: '' },
      ];

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Compass size={24} color={THEME.colors.primary} />
          <Text style={styles.headerTitle}>
            {activeCommunity?.name || 'Mivo Communities'}
          </Text>
        </View>
      </View>

      {/* Horizontal Community Selector Carousel */}
      <View style={styles.communityCarousel}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.communityScrollContent}
        >
          {displayCommunities.map((c) => {
            const isSelected =
              activeCommunity?.id === c.id ||
              (!activeCommunity && displayCommunities[0]?.id === c.id);
            return (
              <TouchableOpacity
                key={c.id}
                testID={`community-pill-${c.id}`}
                onPress={() => selectCommunity(c as any)}
                style={[
                  styles.communityPill,
                  isSelected && styles.communityPillActive,
                ]}
              >
                <Text
                  style={[
                    styles.communityPillText,
                    isSelected && styles.communityPillTextActive,
                  ]}
                >
                  {c.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Channels List */}
      <ScrollView
        contentContainerStyle={styles.scrollList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={THEME.colors.primary}
          />
        }
      >
        {/* TEXT CHANNELS SECTION */}
        {displayTextChannels.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>TEXT CHANNELS</Text>
            {displayTextChannels.map((c) => (
              <TouchableOpacity
                key={c.id}
                testID={`channel-row-${c.id}`}
                style={styles.channelRow}
                onPress={() => handleOpenChannel(c as ChannelDTO)}
              >
                <View style={styles.channelLeft}>
                  <Hash size={18} color={THEME.colors.textMuted} />
                  <Text style={styles.channelName}>{c.name}</Text>
                </View>
                <ChevronRight size={18} color={THEME.colors.borderLight} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* VOICE HUDDLES SECTION */}
        {displayVoiceChannels.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>VOICE HUDDLES & STAGES</Text>
            {displayVoiceChannels.map((c) => (
              <TouchableOpacity
                key={c.id}
                testID={`channel-row-${c.id}`}
                style={[styles.channelRow, styles.voiceRow]}
                onPress={() => handleJoinVoiceOrStage(c as ChannelDTO)}
              >
                <View style={styles.channelLeft}>
                  <View style={styles.voiceIconBg}>
                    <Volume2 size={16} color={THEME.colors.accentGreen} />
                  </View>
                  <View>
                    <Text style={styles.channelName}>{c.name}</Text>
                    <Text style={styles.voiceSub}>Tap to jump in voice room</Text>
                  </View>
                </View>
                <View style={styles.joinTag}>
                  <Text style={styles.joinTagText}>JOIN</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* LIVE BROADCAST / STAGE SECTION */}
        {displayStageChannels.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>INTERACTIVE LIVE STAGES</Text>
            {displayStageChannels.map((c) => (
              <TouchableOpacity
                key={c.id}
                testID={`channel-row-${c.id}`}
                style={[styles.channelRow, styles.stageRow]}
                onPress={() => handleJoinVoiceOrStage(c as ChannelDTO)}
              >
                <View style={styles.channelLeft}>
                  <View style={styles.stageIconBg}>
                    <Radio size={16} color={THEME.colors.accentCyan} />
                  </View>
                  <View>
                    <Text style={styles.channelName}>{c.name}</Text>
                    <Text style={styles.stageSub}>Multi-participant video stage</Text>
                  </View>
                </View>
                <View style={styles.liveBadge}>
                  <Text style={styles.liveBadgeText}>STAGE</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  communityCarousel: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  communityScrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  communityPill: {
    backgroundColor: THEME.colors.surface,
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: THEME.borderRadius.full,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  communityPillActive: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  communityPillText: {
    color: THEME.colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  communityPillTextActive: {
    color: '#FFFFFF',
  },
  scrollList: {
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.textMuted,
    letterSpacing: 0.8,
    marginBottom: 10,
    marginLeft: 4,
  },
  channelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: THEME.colors.surface,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: THEME.borderRadius.md,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  voiceRow: {
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  stageRow: {
    borderColor: 'rgba(6, 182, 212, 0.25)',
  },
  channelLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  channelName: {
    color: THEME.colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  voiceSub: {
    color: THEME.colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  stageSub: {
    color: THEME.colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  voiceIconBg: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stageIconBg: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(6, 182, 212, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinTag: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: THEME.borderRadius.sm,
    borderWidth: 1,
    borderColor: THEME.colors.accentGreen,
  },
  joinTagText: {
    color: THEME.colors.accentGreen,
    fontSize: 11,
    fontWeight: '700',
  },
  liveBadge: {
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: THEME.borderRadius.sm,
    borderWidth: 1,
    borderColor: THEME.colors.accentCyan,
  },
  liveBadgeText: {
    color: THEME.colors.accentCyan,
    fontSize: 11,
    fontWeight: '700',
  },
});

