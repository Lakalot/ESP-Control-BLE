import { describe, expect, it, beforeEach } from '@jest/globals';
import { selectInitialTransport } from '../../src/transport/selectTransport';
// selectTransport imports the production facade ('../../modules/ecb-spp'), which
// jest's moduleNameMapper redirects to __mocks__/ecb-spp.ts. The test drives that
// same mock through its test-control exports (_state/_reset), imported from the
// mock directly so tsc resolves them (the production facade has no such exports).
import { _state, _reset } from '../../__mocks__/ecb-spp';

describe('selectInitialTransport', () => {
  beforeEach(() => _reset());

  it('returns ble when BLE is usable', async () => {
    expect(await selectInitialTransport('on')).toBe('ble');
    expect(await selectInitialTransport('off')).toBe('ble'); // off != unsupported; BLE exists
  });

  it('returns spp when BLE is unsupported and SPP is available', async () => {
    _state.available = true;
    expect(await selectInitialTransport('unsupported')).toBe('spp');
  });

  it('stays ble when BLE is unsupported but SPP is also unavailable', async () => {
    _state.available = false;
    expect(await selectInitialTransport('unsupported')).toBe('ble');
  });
});
