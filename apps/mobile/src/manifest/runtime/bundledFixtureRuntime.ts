import { Asset } from 'expo-asset';
import { FixtureRuntime } from './FixtureRuntime';

/**
 * Loads `assets/manifest_demo.pb` from the Expo asset bundle and returns a
 * ready-to-use FixtureRuntime. Used by the control screen in `fixture` transport
 * mode to render the dashboard with no hardware (the live modes use BleRuntime /
 * SppDevice instead).
 */
export async function loadBundledFixtureRuntime(): Promise<FixtureRuntime> {
  // NOTE: `require` of a binary asset yields an Asset module in Expo.
  const module = require('../../../assets/manifest_demo.pb') as number;
  const asset = Asset.fromModule(module);
  await asset.downloadAsync();
  if (!asset.localUri) throw new Error('bundled manifest asset failed to download');
  const response = await fetch(asset.localUri);
  const buf = await response.arrayBuffer();
  return new FixtureRuntime({
    manifestBytes: new Uint8Array(buf),
    initialState: {
      'relay.auto': { kind: 'bool', value: false },
      'brightness': { kind: 'uint', value: 50 },
    },
  });
}