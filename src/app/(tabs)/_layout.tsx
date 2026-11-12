import { Tabs } from 'expo-router';
import { Icon, IconName } from '../../components/icon';
import { F, useTheme, fs } from '../../theme';

const TABS: [string, string, IconName][] = [
  ['(home)', 'home', 'home'],
  ['(paths)', 'paths', 'paths'],
  ['(stats)', 'stats', 'stats'],
  ['(highlights)', 'highlights', 'highlights'],
  ['(issues)', 'issues', 'issues'],
];

export default function TabsLayout() {
  const { c } = useTheme();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: c.link,
        tabBarInactiveTintColor: c.muted,
        tabBarStyle: { backgroundColor: c.bar, borderTopColor: c.line },
        tabBarLabelStyle: { fontFamily: F.sans, fontSize: fs(11) },
        sceneStyle: { backgroundColor: c.bg },
      }}
    >
      {TABS.map(([name, title, icon]) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{ title, tabBarIcon: ({ color }) => <Icon name={icon} size={24} color={color as string} width={1.7} /> }}
        />
      ))}
    </Tabs>
  );
}
