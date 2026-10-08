import React from 'react';
import { Platform, ScrollView, Text, View } from 'react-native';
import { EverframeSensitive, useEverframeScreen } from '@everframe/react-native';
import { color, everframe, font } from '../theme';
import { useInsets, useLayout } from '../layout';
import { scenarios, setAllScenarios, setScenario, useScenarios } from '../demo/scenarios';
import { hasKey } from '../everframe/config';
import { isDemoMode } from '../demo/mode';
import { PhoneHeader, TopNav } from '../components/Chrome';
import { Focusable } from '../components/Focusable';
import { reportHint, requestReport } from '../components/ReportTrigger';
import { Button, SectionHeading, ShowTitle, styles } from '../components/primitives';

// The hosted demo starts with every bug on and hides the switches.
const DEMO_MODE = isDemoMode({ EXPO_PUBLIC_DEMO_MODE: process.env.EXPO_PUBLIC_DEMO_MODE });

export const viewer = {
  id: 'viewer-0042',
  displayName: 'Mara Lind',
  email: 'mara.lind@nocturne.example',
};

function Row({ label, value }: { label: string; value: string }): React.JSX.Element {
  const L = useLayout();
  const fs = L.size({ tv: 26, wide: 16, phone: 15 });
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 16, paddingVertical: fs * 0.7, borderBottomWidth: 1, borderBottomColor: color.line }}>
      <Text style={{ fontFamily: font.body, fontSize: fs, color: color.lichen }}>{label}</Text>
      <Text style={{ flexShrink: 1, fontFamily: font.medium, fontSize: fs, color: color.bone, textAlign: 'right' }}>{value}</Text>
    </View>
  );
}

function Toggle({ on }: { on: boolean }): React.JSX.Element {
  const L = useLayout();
  const w = L.size({ tv: 72, wide: 44, phone: 44 });
  const h = w * 0.58;
  return (
    <View style={{ width: w, height: h, borderRadius: h, padding: h * 0.12, backgroundColor: on ? color.marigold : color.lineStrong, alignItems: on ? 'flex-end' : 'flex-start' }}>
      <View style={{ width: h * 0.76, height: h * 0.76, borderRadius: h, backgroundColor: on ? color.onMarigold : color.lichen }} />
    </View>
  );
}

