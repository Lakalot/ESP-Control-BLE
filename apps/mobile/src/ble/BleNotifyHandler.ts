import { AuthStatus, ResponseStatus } from '../types/protocol.types';
import { decodeResponse } from '../protocol/CommandDecoder';

type AuthCallback = (frame: Uint8Array) => void;
type ResponseCallback = (cmdId: number, status: ResponseStatus, payload: Uint8Array) => void;

export class BleNotifyHandler {
  private authCallback: AuthCallback | null = null;
  private responseCallback: ResponseCallback | null = null;

  onAuthFrame(callback: AuthCallback): void {
    this.authCallback = callback;
  }

  onResponseFrame(callback: ResponseCallback): void {
    this.responseCallback = callback;
  }

  handle(data: Uint8Array): void {
    if (data.length === 0) return;

    const firstByte = data[0];

    if (
      firstByte === AuthStatus.CHALLENGE ||
      firstByte === AuthStatus.AUTH_OK ||
      firstByte === AuthStatus.AUTH_FAIL
    ) {
      this.authCallback?.(data);
      return;
    }

    try {
      const response = decodeResponse(data);
      this.responseCallback?.(response.cmdId, response.status, response.payload);
    } catch (e) {
      console.warn('[BleNotifyHandler] Décodage impossible:', e);
    }
  }
}

export const bleNotifyHandler = new BleNotifyHandler();
