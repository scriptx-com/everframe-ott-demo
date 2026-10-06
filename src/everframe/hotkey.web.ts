import { useEffect } from 'react';

/** Ctrl+Shift+B (Cmd+Shift+B on a Mac) opens the reporter. */
export function useReportHotkey(onReport: () => void): void {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        onReport();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onReport]);
}
