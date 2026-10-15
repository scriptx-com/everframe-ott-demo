import type { RefCallback } from 'react';
import type { InteractionTargetAnnotation } from './interactionTargets';

/** Keep the demo compatible with released SDKs while optional helpers are reviewed. */
export interface InteractionOptions {
  target?: InteractionTargetAnnotation;
  helperTypes?: readonly ('text_edit' | 'control_change' | 'scroll')[];
}
interface InteractionHelpers<T> {
  ref: RefCallback<T>;
  textChanged(text: string, options?: { composing?: boolean; reason?: 'change' | 'end' | 'submit' }): void;
  scrollSettled(change: { axis: 'x' | 'y'; direction: 'forward' | 'backward' }): void;
}
type InteractionHook = <T>(options?: InteractionOptions) => InteractionHelpers<T>;
const noop = () => {};
const noInteraction: InteractionHook = () => ({ ref: noop, textChanged: noop, scrollSettled: noop });
export function selectInteractionHook(sdk: object, enabled: boolean): InteractionHook {
  const hook = (sdk as { useEverframeInteraction?: InteractionHook }).useEverframeInteraction;
  return enabled && typeof hook === 'function' ? hook : noInteraction;
}
export function helpersEnabled(development: boolean, override: string | undefined): boolean {
  return !development || override !== '0';
}
export const interactionHelpersEnabled = helpersEnabled(
  typeof __DEV__ !== 'undefined' && __DEV__, process.env.EXPO_PUBLIC_EVERFRAME_INTERACTION_HELPERS,
);
export const interactionPolicy = {
  valueTestIds: ['search-input'],
  urlRules: [
    { origin: 'nocturne://title', routes: ['/:id'] },
    { origin: 'nocturne://play', routes: ['/:id', '/:id/:episode'] },
    { origin: 'nocturne://demo', routes: ['/:scenario/:state'] },
  ],
  launchArgumentKeys: [],
};
