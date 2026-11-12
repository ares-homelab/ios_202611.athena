import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { PathCard, ReadingCards } from '../../../components/bits';
import { Icon } from '../../../components/icon';
import { Button, Cover, Empty, ErrorBox, IconButton, Screen, Tile, Tiles, useUi } from '../../../components/ui';
import { useHome } from '../../../data';
import { clock, dayMonth, hm, today, weekday } from '../../../format';
import { refreshAll, useNet, useOutbox, type Pending } from '../../../store';
import { F, useTheme, fs } from '../../../theme';

const pendingLabel = (p: Pending) =>
  p.kind === 'status' ? `${p.title} → ${p.workflow.toLowerCase()}` : p.kind === 'send' ? `send ${p.title} to the kindle` : p.label;

export default function Home() {
  const u = useUi();
  const { c } = useTheme();
  const home = useHome();
  const net = useNet();
  const outbox = useOutbox();
  const h = home.data;
  const offline = net.online === false;
  const savedAt = home.at ? clock(home.at) : null;
  const reading = h?.reading ?? [];
  const issue = h?.latest_issue;
  const refresh = () => {
    refreshAll();
  };

  return (
    <Screen refreshing={home.loading && !!h} onRefresh={refresh}>
      <View style={[u.row, { justifyContent: 'space-between', alignItems: 'flex-end' }]}>
        <View style={{ gap: 2 }}>
          <Text style={[u.soft, { color: c.muted }]}>{today()}</Text>
          <Text style={{ fontFamily: F.serifMediumItalic, fontSize: fs(40), lineHeight: fs(46), letterSpacing: 0.5, color: c.text }}>athena</Text>
        </View>
        <View style={[u.row, { gap: 6, marginRight: -10 }]}>
          <View style={[u.row, { gap: 6 }]}>
            <View
              style={{
                width: 7,
                height: 7,
                borderRadius: 4,
                backgroundColor: offline ? 'transparent' : c.ok,
                borderWidth: offline ? 1.5 : 0,
                borderColor: c.warn,
              }}
            />
            <Text style={[u.muted, offline && { color: c.warn }]}>
              {offline ? 'offline' : h?.last_sync ? `synced ${clock(h.last_sync)}` : home.loading ? 'syncing' : ''}
            </Text>
          </View>
          <IconButton name="gear" label="settings" onPress={() => router.push('/settings')} />
        </View>
      </View>

      {offline ? (
        <View style={{ backgroundColor: c.warnBg, borderColor: c.warnLine, borderWidth: 1, borderRadius: 16, padding: 16, gap: 12 }}>
          <View style={[u.row, { gap: 12, alignItems: 'flex-start' }]}>
            <Icon name="offline" size={22} color={c.warn} />
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={[u.body, { fontFamily: F.sansBold, fontSize: fs(15) }]}>can&apos;t reach ares</Text>
              <Text style={u.soft}>
                {savedAt ? `showing what was saved at ${savedAt}. ` : ''}connect tailscale or come home to sync.
              </Text>
            </View>
          </View>
          {outbox.length ? (
            <View style={{ borderTopWidth: 1, borderTopColor: c.warnLine, paddingTop: 12, gap: 8 }}>
              <Text style={[u.eyebrow, { color: c.warn }]}>WAITING TO SYNC · {outbox.length}</Text>
              {outbox.map((p, i) => (
                <Text key={i} style={[u.soft, { color: c.text }]}>
                  {pendingLabel(p)}
                </Text>
              ))}
            </View>
          ) : null}
          <Button label="try again" kind="warn" onPress={refresh} busy={home.loading} />
        </View>
      ) : home.error && !h ? (
        <ErrorBox error={home.error} onRetry={refresh} />
      ) : home.error ? (
        <ErrorBox error={home.error} onRetry={refresh} stale />
      ) : null}

      <View style={{ gap: 14 }}>
        <View style={[u.row, { justifyContent: 'space-between', alignItems: 'baseline' }]}>
          <Text style={u.h2}>reading now</Text>
          {offline && savedAt ? (
            <Text style={u.muted}>as of {savedAt}</Text>
          ) : reading.length ? (
            <Pressable onPress={() => router.push('/reading')} hitSlop={8}>
              <Text style={u.link}>all {reading.length}</Text>
            </Pressable>
          ) : null}
        </View>
        {reading.length ? <ReadingCards items={reading} dim={offline} /> : <Empty>{h ? 'nothing open on the kindle right now.' : home.loading ? 'loading…' : ''}</Empty>}
      </View>

      {offline ? (
        <Empty>paths, stats and highlights still open from the saved copy. covers you haven&apos;t viewed yet show as plain titles.</Empty>
      ) : h ? (
        <>
          <Tiles>
            <Tile value={hm((h.seconds_30 ?? 0) / 3600)} label="last 30 days" />
            <Tile value={String(h.reading_days ?? 0)} label="reading days" />
            <Tile value={String(h.books_read ?? 0)} label="books read" />
          </Tiles>

          {h.path ? (
            <View style={{ gap: 12 }}>
              <Text style={u.h2}>continue a path</Text>
              <PathCard path={h.path} />
            </View>
          ) : null}

          {issue ? (
            <Pressable onPress={() => router.navigate('/issues')} style={[u.row, { gap: 14, borderTopWidth: 1, borderTopColor: c.line, paddingTop: 16 }]}>
              <Cover id={issue.id} title="ny" hasCover={issue.has_cover} width={44} height={58} radius={3} />
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={[u.body, { fontFamily: F.sansMedium }]}>the new yorker, {dayMonth(issue.date ?? issue.added)}</Text>
                <Text style={u.muted}>
                  {issue.sent ? 'on the kindle' : 'waiting for the kindle'}
                  {h.next_issue ? ` · next issue ${weekday(h.next_issue).slice(0, 3)} ${dayMonth(h.next_issue)}` : ''}
                </Text>
              </View>
              <Icon name="next" size={18} color={c.muted} />
            </Pressable>
          ) : null}
        </>
      ) : null}
    </Screen>
  );
}
