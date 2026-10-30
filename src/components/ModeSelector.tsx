import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { THEME } from '../constants/theme';
import { RoomCommunicationMode } from '../types';
import { MessageSquare, Mic, Video, Radio } from 'lucide-react-native';
import { triggerHaptic } from '../utils/haptics';

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
    icon: (isActive: boolean) => React.ReactNode;
  }> = [
    {
      mode: 'TEXT',
      label: 'Chat',
      icon: (isActive) => (
        <MessageSquare size={14} color={isActive ? '#FFFFFF' : '#94A3B8'} />
      ),
    },
    {
      mode: 'VOICE',
      label: 'Voice',
      icon: (isActive) => (
        <Mic size={14} color={isActive ? '#FFFFFF' : '#94A3B8'} />
      ),
    },
    {
      mode: 'VIDEO',
      label: 'Video',
      icon: (isActive) => (
        <Video size={14} color={isActive ? '#FFFFFF' : '#94A3B8'} />
      ),
    },
    {
      mode: 'STREAM',
      label: 'Stage',
      icon: (isActive) => (
        <Radio size={14} color={isActive ? '#FFFFFF' : '#94A3B8'} />
      ),
    },
  ];

  const handleSelect = (mode: RoomCommunicationMode) => {
    if (mode !== currentMode) {
      triggerHaptic();
    }
    onSelectMode(mode);
  };

  return (
    <View style={styles.container}>
      {modes.map((item) => {
        const isActive = currentMode === item.mode;
        return (
          <TouchableOpacity
            key={item.mode}
            testID={`mode-pill-${item.mode}`}
            activeOpacity={0.82}
            onPress={() => handleSelect(item.mode)}
            style={[styles.pill, isActive && styles.activePill]}
          >
            {item.icon(isActive)}
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
    backgroundColor: '#0F1626',
    padding: 4,
    borderRadius: THEME.borderRadius.full,
    borderWidth: 1,
    borderColor: '#232F45',
    alignSelf: 'center',
    gap: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 13,
    borderRadius: THEME.borderRadius.full,
    gap: 6,
  },
  activePill: {
    backgroundColor: THEME.colors.primary,
    shadowColor: THEME.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 3,
  },
  pillText: {
    color: THEME.colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  activePillText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
