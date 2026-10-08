// Visible report trigger for the hosted demo (EXPO_PUBLIC_DEMO_MODE=1).
// Real apps keep reporting out of sight (shake, hotkey); a demo visitor on a
// streamed phone or the web needs to see it. TVs keep their remote triggers.
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { requestReport } from './ReportTrigger';
import { everframe, font } from '../theme';
import { useLayout } from '../layout';
import type { DemoButtonPlacement } from './demoButtonPlacement';

export { demoButtonPlacement } from './demoButtonPlacement';

export function DemoReportButton({
  placement,
  bottom = 16,
}: {
  placement: DemoButtonPlacement;
  /** Distance from the bottom edge for the floating variant (clears the tab bar). */
  bottom?: number;
}): React.JSX.Element {
  const L = useLayout();
  const pill = (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Report a bug"
      testID="demo-report-button"
      onPress={requestReport}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: 7,
        paddingHorizontal: 14,
        paddingVertical: 9,
        borderRadius: 999,
        backgroundColor: everframe.cyan,
        opacity: pressed ? 0.85 : 1,
      })}
    >
      <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: everframe.onCyan }} />
      <Text style={{ fontFamily: font.semibold, fontSize: L.size({ tv: 20, wide: 14, phone: 14 }), color: everframe.onCyan }}>
        Report a bug
      </Text>
    </Pressable>
  );
  if (placement === 'header') return pill;
  return (
    <View pointerEvents="box-none" style={{ position: 'absolute', right: 16, bottom }}>
      {pill}
    </View>
  );
}
