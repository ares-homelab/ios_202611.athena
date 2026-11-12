import { useMemo, useSyncExternalStore } from 'react';
import { StyleSheet, useColorScheme } from 'react-native';
import { readJson, writeJson } from './files';

type Base = { bg: string; panel: string; text: string; muted: string; track: string; accent: string; on: string };
type LightBase = Base & { link: string };

export type Colors = {
  bg: string;
  panel: string;
  raised: string;
  selected: string;
  bar: string;
  text: string;
  soft: string;
  muted: string;
  line: string;
  track: string;
  trackOn: string;
  accent: string;
  onAccent: string;
  link: string;
  progress: string;
  ok: string;
  warn: string;
  warnBg: string;
  warnLine: string;
  dnf: string;
  tbr: string;
  coverEdge: string;
};

const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mix = (a: string, b: string, t: number) =>
  '#' + hex(a).map((x, i) => Math.round(x + (hex(b)[i] - x) * t).toString(16).padStart(2, '0')).join('').toUpperCase();

const dark = (b: Base, x: Partial<Colors> = {}): Colors => ({
  bg: b.bg,
  panel: b.panel,
  raised: mix(b.panel, b.track, 0.5),
  selected: mix(b.panel, b.track, 0.8),
  bar: mix(b.bg, b.panel, 0.5),
  text: b.text,
  soft: mix(b.text, b.muted, 0.5),
  muted: b.muted,
  line: mix(b.panel, b.track, 0.4),
  track: b.track,
  trackOn: mix(b.track, b.accent, 0.35),
  accent: b.accent,
  onAccent: b.on,
  link: b.accent,
  progress: b.accent,
  ok: '#8FB07A',
  warn: '#D9A27E',
  warnBg: '#2A2219',
  warnLine: '#4D3A2A',
  dnf: '#B07A6A',
  tbr: mix(b.track, b.muted, 0.15),
  coverEdge: 'rgba(237,230,214,0.12)',
  ...x,
});

const light = (b: LightBase, x: Partial<Colors> = {}): Colors => ({
  bg: b.bg,
  panel: b.panel,
  raised: mix(b.panel, b.track, 0.5),
  selected: '#FFFCF5',
  bar: mix(b.bg, b.panel, 0.4),
  text: b.text,
  soft: mix(b.text, b.muted, 0.35),
  muted: b.muted,
  line: mix(b.panel, b.track, 0.6),
  track: b.track,
  trackOn: mix(b.track, b.link, 0.4),
  accent: b.accent,
  onAccent: b.on,
  link: b.link,
  progress: mix(b.accent, b.link, 0.4),
  ok: '#5E8F4C',
  warn: '#A8643A',
  warnBg: '#F3E4D6',
  warnLine: '#E0C6AE',
  dnf: '#A0604F',
  tbr: mix(b.track, b.muted, 0.2),
  coverEdge: 'rgba(60,48,20,0.18)',
  ...x,
});

