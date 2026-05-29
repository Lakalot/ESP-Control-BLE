export type BleStateType = 'unknown' | 'on' | 'off' | 'unauthorized' | 'unsupported';

export type ConnectionState =
  | 'idle'
  | 'connecting'
  | 'authenticating'
  | 'ready'
  | 'error';

export interface BleDevice {
  id: string;
  name: string | null;
  rssi: number | null;
  serviceUUIDs: string[] | null;
}
