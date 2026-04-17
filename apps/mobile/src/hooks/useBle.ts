import { useCallback } from 'react';
import { useBleStore } from '../store/bleStore';
import { useDeviceStore } from '../store/deviceStore';
import { useAuthStore } from '../store/authStore';
import { bleScanner } from '../ble/BleScanner';
import { bleConnection } from '../ble/BleConnection';
import { bleNotifyHandler } from '../ble/BleNotifyHandler';
import { parseManifest } from '../protocol/ManifestParser';
import { parseChallengeFrame, computeHmacResponse } from '../protocol/ChallengeResponse';
import { encodeCommand } from '../protocol/CommandEncoder';
import { AuthStatus, ResponseStatus } from '../types/protocol.types';
import { BleDevice } from '../types/ble.types';

const COMMAND_TIMEOUT_MS = 5000;

export function useBle() {
  const bleStore = useBleStore();
  const deviceStore = useDeviceStore();
  const authStore = useAuthStore();

  const startScan = useCallback(() => {
    bleStore.clearDiscoveredDevices();
    bleStore.setIsScanning(true);
    bleScanner.startScan(
      (device) => bleStore.addDiscoveredDevice(device),
      (error) => {
        console.error('[BLE] Scan error:', error);
        bleStore.setIsScanning(false);
      },
    );
  }, [bleStore]);

  const stopScan = useCallback(() => {
    bleScanner.stopScan();
    bleStore.setIsScanning(false);
  }, [bleStore]);

  const connectToDevice = useCallback(
    async (device: BleDevice, pin: string) => {
      bleStore.setConnectionState('connecting');
      bleStore.setConnectedDevice(device);

      try {
        await bleConnection.connect(device.id);
        bleStore.setConnectionState('authenticating');

        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error('Timeout challenge')), COMMAND_TIMEOUT_MS);

          bleNotifyHandler.onAuthFrame(async (frame) => {
            clearTimeout(timeout);

            if (frame[0] === AuthStatus.CHALLENGE) {
              try {
                const challenge = parseChallengeFrame(frame);
                const hmac = await computeHmacResponse(pin, challenge);

                const authFrame = new Uint8Array(5);
                authFrame[0] = AuthStatus.AUTH_OK;
                authFrame.set(hmac, 1);
                await bleConnection.writeCommand(authFrame);
              } catch (e) {
                reject(e);
              }
            } else if (frame[0] === AuthStatus.AUTH_OK) {
              resolve();
            } else if (frame[0] === AuthStatus.AUTH_FAIL) {
              await authStore.removePin(device.id);
              reject(new Error('AUTH_FAIL'));
            }
          });

          bleConnection.subscribeToNotifications(
            (data) => bleNotifyHandler.handle(data),
            reject,
          );
        });

        const rawManifest = await bleConnection.readManifest();
        const manifest = parseManifest(rawManifest);
        deviceStore.setManifest(manifest);

        await authStore.savePin(device.id, pin, device.name ?? device.id);

        bleStore.setConnectionState('ready');

        bleConnection.onUnrecoverableDisconnect(() => {
          bleStore.setConnectionState('error');
          deviceStore.reset();
        });
      } catch (error) {
        bleStore.setConnectionState('error');
        throw error;
      }
    },
    [bleStore, deviceStore, authStore],
  );

  const sendCommand = useCallback(
    async (cmdId: number, payload: Uint8Array, pin: string) => {
      deviceStore.addPendingCommand(cmdId);

      const timeout = setTimeout(() => {
        deviceStore.removePendingCommand(cmdId);
        console.warn(`[BLE] Timeout commande cmdId=${cmdId}`);
      }, COMMAND_TIMEOUT_MS);

      bleNotifyHandler.onResponseFrame((responseCmdId, status, responsePayload) => {
        if (responseCmdId !== cmdId) return;
        clearTimeout(timeout);
        deviceStore.removePendingCommand(cmdId);

        if (status === ResponseStatus.OK) {
          if (responsePayload.length >= 2) {
            const view = new DataView(responsePayload.buffer);
            deviceStore.setCommandValue(cmdId, view.getInt16(0, false));
          }
        } else {
          console.warn(`[BLE] Erreur commande cmdId=${cmdId}, status=${status}`);
        }
      });

      const hmac = await computeHmacResponse(pin, new Uint8Array([cmdId]));
      const frame = encodeCommand({ cmdId, payload, hmacHash: hmac });
      await bleConnection.writeCommand(frame);
    },
    [deviceStore],
  );

  const disconnect = useCallback(async () => {
    await bleConnection.disconnect();
    bleStore.setConnectedDevice(null);
    bleStore.setConnectionState('idle');
    deviceStore.reset();
  }, [bleStore, deviceStore]);

  return {
    bleState: bleStore.bleState,
    isScanning: bleStore.isScanning,
    discoveredDevices: bleStore.discoveredDevices,
    connectedDevice: bleStore.connectedDevice,
    connectionState: bleStore.connectionState,
    startScan,
    stopScan,
    connectToDevice,
    sendCommand,
    disconnect,
  };
}
