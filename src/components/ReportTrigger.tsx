import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Platform, Text, TVEventControl, TVEventHandler, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { companion, useCompanion, useEverframe } from '@everframe/react-native';
import { everframe, font } from '../theme';
import { useLayout } from '../layout';
import { useReportHotkey } from '../everframe/hotkey';
import { Focusable } from './Focusable';
import { Icon } from './Icon';

// Everframe leaves report triggers to the host app. Like most consumer apps,
// Nocturne keeps them out of sight rather than floating a button over content:
//   phone         — shake the phone (the SDK's own shake-to-report trigger,
//                   switched on in everframe/config.ts)
//   web           — Ctrl+Shift+B (Cmd+Shift+B on a Mac)
//   Apple TV      — holding Play/Pause opens the pairing panel
//   Android TV    — the Menu button opens the pairing panel
// The pairing panel never asks anyone to type a report with a remote: the
// viewer scans its code and files the report from their phone, or picks the
// TV up in the Everframe dashboard's Companion and files it from there, with
// this screen's context streamed either way.
// Everywhere, Profile also has a "Report a problem" entry.

const appleTV = Platform.isTV && Platform.OS === 'ios';
const tv = Platform.isTV;
const KEY_UP = 1;

let requestHandler: (() => void) | null = null;

/** Open the reporter from anywhere (e.g. a "Report a problem" menu item). */
export function requestReport(): void {
  requestHandler?.();
}

const isMac = Platform.OS === 'web' && /Mac/.test(globalThis.navigator?.platform ?? '');

/** How to report from anywhere on this device, as a sentence. */
export const reportHint = appleTV
  ? 'Hold play/pause to report a problem'
  : Platform.isTV
    ? 'Press the menu button to report a problem'
    : Platform.OS === 'web'
      ? `Press ${isMac ? 'Cmd' : 'Ctrl'}+Shift+B to report a problem`
      : 'Shake your phone to report a problem';

export function ReportTrigger(): React.JSX.Element | null {
  const L = useLayout();
  const { open } = useEverframe();
  const [pairing, setPairing] = useState(false);
  const [sent, setSent] = useState(false);
  const busy = useRef(false);

  const report = useCallback(async () => {
    if (tv) {
      setPairing(true);
      return;
    }
    if (busy.current) return;
    busy.current = true;
    try {
      const result = await open();
      // The web SDK shows its own confirmation; native gets ours.
      if (Platform.OS !== 'web' && (result.status === 'submitted' || result.status === 'queued')) {
        setSent(true);
        setTimeout(() => setSent(false), 3500);
      }
    } catch (err) {
      console.warn('[report] reporter did not open', err);
    } finally {
      busy.current = false;
    }
  }, [open]);

  useEffect(() => {
    requestHandler = () => void report();
    return () => {
      requestHandler = null;
    };
  }, [report]);

  useReportHotkey(useCallback(() => void report(), [report]));

  useEffect(() => {
    if (!Platform.isTV) return;
    const sub = TVEventHandler.addListener((evt) => {
      if (Number(evt.eventKeyAction) !== KEY_UP) return;
      if (appleTV && evt.eventType === 'longPlayPause') void report();
      if (Platform.OS === 'android' && evt.eventType === 'menu') void report();
    });
    return () => sub?.remove();
  }, [report]);

  return (
    <>
      {sent ? <SentToast /> : null}
      {pairing ? <PairPhone onClose={() => setPairing(false)} /> : null}
    </>
  );
}

function SentToast(): React.JSX.Element {
  const L = useLayout();
  const fs = L.size({ tv: 26, wide: 15, phone: 15 });
  return (
    <View
      testID="submitted"
      accessibilityLiveRegion="polite"
      style={{
        position: 'absolute',
        top: L.size({ tv: 60, wide: 24, phone: 64 }),
        alignSelf: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        gap: fs * 0.6,
        backgroundColor: everframe.night,
        borderRadius: fs * 2,
        paddingHorizontal: fs * 1.1,
        paddingVertical: fs * 0.7,
      }}
    >
      <Icon name="check" size={fs * 1.2} color={everframe.cyan} />
      <Text style={{ fontFamily: font.medium, fontSize: fs, color: everframe.ice }}>Report sent. Thanks for flagging it.</Text>
    </View>
  );
}

