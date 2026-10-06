import React, { useSyncExternalStore } from 'react';
import { Text, View } from 'react-native';
import { color, font } from '../theme';
import { useLayout } from '../layout';
import { Icon } from './Icon';

type Tone = 'info' | 'error';
interface ToastState {
  id: number;
  text: string;
  tone: Tone;
}

let current: ToastState | null = null;
let seq = 0;
const listeners = new Set<() => void>();

export function showToast(text: string, tone: Tone = 'info'): void {
  const id = ++seq;
  current = { id, text, tone };
  for (const l of listeners) l();
  setTimeout(() => {
    if (current?.id !== id) return;
    current = null;
    for (const l of listeners) l();
  }, 4000);
}

export function ToastHost({ top }: { top: number }): React.JSX.Element | null {
  const L = useLayout();
  const t = useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => current,
    () => current,
  );
  if (!t) return null;
  const fs = L.size({ tv: 26, wide: 15, phone: 14 });
  const error = t.tone === 'error';
  return (
    <View
      accessibilityLiveRegion="polite"
      accessibilityRole="alert"
      style={{
        position: 'absolute',
        top,
        left: L.form === 'phone' ? 20 : undefined,
        right: L.form === 'phone' ? 20 : undefined,
        alignSelf: 'center',
        maxWidth: 720,
        flexDirection: 'row',
        alignItems: 'center',
        gap: fs * 0.7,
        paddingHorizontal: fs * 1.1,
        paddingVertical: fs * 0.9,
        borderRadius: fs,
        backgroundColor: error ? color.dangerBg : color.raised,
      }}
    >
      <Icon name={error ? 'alert' : 'check'} size={fs * 1.3} color={error ? color.danger : color.marigold} />
      <Text style={{ flexShrink: 1, fontFamily: font.medium, fontSize: fs, lineHeight: fs * 1.4, color: error ? '#FFD9C7' : color.bone }}>{t.text}</Text>
    </View>
  );
}
