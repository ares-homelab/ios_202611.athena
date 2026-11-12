import type { Book, Workflow } from './api';

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const MONTHS_LONG = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

const pad = (n: number) => String(n).padStart(2, '0');
const toDate = (d: Date | string | number) => (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d) ? new Date(`${d}T12:00:00`) : new Date(d));

export const dayMonth = (d: Date | string) => {
  const x = toDate(d);
  return `${x.getDate()} ${MONTHS[x.getMonth()]}`;
};
export const longDate = (d: Date | string) => {
  const x = toDate(d);
  return `${x.getDate()} ${MONTHS_LONG[x.getMonth()]}`;
};
export const longDateYear = (d: Date | string) => `${longDate(d)} ${toDate(d).getFullYear()}`;
export const weekday = (d: Date | string) => DAYS[toDate(d).getDay()];
export const today = () => `${weekday(new Date())}, ${longDate(new Date())}`;
export const clock = (t: number | Date | string) => {
  const x = new Date(t);
  return `${pad(x.getHours())}:${pad(x.getMinutes())}`;
};
export const monthShort = (ym: string) => MONTHS[Number(ym.slice(5, 7)) - 1] ?? ym;

export const hm = (hours: number) => {
  const m = Math.round(hours * 60);
  if (m < 60) return `${m}m`;
  return `${Math.floor(m / 60)}h ${pad(m % 60)}m`;
};
export const seconds = (s: number) => hm(s / 3600);

export const percent = (p: number) => `${Math.round(p * 100)}%`;

const ROMAN: [number, string][] = [
  [10, 'x'],
  [9, 'ix'],
  [5, 'v'],
  [4, 'iv'],
  [1, 'i'],
];
export function roman(n: number) {
  let out = '';
  for (const [v, s] of ROMAN)
    while (n >= v) {
      out += s;
      n -= v;
    }
  return out;
}

export const statusOf = (b: Pick<Book, 'workflow'>): Workflow | null =>
  (['ONGOING', 'READ', 'DNF', 'TBR'] as Workflow[]).find((w) => b.workflow.includes(w)) ?? null;

export const authors = (a: string[] | string | null | undefined) => (Array.isArray(a) ? a.join(', ') : (a ?? ''));

export const plainText = (html: string | null) =>
  (html ?? '')
    .replace(/<\/(p|div|h\d)>|<br\s*\/?>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

export const LANGS: Record<string, string> = { eng: 'english', por: 'portuguese', spa: 'spanish', fra: 'french', deu: 'german', ita: 'italian', lat: 'latin', jpn: 'japanese', zho: 'chinese' };
