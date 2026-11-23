// app/_layout.tsx
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ChatsProvider } from '../src/store/chatStore';
import { ThemeProvider, useAppTheme } from '../src/store/themeStore';

function RootNavigator() {
  const { themeMode, colors } = useAppTheme();

  return (
    <>
      <StatusBar style={themeMode === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.base },
        }}
      />
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <ChatsProvider>
        <RootNavigator />
      </ChatsProvider>
    </ThemeProvider>
  );
}