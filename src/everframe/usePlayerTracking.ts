import { useTrackPlayer, type PlayerHandle } from '@everframe/react-native';

export type { PlayerHandle };

/** Native: the host reports player events and stats through the handle. */
export function usePlayerTracking(name: string): PlayerHandle {
  return useTrackPlayer({ library: 'expo-video', libraryVersion: '56.1', name });
}
