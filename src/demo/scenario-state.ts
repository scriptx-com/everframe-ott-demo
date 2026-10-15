import type { ScenarioState } from './scenarios';

/** Publish a full snapshot, including false values, after the provider mounts. */
export function publishScenarioState(state: ScenarioState, setState: (key: string, value: boolean) => void): void {
  for (const [id, on] of Object.entries(state)) setState(`demo.${id}`, on);
}
