import { Pressable, Text, View } from 'react-native';
import { openBook } from '../../../components/bits';
import { Empty, ErrorBox, Screen, TitleRow, useUi } from '../../../components/ui';
import { useStats } from '../../../data';
import { dayMonth, hm, monthShort, seconds } from '../../../format';
import { F, useTheme } from '../../../theme';

const Big = ({ value, label }: { value: string; label: string }) => {
  const u = useUi();
  const { c } = useTheme();
  return (
    <View style={{ gap: 4 }}>
      <Text style={{ fontFamily: F.serifBold, fontSize: 44, lineHeight: 48, color: c.text }}>{value}</Text>
      <Text style={[u.soft, { color: c.muted }]}>{label}</Text>
    </View>
  );
};

export default function StatsScreen() {
  const u = useUi();
  const { c } = useTheme();
  const stats = useStats();
  const s = stats.data;
  const thisMonth = new Date().toISOString().slice(0, 7);
  const months = (s?.year_months?.length ? s.year_months : (s?.months ?? [])).slice(-6);
  const max = Math.max(1, ...months.map((m) => m.hours));
  const lib = s?.library ?? {};
  const parts = [
    { key: 'READ', label: 'read', color: c.progress },
    { key: 'ONGOING', label: 'ongoing', color: c.ok },
    { key: 'TBR', label: 'tbr', color: c.tbr, edge: true },
    { key: 'DNF', label: 'dnf', color: c.dnf },
  ] as const;
  const libTotal = parts.reduce((a, p) => a + (lib[p.key] ?? 0), 0);

  return (
    <Screen refreshing={stats.loading && !!s} onRefresh={stats.refresh} gap={22}>
      <TitleRow title="stats" right={<Text style={[u.soft, { color: c.muted, marginBottom: 4 }]}>{s?.year ?? new Date().getFullYear()} · athena only</Text>} />
      {stats.error ? <ErrorBox error={stats.error} onRetry={stats.refresh} stale={!!s} /> : null}
      {!s ? (
        <Empty>{stats.loading ? 'loading…' : ''}</Empty>
      ) : (
        <>
          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: 'row', gap: 28 }}>
              <Big value={hm(s.year_hours ?? s.hours)} label={s.year_hours != null ? 'reading this year' : 'reading in all'} />
              <Big value={String(s.year_days ?? s.days)} label="reading days" />
            </View>
            <Text style={u.muted}>
              streak {s.streak} {s.streak === 1 ? 'day' : 'days'} · longest {s.longest_streak}
            </Text>
          </View>

          {months.length ? (
            <View style={{ backgroundColor: c.panel, borderRadius: 16, paddingTop: 18, paddingHorizontal: 16, paddingBottom: 14, gap: 14 }}>
              <Text style={[u.soft, { color: c.soft }]}>hours per month</Text>
              <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-end', height: 170 }}>
                {months.map((m) => {
                  const h = Math.max(2, Math.round((m.hours / max) * 140));
                  const now = m.month === thisMonth && h < 10;
                  return (
                    <View key={m.month} style={{ flex: 1, alignItems: 'center', gap: 6 }}>
                      <Text style={{ fontFamily: F.sans, fontSize: 11, color: c.soft }}>{m.hours.toFixed(1)}</Text>
                      <View style={{ width: '100%', height: h, borderTopLeftRadius: 4, borderTopRightRadius: 4, backgroundColor: now ? c.trackOn : c.progress }} />
                    </View>
                  );
                })}
              </View>
              <View style={{ flexDirection: 'row', gap: 12, borderTopWidth: 1, borderTopColor: c.selected, paddingTop: 8 }}>
                {months.map((m) => (
                  <Text key={m.month} style={{ flex: 1, textAlign: 'center', fontFamily: F.sans, fontSize: 11, color: c.muted }}>
                    {monthShort(m.month)}
                  </Text>
                ))}
              </View>
            </View>
          ) : null}

          {libTotal ? (
            <View style={{ gap: 12 }}>
              <Text style={u.h3}>library</Text>
              <View style={{ flexDirection: 'row', height: 10, borderRadius: 5, overflow: 'hidden', gap: 2 }}>
                {parts.map((p) => (lib[p.key] ? <View key={p.key} style={{ flex: lib[p.key], backgroundColor: p.color }} /> : null))}
              </View>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', rowGap: 10 }}>
                {parts.map((p) => (
                  <View key={p.key} style={[u.row, { width: '50%', gap: 8 }]}>
                    <View style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: p.color, borderWidth: 'edge' in p ? 1 : 0, borderColor: c.trackOn }} />
                    <Text style={u.body}>
                      {lib[p.key] ?? 0} {p.label}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          {s.recent?.length ? (
            <View style={{ gap: 4 }}>
              <Text style={[u.h3, { marginBottom: 6 }]}>recent sessions</Text>
              {s.recent.map((r, i) => (
                <Pressable
                  key={`${r.date}-${i}`}
                  onPress={() => openBook(r.calibre_id)}
                  style={[u.row, { justifyContent: 'space-between', gap: 12, paddingVertical: 10 }, i < s.recent!.length - 1 && u.line]}
                >
                  <Text style={[u.body, { flex: 1 }]} numberOfLines={1}>
                    {r.title ?? 'untitled'}
                  </Text>
                  <Text style={[u.soft, { color: c.muted }]}>
                    {dayMonth(r.date)} · {seconds(r.seconds)}
                  </Text>
                </Pressable>
              ))}
            </View>
          ) : null}
        </>
      )}
    </Screen>
  );
}
