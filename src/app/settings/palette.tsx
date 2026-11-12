import { Pressable, Text, View } from 'react-native';
import { BackBar, Screen, useUi } from '../../components/ui';
import { PALETTES, setPrefs, usePrefs, useTheme, type Colors, fs } from '../../theme';
import { F } from '../../theme';

function Sample({ c }: { c: Colors }) {
  return (
    <View style={{ flex: 1, backgroundColor: c.bg, borderRadius: 12, padding: 12, gap: 8, borderWidth: 1, borderColor: c.line }}>
      <Text style={{ fontFamily: F.serifMediumItalic, fontSize: fs(20), color: c.text }}>athena</Text>
      <View style={{ backgroundColor: c.panel, borderRadius: 9, padding: 9, gap: 6 }}>
        <Text style={{ fontFamily: F.serifBold, fontSize: fs(15), color: c.text }}>brazil&apos;s spirits</Text>
        <View style={{ height: 3, borderRadius: 2, backgroundColor: c.track }}>
          <View style={{ width: '40%', height: 3, borderRadius: 2, backgroundColor: c.progress }} />
        </View>
      </View>
      <View style={{ alignSelf: 'flex-start', borderRadius: 8, paddingVertical: 3, paddingHorizontal: 8, backgroundColor: c.accent }}>
        <Text style={{ fontFamily: F.sansBold, fontSize: fs(10), color: c.onAccent }}>ongoing</Text>
      </View>
    </View>
  );
}

export default function Palette() {
  const u = useUi();
  const { c } = useTheme();
  const prefs = usePrefs();
  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <BackBar label="settings" />
      <Screen top={false} gap={16}>
        <Text style={u.h1}>palette</Text>
        {PALETTES.map((p) => {
          const on = p.id === prefs.palette;
          return (
            <Pressable
              key={p.id}
              onPress={() => setPrefs({ palette: p.id })}
              style={{ backgroundColor: c.panel, borderRadius: 18, padding: 16, gap: 12, borderWidth: 1.5, borderColor: on ? c.accent : 'transparent' }}
            >
              <View style={[u.row, { justifyContent: 'space-between' }]}>
                <Text style={[u.body, { fontFamily: F.sansBold, fontSize: fs(16) }]}>{p.id}</Text>
                <Text style={u.muted}>{on ? 'current' : p.note}</Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <Sample c={p.dark} />
                <Sample c={p.light} />
              </View>
            </Pressable>
          );
        })}
      </Screen>
    </View>
  );
}
