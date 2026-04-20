import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '../../src/hooks/useAuth';
import { useAutoRefresh } from '../../src/hooks/useAutoRefresh';
import { useBle } from '../../src/hooks/useBle';
import { useManifest } from '../../src/hooks/useManifest';
import type { BleDevice } from '../../src/types/ble.types';
import { DeviceInfoSheet } from '../../src/ui/components/device/DeviceInfoSheet';
import { ManifestRenderer } from '../../src/ui/components/manifest/ManifestRenderer';
import {
  triggerErrorHaptic,
  triggerSelectionHaptic,
  triggerSoftImpactHaptic,
  triggerSuccessHaptic,
} from '../../src/ui/feedback/haptics';
import { palette, radius, shadows, withAlpha } from '../../src/ui/theme/ui';
import { CmdType } from '../../src/types/manifest.types';
import { getManifestRuntime } from '../../src/settings/manifestRuntimeFlag';
import { BleRuntime } from '../../src/manifest-v5/runtime/BleRuntime';
import { createRealBleDevice } from '../../src/manifest-v5/runtime/RealBleDevice';
import { ManifestScreenRenderer } from '../../src/manifest-v5/render/ManifestScreenRenderer';
import type { ManifestV5Runtime } from '../../src/manifest-v5/runtime/ManifestV5Runtime';
import '../../src/manifest-v5/render/widgets';


type RouteParams = {
  deviceId: string;
  pin: string;
  device: BleDevice;
};

const STATE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  idle: { label: 'Deconnecte', color: palette.subtle, bg: withAlpha(palette.subtle, 0.12) },
  connecting: { label: 'Connexion', color: palette.warn, bg: withAlpha(palette.warn, 0.14) },
  authenticating: {
    label: 'Authentification',
    color: palette.accentAlt,
    bg: withAlpha(palette.accentAlt, 0.14),
  },
  ready: { label: 'Pret', color: palette.success, bg: withAlpha(palette.success, 0.14) },
  error: { label: 'Erreur', color: palette.danger, bg: withAlpha(palette.danger, 0.14) },
};

function V5PilotRenderer({ deviceId }: { deviceId: string }) {
  const [runtime, setRuntime] = useState<ManifestV5Runtime | null>(null);
  useEffect(() => {
    let cancelled = false;
    let bleDevice: import('../../src/manifest-v5/runtime/RealBleDevice').RealBleDevice | null = null;
    createRealBleDevice(deviceId).then((device) => {
      bleDevice = device;
      if (!cancelled) {
        setRuntime(new BleRuntime(device));
      } else {
        // Component unmounted before device was ready — disconnect immediately
        device.disconnect().catch(() => {});
      }
    });
    return () => {
      cancelled = true;
      if (bleDevice) {
        bleDevice.disconnect().catch(() => {});
        bleDevice = null;
      }
    };
  }, [deviceId]);
  if (!runtime) return <ActivityIndicator />;
  return <ManifestScreenRenderer runtime={runtime} screenSlug="home" />;
}

