import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useMachine } from '@xstate/react';

import { useAuthStore } from '../../src/store/authStore';
import type { BleDevice } from '../../src/types/ble.types';
import { useTransport } from '../../src/settings/manifestRuntimeFlag';
import { BleRuntime } from '../../src/manifest/runtime/BleRuntime';
import { createRealBleDevice } from '../../src/manifest/runtime/RealBleDevice';
import { createSppDevice } from '../../src/manifest/runtime/SppDevice';
import { createConnectionMachine } from '../../src/manifest/runtime/connectionMachine';
import { loadBundledFixtureRuntime } from '../../src/manifest/runtime/bundledFixtureRuntime';
import { ManifestScreenRenderer } from '../../src/manifest/render/ManifestScreenRenderer';
import type { ManifestRuntime } from '../../src/manifest/runtime/ManifestRuntime';
import '../../src/manifest/render/widgets';

type RouteParams = {
  device: BleDevice;
  pin: string;
};

function DeviceRenderer({ device, pin }: RouteParams) {
  const savePin = useAuthStore((state) => state.savePin);
  const transport = useTransport();
  const machine = useMemo(
    () =>
      createConnectionMachine({
        connect: async () => {
          // In SPP mode the device id is the MAC address; in BLE mode it's the
          // peripheral id. Either way we wrap the transport device in BleRuntime,
          // so auth/framing/reconnect/UI are reused unchanged.
          const dev =
            transport === 'spp'
              ? await createSppDevice(device.id)
              : await createRealBleDevice(device.id);
          return new BleRuntime(dev);
        },
        authenticate: async (rt) => {
          await rt.authenticate(pin);
        },
        pin,
      }),
    [device.id, pin, transport],
  );

  const [state, send] = useMachine(machine);
  const runtime = state.context.runtime;

  useEffect(() => {
    if (state.matches('ready')) {
      savePin(device.id, pin, device.name ?? device.id).catch(() => {});
    }
  }, [state, device, pin, savePin]);

  // Forward unintentional link drops to the machine. Keyed on `runtime` (not the
  // whole `state`, which changes every transition) so we resubscribe exactly
  // once per fresh runtime — critical because the machine produces a NEW runtime
  // on each reconnect, and the old runtime's subscription would otherwise go
  // stale. `unsub` detaches the listener before we attach to the next runtime.
  useEffect(() => {
    if (!runtime) return;
    const unsub = runtime.onDisconnected(() => send({ type: 'DISCONNECTED' }));
    return unsub;
  }, [runtime, send]);

  // Free the firmware's exclusive GATT session when the screen unmounts. The
  // runtime can change across reconnects, so read the latest via a ref rather
  // than keying this effect on `runtime` (which would tear down + reconnect on
  // every recovery). The unmount cleanup also sends CANCEL so the machine
  // settles into its terminal `cancelled` state and stops any pending timers.
  const runtimeRef = useRef(runtime);
  runtimeRef.current = runtime;
  useEffect(() => {
    return () => {
      runtimeRef.current?.disconnect().catch(() => {});
      send({ type: 'CANCEL' });
    };
  }, [send]);

  if (state.matches('failed')) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>
          Connexion echouee: {state.context.error ?? 'inconnue'}
        </Text>
      </View>
    );
  }

  if (state.matches('reconnecting')) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={styles.statusText}>Reconnexion…</Text>
      </View>
    );
  }

  if (!state.matches('ready') || !runtime) {
    return <ActivityIndicator />;
  }

  return <ManifestScreenRenderer runtime={runtime} screenSlug="home" />;
}

function FixtureRenderer() {
  const [runtime, setRuntime] = useState<ManifestRuntime | null>(null);
  useEffect(() => {
    let cancelled = false;
    loadBundledFixtureRuntime().then((rt) => {
      if (!cancelled) setRuntime(rt);
    });
    return () => {
      cancelled = true;
    };
  }, []);
  if (!runtime) return <ActivityIndicator />;
  return <ManifestScreenRenderer runtime={runtime} screenSlug="home" />;
}

export default function ControlScreen() {
  const route = useRoute();
  const { device, pin } = route.params as RouteParams;
  const transport = useTransport();
  return transport === 'fixture' ? (
    <FixtureRenderer />
  ) : (
    <DeviceRenderer device={device} pin={pin} />
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
  statusText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 12,
  },
});
