import { Platform } from 'react-native';
import { requireOptionalNativeModule } from 'expo';

type Native = { get(key: string): string | null };
const native = Platform.OS === 'web' ? null : requireOptionalNativeModule<Native>('LaunchParams');

/** A VibeView launch param, or null when absent, empty, or unreadable. Never throws. */
export function getLaunchParam(key: string): string | null {
  try {
    return native?.get(key) ?? null;
  } catch {
    return null;
  }
}
