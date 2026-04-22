import { getManifestRuntime, setManifestRuntime } from '@/settings/manifestRuntimeFlag';

describe('manifestRuntimeFlag', () => {
  it('defaults to v5', () => {
    setManifestRuntime(null);
    expect(getManifestRuntime()).toBe('manifest');
  });
  it('round-trips v5', () => {
    setManifestRuntime('manifest');
    expect(getManifestRuntime()).toBe('manifest');
  });
  it('defaults the product runtime to v5', () => {
    setManifestRuntime(null);
    expect(getManifestRuntime()).toBe('manifest');
  });
});