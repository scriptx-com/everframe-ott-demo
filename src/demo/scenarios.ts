import { useSyncExternalStore } from 'react';

// Bugs the app can switch on for a recording. Each one leaves the evidence an
// Everframe report is meant to carry: a visible symptom for the screenshot,
// plus console, network or player events behind it.

export type ScenarioId = 'subtitleDrift' | 'brokenPoster' | 'slowSearch' | 'downloadFails' | 'playerStall';

export interface Scenario {
  id: ScenarioId;
  name: string;
  where: string;
  shows: string;
}

export const scenarios: Scenario[] = [
  {
    id: 'subtitleDrift',
    name: 'Subtitles run 2 seconds late',
    where: 'Any episode, with subtitles on',
    shows: 'Screenshot and annotation, player events',
  },
  {
    id: 'brokenPoster',
    name: 'A poster fails to load',
    where: 'Neon Saints, in Nocturne originals',
    shows: 'Failed request in the network log',
  },
  {
    id: 'slowSearch',
    name: 'Search takes 4 seconds',
    where: 'Search',
    shows: 'Request timings',
  },
  {
    id: 'downloadFails',
    name: 'Download throws an error',
    where: 'Download on any series page',
    shows: 'Captured exception and console error',
  },
  {
    id: 'playerStall',
    name: 'Playback stalls after 10 seconds',
    where: 'Player',
    shows: 'Buffering events and a failed segment request',
  },
];

type State = Record<ScenarioId, boolean>;

let state: State = {
  subtitleDrift: false,
  brokenPoster: false,
  slowSearch: false,
  downloadFails: false,
  playerStall: false,
};
const listeners = new Set<() => void>();

function emit(): void {
  for (const l of listeners) l();
}

export function setScenario(id: ScenarioId, on: boolean): void {
  state = { ...state, [id]: on };
  console.info(`[demo] ${id} ${on ? 'on' : 'off'}`);
  emit();
}

export function setAllScenarios(on: boolean): void {
  state = Object.fromEntries(Object.keys(state).map((k) => [k, on])) as State;
  console.info(`[demo] all scenarios ${on ? 'on' : 'off'}`);
  emit();
}

export function isOn(id: ScenarioId): boolean {
  return state[id];
}

function subscribe(l: () => void): () => void {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useScenarios(): State {
  return useSyncExternalStore(subscribe, () => state, () => state);
}

export function useScenario(id: ScenarioId): boolean {
  return useScenarios()[id];
}
