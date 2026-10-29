import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { THEME } from '../src/constants/theme';
import { useAuthStore } from '../src/stores/useAuthStore';
import { useConfigStore } from '../src/stores/useConfigStore';
import { useConversationStore } from '../src/stores/useConversationStore';
import { useRoomStore } from '../src/stores/useRoomStore';

export default function RootLayout() {
  const initializeAuth = useAuthStore((s) => s.initialize);
  const loadConfig = useConfigStore((s) => s.loadConfig);
  const setupChatSockets = useConversationStore((s) => s.setupSocketListeners);
  const setupRoomSockets = useRoomStore((s) => s.setupSocketListeners);

  useEffect(() => {
    loadConfig();
    initializeAuth();
  }, []);

  useEffect(() => {
    const unsubChat = setupChatSockets();
    const unsubRoom = setupRoomSockets();
    return () => {
      unsubChat();
      unsubRoom();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: THEME.colors.background },
          animation: 'fade_from_bottom',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="chat/[id]"
          options={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="room/[id]"
          options={{
            headerShown: false,
            presentation: 'fullScreenModal',
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name="settings/server"
          options={{
            headerShown: false,
            presentation: 'modal',
          }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}

