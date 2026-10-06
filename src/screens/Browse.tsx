import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useEverframeScreen } from '@everframe/react-native';
import { color, font } from '../theme';
import { useInsets, useLayout } from '../layout';
import { nav, type Section } from '../nav';
import { titles, type Kind, type Title } from '../data/catalog';
import { useSaved } from '../data/myList';
import { PosterCard } from '../components/Cards';
import { PhoneHeader, TopNav } from '../components/Chrome';
import { useCardWidth } from '../components/Rail';
import { Button, ShowTitle } from '../components/primitives';

const heading: Partial<Record<Section, string>> = {
  series: 'Series',
  films: 'Films',
  documentaries: 'Documentaries',
  list: 'My list',
};

/** A poster grid: one kind of title, or the viewer's saved list. */
export function Browse({ section, kind }: { section: Section; kind?: Kind }): React.JSX.Element {
  useEverframeScreen(heading[section] ?? 'Browse');
  const L = useLayout();
  const insets = useInsets();
  const saved = useSaved();
  const items: Title[] = kind ? titles.filter((t) => t.kind === kind) : saved.map((id) => titles.find((t) => t.id === id)!).filter(Boolean);
  const phoneCols = 3;
  const gridWidth = useCardWidth('poster');
  const gap = L.size({ tv: 32, wide: 20, phone: 12 });
  const width = L.form === 'phone' ? Math.floor((L.width - 40 - gap * (phoneCols - 1)) / phoneCols) : gridWidth;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: color.ground }} contentContainerStyle={{ paddingBottom: L.size({ tv: 120, wide: 96, phone: 140 }) }}>
      {L.form === 'phone' ? <PhoneHeader topInset={insets.top} /> : <TopNav active={section} />}
      <View style={{ width: '100%', maxWidth: L.form === 'wide' ? 1440 : undefined, alignSelf: 'center', paddingHorizontal: L.gutter, gap: L.size({ tv: 40, wide: 28, phone: 18 }) }}>
        <ShowTitle size={L.size({ tv: 120, wide: 84, phone: 52 })} style={{ marginTop: L.size({ tv: 30, wide: 24, phone: 8 }) }}>
          {heading[section] ?? ''}
        </ShowTitle>
        {items.length === 0 ? (
          <View style={{ gap: 16, alignItems: 'flex-start' }}>
            <Text style={{ fontFamily: font.body, fontSize: L.size({ tv: 28, wide: 17, phone: 15 }), color: color.mist }}>
              Save shows here to find them again. Choose My list on any title.
            </Text>
            <Button kind="primary" label="Browse series" onPress={() => nav.section('series')} />
          </View>
        ) : (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap, paddingVertical: L.form === 'tv' ? 20 : 0 }}>
            {items.map((t, i) => (
              <PosterCard key={t.id} title={t} width={width} hasTVPreferredFocus={L.form === 'tv' && i === 0} onPress={() => nav.push({ name: 'detail', id: t.id })} />
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
