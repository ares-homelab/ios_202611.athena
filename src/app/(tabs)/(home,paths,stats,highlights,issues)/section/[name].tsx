import { useLocalSearchParams } from 'expo-router';
import { EntryScreen } from '../../../../components/entries';
import { sectionKey } from '../../../../api';
import { useSections } from '../../../../data';

export default function SectionScreen() {
  const { name } = useLocalSearchParams<{ name: string }>();
  const sections = useSections();
  const s = sections.data?.find((x) => x.name === name);
  const next = s?.entries.find((e) => e.calibre_id != null && e.status !== 'read' && e.status !== 'dnf');
  return (
    <EntryScreen
      back="paths"
      eyebrow={['section', ...(s?.crosses ?? [])].join(' · ')}
      title={s?.title ?? ''}
      description={s?.description}
      entries={s?.entries ?? []}
      upNext={next?.n}
      pinKey={sectionKey(name)}
      pinLabel={`section: ${s?.title ?? name}`}
      loading={sections.loading}
      error={sections.error ?? (!s && sections.data ? 'no such section' : undefined)}
      refresh={sections.refresh}
    />
  );
}
