import * as pb from '../generated/manifest.pbjs.js';
import type { NormalizedManifest } from './normalize.js';

const root = pb.esp_control;

export function encodeManifest(manifest: NormalizedManifest): Uint8Array {
  const message = root.ManifestBundle.create({
    version: manifest.version,
    schemaVersion: manifest.schemaVersion,
    minAppVersion: manifest.minAppVersion,
    capabilities: { featureIdxs: manifest.capabilities.featureIdxs },
    strings: manifest.strings.map((value) => ({ value })),
    resources: manifest.resources,
    actions: manifest.actions,
    screens: manifest.screens,
    nodes: manifest.nodes.map((node) => {
      const { visibleIf, enabledIf, ...rest } = node;
      return {
        ...rest,
        visibleIf: visibleIf ?? null,
        enabledIf: enabledIf ?? null,
      };
    }),
  });

  return root.ManifestBundle.encode(message).finish();
}

export function decodeManifest(bytes: Uint8Array): pb.esp_control.IManifestBundle {      
  const decoded = root.ManifestBundle.decode(bytes);
  return root.ManifestBundle.toObject(decoded, {
    defaults: true,
    longs: Number,
    enums: String,
  }) as pb.esp_control.IManifestBundle;
}
