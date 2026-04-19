import * as pb from '../generated/manifest_v5.pbjs.js';
import type { NormalizedManifest } from './normalize.js';

const root = pb.esp_control.v5;

export function encodeManifest(manifest: NormalizedManifest): Uint8Array {
  const message = root.ManifestBundleV5.create({
    version: manifest.version,
    capabilities: { featureIdxs: manifest.capabilities.featureIdxs },
    strings: manifest.strings.map((value) => ({ value })),
    resources: manifest.resources,
    actions: manifest.actions,
    screens: manifest.screens,
    nodes: manifest.nodes.map((node) => ({
      ...node,
      visibleIf: node.visibleIf ?? undefined,
      enabledIf: node.enabledIf ?? undefined,
    })),
  });

  return root.ManifestBundleV5.encode(message).finish();
}

export function decodeManifest(bytes: Uint8Array): pb.esp_control.v5.IManifestBundleV5 {      
  const decoded = root.ManifestBundleV5.decode(bytes);
  return root.ManifestBundleV5.toObject(decoded, {
    defaults: true,
    longs: Number,
    enums: String,
  }) as pb.esp_control.v5.IManifestBundleV5;
}
