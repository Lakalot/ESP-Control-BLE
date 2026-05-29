import { describe, expect, it, beforeEach } from '@jest/globals';
import { getTransport, setTransport, useTransportStore } from '../../src/settings/manifestRuntimeFlag';

describe('transport store', () => {
  beforeEach(() => useTransportStore.setState({ transport: 'ble' }));

  it('defaults to ble and updates reactively via the store', () => {
    expect(getTransport()).toBe('ble');
    setTransport('spp');
    expect(useTransportStore.getState().transport).toBe('spp');
  });

  it('normalizes invalid values to ble', () => {
    setTransport('spp');
    setTransport(null);
    expect(getTransport()).toBe('ble');
  });
});
