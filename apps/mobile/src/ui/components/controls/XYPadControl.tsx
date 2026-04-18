import React, { useEffect, useRef, useState } from 'react';
import { PanResponder, StyleSheet, Text, View } from 'react-native';

import type { XYValue } from '../../../store/deviceStore';
import type { ControlProps } from '../../../types/control.types';
import { palette, radius, withAlpha } from '../../theme/ui';
import { CardShell } from './shared/CardShell';

const PAD_SIZE = 208;
const HALF = PAD_SIZE / 2;
const CROSSHAIR = 12;
const SEND_INTERVAL_MS = 80;

function clamp(value: number): number {
  return Math.max(-100, Math.min(100, value));
}

function pxToValue(px: number): number {
  return clamp(Math.round((px / HALF) * 100));
}

function valueToPx(value: number): number {
  return (clamp(value) / 100) * HALF;
}

export function XYPadControl({
  command,
  currentValue,
  isPending,
  onAction,
  variant,
  surfaceStyle,
  titleOverride,
  subtitle,
}: ControlProps) {
  const xyValue =
    currentValue != null &&
    typeof currentValue === 'object' &&
    'x' in currentValue &&
    'y' in currentValue
      ? (currentValue as XYValue)
      : null;
  const accentColor = command.options.color ?? palette.accentAlt;
  const isDisabled = Boolean(command.options.disabled) || isPending;
  const [dot, setDot] = useState(() => ({
    px: valueToPx(xyValue?.x ?? 0),
    py: valueToPx(xyValue?.y ?? 0),
  }));
  const padRef = useRef<View>(null);
  const padOriginRef = useRef<{ x: number; y: number } | null>(null);
  const lastSentRef = useRef(0);

  useEffect(() => {
    if (!xyValue) return;
    setDot({
      px: valueToPx(xyValue.x),
      py: valueToPx(xyValue.y),
    });
  }, [xyValue]);

  const emitValue = (rawX: number, rawY: number, force = false) => {
    const clampedPx = Math.max(-HALF, Math.min(HALF, rawX));
    const clampedPy = Math.max(-HALF, Math.min(HALF, rawY));
    const value = { x: pxToValue(clampedPx), y: pxToValue(clampedPy) };

    setDot({ px: valueToPx(value.x), py: valueToPx(value.y) });

    const now = Date.now();
    if (!isDisabled && (force || now - lastSentRef.current >= SEND_INTERVAL_MS)) {
      lastSentRef.current = now;
      const payload = new Uint8Array(4);
      const view = new DataView(payload.buffer);
      view.setInt16(0, value.x, false);
      view.setInt16(2, value.y, false);
      onAction(command.id, payload);
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !isDisabled,
      onMoveShouldSetPanResponder: () => !isDisabled,
      onPanResponderGrant: () => {
        padRef.current?.measure((_fx, _fy, _w, _h, pageX, pageY) => {
          padOriginRef.current = { x: pageX, y: pageY };
        });
      },
      onPanResponderMove: (event) => {
        const origin = padOriginRef.current;
        if (!origin) return;

        const rawX = event.nativeEvent.pageX - origin.x - HALF;
        const rawY = event.nativeEvent.pageY - origin.y - HALF;
        emitValue(rawX, rawY);
      },
      onPanResponderRelease: (event) => {
        const origin = padOriginRef.current;
        if (!origin) return;

        const rawX = event.nativeEvent.pageX - origin.x - HALF;
        const rawY = event.nativeEvent.pageY - origin.y - HALF;
        emitValue(rawX, rawY, true);
      },
    }),
  ).current;

  const dotLeft = HALF + dot.px - CROSSHAIR;
  const dotTop = HALF + dot.py - CROSSHAIR;

  return (
    <CardShell
      command={command}
      variant={variant}
      surfaceStyle={surfaceStyle}
      titleOverride={titleOverride}
      subtitle={subtitle}
      isPending={isPending}
      isDisabled={Boolean(command.options.disabled)}
      metaItems={Boolean(command.options.disabled) ? ['Desactive'] : []}
    >
      <View style={styles.container}>
        <Text style={styles.caption}>
          {command.options.hint ?? 'Glissez pour envoyer une position X/Y.'}
        </Text>

        <View
          ref={padRef}
          style={[styles.pad, isDisabled && styles.padDisabled]}
          {...panResponder.panHandlers}
        >
          <View style={styles.gridRing} />
          <View style={styles.gridH} />
          <View style={styles.gridV} />
          <View
            style={[
              styles.crosshair,
              {
                left: dotLeft,
                top: dotTop,
                borderColor: accentColor,
                backgroundColor: withAlpha(accentColor, 0.14),
              },
            ]}
          />
          <View
            style={[styles.crosshairH, { top: HALF + dot.py - 1, backgroundColor: accentColor }]}
          />
          <View
            style={[styles.crosshairV, { left: HALF + dot.px - 1, backgroundColor: accentColor }]}
          />
        </View>

        <View style={styles.valueRow}>
          <View style={styles.valueChip}>
            <Text style={styles.valueChipLabel}>X</Text>
            <Text style={[styles.xyLabel, { color: accentColor }]}>
              {pxToValue(dot.px).toString().padStart(4)}
            </Text>
          </View>
          <View style={styles.valueChip}>
            <Text style={styles.valueChipLabel}>Y</Text>
            <Text style={[styles.xyLabel, { color: accentColor }]}>
              {pxToValue(dot.py).toString().padStart(4)}
            </Text>
          </View>
        </View>
      </View>

      {Boolean(command.options.disabled) ? (
        <View pointerEvents="none" style={styles.disabledOverlay} />
      ) : null}
    </CardShell>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 10,
  },
  caption: {
    width: '100%',
    fontSize: 12,
    color: palette.muted,
  },
  pad: {
    width: PAD_SIZE,
    height: PAD_SIZE,
    borderRadius: 24,
    backgroundColor: palette.panelInset,
    borderWidth: 1,
    borderColor: palette.borderStrong,
    overflow: 'hidden',
    position: 'relative',
  },
  padDisabled: {
    opacity: 0.4,
  },
  gridRing: {
    position: 'absolute',
    width: PAD_SIZE * 0.55,
    height: PAD_SIZE * 0.55,
    left: PAD_SIZE * 0.225,
    top: PAD_SIZE * 0.225,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: withAlpha(palette.white, 0.05),
  },
  gridH: {
    position: 'absolute',
    top: HALF - 1,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: withAlpha(palette.white, 0.08),
  },
  gridV: {
    position: 'absolute',
    left: HALF - 1,
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: withAlpha(palette.white, 0.08),
  },
  crosshair: {
    position: 'absolute',
    width: CROSSHAIR * 2,
    height: CROSSHAIR * 2,
    borderRadius: CROSSHAIR,
    borderWidth: 2,
    zIndex: 3,
  },
  crosshairH: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    opacity: 0.35,
    zIndex: 2,
  },
  crosshairV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    opacity: 0.35,
    zIndex: 2,
  },
  valueRow: {
    flexDirection: 'row',
    gap: 12,
  },
  valueChip: {
    minWidth: 88,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radius.md,
    backgroundColor: palette.panelInset,
    borderWidth: 1,
    borderColor: palette.border,
    alignItems: 'center',
  },
  valueChipLabel: {
    fontSize: 11,
    color: palette.subtle,
    marginBottom: 4,
  },
  xyLabel: {
    fontSize: 13,
    fontVariant: ['tabular-nums'],
    fontWeight: '700',
  },
  disabledOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: withAlpha(palette.bg, 0.18),
  },
});
