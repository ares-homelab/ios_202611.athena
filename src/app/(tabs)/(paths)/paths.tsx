import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { openPath, openSection } from '../../../components/bits';
import { Empty, ErrorBox, IconButton, Screen, Segmented, TitleRow, useUi } from '../../../components/ui';
import { usePaths, useSections } from '../../../data';
import { roman } from '../../../format';
import { F, useTheme } from '../../../theme';

function Row({ mark, title, about, counts, pinned, onPress, last }: { mark?: string; title: string; about?: string | null; counts: string; pinned?: boolean; onPress: () => void; last?: boolean }) {
  const u = useUi();
  const { c } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        { flexDirection: 'row', gap: 14, paddingVertical: 14, borderBottomWidth: last ? 0 : 1, borderBottomColor: c.line, opacity: pressed ? 0.75 : 1 },
        pinned && { backgroundColor: c.bar, marginHorizontal: -24, paddingHorizontal: 24 },
      ]}
    >
      {mark !== undefined ? <Text style={{ width: 26, marginTop: 2, fontFamily: F.serifItalic, fontSize: 22, color: c.link }}>{mark}</Text> : null}
      <View style={{ flex: 1, gap: 6 }}>
        <Text style={{ fontFamily: F.serifBold, fontSize: 21, lineHeight: 23, color: c.text }}>{title}</Text>
        {about ? <Text style={[u.soft, { color: c.muted }]}>{about}</Text> : null}
        <Text style={[u.muted, { color: c.soft }]}>
          {counts}
          {pinned ? <Text style={{ color: c.link }}> · pinned</Text> : null}
        </Text>
      </View>
    </Pressable>
  );
}

export default function Paths() {
  const paths = usePaths();
  const sections = useSections();
  const [view, setView] = useState<'paths' | 'sections'>('paths');
  const cross = (paths.data ?? []).filter((p) => p.number != null).sort((a, b) => (a.number ?? 0) - (b.number ?? 0));
  const secs = sections.data ?? [];
  const current = view === 'paths' ? paths : sections;
  const refresh = () => {
    paths.refresh();
    sections.refresh();
  };
  return (
    <Screen refreshing={(paths.loading && !!paths.data) || (sections.loading && !!sections.data)} onRefresh={refresh} gap={20}>
      <TitleRow title="reading paths" right={<IconButton name="search" label="search the library" round onPress={() => router.push('/library')} />} />
      <Segmented
        value={view}
        onChange={setView}
        options={[
          { value: 'paths', label: `paths · ${cross.length}` },
          { value: 'sections', label: `sections · ${secs.length}` },
        ]}
      />
      {current.error ? <ErrorBox error={current.error} onRetry={current.refresh} stale={!!current.data} /> : null}
      <View>
        {view === 'paths'
          ? cross.map((p, i) => (
              <Row
                key={p.name}
                mark={roman(p.number ?? i + 1)}
                title={p.name}
                about={p.description}
                counts={`${p.entries?.length ?? p.books.length} books · ${p.in_library ?? p.books.length} in library · ${p.read} read`}
                pinned={p.pinned}
                last={i === cross.length - 1}
                onPress={() => openPath(p.number)}
              />
            ))
          : secs.map((s, i) => (
              <Row
                key={s.name}
                title={s.title}
                about={s.description}
                counts={`${s.entries.length} books · ${s.in_library} in library · ${s.read} read`}
                pinned={s.pinned}
                last={i === secs.length - 1}
                onPress={() => openSection(s.name)}
              />
            ))}
        {!current.data && current.loading ? <Empty>loading…</Empty> : null}
      </View>
    </Screen>
  );
}
