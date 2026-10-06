// On web, @everframe/react-native resolves to the browser SDK, which captures
// console and network on its own.
// Web uses its own key (a web app in Everframe), falling back to the shared one,
// then to the public demo project's web key.
import { DEMO_WEB_KEY } from './keys';

const apiKey = process.env.EXPO_PUBLIC_EVERFRAME_WEB_KEY || process.env.EXPO_PUBLIC_EVERFRAME_KEY || DEMO_WEB_KEY;

export const hasKey = apiKey.length > 0;

export const everframeConfig = {
  apiKey,
  appName: 'nocturne-web',
  appVersion: '1.0.0',
  disabled: !hasKey,
};
