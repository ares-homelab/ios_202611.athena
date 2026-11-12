import { Pressable, Text, View } from 'react-native';
import { openBook } from '../../../components/bits';
import { Bar, BackBar, Cover, Empty, ErrorBox, Screen, useUi } from '../../../components/ui';
import { useReading } from '../../../data';
import { dayMonth, percent } from '../../../format';
import { F, useTheme } from '../../../theme';

export default function ReadingScreen() {
  const u = useUi();
  const { c } = useTheme();
  const res = useReading();
  const items = res.data ?? [];
  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <BackBar label="home" />
      <Screen top={false} gap={16} refreshing={res.loading && !!res.data} onRefresh={res.refresh}>
        <Text style={u.h1}>reading now</Text>
        {res.error ? <ErrorBox error={res.error} onRetry={res.refresh} stale={!!res.data} /> : null}
        {items.map((r, i) => (
          <Pressable key={`${r.calibre_id}-${i}`} onPress={() => openBook(r.calibre_id)} style={[u.row, { gap: 14, paddingBottom: 14 }, i < items.length - 1 && u.line]}>
            <Cover id={r.calibre_id} title={r.title} width={48} height={72} radius={4} />
            <View style={{ flex: 1, gap: 6 }}>
              <Text style={{ fontFamily: F.serifBold, fontSize: 19, lineHeight: 21, color: c.text }}>{r.title}</Text>
              <Text style={u.muted}>{r.authors}</Text>
              <Bar value={r.progress} />
              <Text style={u.muted}>
                {percent(r.progress)} · p. {r.page} of {r.pages} · {dayMonth(r.last_read)}
                {r.source === 'kosync' ? ' · kosync' : ''}
              </Text>
            </View>
          </Pressable>
        ))}
        {!items.length ? <Empty>{res.loading ? 'loading…' : 'nothing open on the kindle right now.'}</Empty> : null}
      </Screen>
    </View>
  );
}
