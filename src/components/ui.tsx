import { Image } from 'expo-image';
import { router } from 'expo-router';
import { ReactNode, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleProp, Text, TextStyle, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api, authHeaders } from '../api';
import { useConfig } from '../config';
import { Colors, F, S, useStyles, useTheme, fs } from '../theme';
import { Icon, IconName } from './icon';

const make = (c: Colors) => ({
  h1: { fontFamily: F.serifBold, fontSize: fs(34), lineHeight: fs(38), color: c.text },
  h2: { fontFamily: F.serifBold, fontSize: fs(24), lineHeight: fs(28), color: c.text },
  h3: { fontFamily: F.serifBold, fontSize: fs(22), lineHeight: fs(26), color: c.text },
  body: { fontFamily: F.sans, fontSize: fs(14), lineHeight: fs(20), color: c.text },
  soft: { fontFamily: F.sans, fontSize: fs(13), lineHeight: fs(18), color: c.soft },
  muted: { fontFamily: F.sans, fontSize: fs(12), lineHeight: fs(16), color: c.muted },
  eyebrow: { fontFamily: F.sans, fontSize: fs(11), letterSpacing: 1.2, color: c.muted },
  link: { fontFamily: F.sans, fontSize: fs(13), color: c.link },
  panel: { backgroundColor: c.panel, borderRadius: S.card, padding: S.card },
  tile: { flex: 1, backgroundColor: c.panel, borderRadius: S.radius, paddingVertical: 14, paddingHorizontal: 12, gap: 4 },
  tileValue: { fontFamily: F.serifBold, fontSize: fs(28), lineHeight: fs(30), color: c.text },
  seg: { flexDirection: 'row' as const, backgroundColor: c.panel, borderRadius: 12, padding: 4, gap: 4 },
  segItem: { flex: 1, height: 38, borderRadius: 9, alignItems: 'center' as const, justifyContent: 'center' as const, flexDirection: 'row' as const, gap: 6 },
  segText: { fontFamily: F.sansMedium, fontSize: fs(14), color: c.muted },
  chip: { backgroundColor: c.panel, borderRadius: 14, paddingVertical: 6, paddingHorizontal: 12 },
  pill: { borderRadius: 10, borderWidth: 1, paddingVertical: 3, paddingHorizontal: 8 },
  error: { backgroundColor: c.warnBg, borderColor: c.warnLine, borderWidth: 1, borderRadius: S.radius, padding: 14, gap: 10 },
  button: { height: 44, borderRadius: 12, alignItems: 'center' as const, justifyContent: 'center' as const, flexDirection: 'row' as const, gap: 10, paddingHorizontal: 16 },
  line: { borderBottomWidth: 1, borderBottomColor: c.line },
  row: { flexDirection: 'row' as const, alignItems: 'center' as const },
});

export const useUi = () => useStyles(make);

export function Screen({
  children,
  refreshing = false,
  onRefresh,
  top = true,
  gap = 24,
}: {
  children: ReactNode;
  refreshing?: boolean;
  onRefresh?: () => void;
  top?: boolean;
  gap?: number;
}) {
  const { c } = useTheme();
  const inset = useSafeAreaInsets();
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.bg }}
      contentContainerStyle={{ paddingTop: top ? inset.top + 14 : 8, paddingHorizontal: S.page, paddingBottom: 40, gap }}
      refreshControl={onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={c.muted} /> : undefined}
    >
      {children}
    </ScrollView>
  );
}

export function TitleRow({ title, right, sub }: { title: string; right?: ReactNode; sub?: string }) {
  const u = useUi();
  const { c } = useTheme();
  return (
    <View style={{ gap: 6 }}>
      <View style={[u.row, { justifyContent: 'space-between', alignItems: 'flex-end' }]}>
        <Text style={u.h1}>{title}</Text>
        {right}
      </View>
      {sub ? <Text style={[u.soft, { color: c.muted }]}>{sub}</Text> : null}
    </View>
  );
}

export function BackBar({ label, right }: { label: string; right?: ReactNode }) {
  const { c } = useTheme();
  const inset = useSafeAreaInsets();
  return (
    <View style={{ paddingTop: inset.top + 6, paddingHorizontal: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: c.bg }}>
      <Pressable
        onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
        hitSlop={8}
        style={{ height: 44, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 4 }}
      >
        <Icon name="back" size={18} color={c.link} width={1.9} />
        <Text style={{ fontFamily: F.sans, fontSize: fs(15), color: c.link }}>{label}</Text>
      </Pressable>
      {right}
    </View>
  );
}

export function IconButton({ name, onPress, color, round, label }: { name: IconName; onPress: () => void; color?: string; round?: boolean; label: string }) {
  const { c } = useTheme();
  return (
    <Pressable
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={6}
      style={{ width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: round ? c.panel : 'transparent' }}
    >
      <Icon name={name} size={round ? 18 : 22} color={color ?? c.soft} />
    </Pressable>
  );
}

