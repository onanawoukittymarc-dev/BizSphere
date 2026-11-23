// app/_layout.tsx
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '../constants/theme';
import { ChatsProvider } from '../src/store/chatStore';

export default function RootLayout() {
  return (
    <ChatsProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.base },
        }}
      />
    </ChatsProvider>
  );
}