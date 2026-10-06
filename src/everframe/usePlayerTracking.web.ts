import { useEffect } from 'react';
import { trackPlayer } from '@everframe/react-native';
import type { PlayerHandle } from './usePlayerTracking';

// On web, Everframe reads events and stats straight from the <video> element,
// so the host-side calls are no-ops.
const inert: PlayerHandle = {
  token: 'web',
  detached: false,
  emit() {},
  updateStats() {},
  track() {},
  detach() {},
};

export function usePlayerTracking(name: string): PlayerHandle {
  useEffect(() => {
    const element = document.querySelector('video');
    if (!element) return undefined;
    const handle = (trackPlayer as unknown as (o: { element: HTMLMediaElement; name: string }) => { detach(): void })({ element, name });
    return () => handle.detach();
  }, [name]);
  return inert;
}
