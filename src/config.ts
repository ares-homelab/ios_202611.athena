import * as SecureStore from 'expo-secure-store';
import { useSyncExternalStore } from 'react';

export const DEFAULT_URL = 'http://ares:8087';

type Config = { url: string; token: string };

const read = (key: string) => {
  try {
    return SecureStore.getItem(key) ?? '';
  } catch {
    return '';
  }
};

let config: Config = { url: read('api_url') || DEFAULT_URL, token: read('api_token') };
const listeners = new Set<() => void>();

export const getConfig = () => config;

export async function saveConfig(next: Config) {
  const url = next.url.trim().replace(/\/+$/, '') || DEFAULT_URL;
  const token = next.token.trim();
  await SecureStore.setItemAsync('api_url', url);
  await SecureStore.setItemAsync('api_token', token);
  config = { url, token };
  listeners.forEach((fn) => fn());
}

const subscribe = (fn: () => void) => {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
};

export const useConfig = () => useSyncExternalStore(subscribe, getConfig);
