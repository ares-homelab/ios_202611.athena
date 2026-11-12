import Constants from 'expo-constants';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Alert, Text, View } from 'react-native';
import { BackBar, Divider, Group, RowLink, Screen, Segmented, useUi } from '../../components/ui';
import { useConfig } from '../../config';
import { usePaths, useSections, useSends } from '../../data';
import { clock } from '../../format';
import { clearCache, refreshAll, useNet } from '../../store';
import { PALETTES, setPrefs, usePrefs, useTheme, type Mode } from '../../theme';

export default function Settings() {
  const u = useUi();
  const { c } = useTheme();
  const prefs = usePrefs();
  const cfg = useConfig();
  const net = useNet();
  const paths = usePaths();
  const sections = useSections();
  const sends = useSends();
  const pinned = [
    ...(paths.data ?? []).filter((p) => p.pinned).map((p) => p.name),
    ...(sections.data ?? []).filter((s) => s.pinned).map((s) => s.title),
  ];
  const waiting = (sends.data ?? []).filter((s) => !s.sent).length;
  const host = cfg.url.replace(/^https?:\/\//, '');
  const clear = () =>
    Alert.alert('clear the offline copy?', 'saved lists and covers on this iphone are removed and fetched again from ares.', [
      { text: 'cancel', style: 'cancel' },
      {
        text: 'clear',
        style: 'destructive',
        onPress: async () => {
          clearCache();
          await Image.clearDiskCache();
          refreshAll();
        },
      },
    ]);
  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <BackBar label="home" />
      <Screen top={false} gap={10}>
        <Text style={[u.h1, { marginHorizontal: 4, marginBottom: 6 }]}>settings</Text>

        <Group label="appearance">
          <View style={{ paddingVertical: 8, gap: 4 }}>
            <Segmented<Mode>
              strong
              value={prefs.mode}
              onChange={(mode) => setPrefs({ mode })}
              style={{ backgroundColor: c.bg, padding: 3, borderRadius: 10 }}
              icons={{ dark: 'moon', light: 'sun', system: 'phone' }}
              options={[
                { value: 'dark', label: 'dark' },
                { value: 'light', label: 'light' },
                { value: 'system', label: 'system' },
              ]}
            />
            <RowLink icon="palette" title="palette" sub={`${prefs.palette} · ${PALETTES.length} to choose from`} onPress={() => router.push('/settings/palette')} />
          </View>
        </Group>

        <Group label="library">
          <RowLink icon="paths" title="reading paths" sub={pinned.length ? `pinned: ${pinned.join(', ')}` : 'nothing pinned'} onPress={() => router.navigate('/paths')} />
          <Divider />
          <RowLink icon="stats" title="stats" sub="fanfic and new yorker left out" onPress={() => router.navigate('/stats')} />
        </Group>

        <Group label="kindle">
          <RowLink icon="queue" title="send queue" sub={waiting ? `${waiting} waiting for wi-fi` : 'books go over wi-fi · harvest hourly'} onPress={() => router.push('/settings/sends')} />
        </Group>

        <Group label="connection">
          <RowLink icon="server" title="ares" sub={`${host} · ${net.online === false ? 'not reachable' : 'home network · tailscale away'}`} onPress={() => router.push('/settings/connection')} />
          <Divider />
          <RowLink icon="key" title="login" sub={cfg.token ? 'token saved on this iphone' : 'no token yet'} onPress={() => router.push('/settings/connection')} />
        </Group>

        <Group label="app">
          <RowLink icon="database" title="offline copy" sub={`${net.syncedAt ? `saved ${clock(net.syncedAt)}` : 'saved copy'} · covers on this iphone`} onPress={clear} />
          <Divider />
          <RowLink
            icon="wrench"
            title="development"
            sub={`version ${Constants.expoConfig?.version ?? '?'}`}
            onPress={() => Alert.alert('athena', `version ${Constants.expoConfig?.version ?? '?'}\napi ${cfg.url}\ninstalled and re-signed by marsign on ares`)}
          />
        </Group>
      </Screen>
    </View>
  );
}
