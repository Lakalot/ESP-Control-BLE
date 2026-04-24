import { Value } from '@sinclair/typebox/value';
import type { Static } from '@sinclair/typebox';
import { assignIds } from '../compiler/assignIds.js';
import { resolveRefs } from '../compiler/resolveRefs.js';
import { ManifestSpec } from '../schema/manifest.js';
import type { Diagnostic } from '../validation/diagnostics.js';
import { validateManifest } from '../validation/ajv.js';
import {
  collectSchemaDiagnostics,
  formatYamlPath,
} from './diagnostics.js';
import { AuthoringManifestSpec } from './schema.js';
import type { AuthoringContent, AuthoringManifest } from './types.js';

type CanonicalManifest = Static<typeof ManifestSpec>;
type CanonicalNode = CanonicalManifest['nodes'][number];

export function expandAuthoringManifest(input: unknown): CanonicalManifest {
  if (!Value.Check(AuthoringManifestSpec, input)) {
    const diagnostics = collectSchemaDiagnostics(Value.Errors(AuthoringManifestSpec, input));

    if (diagnostics.length > 0) {
      throw new Error(diagnostics.map((entry) => `${entry.path}: ${entry.message}`).join('; '));
    }

    throw new Error('manifest does not match the YAML authoring schema');
  }

  const manifest = input as AuthoringManifest;
  const topLevelDiagnostics = collectTopLevelDuplicateDiagnostics(manifest);

  if (topLevelDiagnostics.length > 0) {
    throw new Error(topLevelDiagnostics.join('; '));
  }

  const views: CanonicalManifest['views'] = [];
  const nodes: CanonicalManifest['nodes'] = [];
  const authoredNodeIds = new Set<string>();
  const authoredNodeSymbols = new Set<string>();
  const authoredNodePathsById = new Map<string, string[]>();
  const authoredNodePathsBySymbol = new Map<string, string[]>();
  const authoredNodeExplicitFirmwareSymbolPaths = new Set<string>();

  for (const [viewIndex, view] of manifest.views.entries()) {
    for (const [entryIndex, entry] of view.content.entries()) {
      collectAuthoredContent(
        entry,
        `views[${viewIndex}].content[${entryIndex}]`,
        authoredNodeIds,
        authoredNodeSymbols,
        authoredNodePathsById,
        authoredNodePathsBySymbol,
        authoredNodeExplicitFirmwareSymbolPaths,
      );
    }
  }

  for (const view of manifest.views) {
    const rootNodeId = `${view.id}.root`;
    const rootFirmwareSymbol = toFirmwareSymbol(rootNodeId);
    const childIds = view.content.map((entry) => entry.id);

    if (authoredNodeIds.has(rootNodeId)) {
      throw new Error(
        formatRootNodeIdCollision(rootNodeId, authoredNodePathsById)
        ?? `generated root node '${rootNodeId}' collides with authored content`,
      );
    }

    if (authoredNodeSymbols.has(rootFirmwareSymbol)) {
      throw new Error(
        formatRootFirmwareSymbolCollision(
          rootFirmwareSymbol,
          authoredNodePathsById,
          authoredNodePathsBySymbol,
        ) ?? `generated root firmwareSymbol '${rootFirmwareSymbol}' collides with authored content`,
      );
    }

    const canonicalView: CanonicalManifest['views'][number] = {
      id: view.id,
      firmwareSymbol: view.firmwareSymbol ?? `${toFirmwareSymbol(view.id)}_screen`,
      title: view.title,
      ...(view.routeKey === undefined ? {} : { routeKey: view.routeKey }),
      rootNodeId,
      ...(view.entryRules === undefined ? {} : { entryRules: view.entryRules }),
    };

    views.push(canonicalView);

    nodes.push({
      id: rootNodeId,
      firmwareSymbol: rootFirmwareSymbol,
      kind: 'stack',
      children: childIds,
    });

    for (const entry of view.content) {
      nodes.push(...expandContent(entry));
    }
  }

  const expanded: CanonicalManifest = {
    version: manifest.version,
    schemaVersion: manifest.schemaVersion,
    minAppVersion: manifest.minAppVersion,
    capabilities: manifest.capabilities,
    ...(manifest.appShell === undefined ? {} : { appShell: manifest.appShell }),
    resources: manifest.resources,
    actions: manifest.actions,
    views,
    nodes,
  };

  const validation = validateManifest(expanded);
  if (!validation.ok) {
    throw new Error(
      `expanded manifest failed canonical validation: ${validation.errors
        .map((error) =>
          `${mapCanonicalDiagnosticToAuthoringPath(
            error,
            expanded,
            authoredNodePathsById,
            authoredNodePathsBySymbol,
            authoredNodeExplicitFirmwareSymbolPaths,
          )} ${error.message}`,
        )
        .join('; ')}`,
    );
  }

  try {
    resolveRefs(expanded, assignIds(expanded));
  } catch (error) {
    throw new Error(formatReferenceError(error, authoredNodePathsById));
  }

  return expanded;
}

