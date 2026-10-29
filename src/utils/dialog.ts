import { Alert, Platform } from 'react-native';

export interface AlertButtonAction {
  text?: string;
  style?: 'default' | 'cancel' | 'destructive';
  onPress?: () => void;
}

export const showCrossPlatformAlert = (
  title: string,
  message?: string,
  buttons?: AlertButtonAction[]
) => {
  if (Platform.OS === 'web') {
    const text = message ? `${title}\n\n${message}` : title;
    // Check if there is a destructive or confirm action
    const confirmBtn = buttons?.find((b) => b.style === 'destructive' || (b.text && b.text.toLowerCase().includes('sign out') || b.text?.toLowerCase().includes('ok') || b.text?.toLowerCase().includes('confirm')));
    const cancelBtn = buttons?.find((b) => b.style === 'cancel');

    if (buttons && buttons.length > 1 && (confirmBtn || cancelBtn)) {
      if (typeof window !== 'undefined' && window.confirm(text)) {
        confirmBtn?.onPress?.();
      } else {
        cancelBtn?.onPress?.();
      }
      return;
    }

    if (typeof window !== 'undefined') {
      window.alert(text);
    }
    const defaultBtn = buttons?.[0];
    defaultBtn?.onPress?.();
  } else {
    Alert.alert(title, message, buttons);
  }
};

export const showCrossPlatformPrompt = (
  title: string,
  message: string,
  onSubmit: (text: string) => void,
  fallbackOptions?: Array<{ text: string; onPress: () => void }>
) => {
  if (Platform.OS === 'ios' && Alert.prompt) {
    Alert.prompt(title, message, (text) => {
      if (text?.trim()) onSubmit(text.trim());
    });
  } else if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') {
      const input = window.prompt(`${title}\n\n${message}`);
      if (input && input.trim()) {
        onSubmit(input.trim());
        return;
      }
    }
    if (fallbackOptions && fallbackOptions.length > 0) {
      fallbackOptions[0].onPress();
    }
  } else {
    // Android Alert dialog with options
    if (fallbackOptions && fallbackOptions.length > 0) {
      Alert.alert(title, message, [
        ...fallbackOptions.map((opt) => ({
          text: opt.text,
          onPress: opt.onPress,
        })),
        { text: 'Cancel', style: 'cancel' },
      ]);
    } else {
      Alert.alert(title, message);
    }
  }
};

