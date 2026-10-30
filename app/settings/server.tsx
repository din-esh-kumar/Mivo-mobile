import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { THEME } from '../../src/constants/theme';
import { Input } from '../../src/components/Input';
import { Button } from '../../src/components/Button';
import { useConfigStore } from '../../src/stores/useConfigStore';
import { showCrossPlatformAlert } from '../../src/utils/dialog';
import { Server, ArrowLeft, Smartphone, Laptop, Radio, Check } from 'lucide-react-native';
import { triggerHaptic } from '../../src/utils/haptics';

export default function ServerSettingsScreen() {
  const router = useRouter();
  const { apiUrl, wsUrl, updateEndpoints, resetToDefaults } = useConfigStore();

  const [inputApi, setInputApi] = useState(apiUrl);
  const [inputWs, setInputWs] = useState(wsUrl);

  const handleSave = async () => {
    triggerHaptic();
    if (!inputApi.trim() || !inputWs.trim()) {
      showCrossPlatformAlert('Error', 'API and WebSocket URLs cannot be empty');
      return;
    }

    await updateEndpoints(inputApi.trim(), inputWs.trim());
    showCrossPlatformAlert('Endpoints Updated', 'Mivo will now connect to your custom endpoints.', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  const setPreset = (host: string) => {
    triggerHaptic();
    setInputApi(`http://${host}:4000/api/v1`);
    setInputWs(`http://${host}:4000`);
  };

  const handleReset = async () => {
    triggerHaptic();
    await resetToDefaults();
    setInputApi('http://localhost:4000/api/v1');
    setInputWs('http://localhost:4000');
    showCrossPlatformAlert('Reset', 'Endpoints restored to default values.');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          testID="server-back-btn"
          style={styles.backBtn}
          onPress={() => {
            triggerHaptic();
            router.back();
          }}
          activeOpacity={0.7}
        >
          <ArrowLeft size={22} color="#F8FAFC" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Server Endpoints</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.introCard}>
          <View style={styles.introIconBubble}>
            <Server size={24} color={THEME.colors.primary} />
          </View>
          <Text style={styles.introTitle}>Connect to Mivo Backend</Text>
          <Text style={styles.introBody}>
            When testing on a physical phone via Expo Go, replace "localhost" with your computer's local Wi-Fi IP address (e.g. 192.168.1.100).
          </Text>
        </View>

        {/* Quick Presets */}
        <Text style={styles.sectionTitle}>QUICK PRESETS</Text>
        <View style={styles.presetsRow}>
          <TouchableOpacity
            testID="preset-wifi-btn"
            style={styles.presetBtn}
            onPress={() => setPreset('192.168.1.10')}
            activeOpacity={0.8}
          >
            <Smartphone size={15} color={THEME.colors.accentGreen} />
            <Text style={styles.presetText}>Wi-Fi (192.168.1.10)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            testID="preset-localhost-btn"
            style={styles.presetBtn}
            onPress={() => setPreset('localhost')}
            activeOpacity={0.8}
          >
            <Laptop size={15} color="#94A3B8" />
            <Text style={styles.presetText}>Localhost</Text>
          </TouchableOpacity>

          <TouchableOpacity
            testID="preset-emulator-btn"
            style={styles.presetBtn}
            onPress={() => setPreset('10.0.2.2')}
            activeOpacity={0.8}
          >
            <Smartphone size={15} color="#94A3B8" />
            <Text style={styles.presetText}>Android (10.0.2.2)</Text>
          </TouchableOpacity>
        </View>

        {/* Form Inputs */}
        <Text style={styles.sectionTitle}>MANUAL CONFIGURATION</Text>
        <Input
          testID="input-api-url"
          label="REST API URL"
          placeholder="http://192.168.1.10:4000/api/v1"
          value={inputApi}
          onChangeText={setInputApi}
          autoCapitalize="none"
        />

        <Input
          testID="input-ws-url"
          label="WebSocket Gateway URL"
          placeholder="http://192.168.1.10:4000"
          value={inputWs}
          onChangeText={setInputWs}
          autoCapitalize="none"
        />

        <Button
          testID="save-endpoints-btn"
          title="Save & Reconnect"
          onPress={handleSave}
          size="lg"
          style={styles.saveBtn}
        />

        <Button
          testID="reset-endpoints-btn"
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
    backgroundColor: '#080B11',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#172033',
    backgroundColor: '#0D1424',
    gap: 12,
  },
  backBtn: {
    padding: 6,
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F8FAFC',
    letterSpacing: -0.3,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  introCard: {
    backgroundColor: '#101625',
    padding: 18,
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1,
    borderColor: '#1D273B',
    alignItems: 'center',
    textAlign: 'center',
    marginBottom: 24,
  },
  introIconBubble: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  introTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  introBody: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.8,
    marginBottom: 10,
    marginLeft: 4,
  },
  presetsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  presetBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#101625',
    borderWidth: 1,
    borderColor: '#1D273B',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: THEME.borderRadius.md,
    gap: 6,
  },
  presetText: {
    color: '#E2E8F0',
    fontSize: 11.5,
    fontWeight: '600',
  },
  saveBtn: {
    marginTop: 16,
  },
  resetBtn: {
    marginTop: 8,
  },
});
