type ScreenIds = readonly { id: string }[];

export type IdManifest = {
  resources: readonly { id: string }[];
  actions: readonly { id: string }[];
  nodes: readonly { id: string }[];
} & ({ screens: ScreenIds } | { views: ScreenIds });

export interface IdMaps {
  resources: Map<string, number>;
  actions: Map<string, number>;
  screens: Map<string, number>;
  nodes: Map<string, number>;
}

export function assignIds(manifest: IdManifest): IdMaps {
  const build = (items: readonly { id: string }[]): Map<string, number> => {
    const out = new Map<string, number>();
    [...items]
      .sort((left, right) => (left.id < right.id ? -1 : left.id > right.id ? 1 : 0))
      .forEach((item, index) => {
        out.set(item.id, index + 1);
      });
    return out;
  };

  const screens = 'screens' in manifest ? manifest.screens : manifest.views;

  return {
    resources: build(manifest.resources),
    actions: build(manifest.actions),
    screens: build(screens),
    nodes: build(manifest.nodes),
  };
}
