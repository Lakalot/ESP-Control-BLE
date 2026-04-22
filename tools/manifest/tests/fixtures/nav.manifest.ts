import type { Static } from '@sinclair/typebox';
import type { ManifestSpec } from '../../src/schema/manifest.js';
import { MINIMAL_MANIFEST } from './minimal.manifest.js';

export const NAV_MANIFEST: Static<typeof ManifestSpec> = {
  ...MINIMAL_MANIFEST,
  appShell: {
    navBar: {
      items: [{ id: 'home', label: 'Home', icon: 'home', viewId: 'home' }],
    },
  },
};
