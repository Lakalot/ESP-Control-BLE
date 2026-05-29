import { describe, expect, it, beforeEach } from '@jest/globals';
import { getManifestRuntime, setManifestRuntime } from '@/settings/manifestRuntimeFlag';

describe('manifestRuntimeFlag', () => {
  beforeEach(() => setManifestRuntime('device'));

  it('defaults to device', () => {
    expect(getManifestRuntime()).toBe('device');
  });

  it('can switch to fixture (debug) and back', () => {
    setManifestRuntime('fixture');
    expect(getManifestRuntime()).toBe('fixture');
    setManifestRuntime('device');
    expect(getManifestRuntime()).toBe('device');
  });

  it('falls back to device for an invalid value', () => {
    setManifestRuntime(null);
    expect(getManifestRuntime()).toBe('device');
  });
});