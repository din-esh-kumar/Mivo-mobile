import { Platform } from 'react-native';

export const triggerHaptic = (style?: any) => {
  if (Platform.OS === 'web') return;
  try {
    const Haptics = require('expo-haptics');
    if (Haptics && typeof Haptics.impactAsync === 'function') {
      const feedbackStyle = style || Haptics.ImpactFeedbackStyle?.Light;
      Haptics.impactAsync(feedbackStyle).catch(() => {});
    }
  } catch {
    // Graceful no-op in test/SSR/unsupported environments
  }
};

export const triggerSelectionHaptic = () => {
  if (Platform.OS === 'web') return;
  try {
    const Haptics = require('expo-haptics');
    if (Haptics && typeof Haptics.selectionAsync === 'function') {
      Haptics.selectionAsync().catch(() => {});
    }
  } catch {
    // Graceful no-op
  }
};

export const triggerSuccessHaptic = () => {
  if (Platform.OS === 'web') return;
  try {
    const Haptics = require('expo-haptics');
    if (Haptics && typeof Haptics.notificationAsync === 'function') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType?.Success).catch(() => {});
    }
  } catch {
    // Graceful no-op
  }
};
