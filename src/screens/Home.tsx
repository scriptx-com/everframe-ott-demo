import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { clipOffscreen } from '../components/Rail';
import { useEverframeScreen } from '@everframe/react-native';
import { color, font } from '../theme';
import { useLayout, useInsets } from '../layout';
import { nav } from '../nav';
import { continueWatching, featured, rails, stillAspect, type Title } from '../data/catalog';
import { toggleSaved, useSaved } from '../data/myList';
import { loadHome } from '../demo/api';
import { Backdrop } from '../components/Backdrop';
import { LandscapeCard, PosterCard, RankedCard } from '../components/Cards';
import { PhoneHeader, TopNav } from '../components/Chrome';
import { Rail } from '../components/Rail';
import { Button, Meta, ShowTitle } from '../components/primitives';

function HeroText({ title, tv, onFocused }: { title: Title; tv: boolean; onFocused?: () => void }): React.JSX.Element {
  const L = useLayout();
  const saved = useSaved().includes(title.id);
  const first = title.episodes[0];
  return (
    <View style={{ gap: L.size({ tv: 24, wide: 16, phone: 12 }), maxWidth: L.size({ tv: 960, wide: 600, phone: 9999 }) }}>
      <Text style={{ fontFamily: font.semibold, fontSize: L.size({ tv: 24, wide: 15, phone: 14 }), color: color.marigold }}>{title.tagline}</Text>
      <ShowTitle size={L.size({ tv: 150, wide: Math.min(116, Math.max(64, L.width * 0.08)), phone: 64 })}>{title.name}</ShowTitle>
      {L.form !== 'phone' ? (
        <>
          <Meta size={L.size({ tv: 22, wide: 14, phone: 13 })} rating={title.rating} items={[title.genre, title.extent]} />
          <Text
            numberOfLines={L.form === 'tv' ? 2 : 3}
            style={{ fontFamily: font.body, fontSize: L.size({ tv: 27, wide: 17, phone: 15 }), lineHeight: L.size({ tv: 39, wide: 25, phone: 22 }), color: color.boneSoft, maxWidth: L.size({ tv: 900, wide: 520, phone: 999 }) }}
          >
            {title.synopsis}
          </Text>
        </>
      ) : null}
      <View style={{ flexDirection: 'row', gap: L.size({ tv: 20, wide: 12, phone: 10 }), marginTop: L.size({ tv: 10, wide: 4, phone: 4 }) }}>
        <Button
          kind="primary"
          icon="play"
          label={!first ? 'Play' : title.kind === 'documentary' ? 'Play E1' : 'Play S1 E1'}
          testID="hero-play"
          onFocused={onFocused}
          hasTVPreferredFocus={tv}
          onPress={() => nav.push({ name: 'player', id: title.id, episode: first?.id })}
          containerStyle={L.form === 'phone' ? { flex: 1 } : undefined}
        />
        <Button
          icon={saved ? 'check' : 'plus'}
          onFocused={onFocused}
          label={L.form === 'wide' ? (saved ? 'In My list' : 'Add to My list') : 'My list'}
          onPress={() => toggleSaved(title.id)}
          containerStyle={L.form === 'phone' ? { flex: 1 } : undefined}
        />
        {L.form !== 'phone' ? <Button label="Details" onPress={() => nav.push({ name: 'detail', id: title.id })} /> : null}
      </View>
    </View>
  );
}

function Rails({ onFocusTitle, onRailLayout }: {
  onFocusTitle?: (t: Title, rail: number) => void;
  onRailLayout?: (rail: number, y: number) => void;
}): React.JSX.Element {
  const L = useLayout();
  return (
    <View style={{ gap: L.size({ tv: 40, wide: 44, phone: 28 }) }}>
      <View onLayout={(e) => onRailLayout?.(0, e.nativeEvent.layout.y)}>
      <Rail
        heading="Continue watching"
        shape="landscape"
        items={continueWatching}
        keyOf={(c) => c.title.id}
        render={(c, w) => (
          <LandscapeCard
            title={c.title}
            episode={c.episode}
            width={w}
            onFocus={() => onFocusTitle?.(c.title, 0)}
            onPress={() => nav.push({ name: 'player', id: c.title.id, episode: c.episode.id })}
          />
        )}
      />
      </View>
      {rails.map((rail, ri) => (
        <View key={rail.id} onLayout={(e) => onRailLayout?.(ri + 1, e.nativeEvent.layout.y)}>
        <Rail
          heading={rail.name}
          shape={rail.shape}
          items={rail.items}
          keyOf={(t) => t.id}
          render={(t, w, i) =>
            rail.shape === 'top10' ? (
              <RankedCard rank={i + 1} title={t} width={w} onFocus={() => onFocusTitle?.(t, ri + 1)} onPress={() => nav.push({ name: 'detail', id: t.id })} />
            ) : rail.shape === 'poster' ? (
              <PosterCard title={t} width={w} onFocus={() => onFocusTitle?.(t, ri + 1)} onPress={() => nav.push({ name: 'detail', id: t.id })} />
            ) : (
              <LandscapeCard title={t} width={w} onFocus={() => onFocusTitle?.(t, ri + 1)} onPress={() => nav.push({ name: 'detail', id: t.id })} />
            )
          }
        />
        </View>
      ))}
    </View>
  );
}

