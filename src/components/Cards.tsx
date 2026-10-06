import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { color, font } from '../theme';
import { useLayout } from '../layout';
import type { Episode, Title } from '../data/catalog';
import { checkArtwork } from '../demo/api';
import { useScenario } from '../demo/scenarios';
import { Focusable } from './Focusable';
import { Progress, styles } from './primitives';
import { Icon } from './Icon';

export interface CardProps {
  title: Title;
  width: number;
  onPress: () => void;
  onFocus?: () => void;
  hasTVPreferredFocus?: boolean;
}

/** Artwork that can fail, on purpose, when the brokenPoster scenario is on. */
function useArtwork(title: Title): boolean {
  const broken = useScenario('brokenPoster');
  const [ok, setOk] = useState(true);
  useEffect(() => {
    let live = true;
    if (!broken || title.id !== 'neon-saints') {
      setOk(true);
      return;
    }
    void checkArtwork(title).then((res) => live && setOk(res));
    return () => {
      live = false;
    };
  }, [broken, title]);
  return ok;
}

function MissingArt({ title, size }: { title: Title; size: number }): React.JSX.Element {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: size * 0.5, padding: size, backgroundColor: color.surface }}>
      <Icon name="alert" size={size * 2} color={color.lichenDim} />
      <Text style={{ fontFamily: font.medium, fontSize: size, color: color.lichen, textAlign: 'center' }}>{title.name}</Text>
    </View>
  );
}

export function PosterCard({ title, width, onPress, onFocus, hasTVPreferredFocus }: CardProps): React.JSX.Element {
  const L = useLayout();
  const ok = useArtwork(title);
  const radius = L.size({ tv: 18, wide: 14, phone: 12 });
  const label = L.size({ tv: 24, wide: 15, phone: 14 });
  return (
    <View style={{ width, gap: L.size({ tv: 16, wide: 10, phone: 8 }) }}>
      <Focusable
        accessibilityRole="button"
        accessibilityLabel={title.name}
        testID={`poster-${title.id}`}
        onPress={onPress}
        onFocusChange={(f) => f && onFocus?.()}
        hasTVPreferredFocus={hasTVPreferredFocus}
        focusScale={L.form === 'tv' ? 1.06 : 1}
        style={{ width, aspectRatio: 2 / 3, borderRadius: radius }}
        focusStyle={[styles.ring, { borderRadius: radius }]}
      >
        {/* Clipping lives on this static inner view: restyling or scaling a
            clipped view on focus blanks its image on Android TV. */}
        <View style={[StyleSheet.absoluteFill, { borderRadius: radius, overflow: 'hidden', backgroundColor: color.surface }]}>
          {ok ? (
            <Image source={title.poster} style={{ width: '100%', height: '100%' }} resizeMode="cover" resizeMethod="resize" />
          ) : (
            <MissingArt title={title} size={label * 0.8} />
          )}
        </View>
        {title.badge ? (
          <Text
            style={{
              position: 'absolute',
              top: radius * 0.6,
              left: radius * 0.6,
              fontFamily: font.semibold,
              fontSize: label * 0.72,
              color: color.onMarigold,
              backgroundColor: color.marigold,
              paddingHorizontal: label * 0.45,
              paddingVertical: label * 0.15,
              borderRadius: label,
              overflow: 'hidden',
            }}
          >
            {title.badge}
          </Text>
        ) : null}
      </Focusable>
      {L.form !== 'tv' ? (
        <Text numberOfLines={1} style={{ fontFamily: font.semibold, fontSize: label, color: color.bone }}>
          {title.name}
        </Text>
      ) : null}
    </View>
  );
}

export function LandscapeCard({ title, episode, width, onPress, onFocus, hasTVPreferredFocus }: CardProps & { episode?: Episode }): React.JSX.Element {
  const L = useLayout();
  const radius = L.size({ tv: 18, wide: 16, phone: 14 });
  const label = L.size({ tv: 24, wide: 16, phone: 15 });
  const sub = L.size({ tv: 20, wide: 14, phone: 13 });
  return (
    <View style={{ width, gap: L.size({ tv: 14, wide: 10, phone: 8 }) }}>
      <Focusable
        accessibilityRole="button"
        accessibilityLabel={episode ? `${title.name}, episode ${episode.number}, ${episode.title}` : title.name}
        testID={`card-${title.id}`}
        onPress={onPress}
        onFocusChange={(f) => f && onFocus?.()}
        hasTVPreferredFocus={hasTVPreferredFocus}
        focusScale={L.form === 'tv' ? 1.05 : 1}
        style={{ width, aspectRatio: 16 / 9, borderRadius: radius }}
        focusStyle={[styles.ring, { borderRadius: radius }]}
      >
        <View style={[StyleSheet.absoluteFill, { borderRadius: radius, overflow: 'hidden', backgroundColor: color.surface }]}>
          <Image source={title.still} style={{ width: '100%', height: '100%' }} resizeMode="cover" resizeMethod="resize" />
          {episode ? (
            <Progress value={episode.progress} height={L.size({ tv: 6, wide: 4, phone: 4 })} style={{ position: 'absolute', left: 0, right: 0, bottom: 0 }} />
          ) : null}
        </View>
      </Focusable>
      <View style={{ gap: 2 }}>
        <Text numberOfLines={1} style={{ fontFamily: font.semibold, fontSize: label, color: color.bone }}>
          {title.name}
        </Text>
        <Text numberOfLines={1} style={{ fontFamily: font.body, fontSize: sub, color: color.lichen }}>
          {episode ? `${title.kind === 'documentary' ? '' : 'S1 '}E${episode.number}  ${episode.title}` : title.genre}
        </Text>
      </View>
    </View>
  );
}

/** Poster with a large rank number beside it, for the Top 10 rail. */
export function RankedCard({ rank, ...props }: CardProps & { rank: number }): React.JSX.Element {
  const L = useLayout();
  const numberSize = props.width * 1.05;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
      <Text
        accessibilityElementsHidden
        importantForAccessibility="no"
        style={{
          fontFamily: font.title,
          fontSize: numberSize,
          lineHeight: numberSize * 0.86,
          color: color.lineStrong,
          letterSpacing: -numberSize * 0.08,
          minWidth: props.width * 0.42,
          textAlign: 'right',
          marginRight: -props.width * 0.06,
          marginBottom: L.form === 'tv' ? 0 : L.size({ tv: 0, wide: 26, phone: 22 }),
        }}
      >
        {String(rank)}
      </Text>
      <PosterCard {...props} />
    </View>
  );
}
