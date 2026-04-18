import { decodeResponse } from '../protocol/frame/CommandDecoder';
import { AuthStatus, ResponseStatus } from '../types/protocol.types';

type AuthCallback = (frame: Uint8Array) => void;
type ResponseCallback = (cmdId: number, status: ResponseStatus, payload: Uint8Array) => void;

export class BleNotifyHandler {
  private authCallbacks = new Set<AuthCallback>();
  private responseCallbacks = new Set<ResponseCallback>();

  onAuthFrame(callback: AuthCallback): () => void {
    this.authCallbacks.add(callback);
    return () => {
      this.authCallbacks.delete(callback);
    };
  }

  onResponseFrame(callback: ResponseCallback): () => void {
    this.responseCallbacks.add(callback);
    return () => {
      this.responseCallbacks.delete(callback);
    };
  }

  handle(data: Uint8Array): void {
    if (data.length === 0) return;

    const firstByte = data[0];
    if (
      firstByte === AuthStatus.CHALLENGE ||
      firstByte === AuthStatus.AUTH_OK ||
      firstByte === AuthStatus.AUTH_FAIL
    ) {
      this.authCallbacks.forEach((callback) => callback(data));
      return;
    }

    try {
      const response = decodeResponse(data);
      this.responseCallbacks.forEach((callback) =>
        callback(response.cmdId, response.status, response.payload),
      );
    } catch (error) {
      console.warn('[BleNotifyHandler] Decode failed:', error);
    }
  }
}

export const bleNotifyHandler = new BleNotifyHandler();
