// Demo-mode decisions, kept pure so they are testable without a device.
// EXPO_PUBLIC_DEMO_MODE=1 is the build used on VibeView and the hosted web
// demo; every other build behaves exactly as before.
import type { ScenarioId } from './scenarios';

// No default parameter: Expo inlines process.env.EXPO_PUBLIC_* only for literal
// member access, so every caller passes { EXPO_PUBLIC_DEMO_MODE: process.env.EXPO_PUBLIC_DEMO_MODE }.
export function isDemoMode(env: Record<string, string | undefined>): boolean {
  return env.EXPO_PUBLIC_DEMO_MODE === '1';
}

const nonEmpty = (v: string | null | undefined): string | undefined => (v ? v : undefined);

export function resolveNativeKey(i: { demo: boolean; launchParam: string | null; envKey?: string; baked: string }): string {
  return (i.demo ? nonEmpty(i.launchParam) : undefined) ?? nonEmpty(i.envKey) ?? i.baked;
}

export function resolveWebKey(i: { demo: boolean; search: string; webEnvKey?: string; envKey?: string; baked: string }): string {
  const fromQuery = i.demo ? nonEmpty(new URLSearchParams(i.search).get('key')) : undefined;
  return fromQuery ?? nonEmpty(i.webEnvKey) ?? nonEmpty(i.envKey) ?? i.baked;
}

const ALL: ScenarioId[] = ['subtitleDrift', 'brokenPoster', 'slowSearch', 'downloadFails', 'playerStall'];

export function initialScenarioState(demo: boolean): Record<ScenarioId, boolean> {
  return Object.fromEntries(ALL.map((id) => [id, demo])) as Record<ScenarioId, boolean>;
}

/**
 * Demo TVs announce themselves to the dashboard's Companion from launch: an
 * embedded TV has no remote buttons beyond the d-pad, so a visitor should not
 * have to dig through menus before the dashboard can pick the TV up.
 */
export function keepCompanionRunning(i: { demo: boolean; isTV: boolean }): boolean {
  return i.demo && i.isTV;
}
