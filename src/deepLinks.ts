import { useEffect } from 'react';
import { Linking, Platform } from 'react-native';
import { nav, type Section } from './nav';
import { titles } from './data/catalog';
import { requestReport } from './components/ReportTrigger';
import { scenarios, setAllScenarios, setScenario, type ScenarioId } from './demo/scenarios';

// Deep links, mainly so a recording can jump straight to a scene:
//   nocturne://home | series | films | documentaries | search | list | profile
//   nocturne://title/<id>                 series page
//   nocturne://play/<id>[/<episode>]      player, e.g. play/kitchen-midnight/e3
//   nocturne://demo/<scenario|all>/<on|off>
//   nocturne://report                     open the Everframe reporter

const SECTIONS: Section[] = ['home', 'series', 'films', 'documentaries', 'search', 'list', 'profile'];

export function handleLink(url: string): void {
  // Expo's own launch URL for development builds.
  if (url.includes('expo-development-client')) return;
  const parts = url.replace(/^[a-z]+:\/\//i, '').split(/[/?#]/).filter(Boolean);
  const [head, a, b] = parts;
  if (!head) return;
  if ((SECTIONS as string[]).includes(head)) return nav.section(head as Section);
  if (head === 'title' && a && titles.some((t) => t.id === a)) return nav.push({ name: 'detail', id: a });
  if (head === 'play' && a && titles.some((t) => t.id === a)) return nav.push({ name: 'player', id: a, episode: b });
  if (head === 'report') return requestReport();
  if (head === 'demo' && a) {
    const on = b !== 'off';
    if (a === 'all') return setAllScenarios(on);
    if (scenarios.some((s) => s.id === a)) return setScenario(a as ScenarioId, on);
  }
  console.warn(`[links] no route for ${url}`);
}

export function useDeepLinks(): void {
  useEffect(() => {
    if (Platform.OS === 'web') return;
    void Linking.getInitialURL().then((url) => url && handleLink(url));
    const sub = Linking.addEventListener('url', ({ url }) => handleLink(url));
    return () => sub.remove();
  }, []);
}
