import { useLocalSearchParams } from 'expo-router';
import { EntryScreen } from '../../../../components/entries';
import { pathKey } from '../../../../api';
import { usePaths } from '../../../../data';
import { roman } from '../../../../format';

export default function PathScreen() {
  const { number } = useLocalSearchParams<{ number: string }>();
  const paths = usePaths();
  const p = paths.data?.find((x) => String(x.number) === number);
  return (
    <EntryScreen
      back="paths"
      eyebrow={[`path ${roman(Number(number))}`, ...(p?.sections ?? [])].join(' · ')}
      title={p?.name ?? ''}
      description={p?.description}
      entries={p?.entries ?? []}
      upNext={p?.up_next?.n}
      pinKey={p ? pathKey(p) : ''}
      pinLabel={`path: ${p?.name ?? ''}`}
      loading={paths.loading}
      error={paths.error ?? (!p && paths.data ? 'no such path' : undefined)}
      refresh={paths.refresh}
    />
  );
}
