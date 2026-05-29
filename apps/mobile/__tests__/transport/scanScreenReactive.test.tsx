import React from 'react';
import { describe, expect, it, beforeEach } from '@jest/globals';
import { act, render } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';

// react-native-ble-plx ships untransformed ESM and pulls in a native module that
// is unavailable under jest. ScanScreen imports it transitively (useBleScan ->
// BleScanner -> BleManager). The BleManager is only *constructed* lazily inside
// startScan (which never runs here: default bleState is 'unknown', not 'on'), so
// a thin stub that just makes the import resolve is enough for this render test.
jest.mock('react-native-ble-plx', () => ({
  __esModule: true,
  BleManager: class {
    state = async () => 'Unknown';
    onStateChange = () => ({ remove() {} });
    startDeviceScan = () => {};
    stopDeviceScan = () => {};
    destroy = () => {};
  },
  State: {
    Unknown: 'Unknown',
    Unsupported: 'Unsupported',
    Unauthorized: 'Unauthorized',
    PoweredOff: 'PoweredOff',
    PoweredOn: 'PoweredOn',
    Resetting: 'Resetting',
  },
}));

import ScanScreen from '../../app/index';
import { setTransport, useTransportStore } from '../../src/settings/manifestRuntimeFlag';

// Regression test for C-1: on the broken-BLE tablet the startup auto-detection
// resolves AFTER ScanScreen has mounted. Before the fix ScanScreen read the
// transport synchronously once and never recovered, leaving the user stuck on
// the BLE scan screen. With the reactive store, setTransport('spp') must trigger
// a re-render that swaps BleScanScreen -> SppScanScreen.
function renderScanScreen() {
  return render(
    <NavigationContainer>
      <ScanScreen />
    </NavigationContainer>,
  );
}

describe('ScanScreen reacts to transport detection', () => {
  beforeEach(() => useTransportStore.setState({ transport: 'ble' }));

  it('mounts in BLE mode then swaps to SPP when detection resolves to spp', async () => {
    const { queryByTestId } = renderScanScreen();

    // First render: default transport is 'ble' (detection has not resolved yet).
    expect(queryByTestId('scan-screen-ble')).not.toBeNull();
    expect(queryByTestId('scan-screen-spp')).toBeNull();

    // Startup detection resolves to SPP (broken-BLE tablet) AFTER mount. The
    // reactive hook re-renders ScanScreen and mounts the SPP scan screen, whose
    // mount effect kicks off async discovery — flush it inside act() so the
    // deferred store updates don't escape the test.
    await act(async () => {
      setTransport('spp');
      await Promise.resolve();
    });

    expect(queryByTestId('scan-screen-spp')).not.toBeNull();
    expect(queryByTestId('scan-screen-ble')).toBeNull();
  });
});
