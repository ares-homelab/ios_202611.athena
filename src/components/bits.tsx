import { router } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import type { Entry, Path, Reading } from '../api';
import { dayMonth, percent } from '../format';
import { F, useTheme } from '../theme';
import { Bar, Cover, Segments, useUi } from './ui';

export const segmentsOf = (entries: Entry[] = []) =>
  entries.map((e) => (e.status === 'read' ? 'read' : e.calibre_id ? 'library' : 'missing') as 'read' | 'library' | 'missing');

export const openBook = (id: number | null | undefined) => id && router.push({ pathname: '/book/[id]', params: { id: String(id) } });
export const openPath = (n: number | null | undefined) => n != null && router.push({ pathname: '/path/[number]', params: { number: String(n) } });
export const openSection = (name: string) => router.push({ pathname: '/section/[name]', params: { name } });

export function ReadingCards({ items, dim }: { items: Reading[]; dim?: boolean }) {
  const u = useUi();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -24, opacity: dim ? 0.85 : 1 }} contentContainerStyle={{ paddingHorizontal: 24, gap: 14 }}>
      {items.map((r) => (
        <Pressable key={`${r.calibre_id}-${r.title}`} onPress={() => openBook(r.calibre_id)} style={{ width: 132, gap: 8 }}>
          <Cover id={r.calibre_id} title={r.title} author={r.authors ?? ''} width={132} height={198} />
          <Bar value={r.progress} />
          <Text style={u.muted}>
            {percent(r.progress)} · {dayMonth(r.last_read)}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

export function PathCard({ path }: { path: Path }) {
  const u = useUi();
  const { c } = useTheme();
  const entries = path.entries ?? [];
  const total = entries.length || path.books.length;
  const next = path.up_next;
  return (
    <Pressable onPress={() => openPath(path.number)} style={({ pressed }) => [u.panel, { gap: 12, opacity: pressed ? 0.8 : 1 }]}>
      <View style={[u.row, { justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }]}>
        <Text style={[u.eyebrow, { flex: 1 }]}>{(path.sections ?? []).join(' · ').toUpperCase()}</Text>
        <Text style={[u.muted, { maxWidth: 110, textAlign: 'right' }]}>
          {path.read} of {total} · {path.in_library ?? path.books.length} in library
        </Text>
      </View>
      <Text style={u.h3}>{path.name}</Text>
      {entries.length ? <Segments items={segmentsOf(entries)} /> : null}
      {next ? (
        <Text style={u.soft}>
          next in your library: <Text style={{ color: c.text, fontFamily: F.sansMedium }}>{next.title}</Text>, {next.author}
        </Text>
      ) : null}
    </Pressable>
  );
}
