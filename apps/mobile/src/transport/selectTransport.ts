import { EcbSpp } from '../../modules/ecb-spp';
import type { BleStateType } from '../types/ble.types';
import type { Transport } from '../settings/manifestRuntimeFlag';

/**
 * Choose the initial transport. BLE is preferred; when the device reports BLE
 * as unsupported (hardware can't do BLE) we fall back to SPP if Bluetooth
 * Classic is available. 'off'/'unknown' do NOT trigger SPP — BLE exists, it's
 * just disabled, so the user can enable it.
 */
export async function selectInitialTransport(bleState: BleStateType): Promise<Transport> {
  if (bleState === 'unsupported') {
    const sppAvailable = await EcbSpp.isAvailable().catch(() => false);
    return sppAvailable ? 'spp' : 'ble';
  }
  return 'ble';
}
