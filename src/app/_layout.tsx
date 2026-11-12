import { CormorantGaramond_400Regular } from '@expo-google-fonts/cormorant-garamond/400Regular';
import { CormorantGaramond_400Regular_Italic } from '@expo-google-fonts/cormorant-garamond/400Regular_Italic';
import { CormorantGaramond_500Medium_Italic } from '@expo-google-fonts/cormorant-garamond/500Medium_Italic';
import { CormorantGaramond_600SemiBold } from '@expo-google-fonts/cormorant-garamond/600SemiBold';
import { Inter_400Regular } from '@expo-google-fonts/inter/400Regular';
import { Inter_500Medium } from '@expo-google-fonts/inter/500Medium';
import { Inter_600SemiBold } from '@expo-google-fonts/inter/600SemiBold';
import { useFonts } from 'expo-font';
import * as Updates from 'expo-updates';
import { router, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useEffect } from 'react';
import { AppState } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { getConfig } from '../config';
import { flush } from '../store';
import { useTheme } from '../theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const { c, scheme } = useTheme();
  const [loaded] = useFonts({
    CormorantGaramond_400Regular,
    CormorantGaramond_400Regular_Italic,
    CormorantGaramond_500Medium_Italic,
    CormorantGaramond_600SemiBold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });
  useEffect(() => {
    SystemUI.setBackgroundColorAsync(c.bg).catch(() => {});
  }, [c.bg]);
  useEffect(() => {
    if (!loaded) return;
    SplashScreen.hideAsync().catch(() => {});
    if (!getConfig().token) setTimeout(() => router.push('/settings/connection'), 0);
    let pending = false;
    const fetchUpdate = async () => {
      if (!Updates.isEnabled) return;
      try {
        if ((await Updates.checkForUpdateAsync()).isAvailable) pending = !!(await Updates.fetchUpdateAsync()).isNew;
      } catch {}
    };
    fetchUpdate();
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') {
        flush();
        fetchUpdate();
      }
      if (s === 'background' && pending) Updates.reloadAsync().catch(() => {});
    });
    return () => sub.remove();
  }, [loaded]);
  if (!loaded) return null;
  return (
    <SafeAreaProvider>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.bg } }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="settings/connection" options={{ gestureEnabled: !!getConfig().token }} />
      </Stack>
    </SafeAreaProvider>
  );
}
