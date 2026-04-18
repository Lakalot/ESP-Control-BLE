import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useBle } from '../../src/hooks/useBle';
import { useManifest } from '../../src/hooks/useManifest';
import { CommandControl } from '../../src/components/CommandControl';
import { BleDevice } from '../../src/types/ble.types';

type RouteParams = {
  deviceId: string;
  pin: string;
  device: BleDevice;
};

const CONNECTION_STATE_LABELS: Record<string, string> = {
  idle: 'Déconnecté',
  connecting: 'Connexion...',
  authenticating: 'Authentification...',
  ready: 'Connecté',
  error: 'Erreur',
};

const CONNECTION_STATE_COLORS: Record<string, string> = {
  idle: '#585b70',
  connecting: '#f9e2af',
  authenticating: '#fab387',
  ready: '#a6e3a1',
  error: '#f38ba8',
};

export default function ControlScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { device, pin } = route.params as RouteParams;

  const { connectionState, connectToDevice, sendCommand, disconnect } = useBle();
  const { manifest, commandValues, pendingCommands } = useManifest();

  useEffect(() => {
    connectToDevice(device, pin).catch((error: Error) => {
      if (error.message === 'AUTH_FAIL') {
        Alert.alert('Erreur', 'PIN incorrect. Réessayez.');
      } else {
        Alert.alert('Erreur', `Connexion échouée: ${error.message}`);
      }
    });

    return () => {
      disconnect();
    };
  }, []);

  const handleCommand = (cmdId: number, payload: Uint8Array) => {
    sendCommand(cmdId, payload, pin).catch((e: Error) =>
      console.error('[ControlScreen] Erreur envoi commande:', e),
    );
  };

  const handleDisconnect = async () => {
    await disconnect();
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.statusBar,
          { backgroundColor: CONNECTION_STATE_COLORS[connectionState] ?? '#585b70' },
        ]}
      >
        <Text style={styles.statusText}>
          {CONNECTION_STATE_LABELS[connectionState] ?? connectionState}
          {' — '}{device.name ?? device.id}
        </Text>
      </View>

      {connectionState === 'connecting' || connectionState === 'authenticating' ? (
        <View style={styles.center}>
          <ActivityIndicator color="#89b4fa" size="large" />
          <Text style={styles.loadingText}>
            {CONNECTION_STATE_LABELS[connectionState]}
          </Text>
        </View>
      ) : connectionState === 'error' ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>Connexion perdue</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => connectToDevice(device, pin)}>
            <Text style={styles.retryText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {manifest?.commands.map((cmd) => (
            <CommandControl
              key={cmd.id}
              command={cmd}
              currentValue={commandValues[cmd.id] ?? null}
              isPending={pendingCommands.has(cmd.id)}
              onAction={handleCommand}
            />
          ))}
        </ScrollView>
      )}

      <TouchableOpacity style={styles.disconnectBtn} onPress={handleDisconnect}>
        <Text style={styles.disconnectText}>Déconnecter</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#181825' },
  statusBar: { padding: 10, alignItems: 'center' },
  statusText: { color: '#1e1e2e', fontWeight: '700', fontSize: 13 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#a6adc8', marginTop: 12, fontSize: 15 },
  errorText: { color: '#f38ba8', fontSize: 16, marginBottom: 16 },
  retryBtn: {
    backgroundColor: '#89b4fa',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  retryText: { color: '#1e1e2e', fontWeight: '700' },
  list: { padding: 16 },
  disconnectBtn: {
    margin: 16,
    padding: 14,
    backgroundColor: '#313244',
    borderRadius: 10,
    alignItems: 'center',
  },
  disconnectText: { color: '#f38ba8', fontWeight: '700' },
});
