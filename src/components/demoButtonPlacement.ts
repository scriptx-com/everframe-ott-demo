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
  // Only section screens render TopNav, so other wide-web screens (a series
  // page) get the floating button instead of no button at all.
  return i.isWeb && i.form === 'wide' && i.route === 'section' ? 'header' : 'floating';
}
