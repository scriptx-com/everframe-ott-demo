import { useMemo } from 'react';
import { Platform, StatusBar, useWindowDimensions } from 'react-native';

/**
 * Three layouts share one codebase:
 *   tv    — 10-foot UI, remote focus. Sizes are authored for a 1920-wide
 *           canvas and scaled (Apple TV is 1920pt wide, Android TV 960dp).
 *   wide  — web and tablets: top navigation, grids.
 *   phone — bottom tabs, single column.
 */
export type Form = 'tv' | 'wide' | 'phone';

export interface Layout {
  form: Form;
  width: number;
  height: number;
  /** Pick a size per form. `tv` is in 1920-canvas units and gets scaled. */
  size: (v: { tv: number; wide: number; phone: number }) => number;
  /** Horizontal page gutter. */
  gutter: number;
}

export const isTV = Platform.isTV;

export function useLayout(): Layout {
  const { width, height } = useWindowDimensions();
  return useMemo(() => {
    const form: Form = isTV ? 'tv' : width >= 900 ? 'wide' : 'phone';
    const tvScale = width / 1920;
    const size = (v: { tv: number; wide: number; phone: number }) =>
      form === 'tv' ? Math.round(v.tv * tvScale) : form === 'wide' ? v.wide : v.phone;
    const gutter = size({ tv: 96, wide: Math.min(56, Math.max(24, width * 0.04)), phone: 20 });
    return { form, width, height, size, gutter };
  }, [width, height]);
}

/**
 * Safe-area insets without react-native-safe-area-context, whose native
 * module does not load on react-native-tvos 0.85. Close enough for phones.
 */
export function useInsets(): { top: number; bottom: number } {
  const { width, height } = useWindowDimensions();
  if (isTV || Platform.OS === 'web') return { top: 0, bottom: 0 };
  if (Platform.OS === 'android') return { top: StatusBar.currentHeight ?? 24, bottom: 24 };
  const landscape = width > height;
  const notched = Math.max(width, height) >= 812;
  if (landscape) return { top: 0, bottom: notched ? 20 : 0 };
  return { top: notched ? 54 : 20, bottom: notched ? 30 : 8 };
}
