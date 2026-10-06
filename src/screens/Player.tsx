import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Image, Platform, Pressable, Text, TVEventHandler, View } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { LinearGradient } from 'expo-linear-gradient';
import { useEverframeScreen } from '@everframe/react-native';
import { usePlayerTracking } from '../everframe/usePlayerTracking';
import { color, font } from '../theme';
import { useInsets, useLayout } from '../layout';
import { nav } from '../nav';
import { byId, type Caption } from '../data/catalog';
import { fetchNextSegment, sendHeartbeat } from '../demo/api';
import { useScenario } from '../demo/scenarios';
import { Focusable } from '../components/Focusable';
import { Icon, type IconName } from '../components/Icon';
import { reportHint } from '../components/ReportTrigger';
import { styles } from '../components/primitives';

// The clips are ~23 s loops. The player presents them inside the episode's
// real running time, starting where the viewer left off, so the UI reads like
// a full episode while the bundle stays small.

const CLIP_SECONDS = 23;
const DRIFT_SECONDS = 2;
const STALL_AFTER = 10;

function clock(sec: number): string {
  const s = Math.max(0, Math.floor(sec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = String(s % 60).padStart(2, '0');
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${r}` : `${m}:${r}`;
}

function cueAt(captions: Caption[], t: number): Caption | undefined {
  return captions.find((c) => t >= c.start && t < c.end);
}

export function Player({ id, episode }: { id: string; episode?: string }): React.JSX.Element {
  const title = byId(id);
  const ep = title.episodes.find((e) => e.id === episode) ?? title.episodes[0];
  useEverframeScreen(`Player: ${title.name}${ep ? ` E${ep.number}` : ''}`);
  const L = useLayout();
  const insets = useInsets();
  const drift = useScenario('subtitleDrift');
  const stallOn = useScenario('playerStall');

  const total = (ep?.length ?? 104) * 60;
  const startAt = Math.floor((ep && ep.progress < 1 ? ep.progress : 0) * total);

  const [elapsed, setElapsed] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [stalled, setStalled] = useState(false);
  const [ready, setReady] = useState(false);
  const [captionsOn, setCaptionsOn] = useState(true);
  const [controls, setControls] = useState(true);
  const lastClipTime = useRef(0);
  const startedRef = useRef(false);
  const mountedAt = useRef(Date.now());
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const tracker = usePlayerTracking('nocturne-player');

  const player = useVideoPlayer(title.clip, (p) => {
    p.loop = true;
    p.muted = true;
    p.timeUpdateEventInterval = 0.25;
    p.play();
  });

  // Time, status and play/pause wiring, mirrored into Everframe player events.
  useEffect(() => {
    const onReady = () => {
      if (startedRef.current) return;
      startedRef.current = true;
      // A play() issued before the source loaded can be dropped (web).
      player.play();
      setReady(true);
      tracker.emit('startup', { ms: Date.now() - mountedAt.current, source: `${title.id}/${ep?.id ?? 'film'}` });
    };
    const subs = [
      player.addListener('timeUpdate', ({ currentTime }) => {
        const prev = lastClipTime.current;
        const delta = currentTime >= prev ? currentTime - prev : CLIP_SECONDS - prev + currentTime;
        lastClipTime.current = currentTime;
        if (delta > 0 && delta < 2) setElapsed((e) => e + delta);
      }),
      player.addListener('statusChange', ({ status, error }) => {
        if (status === 'readyToPlay') onReady();
        if (status === 'error') {
          console.error('[player] playback error', error);
          tracker.emit('error', { message: String(error?.message ?? 'unknown') });
        }
      }),
      player.addListener('playingChange', ({ isPlaying }) => {
        setPlaying(isPlaying);
        tracker.emit(isPlaying ? 'play' : 'pause', { position: Math.round(startAt + lastClipTime.current) });
      }),
    ];
    if (player.status === 'readyToPlay') onReady();
    console.log(`[player] open ${title.id} ${ep ? `E${ep.number}` : ''} at ${clock(startAt)} of ${clock(total)}`);
    if (drift) console.info(`[captions] track "en" offset ${-DRIFT_SECONDS * 1000} ms from manifest`);
    return () => subs.forEach((s) => s.remove());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player]);

  // Rough stats so the session vitals timeline has a shape.
  useEffect(() => {
    const t = setInterval(() => {
      tracker.updateStats({ bufferAheadMs: stalled ? 0 : 8000, bitrate: 4_800_000, bandwidthEstimate: stalled ? 300_000 : 12_000_000, width: 1280, height: 720, droppedFrames: 0 });
    }, 2000);
    return () => clearInterval(t);
  }, [tracker, stalled]);

  useEffect(() => {
    const t = setInterval(() => void sendHeartbeat(title, startAt + lastClipTime.current), 30_000);
    return () => clearInterval(t);
  }, [title, startAt]);

  // Scenario: a segment request fails and playback stops after ~10 s.
  useEffect(() => {
    if (!stallOn || stalled || elapsed < STALL_AFTER) return;
    setStalled(true);
    player.pause();
    tracker.emit('buffer_start', { position: Math.round(startAt + elapsed) });
    console.warn('[player] buffer empty, waiting for next segment');
    let attempt = 0;
    let cancelled = false;
    const retry = async () => {
      if (cancelled) return;
      attempt += 1;
      const ok = await fetchNextSegment(title, 412 + attempt);
      if (!ok && !cancelled) {
        tracker.emit('error', { code: 'SEGMENT_HTTP_503', attempt });
        console.error(`[player] segment ${412 + attempt} failed (HTTP 503), retry ${attempt}`);
        if (attempt < 4) setTimeout(() => void retry(), 4000);
      }
    };
    void retry();
    return () => {
      cancelled = true;
    };
  }, [stallOn, stalled, elapsed, player, tracker, startAt, title]);

  useEffect(() => {
    if (!stallOn && stalled) {
      setStalled(false);
      tracker.emit('buffer_end', {});
      player.play();
    }
  }, [stallOn, stalled, player, tracker]);

  const poke = useCallback(() => {
    setControls(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setControls(false), L.form === 'tv' ? 5000 : 3500);
  }, [L.form]);

  useEffect(() => {
    poke();
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [poke]);

  const toggle = useCallback(() => {
    if (stalled) return;
    if (player.playing) player.pause();
    else player.play();
    poke();
  }, [player, poke, stalled]);

  const skip = useCallback(
    (sec: number) => {
      if (stalled) return;
      player.seekBy(sec);
      setElapsed((e) => Math.max(-startAt, e + sec));
      tracker.emit('seek', { from: Math.round(startAt + elapsed), to: Math.round(startAt + elapsed + sec) });
      poke();
    },
    [player, poke, stalled, startAt, elapsed, tracker],
  );

  // Remote: play/pause toggles, any other key shows the controls.
  useEffect(() => {
    if (!Platform.isTV) return;
    const sub = TVEventHandler.addListener((evt) => {
      if (Number(evt.eventKeyAction) !== 1) return;
      if (evt.eventType === 'playPause') toggle();
      else if (evt.eventType !== 'longPlayPause') poke();
    });
    return () => sub?.remove();
  }, [toggle, poke]);

  // Keyboard on web.
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) return;
      if (e.key === ' ' || e.key === 'k') {
        e.preventDefault();
        toggle();
      } else if (e.key === 'ArrowLeft') skip(-10);
      else if (e.key === 'ArrowRight') skip(10);
      else if (e.key === 'Escape') nav.back();
      else poke();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [toggle, skip, poke]);

  const position = Math.min(total, startAt + elapsed);
  const clipTime = lastClipTime.current;
  const cue = captionsOn ? cueAt(title.captions, drift ? clipTime - DRIFT_SECONDS : clipTime) : undefined;

  // Phones in portrait get a 16:9 picture in the middle; everything else fills.
  const portrait = L.form === 'phone' && L.height > L.width;
  const boxH = L.width * (9 / 16);
  const videoBox = portrait
    ? ({ position: 'absolute', left: 0, width: L.width, height: boxH, top: (L.height - boxH) / 2 - 40 } as const)
    : ({ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 } as const);
  const captionBottom = portrait
    ? 10
    : controls
      ? L.size({ tv: 300, wide: 190, phone: 170 })
      : L.size({ tv: 110, wide: 60, phone: 50 });

  const fs = L.size({ tv: 24, wide: 15, phone: 14 });
  const titleSize = L.size({ tv: 34, wide: 22, phone: 18 });
  const btn = L.size({ tv: 76, wide: 52, phone: 48 });
  const pad = L.form === 'tv' ? L.gutter : L.size({ tv: 0, wide: 40, phone: 20 });

  return (
    <Pressable
      accessibilityLabel="Video player"
      onPress={() => (controls && L.form === 'phone' ? setControls(false) : poke())}
      onHoverIn={poke}
      style={{ flex: 1, backgroundColor: '#000' }}
    >
      <View style={videoBox} pointerEvents="none">
        <VideoView
          player={player}
          nativeControls={false}
          contentFit="cover"
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
          {...({ focusable: false } as object)}
        />
        {stalled ? (
          // A paused native player can render black; hold the episode still instead.
          <Image source={title.still} resizeMode="cover" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0.55 }} />
        ) : null}
        {cue ? (
          <View style={{ position: 'absolute', left: 0, right: 0, bottom: captionBottom, alignItems: 'center', paddingHorizontal: 24 }}>
            <Text
              testID="caption"
              style={{ fontFamily: font.medium, fontSize: L.size({ tv: 40, wide: 26, phone: portrait ? 15 : 18 }), lineHeight: L.size({ tv: 52, wide: 34, phone: portrait ? 20 : 24 }), color: '#fff', backgroundColor: 'rgba(0,0,0,0.72)', paddingHorizontal: 12, paddingVertical: 3, borderRadius: 6, overflow: 'hidden', textAlign: 'center' }}
            >
              {cue.text}
            </Text>
          </View>
        ) : null}
      </View>

      {!ready || stalled ? (
        <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', gap: 14 }}>
          <ActivityIndicator size="large" color={color.marigold} />
          {stalled ? <Text style={{ fontFamily: font.medium, fontSize: fs, color: color.bone }}>Buffering…</Text> : null}
        </View>
      ) : null}

      {controls ? (
        <>
          <View pointerEvents="box-none" style={{ position: 'absolute', top: insets.top + L.size({ tv: 56, wide: 24, phone: 8 }), left: pad, right: pad, flexDirection: 'row', alignItems: 'center', gap: 16 }}>
            <Focusable
              accessibilityRole="button"
              accessibilityLabel="Back"
              testID="player-back"
              onPress={() => nav.back()}
              style={{ width: btn, height: btn, borderRadius: btn, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.45)' }}
              focusStyle={[styles.ring, { borderRadius: btn }]}
            >
              <Icon name="back" size={btn * 0.42} color={color.bone} weight={2.2} />
            </Focusable>
          </View>

          <View
            pointerEvents="box-none"
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              paddingHorizontal: pad,
              paddingBottom: insets.bottom + L.size({ tv: 64, wide: 28, phone: 20 }),
              paddingTop: L.size({ tv: 120, wide: 80, phone: 60 }),
              gap: L.size({ tv: 22, wide: 14, phone: 12 }),
            }}
          >
            <LinearGradient
              colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.75)']}
              style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
              pointerEvents="none"
            />
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16 }}>
              <View style={{ flexShrink: 1, gap: 4 }}>
                <Text numberOfLines={1} style={{ fontFamily: font.brand, fontSize: titleSize, color: color.bone, letterSpacing: -titleSize * 0.02 }}>
                  {title.name}
                </Text>
                {ep ? (
                  <Text numberOfLines={1} style={{ fontFamily: font.body, fontSize: fs, color: color.mist }}>
                    {title.kind === 'documentary' ? '' : 'S1 '}E{ep.number}  {ep.title}
                  </Text>
                ) : null}
              </View>
              <Text style={{ fontFamily: font.medium, fontSize: fs, color: color.mist }} testID="player-time">
                {clock(position)} / {clock(total)}
              </Text>
            </View>
            <View style={{ height: L.size({ tv: 8, wide: 5, phone: 4 }), borderRadius: 99, backgroundColor: 'rgba(241,234,219,0.28)' }}>
              <View style={{ height: '100%', width: `${(position / total) * 100}%`, borderRadius: 99, backgroundColor: color.marigold }} />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: L.size({ tv: 20, wide: 12, phone: 10 }) }}>
              <ControlButton icon="rewind" label="Back 10 seconds" size={btn} onPress={() => skip(-10)} />
              <ControlButton icon={playing && !stalled ? 'pause' : 'play'} label={playing ? 'Pause' : 'Play'} size={btn} onPress={toggle} primary preferred />
              <ControlButton icon="forward" label="Forward 10 seconds" size={btn} onPress={() => skip(10)} />
              <ControlButton icon="captions" label={captionsOn ? 'Turn subtitles off' : 'Turn subtitles on'} size={btn} onPress={() => setCaptionsOn((c) => !c)} active={captionsOn} />
              {reportHint ? (
                <Text numberOfLines={2} style={{ marginLeft: 'auto', flexShrink: 1, textAlign: 'right', fontFamily: font.body, fontSize: fs * 0.85, color: color.lichen }}>{reportHint}</Text>
              ) : null}
            </View>
          </View>
        </>
      ) : null}
    </Pressable>
  );
}

function ControlButton({ icon, label, size, onPress, primary, preferred, active }: {
  icon: IconName;
  label: string;
  size: number;
  onPress: () => void;
  primary?: boolean;
  preferred?: boolean;
  active?: boolean;
}): React.JSX.Element {
  return (
    <Focusable
      accessibilityRole="button"
      accessibilityLabel={label}
      hasTVPreferredFocus={Platform.isTV && preferred}
      onPress={onPress}
      focusScale={Platform.isTV ? 1.08 : 1}
      style={{
        width: size,
        height: size,
        borderRadius: size,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: primary ? color.marigold : active ? color.glassStrong : color.glass,
      }}
      focusStyle={[styles.ring, { borderRadius: size }]}
    >
      <Icon name={icon} size={size * 0.44} color={primary ? color.onMarigold : color.bone} weight={2.2} />
    </Focusable>
  );
}
