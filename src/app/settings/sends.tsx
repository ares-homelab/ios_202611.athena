import { Pressable, Text, View } from 'react-native';
import { openBook } from '../../components/bits';
import { BackBar, Empty, ErrorBox, Screen, useUi } from '../../components/ui';
import { useBooks, useSends } from '../../data';
import { clock, dayMonth } from '../../format';
import { useTheme } from '../../theme';

export default function Sends() {
  const u = useUi();
  const { c } = useTheme();
  const sends = useSends();
  const books = useBooks();
  const title = (id: number) => books.data?.find((b) => b.id === id)?.title ?? `book ${id}`;
  const items = [...(sends.data ?? [])].reverse();
  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <BackBar label="settings" />
      <Screen top={false} gap={14} refreshing={sends.loading && !!sends.data} onRefresh={sends.refresh}>
        <Text style={u.h1}>send queue</Text>
        <Text style={[u.soft, { color: c.muted }]}>books you send go to the kindle the next time it is on wi-fi.</Text>
        {sends.error ? <ErrorBox error={sends.error} onRetry={sends.refresh} stale={!!sends.data} /> : null}
        <View>
          {items.map((s, i) => (
            <Pressable key={`${s.book_id}-${s.requested}`} onPress={() => openBook(s.book_id)} style={[u.row, { justifyContent: 'space-between', gap: 12, paddingVertical: 12 }, i < items.length - 1 && u.line]}>
              <Text style={[u.body, { flex: 1 }]} numberOfLines={1}>
                {title(s.book_id)}
              </Text>
              <Text style={[u.muted, !s.sent && { color: c.link }]}>{s.sent ? `sent ${dayMonth(s.sent)}` : `waiting since ${dayMonth(s.requested)} ${clock(s.requested)}`}</Text>
            </Pressable>
          ))}
          {!items.length ? <Empty>{sends.loading ? 'loading…' : 'nothing sent yet.'}</Empty> : null}
        </View>
      </Screen>
    </View>
  );
}
