import { Alert, Pressable, Text, View } from 'react-native';
import type { Entry } from '../api';
import { usePins } from '../data';
import { perform } from '../store';
import { F, useTheme } from '../theme';
import { openBook, segmentsOf } from './bits';
import { BackBar, Empty, ErrorBox, IconButton, Screen, Segments, StatusPill, useUi, Cover } from './ui';

function EntryRow({ e, next, last }: { e: Entry; next: boolean; last: boolean }) {
  const u = useUi();
  const { c } = useTheme();
  const inLib = e.calibre_id != null;
  const sub = [e.author, e.year, next ? 'up next' : e.calibre_id ? null : e.free ? 'free' : null, next ? null : (e.section ?? e.group)].filter(Boolean).join(' · ');
  return (
    <Pressable
      disabled={!inLib}
      onPress={() => openBook(e.calibre_id)}
      style={({ pressed }) => [
        { flexDirection: 'row', gap: 14, alignItems: 'center', paddingVertical: 12, opacity: pressed ? 0.75 : 1 },
        next ? { backgroundColor: c.panel, borderRadius: 14, paddingHorizontal: 14, marginHorizontal: -14, marginVertical: 6 } : !last && { borderBottomWidth: 1, borderBottomColor: c.line },
      ]}
    >
      <Text style={{ width: 22, fontFamily: F.serif, fontSize: 18, color: next ? c.link : c.muted }}>{e.n}</Text>
      {next ? <Cover id={e.calibre_id} title={e.title} hasCover={e.has_cover} width={34} height={50} radius={3} /> : null}
      <View style={{ flex: 1, gap: 3 }}>
        <Text style={{ fontFamily: next ? F.sansBold : F.sansMedium, fontSize: 15, color: c.text }}>{e.title}</Text>
        {sub ? <Text style={[u.muted, next && { color: c.soft }]}>{sub}</Text> : null}
      </View>
      <StatusPill status={e.status} strong={next} />
    </Pressable>
  );
}

export function EntryScreen({
  back,
  eyebrow,
  title,
  description,
  entries,
  upNext,
  pinKey,
  pinLabel,
  loading,
  error,
  refresh,
}: {
  back: string;
  eyebrow: string;
  title: string;
  description?: string | null;
  entries: Entry[];
  upNext?: number | null;
  pinKey: string;
  pinLabel: string;
  loading: boolean;
  error?: string;
  refresh: () => void;
}) {
  const u = useUi();
  const { c } = useTheme();
  const pins = usePins();
  const pinned = pins.data?.paths.includes(pinKey) ?? false;
  const read = entries.filter((e) => e.status === 'read').length;
  const inLib = entries.filter((e) => e.calibre_id != null).length;
  const toggle = () => {
    const cur = pins.data ?? { books: [], paths: [] };
    const paths = pinned ? cur.paths.filter((p) => p !== pinKey) : [...cur.paths, pinKey];
    perform({ kind: 'pins', pins: { ...cur, paths }, label: `${pinned ? 'unpinned' : 'pinned'} ${pinLabel}` }).catch((e: Error) => Alert.alert("couldn't change the pin", e.message));
  };
  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <BackBar label={back} right={<IconButton name="bookmark" label={pinned ? 'unpin' : 'pin'} color={pinned ? c.link : c.muted} onPress={toggle} />} />
      <Screen top={false} gap={20} refreshing={loading && entries.length > 0} onRefresh={refresh}>
        <View style={{ gap: 8 }}>
          <Text style={u.eyebrow}>{eyebrow.toUpperCase()}</Text>
          <Text style={{ fontFamily: F.serifBold, fontSize: 38, lineHeight: 40, color: c.text }}>{title}</Text>
          {description ? <Text style={[u.soft, { fontSize: 14, lineHeight: 20 }]}>{description}</Text> : null}
        </View>
        {error ? <ErrorBox error={error} onRetry={refresh} stale={entries.length > 0} /> : null}
        {entries.length ? (
          <View style={{ gap: 8 }}>
            <Segments items={segmentsOf(entries)} height={5} />
            <Text style={u.muted}>
              {read} read · {inLib} in library · {entries.length - inLib} to find
            </Text>
          </View>
        ) : (
          <Empty>{loading ? 'loading…' : 'no books on this list yet.'}</Empty>
        )}
        <View>
          {entries.map((e, i) => (
            <EntryRow key={`${e.n}-${e.title}`} e={e} next={upNext != null && e.n === upNext} last={i === entries.length - 1} />
          ))}
        </View>
      </Screen>
    </View>
  );
}