export function Profile(): React.JSX.Element {
  useEverframeScreen('Profile');
  const L = useLayout();
  const insets = useInsets();
  const state = useScenarios();
  const fs = L.size({ tv: 26, wide: 16, phone: 15 });
  const card = { backgroundColor: color.surface, borderRadius: L.size({ tv: 28, wide: 20, phone: 18 }), padding: L.size({ tv: 40, wide: 28, phone: 20 }), gap: L.size({ tv: 10, wide: 6, phone: 4 }) };
  const allOn = scenarios.every((s) => state[s.id]);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: color.ground }} contentContainerStyle={{ paddingBottom: L.size({ tv: 120, wide: 96, phone: 140 }) }}>
      {L.form === 'phone' ? <PhoneHeader topInset={insets.top} /> : <TopNav active="profile" />}
      <View style={{ width: '100%', maxWidth: L.form === 'tv' ? undefined : 1440, alignSelf: 'center', paddingHorizontal: L.gutter, gap: L.size({ tv: 40, wide: 28, phone: 20 }) }}>
        <ShowTitle size={L.size({ tv: 120, wide: 84, phone: 52 })} style={{ marginTop: L.size({ tv: 30, wide: 24, phone: 8 }) }}>
          {viewer.displayName}
        </ShowTitle>

        <View style={{ flexDirection: L.form === 'phone' ? 'column' : 'row', gap: L.size({ tv: 40, wide: 28, phone: 20 }), alignItems: 'flex-start' }}>
          <View style={[card, { flex: 1, alignSelf: 'stretch' }]}>
            <SectionHeading size={L.size({ tv: 32, wide: 22, phone: 19 })}>Account</SectionHeading>
            <Row label="Plan" value="Nocturne Premium, 4K" />
            <EverframeSensitive>
              <Row label="Email" value={viewer.email} />
              <Row label="Payment" value="Visa ending 4242, renews 14 Nov" />
            </EverframeSensitive>
            <Row label="Profile ID" value={viewer.id} />
          </View>

          <View style={[card, { flex: 1, alignSelf: 'stretch' }]}>
            <SectionHeading size={L.size({ tv: 32, wide: 22, phone: 19 })}>Something not right?</SectionHeading>
            <Text style={{ fontFamily: font.body, fontSize: fs, lineHeight: fs * 1.45, color: color.mist, marginBottom: fs * 0.6 }}>
              Send us a report with a screenshot. We see exactly what you saw, including what the app was doing at the time. {reportHint} from any screen.
            </Text>
            <Button kind="primary" icon="report" label="Report a problem" onPress={requestReport} testID="profile-report" containerStyle={{ alignSelf: 'flex-start' }} />
          </View>
        </View>

        {!DEMO_MODE ? (
          <View style={card}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
              <View style={{ gap: 4, flexShrink: 1 }}>
                <SectionHeading size={L.size({ tv: 32, wide: 22, phone: 19 })}>Demo bugs</SectionHeading>
                <Text style={{ fontFamily: font.body, fontSize: fs * 0.9, color: color.lichen }}>Switch one on, reproduce it, then report it.</Text>
              </View>
              <Button label={allOn ? 'Turn all off' : 'Turn all on'} onPress={() => setAllScenarios(!allOn)} testID="demo-all" />
            </View>
            <View style={{ marginTop: fs * 0.6 }}>
              {scenarios.map((s) => (
                <Focusable
                  key={s.id}
                  accessibilityRole="switch"
                  accessibilityState={{ checked: state[s.id] }}
                  accessibilityLabel={s.name}
                  testID={`demo-${s.id}`}
                  onPress={() => setScenario(s.id, !state[s.id])}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: fs * 0.8, paddingHorizontal: fs * 0.6, borderRadius: fs * 0.6, borderBottomWidth: 1, borderBottomColor: color.line }}
                  focusStyle={[{ backgroundColor: color.raised }, L.form === 'tv' && [styles.ring, { borderRadius: fs * 0.6 }]]}
                >
                  <View style={{ flex: 1, gap: 3 }}>
                    <Text style={{ fontFamily: font.semibold, fontSize: fs, color: color.bone }}>{s.name}</Text>
                    <Text style={{ fontFamily: font.body, fontSize: fs * 0.85, color: color.lichen }}>
                      {s.where}. Shows: {s.shows.toLowerCase()}.
                    </Text>
                  </View>
                  <Toggle on={state[s.id]} />
                </Focusable>
              ))}
            </View>
          </View>
        ) : null}

        <View style={[card, { backgroundColor: everframe.night }]}>
          <Text style={{ fontFamily: font.semibold, fontSize: fs, color: everframe.ice }}>
            Everframe {hasKey ? 'is connected' : 'has no SDK key'}
          </Text>
          <Text style={{ fontFamily: font.body, fontSize: fs * 0.88, lineHeight: fs * 1.35, color: everframe.iceDim }}>
            {hasKey
              ? `Reports from this ${Platform.isTV ? 'TV' : Platform.OS === 'web' ? 'browser' : 'phone'} go to the Nocturne project.`
              : 'Add your Everframe SDK key to .env (see .env.example) and rebuild the app to send reports.'}
          </Text>
        </View>

        <Text style={{ fontFamily: font.body, fontSize: fs * 0.8, lineHeight: fs * 1.25, color: color.lichenDim }}>
          Nocturne TV is a fictional service made to demonstrate Everframe. Its titles, people and artwork are invented; the artwork was generated for this demo. Fonts: Bricolage Grotesque and Instrument Sans (SIL Open Font License).
        </Text>
      </View>
    </ScrollView>
  );
}
