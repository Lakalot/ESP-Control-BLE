import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { useAuth } from '../src/hooks/useAuth';
import { useBle } from '../src/hooks/useBle';
import type { BleDevice } from '../src/types/ble.types';
import { DeviceCard } from '../src/ui/components/DeviceCard';
import { PinPrompt } from '../src/ui/components/PinPrompt';
import { palette, radius, shadows, withAlpha } from '../src/ui/theme/ui';

const BLE_STATE_META: Record<string, { label: string; color: string }> = {
  on: { label: 'Bluetooth actif', color: palette.success },
  off: { label: 'Bluetooth desactive', color: palette.danger },
  unauthorized: { label: 'Permission requise', color: palette.warn },
  unknown: { label: 'Etat inconnu', color: palette.subtle },
  resetting: { label: 'Redemarrage Bluetooth', color: palette.accentAlt },
  unsupported: { label: 'Bluetooth indisponible', color: palette.danger },
  turning_on: { label: 'Activation...', color: palette.warn },
  turning_off: { label: 'Desactivation...', color: palette.warn },
};

export default function ScanScreen() {
  const navigation = useNavigation<any>();
  const { bleState, isScanning, discoveredDevices, startScan, stopScan } = useBle();
  const { getPin } = useAuth();

  const [selectedDevice, setSelectedDevice] = useState<BleDevice | null>(null);
  const [showPinPrompt, setShowPinPrompt] = useState(false);
  const scanBtnDisabled = useRef(false);

  const bleMeta = BLE_STATE_META[bleState] ?? BLE_STATE_META.unknown;
  const readyCount = discoveredDevices.length;

  const heroSubtitle = useMemo(() => {
    if (bleState !== 'on') {
      return 'Activez le Bluetooth et lancez un scan pour afficher les appareils disponibles.';
    }

    if (isScanning) {
      return 'Recherche des appareils BLE disponibles.';
    }

    return 'Selectionnez un appareil pour ouvrir ses commandes.';
  }, [bleState, isScanning]);

  const safeStartScan = () => {
    startScan().catch((error) => console.error('[BLE] startScan error:', error));
  };

  const handleScanToggle = () => {
    if (scanBtnDisabled.current) return;
    scanBtnDisabled.current = true;
    setTimeout(() => {
      scanBtnDisabled.current = false;
    }, 600);

    if (isScanning) {
      stopScan();
    } else {
      safeStartScan();
    }
  };

  useEffect(() => {
    if (bleState === 'on') {
      safeStartScan();
    }

    return () => stopScan();
  }, [bleState, startScan, stopScan]);

  const handleDevicePress = (device: BleDevice) => {
    stopScan();
    setSelectedDevice(device);
    const savedPin = getPin(device.id);
    if (savedPin) {
      navigation.navigate('control', { deviceId: device.id, pin: savedPin, device });
      return;
    }

    setShowPinPrompt(true);
  };

  const handlePinSubmit = (pin: string) => {
    setShowPinPrompt(false);
    if (!selectedDevice) return;

    navigation.navigate('control', {
      deviceId: selectedDevice.id,
      pin,
      device: selectedDevice,
    });
  };

  const handlePinCancel = () => {
    setShowPinPrompt(false);
    setSelectedDevice(null);
    safeStartScan();
  };

  return (
    <View style={styles.container}>
      <View style={styles.orbA} />
      <View style={styles.orbB} />

      <FlatList
        data={discoveredDevices}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <DeviceCard device={item} onPress={handleDevicePress} />}
        contentContainerStyle={[
          styles.list,
          discoveredDevices.length === 0 && styles.listEmpty,
        ]}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.heroCard}>
            <View style={styles.heroTop}>
              <View style={[styles.statusPill, { borderColor: withAlpha(bleMeta.color, 0.42) }]}>
                <View style={[styles.statusDot, { backgroundColor: bleMeta.color }]} />
                <Text style={[styles.statusPillText, { color: bleMeta.color }]}>{bleMeta.label}</Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.scanBtn,
                  isScanning ? styles.scanBtnStop : styles.scanBtnStart,
                  bleState !== 'on' && styles.scanBtnDisabled,
                ]}
                onPress={handleScanToggle}
                disabled={bleState !== 'on'}
                activeOpacity={0.85}
              >
                {isScanning ? <ActivityIndicator size="small" color={palette.bg} /> : null}
                <Text style={styles.scanBtnText}>{isScanning ? 'Pause' : 'Scanner'}</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.heroSubtitle}>{heroSubtitle}</Text>

            <View style={styles.heroStats}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{readyCount}</Text>
                <Text style={styles.statLabel}>Appareils</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{isScanning ? 'LIVE' : 'STOP'}</Text>
                <Text style={styles.statLabel}>Scan</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{bleState === 'on' ? 'OK' : '--'}</Text>
                <Text style={styles.statLabel}>BLE</Text>
              </View>
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Appareils detectes</Text>
              <Text style={styles.sectionMeta}>
                {readyCount === 0 ? 'Aucun resultat pour le moment' : `${readyCount} disponible${readyCount > 1 ? 's' : ''}`}
              </Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={[styles.emptyCard, shadows.card]}>
            {isScanning ? (
              <>
                <ActivityIndicator size="large" color={palette.accentAlt} style={styles.emptyIndicator} />
                <Text style={styles.emptyTitle}>Recherche en cours</Text>
                <Text style={styles.emptyHint}>
                  Verifiez que votre ESP32 est alimente, proche et bien en advertising BLE.
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.emptyTitle}>Aucun appareil trouve</Text>
                <Text style={styles.emptyHint}>
                  Lancez un scan pour rafraichir la liste et verifier le perimetre BLE autour de vous.
                </Text>
              </>
            )}
          </View>
        }
      />

      <PinPrompt
        visible={showPinPrompt}
        deviceName={selectedDevice?.name ?? selectedDevice?.id ?? ''}
        onSubmit={handlePinSubmit}
        onCancel={handlePinCancel}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.bg,
  },
  orbA: {
    position: 'absolute',
    top: -80,
    right: -50,
    width: 220,
    height: 220,
    borderRadius: radius.pill,
    backgroundColor: withAlpha(palette.accent, 0.09),
  },
  orbB: {
    position: 'absolute',
    top: 180,
    left: -70,
    width: 180,
    height: 180,
    borderRadius: radius.pill,
    backgroundColor: withAlpha(palette.accentAlt, 0.08),
  },
  list: {
    padding: 18,
    paddingBottom: 28,
  },
  listEmpty: {
    flexGrow: 1,
  },
  heroCard: {
    backgroundColor: palette.panel,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 20,
    marginBottom: 18,
    ...shadows.card,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    marginBottom: 18,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: palette.panelInset,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: radius.pill,
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  scanBtn: {
    minWidth: 108,
    borderRadius: radius.pill,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  scanBtnStart: {
    backgroundColor: palette.accent,
  },
  scanBtnStop: {
    backgroundColor: palette.warn,
  },
  scanBtnDisabled: {
    backgroundColor: palette.borderStrong,
  },
  scanBtnText: {
    color: palette.bg,
    fontWeight: '800',
    fontSize: 13,
  },
  heroSubtitle: {
    color: palette.muted,
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 18,
  },
  heroStats: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },
  statCard: {
    flex: 1,
    backgroundColor: palette.panelInset,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.border,
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  statValue: {
    color: palette.text,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  statLabel: {
    color: palette.muted,
    fontSize: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: 12,
  },
  sectionTitle: {
    color: palette.text,
    fontSize: 16,
    fontWeight: '700',
  },
  sectionMeta: {
    flex: 1,
    textAlign: 'right',
    color: palette.subtle,
    fontSize: 12,
  },
  emptyCard: {
    flex: 1,
    minHeight: 280,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.panel,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  emptyIndicator: {
    marginBottom: 18,
  },
  emptyTitle: {
    color: palette.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptyHint: {
    color: palette.muted,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },
});
