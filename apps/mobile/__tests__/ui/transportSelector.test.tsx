import React from 'react';
import { describe, expect, it, beforeEach } from '@jest/globals';
import { fireEvent, render } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';

import type { ReactTestInstance } from 'react-test-renderer';

import { DeviceListView, type ScanController } from '../../src/ui/components/DeviceListView';
import { useTransportStore } from '../../src/settings/manifestRuntimeFlag';

// @testing-library/jest-native isn't installed in this repo, so flatten a node's
// rendered text ourselves instead of relying on toHaveTextContent.
function textOf(node: ReactTestInstance): string {
  const collect = (children: unknown): string => {
    if (children == null || children === false) return '';
    if (typeof children === 'string' || typeof children === 'number') return String(children);
    if (Array.isArray(children)) return children.map(collect).join('');
    const instance = children as ReactTestInstance;
    return instance?.props ? collect(instance.props.children) : '';
  };
  return collect(node.props.children);
}

// Minimal ScanController so DeviceListView renders without touching any scan
// hook / native BLE module. bleState 'off' mirrors what the broken-BLE
// Dslide716 tablet reports, so the raw-state line shows '(off)'.
function makeFakeScan(): ScanController {
  return {
    bleState: 'off',
    isScanning: false,
    discoveredDevices: [],
    startScan: jest.fn(),
    stopScan: jest.fn(),
  };
}

function renderDeviceList(transport: 'ble' | 'spp' = 'ble') {
  return render(
    <NavigationContainer>
      <DeviceListView scan={makeFakeScan()} transport={transport} />
    </NavigationContainer>,
  );
}

describe('DeviceListView transport selector', () => {
  beforeEach(() => useTransportStore.setState({ transport: 'ble' }));

  it('shows the BLE mode badge initially', () => {
    const { getByTestId } = renderDeviceList('ble');
    expect(textOf(getByTestId('transport-mode-badge'))).toContain('BLE');
  });

  it('exposes both transport toggle buttons', () => {
    const { getByTestId } = renderDeviceList('ble');
    expect(getByTestId('transport-toggle-ble')).not.toBeNull();
    expect(getByTestId('transport-toggle-spp')).not.toBeNull();
  });

  it('calls setTransport("spp") and updates the store when SPP is tapped', () => {
    const { getByTestId } = renderDeviceList('ble');

    expect(useTransportStore.getState().transport).toBe('ble');
    fireEvent.press(getByTestId('transport-toggle-spp'));
    expect(useTransportStore.getState().transport).toBe('spp');

    // The badge reads useTransport() (the live value), so it flips to SPP.
    expect(textOf(getByTestId('transport-mode-badge'))).toContain('SPP');
  });

  it('shows the raw bleState value so the actual tablet report is visible', () => {
    const { getByTestId } = renderDeviceList('ble');
    // Friendly label + raw value in parentheses, e.g. 'Bluetooth desactive (off)'.
    expect(textOf(getByTestId('transport-ble-state'))).toContain('(off)');
  });
});
