import { useMemo, useState } from 'react';
import { Pressable, Share, Text, TextInput, View } from 'react-native';
import type { AnyHighlight } from '../../../api';
import { openBook } from '../../../components/bits';
import { Icon } from '../../../components/icon';
import { Chip, Empty, ErrorBox, Screen, TitleRow, useUi } from '../../../components/ui';
import { useHighlights } from '../../../data';
import { F, useTheme } from '../../../theme';

type View_ = 'recent' | 'book' | 'notes';

function Item({ h, last, showBook }: { h: AnyHighlight; last: boolean; showBook: boolean }) {
  const u = useUi();
  const { c } = useTheme();
  const meta = [showBook ? h.book_title : null, showBook ? h.authors : null, h.chapter, h.page && !h.chapter ? `p. ${h.page}` : null].filter(Boolean).join(' · ');
  return (
    <View style={[{ gap: 10, paddingTop: 6, paddingBottom: 18 }, !last && u.line]}>
      {h.text ? (
        <Pressable onPress={() => openBook(h.calibre_id)}>
          <Text style={{ fontFamily: F.serif, fontSize: 22, lineHeight: 29, color: c.text }}>“{h.text.trim()}”</Text>
        </Pressable>
      ) : null}
      <View style={[u.row, { justifyContent: 'space-between' }]}>
        <Text style={[u.muted, { flex: 1 }]}>{meta}</Text>
        <Pressable
          accessibilityLabel="share highlight"
          hitSlop={8}
          style={{ width: 44, height: 32, alignItems: 'flex-end', justifyContent: 'center' }}
          onPress={() => Share.share({ message: `“${h.text?.trim() ?? ''}”${h.book_title ? `\n— ${[h.book_title, h.authors].filter(Boolean).join(', ')}` : ''}` })}
        >
          <Icon name="share" size={18} color={c.muted} />
        </Pressable>
      </View>
      {h.note ? (
        <View style={{ backgroundColor: c.panel, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 12, flexDirection: 'row', gap: 8 }}>
          <Icon name="pencil" size={15} color={c.muted} />
          <Text style={[u.soft, { flex: 1 }]}>{h.note}</Text>
        </View>
      ) : null}
    </View>
  );
}

export default function Highlights() {
  const u = useUi();
  const { c } = useTheme();
  const res = useHighlights();
  const [view, setView] = useState<View_>('recent');
  const [query, setQuery] = useState('');
  const all = useMemo(() => (res.data?.highlights ?? []).filter((h) => h.kind !== 'bookmark'), [res.data]);
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    let out = all.filter((h) => (view !== 'notes' || h.note) && (!q || [h.text, h.note, h.book_title, h.authors].some((x) => x?.toLowerCase().includes(q))));
    out = [...out].sort((a, b) =>
      view === 'book' ? (a.book_title ?? '').localeCompare(b.book_title ?? '') || (a.page ?? 0) - (b.page ?? 0) : (b.created ?? '').localeCompare(a.created ?? ''),
    );
    return out;
  }, [all, view, query]);
  const books = new Set(all.map((h) => h.calibre_id ?? h.book_title)).size;

  return (
    <Screen refreshing={res.loading && !!res.data} onRefresh={res.refresh} gap={18}>
      <TitleRow
        title="highlights"
        right={
          res.data ? (
            <Text style={[u.soft, { color: c.muted, marginBottom: 4 }]}>
              {res.data.total ?? all.length} from {res.data.books ?? books} {books === 1 ? 'book' : 'books'}
            </Text>
          ) : null
        }
      />
      <View style={[u.row, { gap: 10, height: 44, paddingHorizontal: 14, backgroundColor: c.panel, borderRadius: 12 }]}>
        <Icon name="search" size={18} color={c.muted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="search highlights and notes"
          placeholderTextColor={c.muted}
          clearButtonMode="while-editing"
          autoCorrect={false}
          style={{ flex: 1, fontFamily: F.sans, fontSize: 15, color: c.text }}
        />
      </View>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Chip label="recent" on={view === 'recent'} onPress={() => setView('recent')} />
        <Chip label="by book" on={view === 'book'} onPress={() => setView('book')} />
        <Chip label="with notes" on={view === 'notes'} onPress={() => setView('notes')} />
      </View>
      {res.error ? <ErrorBox error={res.error} onRetry={res.refresh} stale={!!res.data} /> : null}
      <View>
        {shown.map((h, i) => {
          const header = view === 'book' && (i === 0 || shown[i - 1].book_title !== h.book_title);
          return (
            <View key={h.id}>
              {header ? <Text style={[u.h3, { marginTop: i ? 18 : 0, marginBottom: 8 }]}>{h.book_title ?? 'untitled'}</Text> : null}
              <Item h={h} last={i === shown.length - 1} showBook={view !== 'book'} />
            </View>
          );
        })}
        {!shown.length ? <Empty>{res.loading && !res.data ? 'loading…' : query ? 'nothing matches.' : 'no highlights yet.'}</Empty> : null}
      </View>
    </Screen>
  );
}
