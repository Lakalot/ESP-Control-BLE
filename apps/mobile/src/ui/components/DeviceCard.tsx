import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { BleDevice } from '../../types/ble.types';
import { palette, radius, shadows, withAlpha } from '../theme/ui';

interface Props {
  device: BleDevice;
  isKnown?: boolean;
  knownLabel?: string;
  onPress: (device: BleDevice) => void;
}

function rssiToSignal(rssi: number | null): { label: string; color: string; bars: number } {
  if (rssi === null) return { label: 'Inconnu', color: palette.subtle, bars: 0 };
  if (rssi >= -60) return { label: 'Fort', color: palette.success, bars: 4 };
  if (rssi >= -75) return { label: 'Stable', color: palette.warn, bars: 3 };
  if (rssi >= -88) return { label: 'Moyen', color: palette.accentAlt, bars: 2 };
  return { label: 'Faible', color: palette.danger, bars: 1 };
}

function SignalBars({ bars, color }: { bars: number; color: string }) {
  return (
    <View style={signalStyles.container}>
      {[1, 2, 3, 4].map((level) => (
        <View
          key={level}
          style={[
            signalStyles.bar,
            { height: 6 + level * 4 },
            { backgroundColor: level <= bars ? color : palette.border },
          ]}
        />
      ))}
    </View>
  );
}

const signalStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
  },
  bar: {
    width: 5,
    borderRadius: radius.pill,
  },
});

export function DeviceCard({ device, isKnown = false, knownLabel, onPress }: Props) {
  const signal = rssiToSignal(device.rssi);
  const displayName = device.name ?? 'ESP32 inconnu';

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        shadows.card,
        pressed && styles.cardPressed,
      ]}
      onPress={() => onPress(device)}
    >
      <View
        style={[
          styles.cardAccent,
          { backgroundColor: withAlpha(signal.color, 0.85) },
        ]}
      />

      <View style={styles.topRow}>
        {isKnown ? (
          <View style={styles.knownPill}>
            <Text style={styles.knownPillText}>PIN memorise</Text>
          </View>
        ) : (
          <View />
        )}
        <View style={[styles.signalPill, { borderColor: withAlpha(signal.color, 0.4) }]}>
          <SignalBars bars={signal.bars} color={signal.color} />
          <Text style={[styles.signalText, { color: signal.color }]}>{signal.label}</Text>
        </View>
      </View>

      <Text style={styles.name} numberOfLines={1}>
        {displayName}
      </Text>

      <Text style={styles.id} numberOfLines={1}>
        {device.id}
      </Text>

      <View style={styles.footerRow}>
        <View style={styles.metaChip}>
          <Text style={styles.metaChipText}>
            {device.rssi !== null ? `${device.rssi} dBm` : 'RSSI indisponible'}
          </Text>
        </View>
        {knownLabel ? (
          <View style={styles.metaChipAlt}>
            <Text style={styles.metaChipAltText}>{knownLabel}</Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: palette.panel,
    borderRadius: radius.md,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: palette.border,
  },
  cardPressed: {
    transform: [{ scale: 0.99 }],
    opacity: 0.96,
  },
  cardAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    gap: 10,
  },
  knownPill: {
    backgroundColor: palette.chip,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  knownPillText: {
    color: palette.accent,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.7,
  },
  signalPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: palette.panelInset,
  },
  signalText: {
    fontSize: 11,
    fontWeight: '700',
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: palette.text,
    marginBottom: 5,
  },
  id: {
    fontSize: 12,
    color: palette.muted,
    marginBottom: 16,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  metaChip: {
    backgroundColor: withAlpha(palette.white, 0.04),
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  metaChipText: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: '600',
  },
  metaChipAlt: {
    backgroundColor: withAlpha(palette.accentAlt, 0.12),
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  metaChipAltText: {
    color: palette.accentAlt,
    fontSize: 12,
    fontWeight: '700',
  },
});
