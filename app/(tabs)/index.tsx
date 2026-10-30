import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { THEME } from '../../src/constants/theme';
import { useCommunityStore } from '../../src/stores/useCommunityStore';
import { useRoomStore } from '../../src/stores/useRoomStore';
import { ChannelDTO } from '../../src/types';
import { Avatar } from '../../src/components/Avatar';
import {
  Hash,
  Volume2,
  Video,
  Radio,
  ChevronRight,
  Compass,
  Users,
  Search,
  X,
  Zap,
} from 'lucide-react-native';
import { triggerHaptic, triggerSelectionHaptic } from '../../src/utils/haptics';

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
  const [channelSearch, setChannelSearch] = useState('');

  useEffect(() => {
    loadUserCommunities();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserCommunities();
    setRefreshing(false);
  };

  const handleOpenChannel = (channel: ChannelDTO) => {
    triggerHaptic();
    selectChannel(channel);
    router.push({
      pathname: '/chat/[id]',
      params: { id: channel.id, name: channel.name, type: 'channel' },
    });
  };

  const handleJoinVoiceOrStage = (channel: ChannelDTO) => {
    triggerHaptic();
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
  const displayCommunities =
    communities.length > 0
      ? communities
      : [
          { id: 'comm-1', name: 'Engineering Core', slug: 'eng-core', ownerId: '1', createdAt: '' },
          { id: 'comm-2', name: 'Product & Design', slug: 'product', ownerId: '1', createdAt: '' },
          { id: 'comm-3', name: 'Growth & Ops', slug: 'growth', ownerId: '1', createdAt: '' },
        ];

  const rawTextChannels = hasLoadedChannels
    ? textChannels
    : [
        { id: 'chan-gen', communityId: 'comm-1', name: 'general', type: 'TEXT' as const, position: 0, createdAt: '' },
        { id: 'chan-dev', communityId: 'comm-1', name: 'dev-chat', type: 'TEXT' as const, position: 1, createdAt: '' },
        { id: 'chan-ann', communityId: 'comm-1', name: 'announcements', type: 'ANNOUNCEMENT' as const, position: 2, createdAt: '' },
      ];

  const rawVoiceChannels = hasLoadedChannels
    ? voiceChannels
    : [
        { id: 'chan-voice-1', communityId: 'comm-1', name: 'Daily Standup Huddle', type: 'VOICE' as const, position: 3, createdAt: '' },
        { id: 'chan-voice-2', communityId: 'comm-1', name: 'Watercooler Voice', type: 'VOICE' as const, position: 4, createdAt: '' },
      ];

  const rawStageChannels = hasLoadedChannels
    ? stageChannels
    : [
        { id: 'chan-stage-1', communityId: 'comm-1', name: 'All-Hands Townhall', type: 'STAGE' as const, position: 5, createdAt: '' },
      ];

  // Filter channels based on quick search if entered
  const displayTextChannels = channelSearch
    ? rawTextChannels.filter((c) => c.name.toLowerCase().includes(channelSearch.toLowerCase()))
    : rawTextChannels;

  const displayVoiceChannels = channelSearch
    ? rawVoiceChannels.filter((c) => c.name.toLowerCase().includes(channelSearch.toLowerCase()))
    : rawVoiceChannels;

  const displayStageChannels = channelSearch
    ? rawStageChannels.filter((c) => c.name.toLowerCase().includes(channelSearch.toLowerCase()))
    : rawStageChannels;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <View style={styles.headerIconBubble}>
            <Compass size={20} color={THEME.colors.primary} />
          </View>
          <View>
            <Text style={styles.headerTitle}>
              {activeCommunity?.name || 'Mivo Communities'}
            </Text>
            <Text style={styles.headerSubtitle}>Real-time channels & audio stages</Text>
          </View>
        </View>

        <View style={styles.headerRightBadge}>
          <View style={styles.livePulseDot} />
          <Text style={styles.livePulseText}>Mesh Ready</Text>
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
                activeOpacity={0.8}
                onPress={() => {
                  triggerHaptic();
                  selectCommunity(c as any);
                }}
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

      {/* Channel Search Filter Input */}
      <View style={styles.searchWrapper}>
        <View style={styles.searchContainer}>
          <Search size={15} color="#64748B" style={styles.searchIcon} />
          <TextInput
            placeholder="Search channels..."
            placeholderTextColor="#64748B"
            value={channelSearch}
            onChangeText={setChannelSearch}
            style={styles.searchInput}
          />
          {channelSearch.length > 0 && (
            <TouchableOpacity onPress={() => setChannelSearch('')}>
              <X size={14} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>
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
        showsVerticalScrollIndicator={false}
      >
        {/* TEXT CHANNELS SECTION */}
        {displayTextChannels.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeader}>TEXT CHANNELS</Text>
              <Text style={styles.sectionCount}>{displayTextChannels.length}</Text>
            </View>
            {displayTextChannels.map((c) => (
              <TouchableOpacity
                key={c.id}
                testID={`channel-row-${c.id}`}
                style={styles.channelRow}
                activeOpacity={0.75}
                onPress={() => handleOpenChannel(c as ChannelDTO)}
              >
                <View style={styles.channelLeft}>
                  <View style={styles.hashIconBg}>
                    <Hash size={16} color={THEME.colors.primaryLight} />
                  </View>
                  <View style={styles.channelTitleWrapper}>
                    <Text style={styles.channelName}>{c.name}</Text>
                    {c.type === 'ANNOUNCEMENT' ? (
                      <Text style={styles.channelSub}>Broadcast only</Text>
                    ) : null}
                  </View>
                </View>
                <ChevronRight size={18} color="#475569" />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* VOICE HUDDLES SECTION */}
        {displayVoiceChannels.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeader}>VOICE HUDDLES & STAGES</Text>
              <View style={styles.sectionPulseDot} />
            </View>
            {displayVoiceChannels.map((c) => (
              <TouchableOpacity
                key={c.id}
                testID={`channel-row-${c.id}`}
                style={[styles.channelRow, styles.voiceRow]}
                activeOpacity={0.8}
                onPress={() => handleJoinVoiceOrStage(c as ChannelDTO)}
              >
                <View style={styles.channelLeft}>
                  <View style={styles.voiceIconBg}>
                    <Volume2 size={16} color={THEME.colors.accentGreen} />
                  </View>
                  <View style={styles.channelTitleWrapper}>
                    <Text style={styles.channelName}>{c.name}</Text>
                    <Text style={styles.voiceSub}>Tap to jump in voice room</Text>
                  </View>
                </View>

                <View style={styles.voiceRightArea}>
                  {/* Active Speaker Avatars Preview */}
                  <View style={styles.voiceAvatarsRow}>
                    <Avatar name="Sarah" size={20} />
                    <Avatar name="Elena" size={20} />
                  </View>

                  <View style={styles.joinTag}>
                    <Text style={styles.joinTagText}>JOIN</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* LIVE BROADCAST / STAGE SECTION */}
        {displayStageChannels.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeader}>INTERACTIVE LIVE STAGES</Text>
              <View style={styles.stageLiveBeacon}>
                <Text style={styles.stageLiveBeaconText}>ON AIR</Text>
              </View>
            </View>
            {displayStageChannels.map((c) => (
              <TouchableOpacity
                key={c.id}
                testID={`channel-row-${c.id}`}
                style={[styles.channelRow, styles.stageRow]}
                activeOpacity={0.8}
                onPress={() => handleJoinVoiceOrStage(c as ChannelDTO)}
              >
                <View style={styles.channelLeft}>
                  <View style={styles.stageIconBg}>
                    <Radio size={16} color={THEME.colors.accentCyan} />
                  </View>
                  <View style={styles.channelTitleWrapper}>
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
    backgroundColor: '#080B11',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#172033',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIconBubble: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F8FAFC',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 1,
  },
  headerRightBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  livePulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: THEME.colors.accentGreen,
  },
  livePulseText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: THEME.colors.accentGreen,
    letterSpacing: 0.2,
  },
  communityCarousel: {
    paddingVertical: 10,
    backgroundColor: '#0B0F1A',
    borderBottomWidth: 1,
    borderBottomColor: '#172033',
  },
  communityScrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  communityPill: {
    backgroundColor: '#111726',
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: THEME.borderRadius.full,
    borderWidth: 1,
    borderColor: '#202B3F',
  },
  communityPillActive: {
    backgroundColor: THEME.colors.primary,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: THEME.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 3,
  },
  communityPillText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
  },
  communityPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  searchWrapper: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#101625',
    borderWidth: 1,
    borderColor: '#1D273B',
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 38,
  },
  searchIcon: {
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    color: '#F8FAFC',
    fontSize: 13.5,
    height: '100%',
  },
  scrollList: {
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  sectionHeader: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.8,
  },
  sectionCount: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  sectionPulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: THEME.colors.accentGreen,
  },
  stageLiveBeacon: {
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.3)',
  },
  stageLiveBeaconText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#22D3EE',
  },
  channelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#101625',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: THEME.borderRadius.md,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#1D273B',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  voiceRow: {
    borderColor: 'rgba(16, 185, 129, 0.28)',
    backgroundColor: '#0F1A24',
  },
  stageRow: {
    borderColor: 'rgba(6, 182, 212, 0.28)',
    backgroundColor: '#0D1A26',
  },
  channelLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  hashIconBg: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  channelTitleWrapper: {
    flex: 1,
  },
  channelName: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  channelSub: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 2,
  },
  voiceSub: {
    color: '#94A3B8',
    fontSize: 11.5,
    marginTop: 2,
  },
  stageSub: {
    color: '#94A3B8',
    fontSize: 11.5,
    marginTop: 2,
  },
  voiceIconBg: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: 'rgba(16, 185, 129, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stageIconBg: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: 'rgba(6, 182, 212, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceRightArea: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  voiceAvatarsRow: {
    flexDirection: 'row',
    gap: -6,
  },
  joinTag: {
    backgroundColor: 'rgba(16, 185, 129, 0.16)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: THEME.borderRadius.sm,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  joinTagText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  liveBadge: {
    backgroundColor: 'rgba(6, 182, 212, 0.16)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: THEME.borderRadius.sm,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.4)',
  },
  liveBadgeText: {
    color: '#06B6D4',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