function expandContent(entry: AuthoringContent): CanonicalNode[] {
  if ('content' in entry) {
    const children = entry.content.map((child) => child.id);
    const node: CanonicalNode = {
      id: entry.id,
      firmwareSymbol: entry.firmwareSymbol ?? toFirmwareSymbol(entry.id),
      kind: entry.kind,
      children,
      ...(entry.title === undefined ? {} : { title: entry.title }),
      ...(entry.tone === undefined ? {} : { tone: entry.tone }),
      ...(entry.visibleIf === undefined ? {} : { visibleIf: entry.visibleIf }),
      ...(entry.enabledIf === undefined ? {} : { enabledIf: entry.enabledIf }),
      ...(entry.columns === undefined ? {} : { columns: entry.columns }),
    };

    return [node, ...entry.content.flatMap((child) => expandContent(child))];
  }

  return [{
    id: entry.id,
    firmwareSymbol: entry.firmwareSymbol ?? toFirmwareSymbol(entry.id),
    kind: 'widget',
    widget: entry.kind,
    ...(entry.title === undefined ? {} : { title: entry.title }),
    ...(entry.tone === undefined ? {} : { tone: entry.tone }),
    ...(entry.visibleIf === undefined ? {} : { visibleIf: entry.visibleIf }),
    ...(entry.enabledIf === undefined ? {} : { enabledIf: entry.enabledIf }),
    ...(entry.text === undefined ? {} : { text: entry.text }),
    ...(entry.formatHint === undefined ? {} : { formatHint: entry.formatHint }),
    ...(entry.resource === undefined && entry.action === undefined
      ? {}
      : {
          bind: {
            ...(entry.resource === undefined ? {} : { resource: entry.resource }),
            ...(entry.action === undefined ? {} : { action: entry.action }),
          },
        }),
  }];
}

function toFirmwareSymbol(id: string): string {
  return id.replace(/\./g, '_');
}

function collectAuthoredContent(
  entry: AuthoringContent,
  path: string,
  ids: Set<string>,
  firmwareSymbols: Set<string>,
  pathsById: Map<string, string[]>,
  pathsBySymbol: Map<string, string[]>,
  explicitFirmwareSymbolPaths: Set<string>,
): void {
  const firmwareSymbol = entry.firmwareSymbol ?? toFirmwareSymbol(entry.id);

  ids.add(entry.id);
  firmwareSymbols.add(firmwareSymbol);
  addPath(pathsById, entry.id, path);
  addPath(pathsBySymbol, firmwareSymbol, path);
  if (entry.firmwareSymbol !== undefined) {
    explicitFirmwareSymbolPaths.add(path);
  }

  if ('content' in entry) {
    for (const [index, child] of entry.content.entries()) {
      collectAuthoredContent(
        child,
        `${path}.content[${index}]`,
        ids,
        firmwareSymbols,
        pathsById,
        pathsBySymbol,
        explicitFirmwareSymbolPaths,
      );
    }
  }
}

