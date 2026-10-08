// On web, @everframe/react-native resolves to the browser SDK, which captures
// console and network on its own.
// Web uses its own key (a web app in Everframe), falling back to the shared one,
// then to the public demo project's web key. Demo builds first take ?key=
// from the URL, which the Everframe onboarding demo passes per org.
import { DEMO_WEB_KEY } from './keys';
import { isDemoMode, resolveWebKey } from '../demo/mode';

const apiKey = resolveWebKey({
  demo: isDemoMode({ EXPO_PUBLIC_DEMO_MODE: process.env.EXPO_PUBLIC_DEMO_MODE }),
  search: typeof window === 'undefined' ? '' : window.location.search,
  webEnvKey: process.env.EXPO_PUBLIC_EVERFRAME_WEB_KEY,
  envKey: process.env.EXPO_PUBLIC_EVERFRAME_KEY,
  baked: DEMO_WEB_KEY,
});

export const hasKey = apiKey.length > 0;

export const everframeConfig = {
  apiKey,
  appName: 'nocturne-web',
  appVersion: '1.0.0',
  disabled: !hasKey,
};
