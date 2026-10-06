import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TextInput, View } from 'react-native';
import { useEverframeScreen } from '@everframe/react-native';
import { color, font } from '../theme';
import { useInsets, useLayout } from '../layout';
import { nav } from '../nav';
import { titles, type Title } from '../data/catalog';
import { search } from '../demo/api';
import { PosterCard } from '../components/Cards';
import { PhoneHeader, TopNav } from '../components/Chrome';
import { Focusable } from '../components/Focusable';
import { useCardWidth } from '../components/Rail';
import { Icon } from '../components/Icon';
import { ShowTitle } from '../components/primitives';

const SUGGESTIONS = ['mystery', 'nature', 'space', 'night markets', 'jazz'];

export function Search(): React.JSX.Element {
  useEverframeScreen('Search');
  const L = useLayout();
  const insets = useInsets();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Title[] | null>(null);
  const [loading, setLoading] = useState(false);
  const seq = useRef(0);

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setResults(null);
      setLoading(false);
      return;
    }
    const id = ++seq.current;
    setLoading(true);
    const t = setTimeout(() => {
      void search(q).then((r) => {
        if (id !== seq.current) return;
        setResults(r);
        setLoading(false);
      });
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  const gap = L.size({ tv: 32, wide: 20, phone: 12 });
  const gridWidth = useCardWidth('poster');
  const width = L.form === 'phone' ? Math.floor((L.width - 40 - gap * 2) / 3) : gridWidth;
  const fs = L.size({ tv: 34, wide: 20, phone: 17 });
  const shown = results ?? titles.slice(0, L.form === 'phone' ? 6 : 8);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: color.ground }} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: L.size({ tv: 120, wide: 96, phone: 140 }) }}>
      {L.form === 'phone' ? <PhoneHeader topInset={insets.top} /> : <TopNav active="search" />}
      <View style={{ width: '100%', maxWidth: L.form === 'wide' ? 1440 : undefined, alignSelf: 'center', paddingHorizontal: L.gutter, gap: L.size({ tv: 36, wide: 24, phone: 18 }) }}>
        <ShowTitle size={L.size({ tv: 120, wide: 84, phone: 52 })} style={{ marginTop: L.size({ tv: 30, wide: 24, phone: 8 }) }}>
          Search
        </ShowTitle>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 999, backgroundColor: color.surface, borderWidth: 1, borderColor: color.lineStrong, paddingHorizontal: fs * 0.9, height: fs * 2.6, maxWidth: 760 }}>
          <Icon name="search" size={fs} color={color.lichen} />
          <TextInput
            testID="search-input"
            accessibilityLabel="Search titles, genres and moods"
            value={query}
            onChangeText={setQuery}
            placeholder="Titles, genres, moods"
            placeholderTextColor={color.lichenDim}
            autoCorrect={false}
            returnKeyType="search"
            style={{ flex: 1, fontFamily: font.body, fontSize: fs, color: color.bone, height: '100%', outlineStyle: 'none' } as object}
          />
          {loading ? <ActivityIndicator color={color.marigold} /> : null}
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {SUGGESTIONS.map((s) => (
            <Focusable
              key={s}
              accessibilityRole="button"
              onPress={() => setQuery(s)}
              style={{ paddingHorizontal: fs * 0.8, paddingVertical: fs * 0.35, borderRadius: 999, borderWidth: 1.5, borderColor: color.lineStrong }}
              focusStyle={{ backgroundColor: color.bone, borderColor: color.bone }}
            >
              {({ focused }) => <Text style={{ fontFamily: font.medium, fontSize: fs * 0.72, color: focused ? color.ground : color.mist }}>{s}</Text>}
            </Focusable>
          ))}
        </View>
        <Text style={{ fontFamily: font.heading, fontSize: L.size({ tv: 30, wide: 20, phone: 18 }), color: color.bone }}>
          {results === null ? 'Popular right now' : results.length === 0 ? `Nothing matches "${query.trim()}". Try a genre, like mystery.` : `${results.length} ${results.length === 1 ? 'result' : 'results'}`}
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap, paddingVertical: L.form === 'tv' ? 20 : 0 }}>
          {shown.map((t) => (
            <PosterCard key={t.id} title={t} width={width} onPress={() => nav.push({ name: 'detail', id: t.id })} />
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