export function Home(): React.JSX.Element {
  useEverframeScreen('Home');
  const L = useLayout();
  const insets = useInsets();
  const [hero, setHero] = useState<Title>(featured[0]!);
  const pending = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    void loadHome();
  }, []);

  // On TV the backdrop follows focus, after a short settle so fast scrolling
  // doesn't flicker through every title.
  // and the focused rail is scrolled into view (Android TV doesn't do it
  // for nested scroll views).
  const scroller = useRef<ScrollView>(null);
  const railsTop = useRef(0);
  const railY = useRef<number[]>([]);
  const focusTitle = (t: Title, rail: number) => {
    if (pending.current) clearTimeout(pending.current);
    pending.current = setTimeout(() => setHero(t), 350);
    const y = railsTop.current + (railY.current[rail] ?? 0) - L.height * 0.55;
    scroller.current?.scrollTo({ y: Math.max(0, y), animated: true });
  };

  if (L.form === 'tv') {
    return (
      <View style={{ flex: 1, backgroundColor: color.ground }}>
        <Backdrop source={hero.still} aspect={stillAspect(hero)} focusX={hero.focusX} bottomStart={0.35} />
        <ScrollView ref={scroller} contentContainerStyle={{ paddingBottom: L.size({ tv: 400, wide: 0, phone: 0 }) }}>
          <TopNav active="home" />
          <View style={{ height: L.height * 0.6, justifyContent: 'flex-end', paddingHorizontal: L.gutter, paddingBottom: L.size({ tv: 40, wide: 0, phone: 0 }) }}>
            <HeroText title={hero} tv onFocused={() => scroller.current?.scrollTo({ y: 0, animated: true })} />
          </View>
          <View onLayout={(e) => (railsTop.current = e.nativeEvent.layout.y)}>
            <Rails
              onFocusTitle={focusTitle}
              onRailLayout={(i, y) => {
                railY.current[i] = y;
              }}
            />
          </View>
        </ScrollView>
      </View>
    );
  }

  if (L.form === 'wide') {
    return (
      <ScrollView style={{ flex: 1, backgroundColor: color.ground }} contentContainerStyle={{ paddingBottom: 96 }}>
        <TopNav active="home" />
        <View style={{ paddingHorizontal: L.gutter, width: '100%', maxWidth: 1440, alignSelf: 'center' }}>
          <View style={{ height: Math.min(560, Math.max(420, L.width * 0.38)), borderRadius: 28, overflow: 'hidden', backgroundColor: color.surface, justifyContent: 'flex-end', padding: Math.min(56, L.width * 0.04) }}>
            <Backdrop source={hero.still} aspect={stillAspect(hero)} focusX={hero.focusX} bottom={false} />
            <HeroText title={hero} tv={false} />
          </View>
        </View>
        <View style={{ height: 44 }} />
        <Rails />
      </ScrollView>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: color.ground }} contentContainerStyle={{ paddingBottom: 140 }} removeClippedSubviews={clipOffscreen}>
      <PhoneHeader topInset={insets.top} />
      <View style={{ marginHorizontal: 20, height: 440, borderRadius: 24, overflow: 'hidden', backgroundColor: color.surface, justifyContent: 'flex-end', padding: 20 }}>
        <Backdrop source={hero.still} aspect={stillAspect(hero)} focusX={hero.focusX} side={false} bottomStart={0.3} />
        <HeroText title={hero} tv={false} />
      </View>
      <View style={{ height: 26 }} />
      <Rails />
    </ScrollView>
  );
}
