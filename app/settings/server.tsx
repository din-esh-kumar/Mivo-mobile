import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { THEME } from '../../src/constants/theme';
import { Input } from '../../src/components/Input';
import { Button } from '../../src/components/Button';
import { useConfigStore } from '../../src/stores/useConfigStore';
import { Server, ArrowLeft, RefreshCw, Smartphone, Laptop } from 'lucide-react-native';

export default function ServerSettingsScreen() {
  const router = useRouter();
  const { apiUrl, wsUrl, updateEndpoints, resetToDefaults } = useConfigStore();

  const [inputApi, setInputApi] = useState(apiUrl);
  const [inputWs, setInputWs] = useState(wsUrl);

  const handleSave = async () => {
    if (!inputApi.trim() || !inputWs.trim()) {
      Alert.alert('Error', 'API and WebSocket URLs cannot be empty');
      return;
    }

    await updateEndpoints(inputApi.trim(), inputWs.trim());
    Alert.alert('Endpoints Updated', 'Mivo will now connect to your custom endpoints.', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  const setPreset = (host: string) => {
    setInputApi(`http://${host}:4000/api`);
    setInputWs(`http://${host}:4000`);
  };

  const handleReset = async () => {
    await resetToDefaults();
    setInputApi('http://localhost:4000/api');
    setInputWs('http://localhost:4000');
    Alert.alert('Reset', 'Endpoints restored to default values.');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={22} color={THEME.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Server Endpoints</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.introCard}>
          <Server size={28} color={THEME.colors.primary} />
          <Text style={styles.introTitle}>Connect to Mivo Backend</Text>
          <Text style={styles.introBody}>
            When testing on a physical phone via Expo Go, replace "localhost" with your computer's local Wi-Fi IP address (e.g. 192.168.1.100).
          </Text>
        </View>

        {/* Quick Presets */}
        <Text style={styles.sectionTitle}>QUICK PRESETS</Text>
        <View style={styles.presetsRow}>
          <TouchableOpacity
            style={styles.presetBtn}
            onPress={() => setPreset('localhost')}
          >
            <Laptop size={16} color={THEME.colors.textSecondary} />
            <Text style={styles.presetText}>Localhost</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.presetBtn}
            onPress={() => setPreset('10.0.2.2')}
          >
            <Smartphone size={16} color={THEME.colors.textSecondary} />
            <Text style={styles.presetText}>Android (10.0.2.2)</Text>
          </TouchableOpacity>
        </View>

        {/* Form Inputs */}
        <Text style={styles.sectionTitle}>MANUAL CONFIGURATION</Text>
        <Input
          label="REST API URL"
          placeholder="http://192.168.1.5:4000/api"
          value={inputApi}
          onChangeText={setInputApi}
          autoCapitalize="none"
        />

        <Input
          label="WebSocket Gateway URL"
          placeholder="http://192.168.1.5:4000"
          value={inputWs}
          onChangeText={setInputWs}
          autoCapitalize="none"
        />

        <Button
          title="Save & Reconnect"
          onPress={handleSave}
          size="lg"
          style={styles.saveBtn}
        />

        <Button
          title="Reset to Defaults"
          onPress={handleReset}
          variant="ghost"
          size="md"
          style={styles.resetBtn}
        />
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
    gap: 12,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  scrollContent: {
    padding: 16,
  },
  introCard: {
    backgroundColor: THEME.colors.surface,
    padding: 16,
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    alignItems: 'center',
    textAlign: 'center',
    marginBottom: 24,
  },
  introTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
    marginTop: 8,
    marginBottom: 6,
  },
  introBody: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.textMuted,
    letterSpacing: 0.8,
    marginBottom: 10,
    marginLeft: 4,
  },
  presetsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  presetBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    paddingVertical: 10,
    borderRadius: THEME.borderRadius.md,
    gap: 8,
  },
  presetText: {
    color: THEME.colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  saveBtn: {
    marginTop: 16,
  },
  resetBtn: {
    marginTop: 8,
  },
});
