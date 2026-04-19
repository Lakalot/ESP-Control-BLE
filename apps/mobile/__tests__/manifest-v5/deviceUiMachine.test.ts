import { createActor } from 'xstate';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createDeviceUiMachine } from '@/manifest-v5/runtime/deviceUiMachine';
import { FixtureRuntime } from '@/manifest-v5/runtime/FixtureRuntime';

const FIXTURE = resolve(__dirname, '..', '..', 'assets', 'manifest_v5_demo.pb');

describe('deviceUiMachine', () => {
  const bytes = new Uint8Array(readFileSync(FIXTURE));

  it('loading_manifest -> ready on success', async () => {
    const rt = new FixtureRuntime({ manifestBytes: bytes });
    const a = createActor(createDeviceUiMachine({ runtime: rt }));
    a.start();
    expect(a.getSnapshot().value).toBe('loading_manifest');
    await new Promise((r) => setImmediate(r));
    expect(a.getSnapshot().value).toBe('ready');
    expect(a.getSnapshot().context.manifest).not.toBeNull();
  });

  it('-> error when runtime throws', async () => {
    const rt = {
      loadManifest: jest.fn().mockRejectedValue(new Error('no device')),
      snapshot: jest.fn(),
      subscribe: jest.fn(),
      invokeAction: jest.fn(),
    };
    const a = createActor(createDeviceUiMachine({ runtime: rt as never }));
    a.start();
    await new Promise((r) => setImmediate(r));
    expect(a.getSnapshot().value).toBe('error');
    expect(a.getSnapshot().context.error).toBe('no device');
  });
});