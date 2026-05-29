import { BleManager as PlxBleManager, State } from 'react-native-ble-plx';
import { BleStateType } from '../types/ble.types';

class BleManagerService {
  private _manager: PlxBleManager | null = null;
  private static instance: BleManagerService;

  private constructor() {}

  static getInstance(): BleManagerService {
    if (!BleManagerService.instance) {
      BleManagerService.instance = new BleManagerService();
    }
    return BleManagerService.instance;
  }

  private get manager(): PlxBleManager {
    if (!this._manager) {
      this._manager = new PlxBleManager();
    }
    return this._manager;
  }

  getPlxManager(): PlxBleManager {
    return this.manager;
  }

  async getBleState(): Promise<BleStateType> {
    const state = await this.manager.state();
    const map: Record<State, BleStateType> = {
      [State.Unknown]: 'unknown',
      [State.Unsupported]: 'unsupported',
      [State.Unauthorized]: 'unauthorized',
      [State.PoweredOff]: 'off',
      [State.PoweredOn]: 'on',
      [State.Resetting]: 'unknown',
    };
    return map[state] ?? 'unknown';
  }

  onStateChange(callback: (state: BleStateType) => void): () => void {
    const sub = this.manager.onStateChange((state) => {
      const map: Record<State, BleStateType> = {
        [State.Unknown]: 'unknown',
        [State.Unsupported]: 'unsupported',
        [State.Unauthorized]: 'unauthorized',
        [State.PoweredOff]: 'off',
        [State.PoweredOn]: 'on',
        [State.Resetting]: 'unknown',
      };
      callback(map[state] ?? 'unknown');
    }, true);
    return () => sub.remove();
  }

  destroy(): void {
    this._manager?.destroy();
    this._manager = null;
  }
}

export const bleManagerService = BleManagerService.getInstance();
