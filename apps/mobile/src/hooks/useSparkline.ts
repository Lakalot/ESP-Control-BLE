import { useEffect, useRef, useState } from 'react';

import { useDeviceStore } from '../store/deviceStore';
import type { CmdId } from '../types/manifest.types';

export function useSparkline(cmdId: CmdId, maxPoints = 50): number[] {
  const historyRef = useRef<number[]>([]);
  const [, forceRender] = useState(0);

  useEffect(() => {
    const unsubscribe = useDeviceStore.subscribe((state, prevState) => {
      const nextValue = state.commandValues[cmdId];
      const prevValue = prevState.commandValues[cmdId];

      if (typeof nextValue !== 'number' || nextValue === prevValue) return;

      const nextHistory =
        historyRef.current.length >= maxPoints
          ? [...historyRef.current.slice(1), nextValue]
          : [...historyRef.current, nextValue];

      historyRef.current = nextHistory;
      forceRender((value) => value + 1);
    });

    return unsubscribe;
  }, [cmdId, maxPoints]);

  return historyRef.current;
}