export default function ControlScreen() {
  const route = useRoute();
  const runtimeMode = getManifestRuntime();
  if (runtimeMode === 'v5') {
    const { device } = route.params as RouteParams;
    return <V5PilotRenderer deviceId={device.id} />;
  }

  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { device, pin } = route.params as RouteParams;

  const { knownDevices, removePin } = useAuth();
  const { connectionState, connectToDevice, sendCommand, disconnect } = useBle();
  const { manifest, commandValues, commandUpdatedAt, pendingCommands } = useManifest();

  const isReady = connectionState === 'ready';
  const commands = manifest?.commands ?? [];
  const rootNodes = manifest?.rootNodes ?? [];
  const config = STATE_CONFIG[connectionState] ?? STATE_CONFIG.idle;
  const previousConnectionState = useRef(connectionState);
  const deviceInfoSheetRef = useRef<React.ElementRef<typeof BottomSheetModal> | null>(null);
  const knownDevice = knownDevices[device.id];

  const refreshableCommands = useMemo(
    () =>
      commands.filter(
        (command) =>
          (command.type === CmdType.READ_ONLY || command.type === CmdType.PROGRESS) &&
          Boolean(command.options.refreshMs),
      ),
    [commands],
  );

  useAutoRefresh({
    commands: refreshableCommands,
    isReady,
    sendCommand,
    pin,
  });

  const showConnectionError = (error: Error) => {
    triggerErrorHaptic();

    if (error.message === 'AUTH_FAIL') {
      Alert.alert('Erreur', 'PIN incorrect. Reessayez.');
      return;
    }

    Alert.alert('Erreur', `Connexion echouee: ${error.message}`);
  };

  useEffect(() => {
    connectToDevice(device, pin).catch(showConnectionError);
    return () => {
      void disconnect();
    };
  }, [connectToDevice, device, disconnect, pin]);

  useEffect(() => {
    if (connectionState === 'ready' && previousConnectionState.current !== 'ready') {
      triggerSuccessHaptic();
    }

    if (connectionState === 'error' && previousConnectionState.current === 'ready') {
      triggerErrorHaptic();
    }

    previousConnectionState.current = connectionState;
  }, [connectionState]);

  const handleCommand = (cmdId: number, payload: Uint8Array) => {
    sendCommand(cmdId, payload, pin).catch((error: Error) => {
      console.error('[ControlScreen] Command send failed:', error);
    });
  };

  const handleRetry = () => {
    triggerSoftImpactHaptic();
    connectToDevice(device, pin).catch(showConnectionError);
  };

  const handleDisconnect = async () => {
    triggerSelectionHaptic();
    await disconnect();
    navigation.goBack();
  };

  const handleOpenInfo = () => {
    triggerSelectionHaptic();
    deviceInfoSheetRef.current?.present();
  };

  const handleForgetPin = () => {
    Alert.alert('Oublier le PIN', 'Supprimer le PIN memorise pour cet appareil ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: () => {
          triggerSoftImpactHaptic();
          void removePin(device.id).catch(() => undefined);
          deviceInfoSheetRef.current?.dismiss();
        },
      },
    ]);
  };

  const isLoading = connectionState === 'connecting' || connectionState === 'authenticating';

  return (
    <View style={styles.container}>
      <View style={styles.orbA} />
      <View style={styles.orbB} />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 24) + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.heroCard, shadows.card]}>
          <View style={styles.heroTopRow}>
            <View style={[styles.statePill, { backgroundColor: config.bg }]}>
              <View style={[styles.stateDot, { backgroundColor: config.color }]} />
              <Text style={[styles.stateText, { color: config.color }]}>{config.label}</Text>
            </View>

            <View style={styles.heroActions}>
              <TouchableOpacity style={styles.infoGhost} onPress={handleOpenInfo} activeOpacity={0.85}>
                <Text style={styles.infoGhostText}>Infos</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.disconnectGhost}
                onPress={handleDisconnect}
                activeOpacity={0.85}
              >
                <Text style={styles.disconnectGhostText}>Quitter</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.deviceName}>{device.name ?? 'ESP32'}</Text>
        </View>

        {isLoading ? (
          <View style={[styles.stateCard, shadows.card]}>
            <ActivityIndicator color={palette.accentAlt} size="large" />
            <Text style={styles.loadingText}>{config.label}...</Text>
            <Text style={styles.loadingHint}>Connexion BLE et chargement des commandes.</Text>
          </View>
        ) : connectionState === 'error' ? (
          <View style={[styles.stateCard, shadows.card]}>
            <Text style={styles.errorTitle}>Connexion perdue</Text>
            <Text style={styles.errorHint}>
              Verifiez l alimentation de l ESP32 puis relancez la connexion.
            </Text>
            <TouchableOpacity style={styles.retryButton} onPress={handleRetry} activeOpacity={0.85}>
              <Text style={styles.retryText}>Reessayer</Text>
            </TouchableOpacity>
          </View>
        ) : rootNodes.length === 0 ? (
          <View style={[styles.stateCard, shadows.card]}>
            <Text style={styles.emptyTitle}>Aucune commande disponible</Text>
            <Text style={styles.emptyHint}>
              L appareil est connecte, mais rien n est expose pour cet ecran.
            </Text>
          </View>
        ) : (
          <ManifestRenderer
            nodes={rootNodes}
            commandValues={commandValues}
            commandUpdatedAt={commandUpdatedAt}
            pendingCommands={pendingCommands}
            onAction={handleCommand}
          />
        )}

        <View style={[styles.sessionCard, shadows.card]}>
          <Text style={styles.sessionTitle}>Session</Text>
          <Text style={styles.sessionHint}>
            Fermez la connexion quand vous avez termine avec cet appareil.
          </Text>
          <TouchableOpacity
            style={styles.disconnectButton}
            onPress={handleDisconnect}
            activeOpacity={0.85}
          >
            <Text style={styles.disconnectText}>Deconnecter l appareil</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <DeviceInfoSheet
        modalRef={deviceInfoSheetRef}
        device={device}
        manifestVersion={manifest?.version}
        knownLabel={knownDevice ? 'PIN memorise' : undefined}
        canForgetPin={Boolean(knownDevice)}
        onForgetPin={handleForgetPin}
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
    top: -40,
    right: -50,
    width: 220,
    height: 220,
    borderRadius: radius.pill,
    backgroundColor: withAlpha(palette.accent, 0.08),
  },
  orbB: {
    position: 'absolute',
    top: 220,
    left: -70,
    width: 180,
    height: 180,
    borderRadius: radius.pill,
    backgroundColor: withAlpha(palette.accentAlt, 0.08),
  },
  scrollContent: {
    padding: 18,
    gap: 14,
  },
  heroCard: {
    backgroundColor: palette.panel,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: radius.lg,
    padding: 20,
    gap: 18,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  heroActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  stateDot: {
    width: 8,
    height: 8,
    borderRadius: radius.pill,
  },
  stateText: {
    fontSize: 12,
    fontWeight: '700',
  },
  infoGhost: {
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: withAlpha(palette.accentAlt, 0.12),
  },
  infoGhostText: {
    color: palette.accentAlt,
    fontSize: 12,
    fontWeight: '700',
  },
  disconnectGhost: {
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: withAlpha(palette.white, 0.04),
  },
  disconnectGhostText: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  deviceName: {
    color: palette.text,
    fontSize: 28,
    fontWeight: '800',
  },
  stateCard: {
    minHeight: 220,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.panel,
    paddingHorizontal: 24,
    gap: 10,
  },
  loadingText: {
    color: palette.text,
    fontSize: 18,
    fontWeight: '700',
  },
  loadingHint: {
    color: palette.muted,
    fontSize: 14,
    textAlign: 'center',
  },
  errorTitle: {
    color: palette.danger,
    fontSize: 20,
    fontWeight: '700',
  },
  errorHint: {
    color: palette.muted,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 21,
  },
  retryButton: {
    marginTop: 6,
    backgroundColor: palette.accentAlt,
    borderRadius: radius.pill,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  retryText: {
    color: palette.bg,
    fontWeight: '800',
    fontSize: 13,
  },
  emptyTitle: {
    color: palette.text,
    fontSize: 20,
    fontWeight: '700',
  },
  emptyHint: {
    color: palette.muted,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 21,
  },
  sessionCard: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.panel,
    padding: 18,
    gap: 12,
  },
  sessionTitle: {
    color: palette.text,
    fontSize: 16,
    fontWeight: '700',
  },
  sessionHint: {
    color: palette.muted,
    fontSize: 13,
    lineHeight: 20,
  },
  disconnectButton: {
    minHeight: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.panel,
    borderWidth: 1,
    borderColor: withAlpha(palette.danger, 0.28),
  },
  disconnectText: {
    color: palette.danger,
    fontWeight: '700',
    fontSize: 14,
  },
});
