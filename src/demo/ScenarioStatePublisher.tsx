import { useEffect } from 'react';
import * as Everframe from '@everframe/react-native';

// State is present in the qualified source build, but not in the current npm release.
const setState = (Everframe as unknown as { setState?: (key: string, value: boolean) => void }).setState;
import { useScenarios } from './scenarios';
import { publishScenarioState } from './scenario-state';

export function ScenarioStatePublisher(): null {
  const state = useScenarios();
  // The provider mounts its runtime in a layout effect, before this passive effect.
  useEffect(() => {
    if (typeof setState === 'function') publishScenarioState(state, setState);
  }, [state]);
  return null;
}
