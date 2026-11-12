import { Pressable, Text, View } from 'react-native';
import { openBook } from '../../../components/bits';
import { Icon } from '../../../components/icon';
import { Cover, Empty, ErrorBox, Eyebrow, Screen, TitleRow, useUi } from '../../../components/ui';
import { useIssues } from '../../../data';
import { clock, dayMonth, longDate, longDateYear, weekday } from '../../../format';
import { F, useTheme, fs } from '../../../theme';

const short = (d: string) => weekday(d).slice(0, 3);

export default function IssuesScreen() {
  const u = useUi();
  const { c } = useTheme();
  const res = useIssues();
  const issues = res.data?.issues ?? [];
  const keep = res.data?.keep ?? 4;
  const latest = issues[0];
  const next = res.data?.next_issue;
  return (
    <Screen refreshing={res.loading && !!res.data} onRefresh={res.refresh} gap={22}>
      <TitleRow title="issues" sub={`the new yorker · read on the kindle · last ${keep} kept`} />
      {res.error ? <ErrorBox error={res.error} onRetry={res.refresh} stale={!!res.data} /> : null}
      {latest ? (
        <Pressable onPress={() => openBook(latest.id)} style={{ backgroundColor: c.panel, borderRadius: 18, padding: 18, flexDirection: 'row', gap: 18 }}>
          <Cover id={latest.id} title="the new yorker" author={latest.date ? dayMonth(latest.date) + ` ${latest.date.slice(0, 4)}` : ''} hasCover={latest.has_cover} width={104} height={140} radius={4} />
          <View style={{ flex: 1, gap: 8 }}>
            <Eyebrow style={{ color: c.link }}>latest</Eyebrow>
            <Text style={{ fontFamily: F.serifBold, fontSize: fs(24), lineHeight: fs(27), color: c.text }}>{longDate(latest.date ?? latest.added)}</Text>
            <Text style={u.soft}>
              arrived {short(latest.added)} {clock(latest.added)} · {latest.sent ? 'on the kindle' : 'not on the kindle yet'}
            </Text>
            <Text style={[u.soft, { color: c.muted }]}>{latest.opened ? 'opened' : 'not opened yet'}</Text>
          </View>
        </Pressable>
      ) : (
        <Empty>{res.loading && !res.data ? 'loading…' : 'no issues kept right now.'}</Empty>
      )}
      {next ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14, paddingHorizontal: 16, borderWidth: 1, borderStyle: 'dashed', borderColor: c.track, borderRadius: 14 }}>
          <Icon name="clock" size={20} color={c.muted} width={1.7} />
          <View style={{ gap: 2, flex: 1 }}>
            <Text style={[u.body, { fontFamily: F.sansMedium }]}>
              next issue {short(next)} {dayMonth(next)}, {clock(next)}
            </Text>
            <Text style={u.muted}>fetched on ares, sent to the kindle on wi-fi</Text>
          </View>
        </View>
      ) : null}
      {issues.length ? (
        <View style={{ gap: 4 }}>
          <Text style={[u.h3, { marginBottom: 6 }]}>kept issues</Text>
          {issues.map((i, n) => (
            <Pressable key={i.id} onPress={() => openBook(i.id)} style={[u.row, { justifyContent: 'space-between', paddingVertical: 12 }, u.line]}>
              <Text style={[u.body, { fontSize: fs(15) }]}>{i.date ? longDateYear(i.date) : i.title}</Text>
              <Text style={u.muted}>
                {n + 1} of {keep}
              </Text>
            </Pressable>
          ))}
          <Text style={[u.soft, { color: c.muted, marginTop: 10, lineHeight: fs(20) }]}>
            older issues show here as they arrive. the oldest is removed when a {keep === 4 ? 'fifth' : 'new one'} comes in. issues don&apos;t count toward athena stats.
          </Text>
        </View>
      ) : null}
    </Screen>
  );
}
