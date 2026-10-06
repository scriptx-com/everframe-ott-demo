import { consoleIntegration } from '@everframe/react-native/integrations/console';
import { DEMO_KEY } from './keys';

const apiKey = process.env.EXPO_PUBLIC_EVERFRAME_KEY || DEMO_KEY;

export const hasKey = apiKey.length > 0;

export const everframeConfig = {
  apiKey,
  appName: 'nocturne',
  appVersion: '1.0.0',
  disabled: !hasKey,
  integrations: [consoleIntegration()],
  // Shake to report on phones. The native SDK owns the gesture (and ignores
  // it on TVs); a second, app-level shake listener would open two reporters
  // at once, and the second gets an empty capture with no replay.
  shakeToReport: { enabled: true },
};