function collectTopLevelDuplicateDiagnostics(manifest: AuthoringManifest): string[] {
  return [
    ...collectSectionDuplicateDiagnostics('resources', manifest.resources),
    ...collectSectionDuplicateDiagnostics('actions', manifest.actions),
    ...collectSectionDuplicateDiagnostics('views', manifest.views, (view) => ({
      value: view.firmwareSymbol ?? `${toFirmwareSymbol(view.id)}_screen`,
      explicit: view.firmwareSymbol !== undefined,
    })),
  ];
}

function collectSectionDuplicateDiagnostics<T extends { id: string; firmwareSymbol?: string }>(
  section: 'resources' | 'actions' | 'views',
  items: readonly T[],
  getFirmwareSymbol: (item: T) => { value: string; explicit: boolean } = (item) => ({
    value: item.firmwareSymbol ?? '',
    explicit: item.firmwareSymbol !== undefined,
  }),
): string[] {
  const idPaths = new Map<string, string[]>();
  const symbolPaths = new Map<string, { path: string; explicit: boolean }[]>();

  for (const [index, item] of items.entries()) {
    const itemPath = `${section}[${index}]`;
    addPath(idPaths, item.id, `${itemPath}.id`);

    const firmwareSymbol = getFirmwareSymbol(item);
    if (firmwareSymbol.value !== '') {
      addSymbolPath(symbolPaths, firmwareSymbol.value, itemPath, firmwareSymbol.explicit);
    }
  }

  const diagnostics: string[] = [];

  for (const [id, paths] of idPaths.entries()) {
    if (paths.length > 1) {
      diagnostics.push(`${joinAuthoringPaths(paths)} duplicate id '${id}' in ${section}`);
    }
  }

  for (const [symbol, paths] of symbolPaths.entries()) {
    if (paths.length > 1) {
      diagnostics.push(
        `${formatTopLevelFirmwareSymbolPaths(paths)} duplicate firmwareSymbol '${symbol}' in ${section}`,
      );
    }
  }

  return diagnostics;
}

function mapCanonicalDiagnosticToAuthoringPath(
  diagnostic: Diagnostic,
  manifest: CanonicalManifest,
  authoredNodePathsById: ReadonlyMap<string, string[]>,
  authoredNodePathsBySymbol: ReadonlyMap<string, string[]>,
  authoredNodeExplicitFirmwareSymbolPaths: ReadonlySet<string>,
): string {
  const aggregateNodePaths = mapAggregateNodeDiagnosticToAuthoringPaths(
    diagnostic,
    authoredNodePathsById,
    authoredNodePathsBySymbol,
  );

  if (aggregateNodePaths) {
    return aggregateNodePaths;
  }

  const path = diagnostic.path;
  const nodeMatch = /^\/nodes\/(\d+)(\/.*)?$/.exec(path);

  if (nodeMatch) {
    const node = manifest.nodes[Number(nodeMatch[1])];
    const authoredPath = node ? authoredNodePathsById.get(node.id)?.[0] : undefined;

    if (authoredPath) {
      if ((nodeMatch[2] ?? '') === '/firmwareSymbol') {
        return authoredNodeExplicitFirmwareSymbolPaths.has(authoredPath)
          ? `${authoredPath}.firmwareSymbol`
          : `${authoredPath}.id`;
      }

      return `${authoredPath}${formatNodeSuffix(nodeMatch[2] ?? '')}`;
    }
  }

  return formatYamlPath(path);
}

function mapAggregateNodeDiagnosticToAuthoringPaths(
  diagnostic: Diagnostic,
  authoredNodePathsById: ReadonlyMap<string, string[]>,
  authoredNodePathsBySymbol: ReadonlyMap<string, string[]>,
): string | undefined {
  if (diagnostic.path !== '/nodes' || !diagnostic.objectId) {
    return undefined;
  }

  if (diagnostic.keyword === 'uniqueId') {
    return joinAuthoringPaths(authoredNodePathsById.get(diagnostic.objectId));
  }

  if (diagnostic.keyword === 'uniqueFirmwareSymbol') {
    return joinAuthoringPaths(authoredNodePathsBySymbol.get(diagnostic.objectId));
  }

  return undefined;
}

function joinAuthoringPaths(paths: readonly string[] | undefined): string | undefined {
  if (!paths || paths.length === 0) {
    return undefined;
  }

  return Array.from(new Set(paths)).join(', ');
}

