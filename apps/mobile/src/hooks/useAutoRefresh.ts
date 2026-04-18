import { useEffect, useRef } from 'react';
import { ManifestCommand } from '../types/manifest.types';

interface AutoRefreshProps {
  commands: ManifestCommand[];
  isReady: boolean;
  sendCommand: (cmdId: number, payload: Uint8Array, pin: string) => Promise<void>;
  pin: string;
}

export function useAutoRefresh({ commands, isReady, sendCommand, pin }: AutoRefreshProps): void {
  const intervalsRef = useRef<ReturnType<typeof setInterval>[]>([]);

  useEffect(() => {
    // Clear any existing intervals
    intervalsRef.current.forEach(clearInterval);
    intervalsRef.current = [];

    if (!isReady) return;

    commands.forEach((cmd) => {
      const ms = cmd.options.refreshMs;
      if (!ms || ms <= 0) return;

      const id = setInterval(() => {
        sendCommand(cmd.id, new Uint8Array(0), pin).catch(() => {
          // Ignore errors from auto-refresh (device may be busy)
        });
      }, ms);

      intervalsRef.current.push(id);
    });

    return () => {
      intervalsRef.current.forEach(clearInterval);
      intervalsRef.current = [];
    };
  }, [commands, isReady, pin, sendCommand]);
}
