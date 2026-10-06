import React, { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, Platform, StyleSheet, View, type ImageSourcePropType } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { color } from '../theme';

const native = Platform.OS !== 'web';

/**
 * Full-bleed artwork with a slow push-in and the scrims that keep text on
 * top of it readable. Cross-fades when the source changes. The push-in is
 * skipped when the viewer has asked for reduced motion.
 */
export function Backdrop({ source, aspect = 1.5, focusX = 0.5, side = true, bottom = true, bottomStart = 0.45 }: {
  source: ImageSourcePropType;
  /** Width / height of the artwork. */
  aspect?: number;
  /** Horizontal position of the subject (0–1), kept in frame when cropping. */
  focusX?: number;
  side?: boolean;
  bottom?: boolean;
  /** Where the bottom scrim starts, as a fraction of height. */
  bottomStart?: number;
}): React.JSX.Element {
  const scale = useRef(new Animated.Value(1)).current;
  const fade = useRef(new Animated.Value(0)).current;
  const [box, setBox] = useState({ w: 0, h: 0 });

  // Cover-fit by hand so the subject stays in frame (no objectPosition on native).
  const wide = box.w / Math.max(1, box.h) > aspect;
  const iw = wide ? box.w : box.h * aspect;
  const ih = wide ? box.w / aspect : box.h;
  const left = Math.min(0, Math.max(box.w - iw, box.w / 2 - iw * focusX));
  const top = (box.h - ih) * 0.4;

  useEffect(() => {
    fade.setValue(0);
    Animated.timing(fade, { toValue: 1, duration: 700, useNativeDriver: native }).start();
    let loop: Animated.CompositeAnimation | undefined;
    let cancelled = false;
    void AccessibilityInfo.isReduceMotionEnabled().then((reduced) => {
      if (reduced || cancelled) return;
      scale.setValue(1);
      loop = Animated.loop(
        Animated.sequence([
          Animated.timing(scale, { toValue: 1.08, duration: 18000, easing: Easing.inOut(Easing.quad), useNativeDriver: native }),
          Animated.timing(scale, { toValue: 1, duration: 18000, easing: Easing.inOut(Easing.quad), useNativeDriver: native }),
        ]),
      );
      loop.start();
    });
    return () => {
      cancelled = true;
      loop?.stop();
    };
  }, [source, fade, scale]);

  return (
    <View
      style={[StyleSheet.absoluteFill, { overflow: 'hidden' }]}
      pointerEvents="none"
      onLayout={(e) => setBox({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}
    >
      {box.w > 0 ? (
        <Animated.Image
          source={source}
          resizeMode="cover"
          style={{ position: 'absolute', left, top, width: iw, height: ih, opacity: fade, transform: [{ scale }] }}
        />
      ) : null}
      {side ? (
        <LinearGradient
          colors={['rgba(14,27,25,0.94)', 'rgba(14,27,25,0.55)', 'rgba(14,27,25,0)']}
          locations={[0, 0.38, 0.66]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
      ) : null}
      {bottom ? (
        <LinearGradient
          colors={['rgba(14,27,25,0)', color.ground]}
          locations={[bottomStart, 0.92]}
          style={StyleSheet.absoluteFill}
        />
      ) : null}
    </View>
  );
}
