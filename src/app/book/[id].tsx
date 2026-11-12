import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActionSheetIOS, Alert, Pressable, Text, View } from 'react-native';
import { WORKFLOWS, type Workflow } from '../../api';
import { openPath, openSection } from '../../components/bits';
import { Icon } from '../../components/icon';
import { BackBar, Button, Cover, Empty, ErrorBox, Eyebrow, IconButton, RowLink, Screen, Segmented, Tag, Tile, Tiles, useUi } from '../../components/ui';
import { useBook, useBookHighlights, usePins } from '../../data';
import { authors, dayMonth, LANGS, plainText, roman, seconds, statusOf } from '../../format';
import { perform, useOutbox } from '../../store';
import { F, useTheme, fs } from '../../theme';

export default function BookScreen() {
  const { id: raw } = useLocalSearchParams<{ id: string }>();
  const id = Number(raw);
  const u = useUi();
  const { c } = useTheme();
  const book = useBook(id);
  const hl = useBookHighlights(id);
  const pins = usePins();
  const outbox = useOutbox();
  const [busy, setBusy] = useState<string | null>(null);
  const [allHl, setAllHl] = useState(false);
  const [more, setMore] = useState(false);
  const b = book.data;

  if (!b)
    return (
      <View style={{ flex: 1, backgroundColor: c.bg }}>
        <BackBar label="back" />
        <Screen top={false} onRefresh={book.refresh}>
          {book.error ? <ErrorBox error={book.error} onRetry={book.refresh} /> : <Empty>loading…</Empty>}
        </Screen>
      </View>
    );

  const status = statusOf(b);
  const queued = outbox.some((p) => p.kind === 'status' && p.book_id === id);
  const pinned = pins.data?.books.includes(id) ?? false;
  const pending = b.sent && !b.sent.sent;
  const prog = b.progress;
  const pages = b.pages ?? prog?.pages ?? null;
  const highlights = (hl.data ?? []).filter((h) => h.kind !== 'bookmark');
  const about = plainText(b.description);
  const language = b.language ?? (b.languages[0] ? (LANGS[b.languages[0]] ?? b.languages[0]) : null);

  const run = async (what: string, fn: () => Promise<unknown>) => {
    setBusy(what);
    try {
      await fn();
    } catch (e) {
      Alert.alert("ares didn't take it", (e as Error).message);
    } finally {
      setBusy(null);
    }
  };
  const setStatus = (w: Workflow) => w !== status && run('status', () => perform({ kind: 'status', book_id: id, title: b.title, workflow: w }));
  const send = () => run('send', () => perform({ kind: 'send', book_id: id, title: b.title }));
  const togglePin = () => {
    const cur = pins.data ?? { books: [], paths: [] };
    const books = pinned ? cur.books.filter((x) => x !== id) : [...cur.books, id];
    run('pin', () => perform({ kind: 'pins', pins: { ...cur, books }, label: `${pinned ? 'unpinned' : 'pinned'} ${b.title}` }));
  };
  const actions = () =>
    ActionSheetIOS.showActionSheetWithOptions({ options: [pinned ? 'unpin book' : 'pin book', 'send to kindle', 'cancel'], cancelButtonIndex: 2 }, (i) => {
      if (i === 0) togglePin();
      if (i === 1) send();
    });

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <BackBar label="back" right={<IconButton name="more" label="more actions" onPress={actions} />} />
      <Screen
        top={false}
        gap={22}
        refreshing={book.loading}
        onRefresh={() => {
          book.refresh();
          hl.refresh();
        }}
      >
        {book.error ? <ErrorBox error={book.error} onRetry={book.refresh} stale /> : null}
        <View style={{ flexDirection: 'row', gap: 18, alignItems: 'flex-end' }}>
          <Cover id={id} title={b.title} author={b.authors[0]} hasCover={b.has_cover} width={118} height={177} shadow />
          <View style={{ flex: 1, gap: 6, paddingBottom: 4 }}>
            <Text style={{ fontFamily: F.serifBold, fontSize: fs(28), lineHeight: fs(30), color: c.text }}>{b.title}</Text>
            <Text style={[u.soft, { fontSize: fs(14) }]}>{[authors(b.authors), b.year].filter(Boolean).join(' · ')}</Text>
            <Text style={u.muted}>
              {[pages ? `${pages} pages` : null, language, b.series ? `${b.series}${b.series_index ? ` ${b.series_index}` : ''}` : null, pinned ? 'pinned' : null]
                .filter(Boolean)
                .join(' · ')}
            </Text>
          </View>
        </View>

        {b.on_kindle || pending ? (
          <View style={[u.row, { gap: 12, paddingVertical: 12, paddingHorizontal: 14, borderWidth: 1, borderColor: c.track, borderRadius: 14 }]}>
            <Icon name={pending ? 'send' : 'kindle'} size={20} color={c.ok} />
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={[u.body, { fontFamily: F.sansMedium }]}>{pending ? 'waiting for the kindle' : 'on the kindle'}</Text>
              <Text style={u.muted}>
                {pending
                  ? 'ares copies it the next time the kindle is on wi-fi'
                  : prog?.source === 'kosync'
                    ? 'progress synced through kosync'
                    : 'progress from reading sessions'}
              </Text>
            </View>
            {pending ? null : <Button label="send again" kind="outline" onPress={send} busy={busy === 'send'} />}
          </View>
        ) : (
          <View style={{ gap: 8 }}>
            <Button label="send to kindle" icon="send" onPress={send} busy={busy === 'send'} style={{ height: 52, borderRadius: 14 }} />
            <Text style={[u.muted, { textAlign: 'center' }]}>ares copies it the next time the kindle is on wi-fi</Text>
          </View>
        )}

        <View style={{ gap: 10 }}>
          <Eyebrow>status</Eyebrow>
          <Segmented strong value={status} onChange={setStatus} options={WORKFLOWS.map((w) => ({ value: w, label: w.toLowerCase() }))} />
          <Text style={u.muted}>{busy === 'status' ? 'saving…' : queued ? 'waiting to sync with ares' : 'saved to calibre on ares'}</Text>
        </View>

        {prog || b.time_read || b.last_read ? (
          <Tiles>
            <Tile size={26} value={prog ? `${Math.round(prog.progress * 100)}%` : '–'} label={prog?.page && (prog.pages ?? pages) ? `p. ${prog.page} of ${prog.pages ?? pages}` : 'progress'} />
            <Tile size={26} value={b.time_read ? seconds(b.time_read) : '–'} label="time read" />
            <Tile size={26} value={b.last_read ? dayMonth(b.last_read) : '–'} label="last read" />
          </Tiles>
        ) : null}

        {b.paths?.length ? (
          <View style={{ gap: 10 }}>
            <Eyebrow>on a path</Eyebrow>
            {b.paths.map((m) => (
              <View key={`${m.kind}-${m.name}`} style={{ backgroundColor: c.panel, borderRadius: 14, paddingHorizontal: 16 }}>
                <RowLink
                  title={m.kind === 'section' ? (m.title ?? m.name) : m.name}
                  sub={m.kind === 'path' ? `path ${roman(m.number ?? 0)} · ${m.books} books` : `section · ${m.books} books`}
                  onPress={() => (m.kind === 'path' ? openPath(m.number) : openSection(m.name))}
                />
              </View>
            ))}
          </View>
        ) : null}

        {highlights.length ? (
          <View style={{ gap: 10 }}>
            <View style={[u.row, { justifyContent: 'space-between', alignItems: 'baseline' }]}>
              <Eyebrow>highlights · {highlights.length}</Eyebrow>
              {highlights.length > 2 ? (
                <Pressable onPress={() => setAllHl(!allHl)} hitSlop={8}>
                  <Text style={u.link}>{allHl ? 'show fewer' : 'see all'}</Text>
                </Pressable>
              ) : null}
            </View>
            {(allHl ? highlights : highlights.slice(0, 2)).map((h) => (
              <View key={h.id} style={{ borderLeftWidth: 2, borderLeftColor: c.accent, paddingLeft: 14, paddingVertical: 2, gap: 6 }}>
                {h.text ? <Text style={{ fontFamily: F.serif, fontSize: fs(18), lineHeight: fs(24), color: c.soft }}>{h.text}</Text> : null}
                {h.note ? <Text style={[u.soft, { color: c.text }]}>{h.note}</Text> : null}
                <Text style={u.muted}>{[h.chapter, h.page ? `p. ${h.page}` : null].filter(Boolean).join(' · ') || 'synced from koreader'}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {about ? (
          <Pressable onPress={() => setMore(!more)} style={{ gap: 10 }}>
            <Eyebrow>about</Eyebrow>
            <Text style={[u.soft, { fontSize: fs(14), lineHeight: fs(21) }]} numberOfLines={more ? undefined : 6}>
              {about}
            </Text>
          </Pressable>
        ) : null}

        {b.tags.length ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {b.tags.map((t) => (
              <Tag key={t} label={t} />
            ))}
          </View>
        ) : null}
      </Screen>
    </View>
  );
}
