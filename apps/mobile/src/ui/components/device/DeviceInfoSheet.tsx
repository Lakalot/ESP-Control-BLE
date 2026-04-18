import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';

import type { BleDevice } from '../../../types/ble.types';
import { palette, radius, withAlpha } from '../../theme/ui';

interface DeviceInfoSheetProps {
  modalRef: React.RefObject<React.ElementRef<typeof BottomSheetModal> | null>;
  device: BleDevice;
  manifestVersion?: number;
  knownLabel?: string;
  canForgetPin: boolean;
  onForgetPin: () => void;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

export function DeviceInfoSheet({
  modalRef,
  device,
  manifestVersion,
  knownLabel,
  canForgetPin,
  onForgetPin,
}: DeviceInfoSheetProps) {
  const snapPoints = useMemo(() => ['46%'], []);

  return (
    <BottomSheetModal
      ref={modalRef}
      snapPoints={snapPoints}
      enableDynamicSizing={false}
      backgroundStyle={styles.sheetBackground}
      handleIndicatorStyle={styles.handleIndicator}
      backdropComponent={(props) => (
        <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.52} />
      )}
    >
      <BottomSheetView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Infos appareil</Text>
          <Text style={styles.subtitle}>
            Les details techniques restent ici, hors de l ecran principal.
          </Text>
        </View>

        <View style={styles.card}>
          <InfoRow label="Nom" value={device.name ?? 'ESP32'} />
          <InfoRow label="Identifiant" value={device.id} />
          <InfoRow
            label="Signal"
            value={device.rssi != null ? `${device.rssi} dBm` : 'Non disponible'}
          />
          <InfoRow
            label="Manifeste"
            value={manifestVersion != null ? `v${manifestVersion}` : 'Non charge'}
          />
          <InfoRow label="Acces" value={knownLabel ?? 'PIN non memorise'} />
        </View>

        {canForgetPin ? (
          <TouchableOpacity style={styles.forgetButton} onPress={onForgetPin} activeOpacity={0.85}>
            <Text style={styles.forgetButtonText}>Oublier le PIN memorise</Text>
          </TouchableOpacity>
        ) : null}
      </BottomSheetView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: palette.panel,
    borderWidth: 1,
    borderColor: palette.border,
  },
  handleIndicator: {
    backgroundColor: palette.borderStrong,
    width: 44,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 28,
    gap: 16,
  },
  header: {
    gap: 6,
  },
  title: {
    color: palette.text,
    fontSize: 20,
    fontWeight: '800',
  },
  subtitle: {
    color: palette.muted,
    fontSize: 13,
    lineHeight: 20,
  },
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.panelInset,
    padding: 16,
    gap: 12,
  },
  infoRow: {
    gap: 4,
  },
  infoLabel: {
    color: palette.subtle,
    fontSize: 12,
    fontWeight: '700',
  },
  infoValue: {
    color: palette.text,
    fontSize: 14,
    lineHeight: 21,
  },
  forgetButton: {
    minHeight: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: withAlpha(palette.danger, 0.32),
    backgroundColor: withAlpha(palette.danger, 0.08),
  },
  forgetButtonText: {
    color: palette.danger,
    fontSize: 14,
    fontWeight: '700',
  },
});
