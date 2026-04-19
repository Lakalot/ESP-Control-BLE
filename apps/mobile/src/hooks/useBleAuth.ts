import { computeHmacResponse, parseChallengeFrame } from '../protocol/auth/ChallengeResponse';
import { bleConnection } from '../transport/BleConnection';
import { bleNotifyHandler } from '../transport/BleNotifyHandler';
import type { IBleTransport } from '../transport/IBleTransport';
import { AuthStatus } from '../types/protocol.types';

const COMMAND_TIMEOUT_MS = 15000;

export function createBleAuth(transport: IBleTransport = bleConnection) {
  return function authenticate(pin: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      let settled = false;
      let notificationUnsubscribe: (() => void) | undefined;

      const finish = (callback: () => void, keepNotifications = false) => {
        if (settled) return;
        settled = true;
        clearTimeout(timeout);
        unsubscribeAuth();
        if (!keepNotifications) notificationUnsubscribe?.();
        callback();
      };

      const timeout = setTimeout(() => {
        finish(() => reject(new Error('Timeout challenge')));
      }, COMMAND_TIMEOUT_MS);

      const unsubscribeAuth = bleNotifyHandler.onAuthFrame((frame) => {
        if (settled) return;

        if (frame[0] === AuthStatus.CHALLENGE) {
          void (async () => {
            try {
              const challenge = parseChallengeFrame(frame);
              const hmac = await computeHmacResponse(pin, challenge);
              const authFrame = new Uint8Array(5);
              authFrame[0] = AuthStatus.AUTH_OK;
              authFrame.set(hmac, 1);
              await transport.writeCommand(authFrame);
            } catch (error) {
              finish(() => reject(error instanceof Error ? error : new Error(String(error))));
            }
          })();
          return;
        }

        if (frame[0] === AuthStatus.AUTH_OK) {
          finish(resolve, true);
          return;
        }

        if (frame[0] === AuthStatus.AUTH_FAIL) {
          finish(() => reject(new Error('AUTH_FAIL')));
        }
      });

      notificationUnsubscribe = transport.subscribe(
        (data) => bleNotifyHandler.handle(data),
        (error) => {
          finish(() => reject(error instanceof Error ? error : new Error(String(error))));
        },
      );
    });
  };
}