export const PALETTES = [
  {
    id: 'gold',
    note: 'current',
    dark: dark(
      { bg: '#15140F', panel: '#1F1D17', text: '#EDE6D6', muted: '#A39A87', track: '#3A372E', accent: '#D9BE7E', on: '#15140F' },
      { raised: '#2A2720', selected: '#34312A', bar: '#1A1914', soft: '#CFC7B5', line: '#2C2A23', trackOn: '#6E6450', tbr: '#4A463B' },
    ),
    light: light(
      { bg: '#F6F1E7', panel: '#ECE4D3', text: '#1F1C15', muted: '#675E4E', track: '#D6CCB6', accent: '#C9A85C', on: '#1F1C15', link: '#7A5C17' },
      { raised: '#E3DAC6', bar: '#EFE8DA', soft: '#3F392E', line: '#DDD3BF', trackOn: '#A8996F', progress: '#9C7A2A' },
    ),
  },
  {
    id: 'olive',
    note: "athena's tree",
    dark: dark({ bg: '#12140F', panel: '#1C1F17', text: '#E6EAD9', muted: '#9DA38C', track: '#353A2C', accent: '#AFC28A', on: '#12140F' }),
    light: light({ bg: '#F3F4EC', panel: '#E5E8D8', text: '#1B1E15', muted: '#5E6450', track: '#CDD3BC', accent: '#9DB377', on: '#1B1E15', link: '#4E6A2E' }),
  },
  {
    id: 'aegean',
    note: 'sea blue',
    dark: dark({ bg: '#0F1318', panel: '#18202A', text: '#E3EAF1', muted: '#93A1B1', track: '#2C3644', accent: '#8FB8E0', on: '#0F1318' }),
    light: light({ bg: '#F1F4F7', panel: '#E2E9F0', text: '#141A21', muted: '#56636F', track: '#C8D3DE', accent: '#8FB8E0', on: '#141A21', link: '#2C5A85' }),
  },
  {
    id: 'wine',
    note: 'deep red',
    dark: dark({ bg: '#170F12', panel: '#23171C', text: '#F0E3E6', muted: '#A8949A', track: '#3D2A31', accent: '#E0A1B0', on: '#170F12' }),
    light: light({ bg: '#F8F1F2', panel: '#EFE1E4', text: '#21141A', muted: '#6B5960', track: '#DDC7CC', accent: '#DDA0AE', on: '#21141A', link: '#8A3346' }),
  },
  {
    id: 'bronze',
    note: 'warm copper',
    dark: dark({ bg: '#16110D', panel: '#221A14', text: '#EFE4D9', muted: '#A8998B', track: '#3D3127', accent: '#DDA073', on: '#16110D' }),
    light: light({ bg: '#F8F2EB', panel: '#EEE2D5', text: '#22180F', muted: '#6B5C4E', track: '#DCCBB8', accent: '#DDA073', on: '#22180F', link: '#8A4F22' }),
  },
  {
    id: 'marble',
    note: 'neutral grey',
    dark: dark({ bg: '#131313', panel: '#1E1E1E', text: '#ECECEA', muted: '#A3A3A0', track: '#383838', accent: '#D8D8D4', on: '#131313' }),
    light: light({ bg: '#F5F5F3', panel: '#E8E8E5', text: '#1A1A1A', muted: '#616161', track: '#D0D0CC', accent: '#2E2E2E', on: '#F5F5F3', link: '#3A3A3A' }),
  },
] as const;

export type Mode = 'dark' | 'light' | 'system';
type Prefs = { mode: Mode; palette: string };

let prefs: Prefs = { mode: 'dark', palette: 'gold', ...readJson<Partial<Prefs>>('prefs.json', {}) };
const listeners = new Set<() => void>();

export function setPrefs(next: Partial<Prefs>) {
  prefs = { ...prefs, ...next };
  writeJson('prefs.json', prefs);
  listeners.forEach((fn) => fn());
}

const subscribe = (fn: () => void) => {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
};

export const usePrefs = () => useSyncExternalStore(subscribe, () => prefs);

export function useTheme() {
  const p = usePrefs();
  const system = useColorScheme();
  const scheme: 'dark' | 'light' = p.mode === 'system' ? (system === 'light' ? 'light' : 'dark') : p.mode;
  const palette = PALETTES.find((x) => x.id === p.palette) ?? PALETTES[0];
  return { c: palette[scheme], scheme };
}

export function useStyles<T extends StyleSheet.NamedStyles<T>>(make: (c: Colors) => T): T {
  const { c } = useTheme();
  return useMemo(() => StyleSheet.create(make(c)), [c, make]);
}

export const F = {
  serif: 'CormorantGaramond_400Regular',
  serifItalic: 'CormorantGaramond_400Regular_Italic',
  serifMediumItalic: 'CormorantGaramond_500Medium_Italic',
  serifBold: 'CormorantGaramond_600SemiBold',
  sans: 'Inter_400Regular',
  sansMedium: 'Inter_500Medium',
  sansBold: 'Inter_600SemiBold',
};

export const S = { page: 24, gap: 10, radius: 14, card: 16 };
