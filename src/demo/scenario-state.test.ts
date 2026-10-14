import { afterEach, describe, expect, it, vi } from 'vitest';
import { initialScenarioState } from './mode';
import { isOn, scenarios, setAllScenarios, setScenario, type ScenarioState } from './scenarios';
import { publishScenarioState } from './scenario-state';

const keys = ['demo.subtitleDrift', 'demo.brokenPoster', 'demo.slowSearch', 'demo.downloadFails', 'demo.playerStall'];
const snapshot = (): ScenarioState => Object.fromEntries(scenarios.map(({ id }) => [id, isOn(id)])) as ScenarioState;
afterEach(() => vi.restoreAllMocks());

describe('scenario State publication', () => {
  it.each([false, true])('publishes all five explicit booleans on initial mount and remount (%s)', on => {
    const setState = vi.fn();
    publishScenarioState(initialScenarioState(on), setState);
    expect(setState.mock.calls).toEqual(keys.map(key => [key, on]));
    setState.mockClear();
    publishScenarioState(initialScenarioState(on), setState);
    expect(setState.mock.calls).toEqual(keys.map(key => [key, on]));
  });

  it('publishes individual changes and all-off/all-on without console state messages', () => {
    const info = vi.spyOn(console, 'info').mockImplementation(() => {});
    const setState = vi.fn();
    setAllScenarios(false);
    setScenario('downloadFails', true);
    publishScenarioState(snapshot(), setState);
    expect(setState.mock.calls).toEqual(keys.map(key => [key, key === 'demo.downloadFails']));
    setState.mockClear();
    setAllScenarios(true);
    publishScenarioState(snapshot(), setState);
    expect(setState.mock.calls).toEqual(keys.map(key => [key, true]));
    setState.mockClear();
    setAllScenarios(false);
    publishScenarioState(snapshot(), setState);
    expect(setState.mock.calls).toEqual(keys.map(key => [key, false]));
    expect(info).not.toHaveBeenCalled();
  });
});
