import React, { useRef, useState } from 'react';
import { Platform, ScrollView, View } from 'react-native';
import { color } from '../theme';
import { useLayout } from '../layout';
import { Focusable } from './Focusable';
import { Icon } from './Icon';
import { SectionHeading } from './primitives';

export type Shape = 'poster' | 'landscape' | 'top10';

/**
 * Android phones detach off-screen cards from the native tree. A smaller tree
 * keeps scrolling cheap and lets Everframe's per-frame privacy check (a 2 ms
 * walk of the view tree) admit replay frames. Not on TV: detached views can't
 * take remote focus.
 */
export const clipOffscreen = Platform.OS === 'android' && !Platform.isTV;

/** Card width for grids (Browse, Search) on wide screens; fixed sizes elsewhere. */
export function useCardWidth(shape: 'poster' | 'landscape', columnsHint?: number): number {
  const L = useLayout();
  if (L.form === 'wide') {
    const avail = Math.min(L.width, 1440) - L.gutter * 2;
    const gap = 20;
    const min = shape === 'poster' ? 150 : 240;
    const cols = columnsHint ?? Math.max(2, Math.floor((avail + gap) / (min + gap)));
    return Math.floor((avail - gap * (cols - 1)) / cols);
  }
  return railCardWidth(L, shape);
}

/** Card width inside a horizontal rail. */
export function railCardWidth(L: ReturnType<typeof useLayout>, shape: Shape): number {
  if (shape === 'landscape') return L.size({ tv: 400, wide: 300, phone: 210 });
  return L.size({ tv: 260, wide: 176, phone: 128 });
}

function Arrow({ dir, onPress }: { dir: 'back' | 'forward'; onPress: () => void }): React.JSX.Element {
  return (
    <Focusable
      accessibilityRole="button"
      accessibilityLabel={dir === 'back' ? 'Scroll left' : 'Scroll right'}
      onPress={onPress}
      style={{ width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: color.glass }}
      focusStyle={{ backgroundColor: color.glassStrong }}
    >
      <Icon name={dir === 'back' ? 'back' : 'next'} size={18} color={color.bone} weight={2.2} />
    </Focusable>
  );
}

/**
 * A titled horizontal strip of cards. TV remotes and touch scroll it
 * natively; on wide screens two arrow buttons page through it for mouse users.
 */
export function Rail<T>({ heading, items, shape, render, keyOf }: {
  heading: string;
  items: T[];
  shape: Shape;
  render: (item: T, width: number, index: number) => React.ReactNode;
  keyOf: (item: T) => string;
}): React.JSX.Element {
  const L = useLayout();
  const width = railCardWidth(L, shape);
  const gap = L.size({ tv: 28, wide: 18, phone: 12 });
  const headingSize = L.size({ tv: 32, wide: 24, phone: 20 });
  // Room above and below so a focused, scaled card is not clipped. On wide
  // screens the ring alone (4px outline, 5px offset) sits 9px outside the card.
  const focusRoom = L.size({ tv: 24, wide: 10, phone: 0 });
  const scroller = useRef<ScrollView>(null);
  const [x, setX] = useState(0);
  const [viewport, setViewport] = useState(0);
  const [content, setContent] = useState(0);
  const page = (dir: 1 | -1) => scroller.current?.scrollTo({ x: Math.max(0, x + dir * viewport * 0.85), animated: true });
  const wide = L.form === 'wide';
  // On wide screens the strip lines up with the 1440px content column.
  const inset = wide ? Math.max(L.gutter, (L.width - 1440) / 2 + L.gutter) : L.gutter;

  return (
    <View style={{ gap: L.size({ tv: 6, wide: 4, phone: 12 }) }}>
      <View style={{ paddingHorizontal: inset, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <SectionHeading size={headingSize}>{heading}</SectionHeading>
        {wide && content > viewport + 4 ? (
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Arrow dir="back" onPress={() => page(-1)} />
            <Arrow dir="forward" onPress={() => page(1)} />
          </View>
        ) : null}
      </View>
      <ScrollView
        ref={scroller}
        horizontal
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={32}
        onScroll={(e) => setX(e.nativeEvent.contentOffset.x)}
        onLayout={(e) => setViewport(e.nativeEvent.layout.width)}
        onContentSizeChange={(w) => setContent(w)}
        contentContainerStyle={{ gap, paddingHorizontal: inset, paddingVertical: focusRoom }}
        removeClippedSubviews={clipOffscreen}
      >
        {items.map((it, i) => (
          <React.Fragment key={keyOf(it)}>{render(it, width, i)}</React.Fragment>
        ))}
      </ScrollView>
    </View>
  );
}
