import { useSyncExternalStore } from 'react';

let saved: string[] = ['salt-line', 'neon-saints', 'long-quiet', 'field-notes'];
const listeners = new Set<() => void>();

export function toggleSaved(id: string): void {
  saved = saved.includes(id) ? saved.filter((x) => x !== id) : [id, ...saved];
  console.log(`[my-list] ${saved.includes(id) ? 'added' : 'removed'} ${id}`);
  for (const l of listeners) l();
}

export function useSaved(): string[] {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => saved,
    () => saved,
  );
}
