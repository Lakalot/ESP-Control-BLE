import { describe, expect, it } from 'vitest';
import { loadManifestSource } from '../src/cli/loadSource.js';
import { normalize, type NormalizedManifest } from '../src/compiler/normalize.js';
import {
  FULL_SURFACE_LEGACY_FIXTURE_PATH,
  FULL_SURFACE_YAML_FIXTURE_PATH,
} from './fixtures/full-surface.manifest.js';

function canonicalizeNormalized(manifest: NormalizedManifest): NormalizedManifest {
  const strings = [''];
  const stringIndexes = new Map<string, number>();
  const intern = (value: string | null): number => {
    if (value === null) return 0;

    const existing = stringIndexes.get(value);
    if (existing !== undefined) {
      return existing;
    }

    const index = strings.length;
    strings.push(value);
    stringIndexes.set(value, index);
    return index;
  };
  const internLiteral = (value: string): number => intern(value);
  const stringAt = (index: number) => (index === 0 ? null : manifest.strings[index] ?? null);
  const resourceIdMap = new Map<number, number>();
  const actionIdMap = new Map<number, number>();
  const screenIdMap = new Map<number, number>();
  const nodeIdMap = new Map<number, number>();
  const nodesById = new Map(manifest.nodes.map((node) => [node.id, node]));
  const orderedNodeIds: number[] = [];
  const seenNodeIds = new Set<number>();

  const visitNode = (nodeId: number) => {
    if (seenNodeIds.has(nodeId)) {
      return;
    }

    seenNodeIds.add(nodeId);
    orderedNodeIds.push(nodeId);

    const node = nodesById.get(nodeId);
    if (!node) {
      throw new Error(`missing normalized node ${nodeId}`);
    }

    for (const childId of node.childrenIds) {
      visitNode(childId);
    }
  };

  for (const screen of manifest.screens) {
    visitNode(screen.rootNodeId);
  }

  for (const node of manifest.nodes) {
    visitNode(node.id);
  }

  const resources = manifest.resources.map((resource, index) => {
    const id = index + 1;
    resourceIdMap.set(resource.id, id);

    return {
      id,
      slugIdx: intern(stringAt(resource.slugIdx)),
      labelIdx: intern(stringAt(resource.labelIdx)),
      unitIdx: intern(stringAt(resource.unitIdx)),
      valueType: resource.valueType,
      readMode: resource.readMode,
      staleAfterMs: resource.staleAfterMs,
      pollMs: resource.pollMs,
      enumValueIdxs: resource.enumValueIdxs.map((idx) => intern(stringAt(idx))),
    };
  });

  const actions = manifest.actions.map((action, index) => {
    const id = index + 1;
    actionIdMap.set(action.id, id);

    return {
      id,
      slugIdx: intern(stringAt(action.slugIdx)),
      labelIdx: intern(stringAt(action.labelIdx)),
      dangerLevel: action.dangerLevel,
      confirmIdx: intern(stringAt(action.confirmIdx)),
      cooldownMs: action.cooldownMs,
      inputSchemaIdx: intern(stringAt(action.inputSchemaIdx)),
      resultSchemaIdx: intern(stringAt(action.resultSchemaIdx)),
    };
  });

  const nodes = orderedNodeIds.map((nodeId, index) => {
    const node = nodesById.get(nodeId);
    if (!node) {
      throw new Error(`missing normalized node ${nodeId}`);
    }

    const id = index + 1;
    nodeIdMap.set(node.id, id);

    return {
      id,
      slugIdx: intern(stringAt(node.slugIdx)),
      kind: node.kind,
      widgetKind: node.widgetKind,
      titleIdx: intern(stringAt(node.titleIdx)),
      toneIdx: intern(stringAt(node.toneIdx)),
      childrenIds: node.childrenIds,
      columns: node.columns,
      bind: node.bind,
      visibleIf: node.visibleIf
        ? { jsonlogic: strings[internLiteral(node.visibleIf.jsonlogic)]! }
        : null,
      enabledIf: node.enabledIf
        ? { jsonlogic: strings[internLiteral(node.enabledIf.jsonlogic)]! }
        : null,
      textIdx: intern(stringAt(node.textIdx)),
      formatHintIdx: intern(stringAt(node.formatHintIdx)),
    };
  });

  const screens = manifest.screens.map((screen, index) => {
    const id = index + 1;
    screenIdMap.set(screen.id, id);

    return {
      id,
      slugIdx: intern(stringAt(screen.slugIdx)),
      titleIdx: intern(stringAt(screen.titleIdx)),
      routeKeyIdx: intern(stringAt(screen.routeKeyIdx)),
      rootNodeId: screen.rootNodeId,
      entryRules: screen.entryRules.map((rule) => ({
        jsonlogic: strings[internLiteral(rule.jsonlogic)]!,
      })),
    };
  });

  const appShell = manifest.appShell
    ? {
        navBarItems: manifest.appShell.navBarItems.map((item) => ({
          idIdx: intern(stringAt(item.idIdx)),
          labelIdx: intern(stringAt(item.labelIdx)),
          iconIdx: intern(stringAt(item.iconIdx)),
          screenId: screenIdMap.get(item.screenId) ?? 0,
        })),
      }
    : null;

  return {
    version: manifest.version,
    schemaVersion: manifest.schemaVersion,
    minAppVersion: manifest.minAppVersion,
    capabilities: {
      featureIdxs: manifest.capabilities.featureIdxs.map((idx) => intern(stringAt(idx))),
    },
    appShell,
    strings,
    resources,
    actions,
    screens: screens.map((screen) => ({
      ...screen,
      rootNodeId: nodeIdMap.get(screen.rootNodeId) ?? 0,
    })),
    nodes: nodes.map((node) => ({
      ...node,
      childrenIds: node.childrenIds.map((childId) => nodeIdMap.get(childId) ?? 0),
      bind: {
        resourceId: resourceIdMap.get(node.bind.resourceId) ?? 0,
        actionId: actionIdMap.get(node.bind.actionId) ?? 0,
      },
    })),
  };
}

describe('JSON/YAML manifest equivalence', () => {
  it('normalizes the full-surface YAML fixture to the same output as the legacy JSON manifest', async () => {
    const authoredYaml = await loadManifestSource(FULL_SURFACE_YAML_FIXTURE_PATH);
    const legacyJson = await loadManifestSource(FULL_SURFACE_LEGACY_FIXTURE_PATH);

    expect(canonicalizeNormalized(normalize(authoredYaml as never))).toEqual(
      canonicalizeNormalized(normalize(legacyJson as never)),
    );
  });
});
