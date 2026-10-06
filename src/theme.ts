// Nocturne design tokens. Deep pine ground, bone ink, one marigold accent.
// The Everframe reporter keeps its own night-blue look on top of this, so the
// boundary between "customer app" and "Everframe" stays visible in demos.

export const color = {
  ground: '#0E1B19',
  groundDeep: '#0B1614',
  surface: '#152724',
  raised: '#1F3530',
  line: '#22372F',
  lineStrong: '#2E4A43',
  bone: '#F1EADB',
  boneSoft: '#DDE3DF',
  mist: '#C9D3CD',
  lichen: '#A8B8B0',
  lichenDim: '#8FA39B',
  marigold: '#F2B441',
  onMarigold: '#1A1406',
  scrim: 'rgba(14,27,25,0.92)',
  glass: 'rgba(241,234,219,0.16)',
  glassStrong: 'rgba(241,234,219,0.24)',
  danger: '#FFB59A',
  dangerBg: '#3A1F14',
} as const;

/** Everframe's own palette, used only for the trigger affordances. */
export const everframe = {
  night: '#101A2C',
  raised: '#1A263B',
  cyan: '#4FD3EC',
  onCyan: '#06222A',
  ice: '#F2F7FC',
  iceDim: '#93A3B8',
} as const;

export const font = {
  title: 'BricolageCondensed-ExtraBold',
  heading: 'Bricolage-SemiBold',
  brand: 'Bricolage-Bold',
  body: 'InstrumentSans-Regular',
  medium: 'InstrumentSans-Medium',
  semibold: 'InstrumentSans-SemiBold',
} as const;

export const fontFiles = {
  [font.title]: require('../assets/fonts/BricolageCondensed-ExtraBold.ttf'),
  [font.heading]: require('../assets/fonts/Bricolage-SemiBold.ttf'),
  [font.brand]: require('../assets/fonts/Bricolage-Bold.ttf'),
  [font.body]: require('../assets/fonts/InstrumentSans-Regular.ttf'),
  [font.medium]: require('../assets/fonts/InstrumentSans-Medium.ttf'),
  [font.semibold]: require('../assets/fonts/InstrumentSans-SemiBold.ttf'),
};
