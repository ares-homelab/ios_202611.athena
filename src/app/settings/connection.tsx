import { router } from 'expo-router';
import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { api } from '../../api';
import { BackBar, Button, Eyebrow, Screen, useUi } from '../../components/ui';
import { DEFAULT_URL, saveConfig, useConfig } from '../../config';
import { refreshAll } from '../../store';
import { F, useTheme } from '../../theme';

export default function Connection() {
  const u = useUi();
  const { c } = useTheme();
  const cfg = useConfig();
  const [url, setUrl] = useState(cfg.url);
  const [token, setToken] = useState(cfg.token);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const first = !cfg.token;
  const clean = () => ({ url: url.trim().replace(/\/+$/, '') || DEFAULT_URL, token: token.trim() });

  const test = async () => {
    setBusy(true);
    setResult(null);
    try {
      const r = await api.hello(clean());
      setResult({ ok: true, text: `connected: ${r.hello} answered` });
    } catch (e) {
      setResult({ ok: false, text: (e as Error).message });
    } finally {
      setBusy(false);
    }
  };
  const save = async () => {
    await saveConfig(clean());
    refreshAll();
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };
  const input = { height: 48, borderRadius: 12, paddingHorizontal: 14, backgroundColor: c.panel, color: c.text, fontFamily: F.sans, fontSize: 15 };

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      {first ? <View style={{ height: 54 }} /> : <BackBar label="settings" />}
      <Screen top={false} gap={18}>
        <Text style={u.h1}>{first ? 'connect to ares' : 'ares'}</Text>
        <Text style={[u.soft, { color: c.muted }]}>
          the athena api runs on ares and is reached over tailscale. the token lives in /srv/config/athena/api.env on ares and is kept in this iphone&apos;s keychain.
        </Text>
        <View style={{ gap: 8 }}>
          <Eyebrow>api address</Eyebrow>
          <TextInput value={url} onChangeText={setUrl} placeholder={DEFAULT_URL} placeholderTextColor={c.muted} autoCapitalize="none" autoCorrect={false} keyboardType="url" style={input} />
        </View>
        <View style={{ gap: 8 }}>
          <Eyebrow>token</Eyebrow>
          <TextInput value={token} onChangeText={setToken} placeholder="bearer token" placeholderTextColor={c.muted} autoCapitalize="none" autoCorrect={false} secureTextEntry style={input} />
        </View>
        <Button label="test connection" kind="outline" onPress={test} busy={busy} style={{ alignSelf: 'flex-start' }} />
        {result ? <Text style={[u.soft, { color: result.ok ? c.ok : c.warn }]}>{result.text}</Text> : null}
        <Button label="save" onPress={save} busy={!token.trim()} />
      </Screen>
    </View>
  );
}
