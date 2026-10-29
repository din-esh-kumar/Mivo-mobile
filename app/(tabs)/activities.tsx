import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { THEME } from '../../src/constants/theme';
import { Bell, Radio, MessageSquare, AtSign, Video, CheckCircle2 } from 'lucide-react-native';

interface ActivityItem {
  id: string;
  type: 'mention' | 'stage' | 'call' | 'recording';
  title: string;
  body: string;
  time: string;
  read: boolean;
}

export default function ActivitiesScreen() {
  const activities: ActivityItem[] = [
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
  ];

  const getIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'stage':
        return <Radio size={18} color={THEME.colors.accentCyan} />;
      case 'mention':
        return <AtSign size={18} color={THEME.colors.primary} />;
      case 'recording':
        return <CheckCircle2 size={18} color={THEME.colors.accentGreen} />;
      case 'call':
        return <Video size={18} color={THEME.colors.accentRed} />;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Bell size={24} color={THEME.colors.primary} />
          <Text style={styles.headerTitle}>Activity & Alerts</Text>
        </View>
      </View>

      <FlatList
        data={activities}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.itemCard, !item.read && styles.itemCardUnread]}
            activeOpacity={0.7}
          >
            <View style={styles.iconCircle}>{getIcon(item.type)}</View>

            <View style={styles.textContainer}>
              <View style={styles.topRow}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.timeText}>{item.time}</Text>
              </View>
              <Text style={styles.itemBody}>{item.body}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
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
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  listContent: {
    padding: 16,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: THEME.colors.surface,
    padding: 14,
    borderRadius: THEME.borderRadius.lg,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    gap: 12,
  },
  itemCardUnread: {
    borderColor: 'rgba(99, 102, 241, 0.4)',
    backgroundColor: '#121A2E',
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: THEME.colors.surfaceHover,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
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
    color: THEME.colors.textPrimary,
  },
  timeText: {
    fontSize: 11,
    color: THEME.colors.textMuted,
  },
  itemBody: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
    lineHeight: 18,
  },
});

