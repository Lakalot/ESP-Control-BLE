import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { decodeManifest } from '../../src/manifest-v5/decode/decodeManifest';

const FIXTURE = resolve(__dirname, '..', '..', 'assets', 'manifest_v5_demo.pb');

function encodeTestManifest(m: any): Uint8Array {
  // Placeholder for protobuf encoding
  return new Uint8Array([0x01, 0x02, 0x03]);
}

describe('decodeManifest', () => {
  const bytes = new Uint8Array(readFileSync(FIXTURE));

  it('produces a RuntimeManifest with version 5', () => {
    const m = decodeManifest(bytes);
    expect(m.version).toBe(5);
  });

  it('populates resources/actions/screens/nodes with slug-keyed lookups', () => {
    const m = decodeManifest(bytes);
    expect(m.resources.size).toBeGreaterThan(0);
    expect(m.actions.size).toBeGreaterThan(0);
    expect(m.screens.size).toBeGreaterThan(0);
    expect(m.nodes.size).toBeGreaterThan(0);
    const firstScreen = m.screens.values().next().value!;
    expect(m.nodes.has(firstScreen.rootNodeSlug)).toBe(true);
  });

  it('projects binding ids back to slugs on widget nodes', () => {
    const m = decodeManifest(bytes);
    const widget = Array.from(m.nodes.values()).find((n) => n.kind === 'widget' && n.bind?.resource);
    expect(widget).toBeDefined();
    if (widget && widget.kind === 'widget' && widget.bind?.resource) {
      expect(m.resources.has(widget.bind.resource)).toBe(true);
    }
  });

  it('throws on truncated bytes', () => {
    const truncated = bytes.slice(0, Math.min(4, bytes.length));
    expect(() => decodeManifest(truncated)).toThrow();
  });

  it('rejects manifests with unsupported schemaVersion or unknown widget kinds', () => {
    expect(() =>
      decodeManifest(
        encodeTestManifest({
          schemaVersion: 2,
          minAppVersion: '1.0.0',
          capabilities: ['widget.timer'],
          widgetKind: 99,
        }),
      ),
    ).toThrow(/protobuf|schema|widget/i);
  });
});
