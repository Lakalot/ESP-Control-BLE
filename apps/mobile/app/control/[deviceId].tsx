import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useMachine } from '@xstate/react';

import { useAuthStore } from '../../src/store/authStore';
import type { BleDevice } from '../../src/types/ble.types';
import { getManifestRuntime } from '../../src/settings/manifestRuntimeFlag';
import { BleRuntime } from '../../src/manifest/runtime/BleRuntime';
import { createRealBleDevice } from '../../src/manifest/runtime/RealBleDevice';
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
  const machine = useMemo(
    () =>
      createConnectionMachine({
        connect: async () => new BleRuntime(await createRealBleDevice(device.id)),
        authenticate: async (rt) => {
          await rt.authenticate(pin);
        },
        pin,
      }),
    [device.id, pin],
  );

  const [state] = useMachine(machine);

  useEffect(() => {
    if (state.matches('ready')) {
      savePin(device.id, pin, device.name ?? device.id).catch(() => {});
    }
  }, [state, device, pin, savePin]);

  if (state.matches('failed')) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>
          Connexion echouee: {state.context.error ?? 'inconnue'}
        </Text>
      </View>
    );
  }

  if (!state.matches('ready') || !state.context.runtime) {
    return <ActivityIndicator />;
  }

  return <ManifestScreenRenderer runtime={state.context.runtime} screenSlug="home" />;
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
  return getManifestRuntime() === 'fixture' ? (
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
});