/** TVs: pair a phone, or the dashboard's Companion, and file the report there. */
function PairPhone({ onClose }: { onClose: () => void }): React.JSX.Element {
  const L = useLayout();
  const { state, pairUrl, resolvedName, code, running } = useCompanion();
  const s = (n: number) => L.size({ tv: n, wide: n / 2, phone: n / 2 });

  useEffect(() => {
    companion.start();
    TVEventControl?.enableTVMenuKey?.();
    const sub = TVEventHandler.addListener((evt) => {
      if (evt.eventType === 'menu' && Number(evt.eventKeyAction) === KEY_UP) onClose();
    });
    return () => {
      sub?.remove();
      // A fresh pairing code every time the panel opens; a stale one may
      // already have expired on the server.
      companion.stop();
    };
  }, [onClose]);

  // Lets a recording (or a tester without a phone) open the pairing page
  // from another device, e.g. the iPhone simulator.
  useEffect(() => {
    if (pairUrl) console.info(`[companion] pair url ${pairUrl}`);
  }, [pairUrl]);

  const status =
    !running || pairUrl === null
      ? 'Connecting…'
      : state === 'paired'
        ? 'Phone connected. Finish the report there.'
        : state === 'report_in_progress'
          ? 'Report in progress on your phone'
          : state === 'phone_disconnected'
            ? 'Phone reconnecting…'
            : 'Scan with your phone camera';

  // Once a phone is connected the report is driven from the phone, which
  // captures this screen: step out of the way so it captures the app, not us.
  if (running && (state === 'paired' || state === 'report_in_progress')) {
    return (
      <View
        pointerEvents="none"
        accessibilityLiveRegion="polite"
        style={{
          position: 'absolute',
          right: s(48),
          bottom: s(48),
          flexDirection: 'row',
          alignItems: 'center',
          gap: s(14),
          paddingHorizontal: s(24),
          paddingVertical: s(14),
          borderRadius: s(40),
          backgroundColor: everframe.night,
        }}
      >
        <View style={{ width: s(12), height: s(12), borderRadius: s(6), backgroundColor: everframe.cyan }} />
        <Text style={{ fontFamily: font.medium, fontSize: s(22), color: everframe.ice }}>{status}</Text>
      </View>
    );
  }

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(4,8,10,0.55)' }}>
      <View
        accessibilityViewIsModal
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          width: s(760),
          backgroundColor: everframe.night,
          paddingHorizontal: s(64),
          paddingVertical: s(64),
          gap: s(32),
        }}
      >
        <View style={{ gap: s(8) }}>
          <Text style={{ fontFamily: font.medium, fontSize: s(22), color: everframe.iceDim }}>Everframe</Text>
          <Text style={{ fontFamily: font.semibold, fontSize: s(46), color: everframe.ice, letterSpacing: -s(1.2) }}>Report a problem</Text>
          <Text style={{ fontFamily: font.body, fontSize: s(24), lineHeight: s(34), color: everframe.iceDim }}>
            Scan the code to describe the problem on your phone, or open Companion in your Everframe project to report from your computer. This screen, and what just happened on it, is attached for you.
          </Text>
        </View>
        <View style={{ alignSelf: 'flex-start', padding: s(24), backgroundColor: '#FFFFFF', borderRadius: s(24) }}>
          {pairUrl ? (
            <QRCode value={pairUrl} size={s(340)} color="#06222A" backgroundColor="#FFFFFF" />
          ) : (
            <View style={{ width: s(340), height: s(340) }} />
          )}
        </View>
        <View style={{ gap: s(8) }}>
          <Text testID="companion-status" style={{ fontFamily: font.semibold, fontSize: s(26), color: everframe.cyan }}>
            {status}
          </Text>
          {(resolvedName ?? code) ? (
            <Text style={{ fontFamily: font.body, fontSize: s(22), color: everframe.iceDim }}>{resolvedName ?? `Code ${code}`}</Text>
          ) : null}
        </View>
        <Focusable
          hasTVPreferredFocus
          accessibilityRole="button"
          onPress={onClose}
          containerStyle={{ marginTop: 'auto', alignSelf: 'flex-start' }}
          style={{ height: s(72), paddingHorizontal: s(36), borderRadius: s(72), justifyContent: 'center', backgroundColor: everframe.raised }}
          focusStyle={{ backgroundColor: everframe.cyan }}
          focusScale={1.05}
        >
          {({ focused }) => (
            <Text style={{ fontFamily: font.semibold, fontSize: s(24), color: focused ? everframe.onCyan : everframe.ice }}>Done</Text>
          )}
        </Focusable>
      </View>
    </View>
  );
}
