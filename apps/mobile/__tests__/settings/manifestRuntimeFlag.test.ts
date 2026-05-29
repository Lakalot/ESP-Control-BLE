import { describe, expect, it, beforeEach } from '@jest/globals';
import { getTransport, setTransport } from '../../src/settings/manifestRuntimeFlag';

describe('transport flag', () => {
  beforeEach(() => setTransport(null));

  it('defaults to ble', () => {
    expect(getTransport()).toBe('ble');
  });

  it('can switch to spp and fixture and back', () => {
    setTransport('spp');
    expect(getTransport()).toBe('spp');
    setTransport('fixture');
    expect(getTransport()).toBe('fixture');
    setTransport('ble');
    expect(getTransport()).toBe('ble');
  });

  it('falls back to ble for an invalid value', () => {
    setTransport('spp');
    setTransport(null);
    expect(getTransport()).toBe('ble');
  });
});
