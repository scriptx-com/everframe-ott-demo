import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

export type IconName =
  | 'play'
  | 'pause'
  | 'plus'
  | 'check'
  | 'search'
  | 'home'
  | 'download'
  | 'user'
  | 'back'
  | 'next'
  | 'close'
  | 'rewind'
  | 'forward'
  | 'captions'
  | 'alert'
  | 'report'
  | 'grid'
  | 'bookmark';

const stroke: Partial<Record<IconName, string>> = {
  plus: 'M12 5v14M5 12h14',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  home: 'M4 10l8-6 8 6v9a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z',
  download: 'M12 4v11M7 10l5 5 5-5M5 20h14',
  back: 'M15 5l-7 7 7 7',
  next: 'M9 5l7 7-7 7',
  close: 'M6 6l12 12M18 6L6 18',
  rewind: 'M11 7L6 12l5 5M18 7l-5 5 5 5',
  forward: 'M13 7l5 5-5 5M6 7l5 5-5 5',
  captions: 'M3 6h18v12H3zM7 11h3M7 14h6M13 11h4M15 14h2',
  report: 'M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3M12 8v5M12 16h.01',
  grid: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
  bookmark: 'M6 4h12v16l-6-4-6 4z',
};

export function Icon({ name, size = 24, color = 'currentColor', weight = 2 }: {
  name: IconName;
  size?: number;
  color?: string;
  weight?: number;
}): React.JSX.Element {
  if (name === 'play') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Path d="M7 4.5v15l12-7.5z" fill={color} />
      </Svg>
    );
  }
  if (name === 'pause') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" fill={color} />
      </Svg>
    );
  }
  if (name === 'search') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Circle cx={11} cy={11} r={7} stroke={color} strokeWidth={weight} />
        <Path d="M20 20l-4-4" stroke={color} strokeWidth={weight} strokeLinecap="round" />
      </Svg>
    );
  }
  if (name === 'user') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Circle cx={12} cy={8} r={4} stroke={color} strokeWidth={weight} />
        <Path d="M4 20c1.5-4 4.5-6 8-6s6.5 2 8 6" stroke={color} strokeWidth={weight} strokeLinecap="round" />
      </Svg>
    );
  }
  if (name === 'alert') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Circle cx={12} cy={12} r={9} stroke={color} strokeWidth={weight} />
        <Path d="M12 7v6M12 16.5h.01" stroke={color} strokeWidth={weight} strokeLinecap="round" />
      </Svg>
    );
  }
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d={stroke[name]} stroke={color} strokeWidth={weight} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
