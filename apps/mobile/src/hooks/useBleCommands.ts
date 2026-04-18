import { useCallback } from 'react';

import { computeHmacResponse } from '../protocol/auth/ChallengeResponse';
import { encodeCommand } from '../protocol/frame/CommandEncoder';
import type { Value, XYValue } from '../store/deviceStore';
import { useDeviceStore } from '../store/deviceStore';
import { bleConnection } from '../transport/BleConnection';
import { bleNotifyHandler } from '../transport/BleNotifyHandler';
import type { IBleTransport } from '../transport/IBleTransport';
import { CmdType } from '../types/manifest.types';
import { ResponseStatus } from '../types/protocol.types';

const COMMAND_TIMEOUT_MS = 5000;

function decodeInt16(payload: Uint8Array): number | undefined {
  if (payload.length < 2) return undefined;
  return new DataView(payload.buffer, payload.byteOffset, 2).getInt16(0, false);
}

function decodeUint16(payload: Uint8Array): number | undefined {
  if (payload.length < 2) return undefined;
  return new DataView(payload.buffer, payload.byteOffset, 2).getUint16(0, false);
}

function decodePayload(payload: Uint8Array, cmdType?: CmdType): Value | undefined {
  switch (cmdType) {
    case CmdType.TEXT_INPUT:
      return new TextDecoder().decode(payload);
    case CmdType.COLOR_PICKER: {
      if (payload.length < 3) return undefined;
      const r = payload[0].toString(16).padStart(2, '0');
      const g = payload[1].toString(16).padStart(2, '0');
      const b = payload[2].toString(16).padStart(2, '0');
      return `#${r}${g}${b}`;
    }
    case CmdType.XY_PAD: {
      if (payload.length < 4) return undefined;
      const view = new DataView(payload.buffer, payload.byteOffset, 4);
      return {
        x: view.getInt16(0, false),
        y: view.getInt16(2, false),
      } as XYValue;
    }
    case CmdType.MULTI_SELECT:
      return payload.length >= 1 ? payload[0] : undefined;
    case CmdType.PROGRESS:
      return decodeUint16(payload);
    case CmdType.TOGGLE:
      return payload.length >= 1 ? payload[0] !== 0 : undefined;
    case CmdType.ACTION:
      if (payload.length === 0) return undefined;
      if (payload.length === 1) return payload[0] !== 0;
      return decodeInt16(payload);
    case CmdType.RANGE:
    case CmdType.READ_ONLY:
      return decodeInt16(payload);
    default:
      if (payload.length === 1) return payload[0];
      return decodeInt16(payload);
  }
}

export function useBleCommands(transport: IBleTransport = bleConnection) {
  const setCommandValue = useDeviceStore((state) => state.setCommandValue);
  const addPendingCommand = useDeviceStore((state) => state.addPendingCommand);
  const removePendingCommand = useDeviceStore((state) => state.removePendingCommand);
  const commandValues = useDeviceStore((state) => state.commandValues);
  const pendingCommands = useDeviceStore((state) => state.pendingCommands);

  const sendCommand = useCallback(
    async (cmdId: number, payload: Uint8Array, pin: string) => {
      if (useDeviceStore.getState().pendingCommands.has(cmdId)) return;

      addPendingCommand(cmdId);

      let handled = false;
      const unsubscribeResponse = bleNotifyHandler.onResponseFrame(
        (responseCmdId, status, responsePayload) => {
          if (handled || responseCmdId !== cmdId) return;
          handled = true;
          clearTimeout(timeout);
          unsubscribeResponse();
          removePendingCommand(cmdId);

          if (status === ResponseStatus.OK) {
            const manifest = useDeviceStore.getState().manifest;
            const command = manifest?.commands.find((item) => item.id === cmdId);
            const value = decodePayload(responsePayload, command?.type);
            if (value !== undefined) setCommandValue(cmdId, value);
            return;
          }

          console.warn(`[BLE] Command error cmdId=${cmdId}, status=${status}`);
        },
      );

      const timeout = setTimeout(() => {
        unsubscribeResponse();
        removePendingCommand(cmdId);
        console.warn(`[BLE] Command timeout cmdId=${cmdId}`);
      }, COMMAND_TIMEOUT_MS);

      try {
        const hmac = await computeHmacResponse(pin, new Uint8Array([cmdId]));
        const frame = encodeCommand({ cmdId, payload, hmacHash: hmac });
        await transport.writeCommand(frame);
      } catch (error) {
        clearTimeout(timeout);
        unsubscribeResponse();
        removePendingCommand(cmdId);
        throw error;
      }
    },
    [addPendingCommand, removePendingCommand, setCommandValue],
  );

  return { sendCommand, commandValues, pendingCommands };
}