export const Eyebrow = ({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) => {
  const u = useUi();
  return <Text style={[u.eyebrow, style]}>{typeof children === 'string' ? children.toUpperCase() : children}</Text>;
};

export function Tile({ value, label, size = 28 }: { value: string; label: string; size?: number }) {
  const u = useUi();
  return (
    <View style={u.tile}>
      <Text style={[u.tileValue, { fontSize: size, lineHeight: size + 2 }]} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      <Text style={u.muted}>{label}</Text>
    </View>
  );
}

export const Tiles = ({ children }: { children: ReactNode }) => <View style={{ flexDirection: 'row', gap: 10 }}>{children}</View>;

export function Bar({ value, height = 3 }: { value: number; height?: number }) {
  const { c } = useTheme();
  return (
    <View style={{ height, borderRadius: 2, backgroundColor: c.line }}>
      <View style={{ width: `${Math.max(0, Math.min(1, value)) * 100}%`, height, borderRadius: 2, backgroundColor: c.progress }} />
    </View>
  );
}

export function Segments({ items, height = 4 }: { items: ('read' | 'library' | 'missing')[]; height?: number }) {
  const { c } = useTheme();
  const color = { read: c.progress, library: c.trackOn, missing: c.track };
  return (
    <View style={{ flexDirection: 'row', gap: 4 }}>
      {items.map((x, i) => (
        <View key={i} style={{ flex: 1, height, borderRadius: height / 2, backgroundColor: color[x] }} />
      ))}
    </View>
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  strong,
  icons,
  style,
}: {
  options: { value: T; label: string }[];
  value: T | null;
  onChange: (v: T) => void;
  strong?: boolean;
  icons?: Partial<Record<T, IconName>>;
  style?: StyleProp<ViewStyle>;
}) {
  const u = useUi();
  const { c } = useTheme();
  return (
    <View style={[u.seg, style]} accessibilityRole="radiogroup">
      {options.map((o) => {
        const on = o.value === value;
        const fg = on ? (strong ? c.onAccent : c.text) : c.muted;
        return (
          <Pressable
            key={o.value}
            accessibilityRole="radio"
            accessibilityState={{ checked: on }}
            onPress={() => onChange(o.value)}
            style={[u.segItem, on && { backgroundColor: strong ? c.accent : c.selected }]}
          >
            {icons?.[o.value] ? <Icon name={icons[o.value]!} size={15} color={fg} width={2} /> : null}
            <Text style={[u.segText, { color: fg }, on && strong && { fontFamily: F.sansBold }]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Chip({ label, on, onPress }: { label: string; on?: boolean; onPress?: () => void }) {
  const { c } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={{
        height: 34,
        paddingHorizontal: 14,
        borderRadius: 17,
        justifyContent: 'center',
        backgroundColor: on ? c.accent : 'transparent',
        borderWidth: on ? 0 : 1,
        borderColor: c.track,
      }}
    >
      <Text style={{ fontFamily: on ? F.sansBold : F.sansMedium, fontSize: fs(13), color: on ? c.onAccent : c.soft }}>{label}</Text>
    </Pressable>
  );
}

export function Tag({ label }: { label: string }) {
  const u = useUi();
  return (
    <View style={u.chip}>
      <Text style={[u.muted, { color: useTheme().c.soft }]}>{label}</Text>
    </View>
  );
}

export function StatusPill({ status, strong }: { status: string; strong?: boolean }) {
  const u = useUi();
  const { c } = useTheme();
  const missing = status === 'to find';
  if (strong)
    return (
      <View style={[u.pill, { backgroundColor: c.accent, borderColor: c.accent }]}>
        <Text style={{ fontFamily: F.sansBold, fontSize: fs(11), color: c.onAccent }}>{status}</Text>
      </View>
    );
  return (
    <View style={[u.pill, { borderColor: missing ? c.track : c.trackOn }]}>
      <Text style={{ fontFamily: F.sans, fontSize: fs(11), color: missing ? c.muted : c.text }}>{status}</Text>
    </View>
  );
}

export function Button({ label, onPress, icon, kind = 'primary', busy, style }: { label: string; onPress: () => void; icon?: IconName; kind?: 'primary' | 'outline' | 'warn'; busy?: boolean; style?: StyleProp<ViewStyle> }) {
  const u = useUi();
  const { c } = useTheme();
  const bg = kind === 'primary' ? c.accent : kind === 'warn' ? c.warn : 'transparent';
  const fg = kind === 'outline' ? c.text : c.onAccent;
  return (
    <Pressable
      disabled={busy}
      onPress={onPress}
      style={({ pressed }) => [
        u.button,
        { backgroundColor: bg, opacity: busy ? 0.6 : pressed ? 0.85 : 1 },
        kind === 'outline' && { borderWidth: 1, borderColor: c.trackOn, height: 36, borderRadius: 18, paddingHorizontal: 14 },
        style,
      ]}
    >
      {icon ? <Icon name={icon} size={20} color={fg} width={1.9} /> : null}
      <Text style={{ fontFamily: kind === 'outline' ? F.sansMedium : F.sansBold, fontSize: kind === 'outline' ? 13 : 14, color: fg }}>{busy ? '…' : label}</Text>
    </Pressable>
  );
}

export function ErrorBox({ error, onRetry, stale }: { error: string; onRetry: () => void; stale?: boolean }) {
  const u = useUi();
  const { c } = useTheme();
  return (
    <View style={u.error}>
      <Text style={[u.body, { fontFamily: F.sansBold }]}>{error}</Text>
      {stale ? <Text style={u.soft}>showing the saved copy.</Text> : null}
      <Button label="try again" kind="warn" onPress={onRetry} style={{ backgroundColor: c.warn }} />
    </View>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  const u = useUi();
  return <Text style={[u.soft, { color: useTheme().c.muted, lineHeight: fs(20) }]}>{children}</Text>;
}

const COVERS = ['#3B4A3A', '#5A3B2E', '#2E3A52', '#6B4A2A', '#4A3B52', '#E6DCC4'];
const coverColor = (key: string) => COVERS[[...key].reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) >>> 0, 7) % COVERS.length];

export function Cover({
  id,
  title,
  author,
  hasCover = true,
  width,
  height,
  plain,
  radius = 6,
  shadow,
}: {
  id: number | null | undefined;
  title: string;
  author?: string;
  hasCover?: boolean;
  width: number;
  height: number;
  plain?: boolean;
  radius?: number;
  shadow?: boolean;
}) {
  const { c } = useTheme();
  const { url, token } = useConfig();
  const [failed, setFailed] = useState(false);
  const bg = coverColor(title);
  const lightCover = bg === '#E6DCC4';
  const small = width < 80;
  return (
    <View
      style={[
        { width, height, borderRadius: radius, backgroundColor: bg, overflow: 'hidden', borderWidth: 1, borderColor: c.coverEdge },
        shadow && { shadowColor: '#000', shadowOpacity: 0.45, shadowRadius: 15, shadowOffset: { width: 0, height: 10 } },
      ]}
    >
      {!plain && !small ? (
        <View style={{ flex: 1, paddingVertical: 14, paddingHorizontal: 12, justifyContent: 'space-between' }}>
          <Text style={{ fontFamily: F.serif, fontSize: width > 120 ? 19 : 17, lineHeight: width > 120 ? 21 : 18, color: lightCover ? '#2A251B' : '#F1EBDC' }} numberOfLines={5}>
            {title}
          </Text>
          {author ? (
            <Text style={{ fontFamily: F.sans, fontSize: fs(9.5), letterSpacing: 1, color: lightCover ? '#2A251B' : '#D7CFBD' }} numberOfLines={2}>
              {author.toUpperCase()}
            </Text>
          ) : null}
        </View>
      ) : null}
      {id && hasCover && !failed && token ? (
        <Image
          source={{ uri: `${url}/books/${id}/cover`, headers: authHeaders(), cacheKey: `cover-${id}` }}
          cachePolicy="disk"
          recyclingKey={String(id)}
          transition={150}
          contentFit="cover"
          onError={() => setFailed(true)}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        />
      ) : null}
    </View>
  );
}

export const coverUrl = api.coverUrl;

export function RowLink({ title, sub, onPress, icon }: { title: string; sub?: string; onPress: () => void; icon?: IconName }) {
  const u = useUi();
  const { c } = useTheme();
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [u.row, { gap: 12, minHeight: 58, opacity: pressed ? 0.7 : 1 }]}>
      {icon ? (
        <View style={{ width: 34, height: 34, borderRadius: 9, backgroundColor: c.raised, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name={icon} size={18} color={c.link} />
        </View>
      ) : null}
      <View style={{ flex: 1, gap: 2, paddingVertical: 8 }}>
        <Text style={{ fontFamily: F.sans, fontSize: fs(15), color: c.text }}>{title}</Text>
        {sub ? <Text style={{ fontFamily: F.sans, fontSize: fs(13), color: c.muted }}>{sub}</Text> : null}
      </View>
      <Icon name="next" size={16} color={c.muted} />
    </Pressable>
  );
}

export function Group({ label, children }: { label: string; children: ReactNode }) {
  const { c } = useTheme();
  return (
    <View style={{ gap: 8 }}>
      <Text style={{ marginHorizontal: 4, marginTop: 8, fontFamily: F.sansBold, fontSize: fs(12), letterSpacing: 1, color: c.muted }}>{label.toUpperCase()}</Text>
      <View style={{ backgroundColor: c.panel, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 4 }}>{children}</View>
    </View>
  );
}

export const Divider = () => <View style={{ height: 1, backgroundColor: useTheme().c.line }} />;
