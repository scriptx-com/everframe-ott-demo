// Where the demo build's visible "Report a bug" button goes, kept pure so it
// is testable without React Native. TVs keep their remote triggers, and the
// player stays uncluttered.
export type DemoButtonPlacement = 'floating' | 'header';

export function demoButtonPlacement(i: {
  demo: boolean;
  isTV: boolean;
  isWeb: boolean;
  form: 'tv' | 'wide' | 'phone';
  route: string;
}): DemoButtonPlacement | null {
  if (!i.demo || i.isTV || i.route === 'player') return null;
  return i.isWeb && i.form === 'wide' ? 'header' : 'floating';
}