function formatRootNodeIdCollision(
  rootNodeId: string,
  authoredNodePathsById: ReadonlyMap<string, string[]>,
): string | undefined {
  const paths = authoredNodePathsById.get(rootNodeId);
  const authoredPaths = joinAuthoringPaths(paths?.map((path) => `${path}.id`));

  return authoredPaths
    ? `${authoredPaths}: generated root node '${rootNodeId}' collides with authored content`
    : undefined;
}

function formatRootFirmwareSymbolCollision(
  rootFirmwareSymbol: string,
  authoredNodePathsById: ReadonlyMap<string, string[]>,
  authoredNodePathsBySymbol: ReadonlyMap<string, string[]>,
): string | undefined {
  const symbolPaths = authoredNodePathsBySymbol.get(rootFirmwareSymbol);

  if (!symbolPaths || symbolPaths.length === 0) {
    return undefined;
  }

  const explicitPaths = symbolPaths.filter((path) => {
    const nodeId = findNodeIdForPath(path, authoredNodePathsById);
    return nodeId ? toFirmwareSymbol(nodeId) !== rootFirmwareSymbol : false;
  });
  const authoredPaths = joinAuthoringPaths(
    (explicitPaths.length > 0 ? explicitPaths : symbolPaths).map((path) =>
      explicitPaths.length > 0 ? `${path}.firmwareSymbol` : path,
    ),
  );

  return authoredPaths
    ? `${authoredPaths}: generated root firmwareSymbol '${rootFirmwareSymbol}' collides with authored content`
    : undefined;
}

function formatNodeSuffix(suffix: string): string {
  if (suffix === '' || suffix === '/') {
    return '';
  }

  const parts = suffix.split('/').slice(1).filter(Boolean);

  return parts.map((part) => (/^\d+$/.test(part) ? `[${part}]` : `.${part}`)).join('');
}

function formatReferenceError(
  error: unknown,
  authoredNodePathsById: ReadonlyMap<string, string[]>,
): string {
  const message = error instanceof Error ? error.message : String(error);
  const resourceMatch = /^node '([^']+)' binds unknown resource '([^']+)'$/.exec(message);

  if (resourceMatch?.[1] && resourceMatch[2]) {
    const path = authoredNodePathsById.get(resourceMatch[1])?.[0];

    if (path) {
      return `${path}.resource: unknown resource '${resourceMatch[2]}'`;
    }
  }

  const actionMatch = /^node '([^']+)' binds unknown action '([^']+)'$/.exec(message);

  if (actionMatch?.[1] && actionMatch[2]) {
    const path = authoredNodePathsById.get(actionMatch[1])?.[0];

    if (path) {
      return `${path}.action: unknown action '${actionMatch[2]}'`;
    }
  }

  return message;
}

function addPath(paths: Map<string, string[]>, key: string, path: string): void {
  const existing = paths.get(key);

  if (existing) {
    existing.push(path);
    return;
  }

  paths.set(key, [path]);
}

function addSymbolPath(
  paths: Map<string, { path: string; explicit: boolean }[]>,
  key: string,
  path: string,
  explicit: boolean,
): void {
  const existing = paths.get(key);

  if (existing) {
    existing.push({ path, explicit });
    return;
  }

  paths.set(key, [{ path, explicit }]);
}

function formatTopLevelFirmwareSymbolPaths(
  paths: readonly { path: string; explicit: boolean }[],
): string {
  const explicitPaths = paths.filter((entry) => entry.explicit);

  if (explicitPaths.length > 0) {
    return joinAuthoringPaths(explicitPaths.map((entry) => `${entry.path}.firmwareSymbol`))!;
  }

  return joinAuthoringPaths(paths.map((entry) => `${entry.path}.id`))!;
}

function findNodeIdForPath(
  path: string,
  authoredNodePathsById: ReadonlyMap<string, string[]>,
): string | undefined {
  for (const [id, paths] of authoredNodePathsById.entries()) {
    if (paths.includes(path)) {
      return id;
    }
  }

  return undefined;
}
