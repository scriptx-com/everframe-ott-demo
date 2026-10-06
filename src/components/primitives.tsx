import React from 'react';
import { Platform, StyleSheet, Text, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import Svg, { Circle, Defs, Mask, Rect } from 'react-native-svg';
import { color, font } from '../theme';
import { useLayout } from '../layout';
import { Focusable, type FocusableProps } from './Focusable';
import { Icon, type IconName } from './Icon';

export function Moon({ size }: { size: number }): React.JSX.Element {
  return (
    <Svg width={size} height={size} viewBox="0 0 40 40">
      <Defs>
        <Mask id="moon-cut">
          <Rect width={40} height={40} fill="#fff" />
          <Circle cx={27} cy={14} r={13} fill="#000" />
        </Mask>
      </Defs>
      <Circle cx={20} cy={20} r={17} fill={color.marigold} mask="url(#moon-cut)" />
    </Svg>
  );
}

export function Wordmark({ size }: { size: number }): React.JSX.Element {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: size * 0.32 }} accessibilityRole="header" accessibilityLabel="Nocturne TV">
      <Moon size={size * 1.05} />
      <Text style={{ fontFamily: font.brand, fontSize: size, color: color.bone, letterSpacing: -size * 0.03 }}>
        nocturne<Text style={{ color: color.marigold }}> tv</Text>
      </Text>
    </View>
  );
}

/** Display title: condensed, heavy, lowercase. The one loud element. */
export function ShowTitle({ children, size, style, lines }: {
  children: string;
  size: number;
  style?: StyleProp<TextStyle>;
  lines?: number;
}): React.JSX.Element {
  return (
    <Text
      accessibilityRole="header"
      numberOfLines={lines}
      style={[
        { fontFamily: font.title, fontSize: size, lineHeight: size * 0.9, color: color.bone, letterSpacing: -size * 0.02 },
        style,
      ]}
    >
      {children.toLowerCase()}
    </Text>
  );
}

type ButtonKind = 'primary' | 'secondary';

export function Button({ label, icon, kind = 'secondary', onPress, onFocused, containerStyle, hasTVPreferredFocus, testID, accessibilityLabel }: {
  label?: string;
  icon?: IconName;
  kind?: ButtonKind;
  onPress: () => void;
  onFocused?: () => void;
  containerStyle?: FocusableProps['containerStyle'];
  hasTVPreferredFocus?: boolean;
  testID?: string;
  accessibilityLabel?: string;
}): React.JSX.Element {
  const L = useLayout();
  const h = L.size({ tv: 76, wide: 52, phone: 48 });
  const fs = L.size({ tv: 28, wide: 17, phone: 16 });
  const primary = kind === 'primary';
  const fg = primary ? color.onMarigold : color.bone;
  const iconOnly = !label;
  return (
    <Focusable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      hasTVPreferredFocus={hasTVPreferredFocus}
      onPress={onPress}
      onFocusChange={(f) => f && onFocused?.()}
      containerStyle={containerStyle}
      focusScale={L.form === 'tv' ? 1.05 : 1}
      style={{
        height: h,
        minWidth: h,
        paddingHorizontal: iconOnly ? 0 : h * (L.form === 'phone' ? 0.36 : 0.5),
        borderRadius: h,
        backgroundColor: primary ? color.marigold : color.glass,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: h * 0.18,
      }}
      focusStyle={L.form === 'tv' || L.form === 'wide' ? [styles.ring, { borderRadius: h }, !primary && { backgroundColor: color.glassStrong }] : undefined}
    >
      {icon ? <Icon name={icon} size={fs * 1.05} color={fg} weight={2.2} /> : null}
      {label ? <Text numberOfLines={1} style={{ fontFamily: font.semibold, fontSize: fs, color: fg }}>{label}</Text> : null}
    </Focusable>
  );
}

export function Progress({ value, height, style }: { value: number; height: number; style?: StyleProp<ViewStyle> }): React.JSX.Element {
  return (
    <View style={[{ height, backgroundColor: 'rgba(241,234,219,0.25)' }, style]}>
      <View style={{ height, width: `${Math.round(value * 100)}%`, backgroundColor: color.marigold }} />
    </View>
  );
}

export function Pill({ children, size }: { children: string; size: number }): React.JSX.Element {
  return (
    <Text
      style={{
        fontFamily: font.semibold,
        fontSize: size,
        color: color.mist,
        borderWidth: Math.max(1.5, size / 11),
        borderColor: color.lichenDim,
        borderRadius: size * 0.36,
        paddingHorizontal: size * 0.5,
        paddingVertical: size * 0.12,
        overflow: 'hidden',
      }}
    >
      {children}
    </Text>
  );
}

export function Meta({ items, size, rating }: { items: string[]; size: number; rating?: string }): React.JSX.Element {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: size * 0.7 }}>
      {rating ? <Pill size={size}>{rating}</Pill> : null}
      {items.map((t) => (
        <Text key={t} style={{ fontFamily: font.body, fontSize: size, color: color.mist }}>
          {t}
        </Text>
      ))}
    </View>
  );
}

export function SectionHeading({ children, size, style }: { children: string; size: number; style?: StyleProp<TextStyle> }): React.JSX.Element {
  return (
    <Text accessibilityRole="header" style={[{ fontFamily: font.heading, fontSize: size, color: color.bone, letterSpacing: -size * 0.01 }, style]}>
      {children}
    </Text>
  );
}

export const styles = StyleSheet.create({
  // Focus ring. Android draws it as a border: removing an outline there
  // leaves the view's children blank on react-native-tvos 0.85.
  ring: (Platform.OS === 'android'
    ? { borderWidth: 3, borderColor: color.bone }
    : {
        shadowColor: '#000',
        shadowOpacity: 0.55,
        shadowRadius: 24,
        shadowOffset: { width: 0, height: 12 },
        outlineColor: color.bone,
        outlineStyle: 'solid',
        outlineWidth: 4,
        outlineOffset: 5,
      }) as ViewStyle,
});
