/** App-owned metadata shape; older released SDKs can keep reporting without the optional hook. */
export interface InteractionTargetAnnotation {
  testId?: string;
  name?: string;
  role?: string;
  reporterTrigger?: 'button' | 'menu';
  container?: { testId?: string; name?: string; role?: string; index?: number; count?: number };
}

export function annotationsEnabled(development: boolean, override: string | undefined): boolean {
  return !development || override !== '0';
}
export const interactionTargetsEnabled = annotationsEnabled(
  typeof __DEV__ !== 'undefined' && __DEV__, process.env.EXPO_PUBLIC_EVERFRAME_TARGET_ANNOTATIONS,
);

export function buildInteractionContainer(id: string, name: string, index: number, count: number, role: 'list' | 'tablist'): NonNullable<InteractionTargetAnnotation['container']> {
  return {testId:id,name,role,index,count};
}
