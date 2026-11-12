import { Directory, File, Paths } from 'expo-file-system';

const file = (name: string) => new File(Paths.document, name);

export function readJson<T>(name: string, fallback: T): T {
  try {
    const f = file(name);
    return f.exists ? (JSON.parse(f.textSync()) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeJson(name: string, data: unknown) {
  try {
    if (name.includes('/')) new Directory(Paths.document, name.split('/')[0]).create({ idempotent: true });
    const f = file(name);
    if (!f.exists) f.create();
    f.write(JSON.stringify(data));
  } catch {}
}

export function clearDir(name: string) {
  const d = new Directory(Paths.document, name);
  if (d.exists) d.delete();
}
