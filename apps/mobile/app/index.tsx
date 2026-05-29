import React from 'react';

import { useBleScan } from '../src/hooks/useBleScan';
import { useSppScan } from '../src/hooks/useSppScan';
import { useTransport } from '../src/settings/manifestRuntimeFlag';
import { DeviceListView } from '../src/ui/components/DeviceListView';

// Each scan screen calls exactly one scan hook unconditionally (hooks can't be
// called conditionally / behind an early return), then feeds the shared
// presentational DeviceListView. ScanScreen picks which one to mount based on
// the active transport, so neither hook's discovery side effects run in the
// other's mode.
function BleScanScreen() {
  const scan = useBleScan();
  return <DeviceListView scan={scan} transport="ble" />;
}

function SppScanScreen() {
  const scan = useSppScan();
  return <DeviceListView scan={scan} transport="spp" />;
}

export default function ScanScreen() {
  // Reactive: re-renders when the startup auto-detection resolves to 'spp', so a
  // broken-BLE tablet swaps to SppScanScreen instead of being stuck on BLE.
  const transport = useTransport();
  return transport === 'spp' ? <SppScanScreen /> : <BleScanScreen />;
}
