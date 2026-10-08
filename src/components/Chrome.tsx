import React from 'react';
import { Platform, Text, View } from 'react-native';
import { color, font } from '../theme';
import { useLayout } from '../layout';
import { nav, type Section } from '../nav';
import { Focusable } from './Focusable';
import { Icon, type IconName } from './Icon';
import { Wordmark, styles } from './primitives';
import { DemoReportButton } from './DemoReportButton';
import { isDemoMode } from '../demo/mode';

const DEMO_MODE = isDemoMode({ EXPO_PUBLIC_DEMO_MODE: process.env.EXPO_PUBLIC_DEMO_MODE });

const TOP: Array<{ section: Section; label: string }> = [
  { section: 'home', label: 'Home' },
  { section: 'series', label: 'Series' },
  { section: 'films', label: 'Films' },
  { section: 'documentaries', label: 'Documentaries' },
  { section: 'list', label: 'My list' },
];

/** Top navigation for TV and wide screens. */
export function TopNav({ active }: { active: Section }): React.JSX.Element {
  const L = useLayout();
  const tv = L.form === 'tv';
  const fs = L.size({ tv: 26, wide: 16, phone: 16 });
  const round = L.size({ tv: 60, wide: 42, phone: 40 });
  return (
    <View
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: L.size({ tv: 56, wide: 28, phone: 16 }),
        rowGap: 12,
        paddingHorizontal: L.gutter,
        paddingVertical: L.size({ tv: 30, wide: 18, phone: 12 }),
        width: '100%',
        maxWidth: tv ? undefined : 1440,
        alignSelf: 'center',
      }}
    >
      <Wordmark size={L.size({ tv: 38, wide: 28, phone: 24 })} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: L.size({ tv: 8, wide: 4, phone: 4 }) }} accessibilityRole="tablist">
        {TOP.map((item) => {
          const on = item.section === active;
          return (
            <Focusable
              key={item.section}
              accessibilityRole="tab"
              accessibilityState={{ selected: on }}
              testID={`nav-${item.section}`}
              onPress={() => nav.section(item.section)}
              style={{
                paddingHorizontal: fs * 0.85,
                paddingVertical: fs * 0.4,
                borderRadius: fs * 2,
                backgroundColor: on ? 'rgba(241,234,219,0.14)' : 'transparent',
              }}
              focusStyle={{ backgroundColor: color.bone }}
            >
              {({ focused }) => (
                <Text style={{ fontFamily: font.medium, fontSize: fs, color: focused ? color.ground : on ? color.bone : color.mist }}>
                  {item.label}
                </Text>
              )}
            </Focusable>
          );
        })}
      </View>
      <View style={{ marginLeft: 'auto', flexDirection: 'row', alignItems: 'center', gap: L.size({ tv: 24, wide: 12, phone: 12 }) }}>
        {DEMO_MODE && Platform.OS === 'web' && L.form === 'wide' ? <DemoReportButton placement="header" /> : null}
        <Focusable
          accessibilityRole="button"
          accessibilityLabel="Search"
          testID="nav-search"
          onPress={() => nav.section('search')}
          style={{ width: round, height: round, borderRadius: round, alignItems: 'center', justifyContent: 'center', backgroundColor: active === 'search' ? color.glassStrong : color.glass }}
          focusStyle={[styles.ring, { borderRadius: round }]}
        >
          <Icon name="search" size={round * 0.46} color={color.bone} />
        </Focusable>
        <Focusable
          accessibilityRole="button"
          accessibilityLabel="Profile"
          testID="nav-profile"
          onPress={() => nav.section('profile')}
          style={{ width: round, height: round, borderRadius: round, alignItems: 'center', justifyContent: 'center', backgroundColor: color.lineStrong }}
          focusStyle={[styles.ring, { borderRadius: round }]}
        >
          <Text style={{ fontFamily: font.semibold, fontSize: round * 0.4, color: color.bone }}>M</Text>
        </Focusable>
      </View>
    </View>
  );
}

const TABS: Array<{ section: Section; label: string; icon: IconName }> = [
  { section: 'home', label: 'Home', icon: 'home' },
  { section: 'search', label: 'Search', icon: 'search' },
  { section: 'list', label: 'My list', icon: 'bookmark' },
  { section: 'profile', label: 'Profile', icon: 'user' },
];

/** Bottom tabs for phones. */
export function TabBar({ active, bottomInset }: { active: Section; bottomInset: number }): React.JSX.Element {
  return (
    <View
      accessibilityRole="tablist"
      style={{
        flexDirection: 'row',
        backgroundColor: color.groundDeep,
        borderTopWidth: 1,
        borderTopColor: color.line,
        paddingBottom: bottomInset,
        paddingTop: 8,
      }}
    >
      {TABS.map((t) => {
        const on = t.section === active;
        const tint = on ? color.marigold : color.lichen;
        return (
          <Focusable
            key={t.section}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            accessibilityLabel={t.label}
            testID={`tab-${t.section}`}
            onPress={() => nav.section(t.section)}
            containerStyle={{ flex: 1 }}
            style={{ alignItems: 'center', justifyContent: 'center', gap: 4, minHeight: 50 }}
          >
            <Icon name={t.icon} size={24} color={tint} />
            <Text style={{ fontFamily: font.semibold, fontSize: 12, color: tint }}>{t.label}</Text>
          </Focusable>
        );
      })}
    </View>
  );
}

/** Phone header: wordmark and avatar. */
export function PhoneHeader({ topInset }: { topInset: number }): React.JSX.Element {
  return (
    <View
      style={{
        paddingTop: topInset + 8,
        paddingHorizontal: 20,
        paddingBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <Wordmark size={24} />
      <Focusable
        accessibilityRole="button"
        accessibilityLabel="Profile"
        onPress={() => nav.section('profile')}
        style={{ width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' }}
      >
        <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: color.lineStrong, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontFamily: font.semibold, fontSize: 15, color: color.bone }}>M</Text>
        </View>
      </Focusable>
    </View>
  );
}

export const isWeb = Platform.OS === 'web';
