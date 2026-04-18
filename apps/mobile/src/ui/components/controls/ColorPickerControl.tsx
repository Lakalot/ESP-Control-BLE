import Slider from '@react-native-community/slider';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import type { ControlProps } from '../../../types/control.types';
import { palette, radius, withAlpha } from '../../theme/ui';
import { CardShell } from './shared/CardShell';
import { makeColorPayload } from './shared/controlUtils';

function hsvToRgb(h: number, s: number, v: number): [number, number, number] {
  const saturation = s / 100;
  const value = v / 100;
  const c = value * saturation;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = value - c;

  let r = 0;
  let g = 0;
  let b = 0;

  if (h < 60) {
    r = c;
    g = x;
  } else if (h < 120) {
    r = x;
    g = c;
  } else if (h < 180) {
    g = c;
    b = x;
  } else if (h < 240) {
    g = x;
    b = c;
  } else if (h < 300) {
    r = x;
    b = c;
  } else {
    r = c;
    b = x;
  }

  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255),
  ];
}

function hexToHsv(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let h = 0;
  if (delta !== 0) {
    if (max === r) h = 60 * (((g - b) / delta) % 6);
    else if (max === g) h = 60 * (((b - r) / delta) + 2);
    else h = 60 * (((r - g) / delta) + 4);
    if (h < 0) h += 360;
  }

  const s = max === 0 ? 0 : (delta / max) * 100;
  const v = max * 100;
  return [Math.round(h), Math.round(s), Math.round(v)];
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b
    .toString(16)
    .padStart(2, '0')}`;
}

function getInitialHsv(value: string | null): [number, number, number] {
  if (value && /^#[0-9a-fA-F]{6}$/.test(value)) return hexToHsv(value);
  return [0, 100, 100];
}

export function ColorPickerControl({
  command,
  currentValue,
  isPending,
  onAction,
  variant,
  surfaceStyle,
  titleOverride,
  subtitle,
}: ControlProps) {
  const textValue = typeof currentValue === 'string' ? currentValue : null;
  const accentColor = command.options.color ?? palette.accentAlt;
  const [hue, setHue] = useState(0);
  const [saturation, setSaturation] = useState(100);
  const [brightness, setBrightness] = useState(100);
  const isDisabled = Boolean(command.options.disabled) || isPending;

  useEffect(() => {
    const [nextHue, nextSaturation, nextBrightness] = getInitialHsv(textValue);
    setHue(nextHue);
    setSaturation(nextSaturation);
    setBrightness(nextBrightness);
  }, [textValue]);

  const [r, g, b] = hsvToRgb(hue, saturation, brightness);
  const previewHex = rgbToHex(r, g, b);

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
      <View style={[styles.container, isDisabled && styles.containerDisabled]}>
        <View style={styles.previewCard}>
          <View style={[styles.swatch, { backgroundColor: previewHex }]} />
          <View style={styles.previewText}>
            <Text style={styles.previewLabel}>Selection</Text>
            <Text style={styles.hexLabel}>{previewHex.toUpperCase()}</Text>
          </View>
          <TouchableOpacity
            style={[
              styles.sendButton,
              { backgroundColor: accentColor },
              isDisabled && styles.sendButtonDisabled,
            ]}
            onPress={() => {
              if (!isDisabled) onAction(command.id, makeColorPayload(previewHex));
            }}
            disabled={isDisabled}
            activeOpacity={0.85}
          >
            <Text style={styles.sendButtonText}>{isPending ? '...' : 'Appliquer'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sliderRow}>
          <Text style={styles.sliderLabel}>H</Text>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={360}
            step={1}
            value={hue}
            onValueChange={setHue}
            minimumTrackTintColor="#ff8a80"
            maximumTrackTintColor={withAlpha(palette.white, 0.08)}
            thumbTintColor={palette.white}
            disabled={isDisabled}
          />
          <Text style={styles.sliderValue}>{hue} deg</Text>
        </View>

        <View style={styles.sliderRow}>
          <Text style={styles.sliderLabel}>S</Text>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={100}
            step={1}
            value={saturation}
            onValueChange={setSaturation}
            minimumTrackTintColor={palette.subtle}
            maximumTrackTintColor={previewHex}
            thumbTintColor={palette.white}
            disabled={isDisabled}
          />
          <Text style={styles.sliderValue}>{saturation}%</Text>
        </View>

        <View style={styles.sliderRow}>
          <Text style={styles.sliderLabel}>V</Text>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={100}
            step={1}
            value={brightness}
            onValueChange={setBrightness}
            minimumTrackTintColor={withAlpha(palette.white, 0.12)}
            maximumTrackTintColor={palette.white}
            thumbTintColor={palette.white}
            disabled={isDisabled}
          />
          <Text style={styles.sliderValue}>{brightness}%</Text>
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
    gap: 10,
  },
  containerDisabled: {
    opacity: 0.4,
  },
  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: palette.panelInset,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 12,
  },
  swatch: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.borderStrong,
  },
  previewText: {
    flex: 1,
    gap: 2,
  },
  previewLabel: {
    color: palette.subtle,
    fontSize: 12,
  },
  hexLabel: {
    fontSize: 14,
    color: palette.text,
    fontVariant: ['tabular-nums'],
    letterSpacing: 1,
    fontWeight: '700',
  },
  sendButton: {
    borderRadius: radius.md,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  sendButtonDisabled: {
    backgroundColor: palette.borderStrong,
  },
  sendButtonText: {
    color: palette.bg,
    fontWeight: '700',
    fontSize: 13,
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sliderLabel: {
    width: 16,
    fontSize: 12,
    color: palette.subtle,
    fontWeight: '700',
  },
  slider: {
    flex: 1,
    height: 36,
  },
  sliderValue: {
    width: 58,
    fontSize: 11,
    color: palette.muted,
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
  },
  disabledOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: withAlpha(palette.bg, 0.18),
  },
});
