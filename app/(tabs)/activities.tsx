import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { THEME } from '../../src/constants/theme';
import { Bell, Radio, AtSign, Video, CheckCircle2, CheckCheck } from 'lucide-react-native';
import { showCrossPlatformAlert } from '../../src/utils/dialog';
import { triggerHaptic } from '../../src/utils/haptics';

interface ActivityItem {
  id: string;
  type: 'mention' | 'stage' | 'call' | 'recording';
  title: string;
  body: string;
  time: string;
  read: boolean;
}

export default function ActivitiesScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState<'ALL' | 'UNREAD' | 'MENTIONS'>('ALL');

  const [activities, setActivities] = useState<ActivityItem[]>([
    {
      id: 'act-1',
      type: 'stage',
      title: 'Live Stage Started',
      body: 'Engineering All-Hands just opened the Stage room.',
      time: '10m ago',
      read: false,
    },
    {
      id: 'act-2',
      type: 'mention',
      title: 'Mentioned in #general',
      body: '@alex check out the new mobile app design tokens and layout!',
      time: '35m ago',
      read: false,
    },
    {
      id: 'act-3',
      type: 'recording',
      title: 'MOM Meeting Summary Ready',
      body: 'Whisper AI generated Minutes of Meeting for "Q4 Architecture Sync".',
      time: '2h ago',
      read: true,
    },
    {
      id: 'act-4',
      type: 'call',
      title: 'Missed Audio Call',
      body: 'Sarah Jenkins attempted to start an audio call with you.',
      time: 'Yesterday',
      read: true,
    },
  ]);

  const handlePressActivity = (item: ActivityItem) => {
    triggerHaptic();
    // Mark as read
    setActivities((prev) =>
      prev.map((a) => (a.id === item.id ? { ...a, read: true } : a))
    );

    switch (item.type) {
      case 'stage':
        router.push({
          pathname: '/room/[id]',
          params: { id: 'chan-stage-1', name: 'All-Hands Townhall', mode: 'STREAM' },
        });
        break;
      case 'mention':
        router.push({
          pathname: '/chat/[id]',
          params: { id: 'chan-gen', name: 'general', type: 'channel' },
        });
        break;
      case 'call':
        router.push({
          pathname: '/room/[id]',
          params: { id: 'call-sarah', name: 'Audio Call with Sarah', mode: 'VOICE' },
        });
        break;
      case 'recording':
        showCrossPlatformAlert(
          'Minutes of Meeting Summary',
          'Key Takeaways:\n• Unified Stage architecture finalized for Expo SDK 58.\n• Zero-drop morphing between Audio, Video, and Stream modes.\n• Next milestone: autonomous mesh connections.'
        );
        break;
    }
  };

  const handleMarkAllAsRead = () => {
    triggerHaptic();
    setActivities((prev) => prev.map((a) => ({ ...a, read: true })));
  };

  const getIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'stage':
        return <Radio size={18} color={THEME.colors.accentCyan} />;
      case 'mention':
        return <AtSign size={18} color={THEME.colors.primaryLight} />;
      case 'recording':
        return <CheckCircle2 size={18} color={THEME.colors.accentGreen} />;
      case 'call':
        return <Video size={18} color={THEME.colors.accentRed} />;
    }
  };

  const unreadCount = activities.filter((a) => !a.read).length;

  const filteredActivities = activities.filter((item) => {
    if (filter === 'UNREAD') return !item.read;
    if (filter === 'MENTIONS') return item.type === 'mention';
    return true;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <View style={styles.headerIconBubble}>
            <Bell size={20} color={THEME.colors.primary} />
          </View>
          <View>
            <Text style={styles.headerTitle}>Activity & Alerts</Text>
            <Text style={styles.headerSubtitle}>
              {unreadCount > 0 ? `${unreadCount} unread updates` : 'All caught up'}
            </Text>
          </View>
        </View>

        {unreadCount > 0 && (
          <TouchableOpacity
            style={styles.markReadBtn}
            onPress={handleMarkAllAsRead}
            activeOpacity={0.8}
          >
            <CheckCheck size={14} color="#94A3B8" />
            <Text style={styles.markReadText}>Mark Read</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContent}>
          <TouchableOpacity
            style={[styles.filterChip, filter === 'ALL' && styles.filterChipActive]}
            onPress={() => {
              triggerHaptic();
              setFilter('ALL');
            }}
          >
            <Text style={[styles.filterChipText, filter === 'ALL' && styles.filterChipTextActive]}>
              All Updates
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, filter === 'UNREAD' && styles.filterChipActive]}
            onPress={() => {
              triggerHaptic();
              setFilter('UNREAD');
            }}
          >
            <Text style={[styles.filterChipText, filter === 'UNREAD' && styles.filterChipTextActive]}>
              Unread {unreadCount > 0 ? `(${unreadCount})` : ''}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, filter === 'MENTIONS' && styles.filterChipActive]}
            onPress={() => {
              triggerHaptic();
              setFilter('MENTIONS');
            }}
          >
            <Text style={[styles.filterChipText, filter === 'MENTIONS' && styles.filterChipTextActive]}>
              Mentions
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <FlatList
        data={filteredActivities}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No alerts to display</Text>
            <Text style={styles.emptySub}>You have cleared all items in this view.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.itemCard, !item.read && styles.itemCardUnread]}
            activeOpacity={0.75}
            onPress={() => handlePressActivity(item)}
          >
            <View style={styles.iconCircle}>{getIcon(item.type)}</View>

            <View style={styles.textContainer}>
              <View style={styles.topRow}>
                <Text style={[styles.itemTitle, !item.read && styles.itemTitleUnread]}>
                  {item.title}
                </Text>
                <Text style={styles.timeText}>{item.time}</Text>
              </View>
              <Text style={styles.itemBody} numberOfLines={2}>
                {item.body}
              </Text>
            </View>

            {!item.read && <View style={styles.unreadIndicator} />}
          </TouchableOpacity>
        )}
      />
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
    fontSize: 20,
    fontWeight: '700',
    color: '#F8FAFC',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 1,
  },
  markReadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#121A2A',
    paddingVertical: 5,
    paddingHorizontal: 9,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1E2B42',
  },
  markReadText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  filterBar: {
    paddingVertical: 8,
    backgroundColor: '#0B0F1A',
    borderBottomWidth: 1,
    borderBottomColor: '#172033',
  },
  filterContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#101726',
    borderWidth: 1,
    borderColor: '#1E283D',
  },
  filterChipActive: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  filterChipText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F1626',
    padding: 14,
    borderRadius: THEME.borderRadius.md,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#1B2438',
  },
  itemCardUnread: {
    backgroundColor: '#121C30',
    borderColor: 'rgba(99, 102, 241, 0.35)',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#162035',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E2E8F0',
    flex: 1,
  },
  itemTitleUnread: {
    fontWeight: '700',
    color: '#FFFFFF',
  },
  timeText: {
    fontSize: 11,
    color: '#64748B',
    marginLeft: 8,
  },
  itemBody: {
    fontSize: 12.5,
    color: '#94A3B8',
    lineHeight: 18,
  },
  unreadIndicator: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: THEME.colors.primary,
    marginLeft: 8,
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F8FAFC',
  },
  emptySub: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 6,
  },
});
