import { consoleIntegration } from '@everframe/react-native/integrations/console';
import { DEMO_KEY } from './keys';
import { getLaunchParam } from '../../modules/launch-params';
import { isDemoMode, resolveNativeKey } from '../demo/mode';

// Demo builds take the key VibeView passes as a launch param, so one shared
// build reports to each org's own demo project.
const apiKey = resolveNativeKey({
  demo: isDemoMode({ EXPO_PUBLIC_DEMO_MODE: process.env.EXPO_PUBLIC_DEMO_MODE }),
  launchParam: getLaunchParam('everframeKey'),
  envKey: process.env.EXPO_PUBLIC_EVERFRAME_KEY,
  baked: DEMO_KEY,
});

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
