import { Stack } from 'expo-router';
import { useTheme } from '../../../theme';

export const unstable_settings = {
  anchor: 'index',
  home: { anchor: 'index' },
  paths: { anchor: 'paths' },
  stats: { anchor: 'stats' },
  highlights: { anchor: 'highlights' },
  issues: { anchor: 'issues' },
};

export default function TabStack() {
  const { c } = useTheme();
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.bg } }} />;
}
