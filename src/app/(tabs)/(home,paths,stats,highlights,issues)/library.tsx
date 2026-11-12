import { useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, Text, TextInput, View } from 'react-native';
import { WORKFLOWS, type Workflow } from '../../../api';
import { openBook } from '../../../components/bits';
import { Icon } from '../../../components/icon';
import { BackBar, Chip, Cover, Empty, ErrorBox, useUi } from '../../../components/ui';
import { useBooks } from '../../../data';
import { authors, statusOf } from '../../../format';
import { F, useTheme } from '../../../theme';

const fold = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export default function Library() {
  const u = useUi();
  const { c } = useTheme();
  const books = useBooks();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Workflow | null>(null);
  const shown = useMemo(() => {
    const q = fold(query.trim());
    return (books.data ?? []).filter(
      (b) => !b.types.some((t) => t.startsWith('periodicals')) && (!filter || b.workflow.includes(filter)) && (!q || fold(`${b.title} ${b.authors.join(' ')} ${b.series ?? ''}`).includes(q)),
    );
  }, [books.data, query, filter]);
  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <BackBar label="paths" />
      <View style={{ paddingHorizontal: 24, gap: 14, paddingBottom: 12 }}>
        <Text style={u.h1}>library</Text>
        <View style={[u.row, { gap: 10, height: 44, paddingHorizontal: 14, backgroundColor: c.panel, borderRadius: 12 }]}>
          <Icon name="search" size={18} color={c.muted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="title, author or series"
            placeholderTextColor={c.muted}
            clearButtonMode="while-editing"
            autoCorrect={false}
            autoFocus
            style={{ flex: 1, fontFamily: F.sans, fontSize: 15, color: c.text }}
          />
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {WORKFLOWS.map((w) => (
            <Chip key={w} label={w.toLowerCase()} on={filter === w} onPress={() => setFilter(filter === w ? null : w)} />
          ))}
        </View>
        {books.error ? <ErrorBox error={books.error} onRetry={books.refresh} stale={!!books.data} /> : null}
      </View>
      <FlatList
        data={shown}
        keyExtractor={(b) => String(b.id)}
        keyboardDismissMode="on-drag"
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={books.loading && !!books.data} onRefresh={books.refresh} tintColor={c.muted} />}
        ListEmptyComponent={<Empty>{books.loading && !books.data ? 'loading…' : 'no books match.'}</Empty>}
        renderItem={({ item: b }) => (
          <Pressable onPress={() => openBook(b.id)} style={[u.row, { gap: 14, paddingVertical: 10 }, u.line]}>
            <Cover id={b.id} title={b.title} hasCover={b.has_cover} width={34} height={50} radius={3} />
            <View style={{ flex: 1, gap: 3 }}>
              <Text style={{ fontFamily: F.sansMedium, fontSize: 15, color: c.text }} numberOfLines={2}>
                {b.title}
              </Text>
              <Text style={u.muted} numberOfLines={1}>
                {[authors(b.authors), b.series].filter(Boolean).join(' · ')}
              </Text>
            </View>
            <Text style={u.muted}>{statusOf(b)?.toLowerCase() ?? ''}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}
