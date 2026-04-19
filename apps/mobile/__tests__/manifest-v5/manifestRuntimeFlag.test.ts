import { getManifestRuntime, setManifestRuntime } from '@/settings/manifestRuntimeFlag';

describe('manifestRuntimeFlag', () => {
  it('defaults to v5', () => {
    setManifestRuntime(null);
    expect(getManifestRuntime()).toBe('v5');
  });
  it('round-trips v5', () => {
    setManifestRuntime('v5');
    expect(getManifestRuntime()).toBe('v5');
  });
  it('defaults the product runtime to v5', () => {
    setManifestRuntime(null);
    expect(getManifestRuntime()).toBe('v5');
  });
});