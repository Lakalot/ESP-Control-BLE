import { BleManager as PlxBleManager, State } from 'react-native-ble-plx';
import { BleStateType } from '../types/ble.types';

class BleManagerService {
  private manager: PlxBleManager;
  private static instance: BleManagerService;

  private constructor() {
    this.manager = new PlxBleManager();
  }

  static getInstance(): BleManagerService {
    if (!BleManagerService.instance) {
      BleManagerService.instance = new BleManagerService();
    }
    return BleManagerService.instance;
  }

  getPlxManager(): PlxBleManager {
    return this.manager;
  }

  async getBleState(): Promise<BleStateType> {
    const state = await this.manager.state();
    const map: Record<State, BleStateType> = {
      [State.Unknown]: 'unknown',
      [State.Unsupported]: 'off',
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
        [State.Unsupported]: 'off',
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
    this.manager.destroy();
  }
}

export const bleManagerService = BleManagerService.getInstance();
