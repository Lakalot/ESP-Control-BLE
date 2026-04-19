import { MINIMAL_MANIFEST } from './minimal.manifest.js';

export const UNKNOWN_VAR_MANIFEST = {
  ...MINIMAL_MANIFEST,
  nodes: [
    ...MINIMAL_MANIFEST.nodes,
    {
      id: 'home.ghost',
      kind: 'widget' as const,
      widget: 'text' as const,
      text: 'Ghost node',
      visibleIf: { '==': [{ var: 'resource.nonexistent' }, true] },
    },
  ],
};
