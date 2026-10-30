import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInputProps,
} from 'react-native';
import { THEME } from '../constants/theme';
import { Eye, EyeOff } from 'lucide-react-native';
import { triggerHaptic } from '../utils/haptics';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  isPassword?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  leftIcon,
  isPassword = false,
  style,
  testID,
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(!isPassword);

  const togglePasswordVisibility = () => {
    triggerHaptic();
    setShowPassword((prev) => !prev);
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputFocused,
          error ? styles.inputError : null,
        ]}
      >
        {leftIcon && <View style={styles.iconContainer}>{leftIcon}</View>}

        <TextInput
          testID={testID}
          placeholderTextColor={THEME.colors.textMuted}
          secureTextEntry={isPassword && !showPassword}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={[styles.input, style]}
          {...rest}
        />

        {isPassword && (
          <TouchableOpacity
            style={styles.eyeBtn}
            onPress={togglePasswordVisibility}
            activeOpacity={0.7}
          >
            {showPassword ? (
              <EyeOff size={18} color={THEME.colors.textSecondary} />
            ) : (
              <Eye size={18} color={THEME.colors.textSecondary} />
            )}
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 16,
  },
  label: {
    ...THEME.typography.caption,
    color: THEME.colors.textSecondary,
    marginBottom: 7,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F1626',
    borderWidth: 1,
    borderColor: '#232F45',
    borderRadius: THEME.borderRadius.md,
    paddingHorizontal: 14,
    height: 50,
  },
  inputFocused: {
    borderColor: THEME.colors.primary,
    backgroundColor: '#131C30',
    shadowColor: THEME.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  inputError: {
    borderColor: THEME.colors.accentRed,
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
  },
  iconContainer: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: THEME.colors.textPrimary,
    fontSize: 15,
    height: '100%',
  },
  eyeBtn: {
    padding: 6,
    marginLeft: 6,
  },
  errorText: {
    ...THEME.typography.caption,
    color: THEME.colors.accentRed,
    marginTop: 5,
    marginLeft: 2,
  },
});
