import { MINIMAL_MANIFEST } from './minimal.manifest.js';

export const DUPLICATE_RESOURCE_ID_MANIFEST = {
  ...MINIMAL_MANIFEST,
  resources: [
    MINIMAL_MANIFEST.resources[0],
    { ...MINIMAL_MANIFEST.resources[0] },
  ],
};
