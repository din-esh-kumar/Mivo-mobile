import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { THEME } from '../constants/theme';
import { RoomCommunicationMode } from '../types';
import { MessageSquare, Mic, Video, Radio } from 'lucide-react-native';

interface ModeSelectorProps {
  currentMode: RoomCommunicationMode;
  onSelectMode: (mode: RoomCommunicationMode) => void;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({
  currentMode,
  onSelectMode,
}) => {
  const modes: Array<{
    mode: RoomCommunicationMode;
    label: string;
    icon: React.ReactNode;
  }> = [
    {
      mode: 'TEXT',
      label: 'Chat',
      icon: <MessageSquare size={14} color={currentMode === 'TEXT' ? '#FFFFFF' : '#94A3B8'} />,
    },
    {
      mode: 'VOICE',
      label: 'Voice',
      icon: <Mic size={14} color={currentMode === 'VOICE' ? '#FFFFFF' : '#94A3B8'} />,
    },
    {
      mode: 'VIDEO',
      label: 'Video',
      icon: <Video size={14} color={currentMode === 'VIDEO' ? '#FFFFFF' : '#94A3B8'} />,
    },
    {
      mode: 'STREAM',
      label: 'Stage',
      icon: <Radio size={14} color={currentMode === 'STREAM' ? '#FFFFFF' : '#94A3B8'} />,
    },
  ];

  return (
    <View style={styles.container}>
      {modes.map((item) => {
        const isActive = currentMode === item.mode;
        return (
          <TouchableOpacity
            key={item.mode}
            activeOpacity={0.8}
            onPress={() => onSelectMode(item.mode)}
            style={[styles.pill, isActive && styles.activePill]}
          >
            {item.icon}
            <Text style={[styles.pillText, isActive && styles.activePillText]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: THEME.colors.surface,
    padding: 4,
    borderRadius: THEME.borderRadius.full,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    alignSelf: 'center',
    gap: 4,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: THEME.borderRadius.full,
    gap: 6,
  },
  activePill: {
    backgroundColor: THEME.colors.primary,
  },
  pillText: {
    color: THEME.colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  activePillText: {
    color: '#FFFFFF',
  },
});

