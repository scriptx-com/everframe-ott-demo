import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Platform,
  Pressable,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import * as Everframe from '@everframe/react-native';
import { interactionTargetsEnabled, type InteractionTargetAnnotation } from '../everframe/interactionTargets';

// Keep the released demo deployable while the optional SDK feature is in review.
const useTarget = (Everframe as typeof Everframe & {
  useEverframeTarget?: <T>(annotation?: InteractionTargetAnnotation) => React.RefCallback<T>;
}).useEverframeTarget ?? (() => (_host: unknown) => {});

type Children = React.ReactNode | ((state: { focused: boolean }) => React.ReactNode);

export interface FocusableProps extends Omit<PressableProps, 'style' | 'children'> {
  everframeTarget?: InteractionTargetAnnotation;
  style?: StyleProp<ViewStyle>;
  /** Layout for the outer pressable, e.g. `{ flex: 1 }` inside a row. */
  containerStyle?: StyleProp<ViewStyle>;
  /** Applied while focused (TV remote, keyboard) or hovered (web). */
  focusStyle?: StyleProp<ViewStyle>;
  /** Grow while focused, e.g. 1.06 for cards on TV. */
  focusScale?: number;
  children?: Children;
  onFocusChange?: (focused: boolean) => void;
}

/**
 * Pressable with one focus model for every platform: remote focus on TV,
 * keyboard focus and hover on web, plain press on phones.
 */
export function Focusable({
  style,
  everframeTarget,
  containerStyle,
  focusStyle,
  focusScale = 1,
  children,
  onFocusChange,
  onFocus,
  onBlur,
  onHoverIn,
  onHoverOut,
  ...rest
}: FocusableProps): React.JSX.Element {
  const targetRef = useTarget<React.ElementRef<typeof Pressable>>(interactionTargetsEnabled ? everframeTarget : undefined);
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const scale = useRef(new Animated.Value(1)).current;
  const active = focused || hovered;

  useEffect(() => {
    if (focusScale === 1) return;
    Animated.spring(scale, {
      toValue: active ? focusScale : 1,
      useNativeDriver: Platform.OS !== 'web',
      friction: 7,
      tension: 80,
    }).start();
  }, [active, focusScale, scale]);

  const change = useCallback(
    (next: boolean) => {
      setFocused(next);
      onFocusChange?.(next);
    },
    [onFocusChange],
  );

  return (
    <Pressable
      {...rest}
      ref={targetRef}
      onFocus={(e) => {
        change(true);
        onFocus?.(e);
      }}
      onBlur={(e) => {
        change(false);
        onBlur?.(e);
      }}
      onHoverIn={(e) => {
        setHovered(true);
        onHoverIn?.(e);
      }}
      onHoverOut={(e) => {
        setHovered(false);
        onHoverOut?.(e);
      }}
      style={[containerStyle, Platform.OS === 'web' && ({ outlineStyle: 'none' } as unknown as ViewStyle)]}
    >
      {({ pressed }) => (
        <Animated.View
          style={[style, active && focusStyle, pressed && { opacity: 0.86 }, { transform: [{ scale }] }]}
        >
          {typeof children === 'function' ? children({ focused: active }) : children}
        </Animated.View>
      )}
    </Pressable>
  );
}
