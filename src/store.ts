import { useCallback, useEffect, useSyncExternalStore } from 'react';
import { api, Book, BookFull, Entry as PathEntry, EntryStatus, net, OfflineError, onNet, Path, pathKey, Pins, Section, sectionKey, Send, Workflow } from './api';
import { clearDir, readJson, writeJson } from './files';

type Entry = { data?: unknown; at?: number; error?: string; loading: boolean };
const entries = new Map<string, Entry>();
const listeners = new Map<string, Set<() => void>>();
const EMPTY: Entry = { loading: false };

const cacheName = (key: string) => `cache/${key.replace(/[^a-z0-9]+/gi, '_')}.json`;

const emit = (key: string) => listeners.get(key)?.forEach((fn) => fn());

function set(key: string, next: Partial<Entry>) {
  entries.set(key, { ...(entries.get(key) ?? EMPTY), ...next });
  emit(key);
}

function hydrate(key: string) {
  if (entries.has(key)) return;
  const saved = readJson<{ at: number; data: unknown } | null>(cacheName(key), null);
  entries.set(key, saved ? { data: saved.data, at: saved.at, loading: false } : { loading: false });
}

const inflight = new Map<string, Promise<void>>();

export function load(key: string, fetcher: () => Promise<unknown>) {
  const running = inflight.get(key);
  if (running) return running;
  hydrate(key);
  set(key, { loading: true });
  const p = fetcher()
    .then((data) => {
      const at = Date.now();
      set(key, { data, at, error: undefined, loading: false });
      writeJson(cacheName(key), { at, data });
    })
    .catch((e: Error) => set(key, { error: e.message || 'something went wrong', loading: false }))
    .finally(() => inflight.delete(key));
  inflight.set(key, p);
  return p;
}

const fetchers = new Map<string, () => Promise<unknown>>();

export function useResource<T>(key: string, fetcher: () => Promise<T>) {
  fetchers.set(key, fetcher);
  const subscribe = useCallback(
    (fn: () => void) => {
      if (!listeners.has(key)) listeners.set(key, new Set());
      listeners.get(key)!.add(fn);
      return () => {
        listeners.get(key)!.delete(fn);
      };
    },
    [key],
  );
  const entry = useSyncExternalStore(subscribe, () => {
    hydrate(key);
    return entries.get(key) ?? EMPTY;
  });
  useEffect(() => {
    load(key, () => fetchers.get(key)!());
  }, [key]);
  const refresh = useCallback(() => load(key, () => fetchers.get(key)!()), [key]);
  return { data: entry.data as T | undefined, at: entry.at, error: entry.error, loading: entry.loading, refresh };
}

export const refreshKeys = (...keys: string[]) =>
  Promise.all(keys.filter((k) => fetchers.has(k)).map((k) => load(k, fetchers.get(k)!)));

export const refreshAll = () => flush().then(() => refreshKeys(...fetchers.keys()));

export function patch<T>(key: string, fn: (data: T) => T) {
  hydrate(key);
  const e = entries.get(key);
  if (e?.data === undefined) return;
  const data = fn(e.data as T);
  set(key, { data });
  writeJson(cacheName(key), { at: e.at, data });
}

export function clearCache() {
  entries.clear();
  clearDir('cache');
  for (const k of listeners.keys()) emit(k);
}

let netSnap = { ...net };
onNet(() => {
  netSnap = { ...net };
});
export const useNet = () => useSyncExternalStore(onNet, () => netSnap);

export type Pending =
  | { kind: 'status'; book_id: number; title: string; workflow: Workflow }
  | { kind: 'pins'; pins: Pins; label: string }
  | { kind: 'send'; book_id: number; title: string };

let outbox: Pending[] = readJson<Pending[]>('outbox.json', []);
const outboxListeners = new Set<() => void>();
const saveOutbox = (next: Pending[]) => {
  outbox = next;
  writeJson('outbox.json', outbox);
  outboxListeners.forEach((fn) => fn());
};

export const useOutbox = () =>
  useSyncExternalStore(
    (fn) => {
      outboxListeners.add(fn);
      return () => {
        outboxListeners.delete(fn);
      };
    },
    () => outbox,
  );

const same = (a: Pending, b: Pending) =>
  a.kind === b.kind && (a.kind === 'pins' || ('book_id' in a && 'book_id' in b && a.book_id === b.book_id));

const run = (p: Pending): Promise<unknown> =>
  p.kind === 'status' ? api.setStatus(p.book_id, p.workflow) : p.kind === 'pins' ? api.setPins(p.pins) : api.send(p.book_id);

const AFTER: Record<Pending['kind'], (p: Pending) => string[]> = {
  status: (p) => ['books', 'paths', 'sections', 'home', 'reading', 'stats/', `book/${'book_id' in p ? p.book_id : ''}`],
  pins: () => ['pins', 'paths', 'sections', 'home'],
  send: (p) => ['sends', `book/${'book_id' in p ? p.book_id : ''}`],
};

type Pinnable = { section?: string; name: string; pinned?: boolean };
type WithEntries = { entries?: PathEntry[] };

function applyLocally(p: Pending) {
  if (p.kind === 'status') {
    const st = p.workflow.toLowerCase() as EntryStatus;
    const book = (b: Book) => (b.id === p.book_id ? { ...b, workflow: [p.workflow] } : b);
    const entries = <T extends WithEntries>(x: T): T => ({
      ...x,
      entries: x.entries?.map((e) => (e.calibre_id === p.book_id ? { ...e, status: st } : e)),
    });
    patch<Book[]>('books', (bs) => bs.map(book));
    patch<BookFull>(`book/${p.book_id}`, (b) => ({ ...b, workflow: [p.workflow] }));
    patch<Path[]>('paths', (ps) => ps.map((x) => entries({ ...x, books: x.books.map(book) })));
    patch<Section[]>('sections', (ss) => ss.map(entries));
  }
  if (p.kind === 'pins') {
    const pinned = new Set(p.pins.paths);
    const mark = <T extends Pinnable>(x: T, key: string): T => ({ ...x, pinned: pinned.has(key) });
    patch<Pins>('pins', () => p.pins);
    patch<Path[]>('paths', (ps) => ps.map((x) => mark(x, pathKey(x))));
    patch<Section[]>('sections', (ss) => ss.map((x) => mark(x, sectionKey(x.name))));
  }
  if (p.kind === 'send') {
    const sent: Send = { book_id: p.book_id, requested: new Date().toISOString(), sent: null };
    patch<Send[]>('sends', (s) => [...s.filter((x) => x.book_id !== p.book_id || x.sent), sent]);
    patch<BookFull>(`book/${p.book_id}`, (b) => ({ ...b, sent }));
  }
}

/** Runs a change on ares; when ares can't be reached it is applied locally and kept until the next sync. */
export async function perform(p: Pending): Promise<'done' | 'queued'> {
  applyLocally(p);
  try {
    await run(p);
    await refreshKeys(...AFTER[p.kind](p));
    return 'done';
  } catch (e) {
    if (!(e instanceof OfflineError)) throw e;
    saveOutbox([...outbox.filter((x) => !same(x, p)), p]);
    return 'queued';
  }
}

export async function flush() {
  for (const p of [...outbox]) {
    try {
      await run(p);
      saveOutbox(outbox.filter((x) => x !== p));
    } catch (e) {
      if (e instanceof OfflineError) return;
      saveOutbox(outbox.filter((x) => x !== p));
    }
  }
}
