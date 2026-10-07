import React, { useEffect } from 'react';
import { BackHandler, LogBox, NativeModules, Platform, StatusBar, TVEventControl, View } from 'react-native';
import { useFonts } from 'expo-font';
import { EverframeProvider, setUser } from '@everframe/react-native';
import { everframeConfig, hasKey } from './everframe/config';
import { useDeepLinks } from './deepLinks';
import { color, fontFiles } from './theme';
import { useInsets, useLayout } from './layout';
import { currentSection, nav, sectionKind, useStack, type Route } from './nav';
import { TabBar } from './components/Chrome';
import { ReportTrigger } from './components/ReportTrigger';
import { DemoReportButton, demoButtonPlacement } from './components/DemoReportButton';
import { isDemoMode } from './demo/mode';
import { ToastHost } from './components/Toast';
import { Home } from './screens/Home';
import { Browse } from './screens/Browse';
import { Detail } from './screens/Detail';
import { Player } from './screens/Player';
import { Profile, viewer } from './screens/Profile';
import { Search } from './screens/Search';

// Without a key the native SDK logs that it could not configure; Profile
// already explains this, so keep the warning out of screenshots.
if (!hasKey) LogBox.ignoreLogs(['[everframe] configure failed']);

function Screen({ route }: { route: Route }): React.JSX.Element {
  switch (route.name) {
    case 'detail':
      return <Detail key={route.id} id={route.id} />;
    case 'player':
      return <Player key={`${route.id}/${route.episode}`} id={route.id} episode={route.episode} />;
    case 'section':
      switch (route.section) {
        case 'home':
          return <Home />;
        case 'search':
          return <Search />;
        case 'profile':
          return <Profile />;
        default:
          return <Browse key={route.section} section={route.section} kind={sectionKind[route.section]} />;
      }
  }
}

/** Back on Android (phone and TV) and the Menu button on Apple TV. */
function useBackNavigation(depth: number): void {
  useEffect(() => {
    if (Platform.isTV && Platform.OS === 'ios') {
      // At the root, Menu must leave the app, as tvOS expects.
      if (depth > 1) TVEventControl.enableTVMenuKey();
      else TVEventControl.disableTVMenuKey();
    }
  }, [depth]);

  useEffect(() => {
    if (Platform.OS === 'web') return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => nav.back());
    return () => sub.remove();
  }, []);
}

/** In debug builds, keep React Native's developer menu off the shake gesture. */
function useQuietDevMenu(): void {
  useEffect(() => {
    if (__DEV__ && !Platform.isTV && Platform.OS !== 'web') {
      NativeModules.DevSettings?.setIsShakeToShowDevMenuEnabled?.(false);
    }
  }, []);
}

/**
 * The demo viewer is always signed in. On web the provider registers itself in
 * its own effect, which runs after this child's, so wait a tick before calling.
 */
function SignedInViewer(): null {
  useEffect(() => {
    const t = setTimeout(() => setUser(viewer), 0);
    return () => clearTimeout(t);
  }, []);
  return null;
}

const DEMO_MODE = isDemoMode({ EXPO_PUBLIC_DEMO_MODE: process.env.EXPO_PUBLIC_DEMO_MODE });

function Shell(): React.JSX.Element {
  const L = useLayout();
  const insets = useInsets();
  const stack = useStack();
  const top = stack[stack.length - 1]!;
  useBackNavigation(stack.length);
  useDeepLinks();
  useQuietDevMenu();

  const showTabs = L.form === 'phone' && top.name !== 'player';
  const demoButton = demoButtonPlacement({
    demo: DEMO_MODE,
    isTV: Platform.isTV,
    isWeb: Platform.OS === 'web',
    form: L.form,
    route: top.name,
  });
  // TabBar is 1px border + 8 top padding + 50 row + the bottom inset.
  const demoButtonBottom = (showTabs ? 59 + insets.bottom : insets.bottom) + 16;

  return (
    <View style={{ flex: 1, backgroundColor: color.ground }}>
      <View style={{ flex: 1 }}>
        <Screen route={top} />
      </View>
      {showTabs ? <TabBar active={currentSection(stack)} bottomInset={insets.bottom} /> : null}
      <ReportTrigger />
      {demoButton === 'floating' ? <DemoReportButton placement="floating" bottom={demoButtonBottom} /> : null}
      <ToastHost top={insets.top + L.size({ tv: 48, wide: 20, phone: 12 })} />
    </View>
  );
}

export function App(): React.JSX.Element | null {
  const [fontsLoaded] = useFonts(fontFiles);
  if (!fontsLoaded) return <View style={{ flex: 1, backgroundColor: color.ground }} />;
  return (
    <EverframeProvider config={everframeConfig}>
      <StatusBar barStyle="light-content" backgroundColor={color.ground} />
      <SignedInViewer />
      <Shell />
    </EverframeProvider>
  );
}
