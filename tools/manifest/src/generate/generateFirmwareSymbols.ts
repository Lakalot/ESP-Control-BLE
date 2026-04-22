import { assignIds } from '../compiler/assignIds.js';
import type {
  FirmwareSymbolCategory,
  FirmwareSymbolItem,
  FirmwareSymbolManifest,
  GeneratedFirmwareSymbols,
} from './firmwareSymbols.types.js';
import { GENERATED_TOP_LEVEL_NAMES_SET } from './firmwareSymbolRules.js';

const IDENTIFIER_PATTERN = /^[a-z][a-z0-9_]*$/;

const RESERVED_KEYWORDS = new Set([
  'alignas',
  'alignof',
  'and',
  'and_eq',
  'asm',
  'atomic_cancel',
  'atomic_commit',
  'atomic_noexcept',
  'auto',
  'bitand',
  'bitor',
  'bool',
  'break',
  'case',
  'catch',
  'char',
  'char8_t',
  'char16_t',
  'char32_t',
  'class',
  'compl',
  'concept',
  'const',
  'consteval',
  'constexpr',
  'constinit',
  'const_cast',
  'continue',
  'co_await',
  'co_return',
  'co_yield',
  'decltype',
  'default',
  'delete',
  'do',
  'double',
  'dynamic_cast',
  'else',
  'enum',
  'explicit',
  'export',
  'extern',
  'false',
  'final',
  'float',
  'for',
  'friend',
  'goto',
  'if',
  'import',
  'inline',
  'int',
  'long',
  'module',
  'mutable',
  'namespace',
  'new',
  'noexcept',
  'not',
  'not_eq',
  'nullptr',
  'operator',
  'or',
  'or_eq',
  'override',
  'private',
  'protected',
  'public',
  'reflexpr',
  'register',
  'reinterpret_cast',
  'requires',
  'return',
  'short',
  'signed',
  'sizeof',
  'static',
  'static_assert',
  'static_cast',
  'struct',
  'switch',
  'synchronized',
  'template',
  'this',
  'thread_local',
  'throw',
  'true',
  'try',
  'typedef',
  'typeid',
  'typename',
  'union',
  'unsigned',
  'using',
  'virtual',
  'void',
  'volatile',
  'wchar_t',
  'while',
  'xor',
  'xor_eq',
]);

interface CategoryConfig {
  singular: FirmwareSymbolCategory;
  plural: keyof FirmwareSymbolManifest;
  namespace: string;
  tableName: string;
  lookupName: string;
}

interface ValidatedEntry {
  manifestId: string;
  symbol: string;
  numericId: number;
}

const CATEGORY_CONFIGS: readonly CategoryConfig[] = [
  {
    singular: 'resource',
    plural: 'resources',
    namespace: 'manifest_resources',
    tableName: 'kManifestResourceSymbols',
    lookupName: 'find_manifest_resource_symbol',
  },
  {
    singular: 'action',
    plural: 'actions',
    namespace: 'manifest_actions',
    tableName: 'kManifestActionSymbols',
    lookupName: 'find_manifest_action_symbol',
  },
  {
    singular: 'screen',
    plural: 'screens',
    namespace: 'manifest_screens',
    tableName: 'kManifestScreenSymbols',
    lookupName: 'find_manifest_screen_symbol',
  },
  {
    singular: 'node',
    plural: 'nodes',
    namespace: 'manifest_nodes',
    tableName: 'kManifestNodeSymbols',
    lookupName: 'find_manifest_node_symbol',
  },
] as const;

export function generateFirmwareSymbols(
  manifest: FirmwareSymbolManifest,
): GeneratedFirmwareSymbols {
  const ids = assignIds(manifest as never);
  const categories = CATEGORY_CONFIGS.map((config) => ({
    ...config,
    entries: validateCategory(config, manifest[config.plural], ids[config.plural]),
  }));

  return {
    headerText: renderHeader(categories),
    sourceText: renderSource(categories),
  };
}

function validateCategory(
  config: CategoryConfig,
  items: readonly FirmwareSymbolItem[],
  ids: ReadonlyMap<string, number>,
): ValidatedEntry[] {
  const seenSymbols = new Set<string>();
  const seenEmittedNames = new Set<string>();

  return items.map((item) => {
      const symbol = item.firmwareSymbol;

      if (typeof symbol !== 'string' || symbol.length === 0) {
        throw new Error(`missing firmwareSymbol for ${config.singular} "${item.id}"`);
      }

      if (!IDENTIFIER_PATTERN.test(symbol)) {
        throw new Error(
          `invalid firmwareSymbol "${symbol}" for ${config.singular} "${item.id}"`,
        );
      }

      if (isReservedFirmwareSymbol(symbol)) {
        throw new Error(
          `reserved firmwareSymbol "${symbol}" for ${config.singular} "${item.id}"`,
        );
      }

      if (GENERATED_TOP_LEVEL_NAMES_SET.has(symbol)) {
        throw new Error(
          `firmwareSymbol "${symbol}" for ${config.singular} "${item.id}" collides with emitted name "${symbol}"`,
        );
      }

      if (seenSymbols.has(symbol)) {
        throw new Error(
          `duplicate firmwareSymbol "${symbol}" for ${config.singular} "${item.id}"`,
        );
      }
      seenSymbols.add(symbol);

      const emittedName = `${config.namespace}::${symbol}`;
      if (seenEmittedNames.has(emittedName)) {
        throw new Error(`emitted name collision for ${emittedName}`);
      }
      seenEmittedNames.add(emittedName);

      const numericId = ids.get(item.id);
      if (numericId === undefined) {
        throw new Error(`missing assigned id for ${config.singular} "${item.id}"`);
      }

      return {
        manifestId: item.id,
        symbol,
        numericId,
      } satisfies ValidatedEntry;
    });
}

function isReservedFirmwareSymbol(symbol: string): boolean {
  return (
    RESERVED_KEYWORDS.has(symbol) ||
    symbol.startsWith('__') ||
    /^_[A-Z]/.test(symbol)
  );
}

function renderHeader(
  categories: readonly (CategoryConfig & { entries: readonly ValidatedEntry[] })[],
): string {
  const lines = [
    '#pragma once',
    '',
    '#include <cstddef>',
    '#include <cstdint>',
    '',
    'struct ManifestSymbolEntry {',
    '  uint32_t id;',
    '  const char* symbol;',
    '  const char* slug;',
    '};',
    '',
  ];

  for (const category of categories) {
    lines.push(`namespace ${category.namespace} {`);
    for (const entry of category.entries) {
      lines.push(`extern const uint32_t ${entry.symbol};`);
    }
    lines.push('}');
    lines.push('');
    lines.push(`extern const ManifestSymbolEntry ${category.tableName}[];`);
    lines.push(`extern const size_t ${category.tableName}Count;`);
    lines.push(
      `const ManifestSymbolEntry* ${category.lookupName}(uint32_t id);`,
    );
    lines.push('');
  }

  return `${lines.join('\n')}\n`;
}

function renderSource(
  categories: readonly (CategoryConfig & { entries: readonly ValidatedEntry[] })[],
): string {
  const lines = ['#include "manifest_symbols.h"', ''];

  for (const category of categories) {
    lines.push(`namespace ${category.namespace} {`);
    for (const entry of category.entries) {
      lines.push(`const uint32_t ${entry.symbol} = ${entry.numericId}u;`);
    }
    lines.push('}');
    lines.push('');

    if (category.entries.length === 0) {
      lines.push(`const ManifestSymbolEntry ${category.tableName}[1] = {};`);
      lines.push(`const size_t ${category.tableName}Count = 0;`);
    } else {
      lines.push(`const ManifestSymbolEntry ${category.tableName}[] = {`);
      for (const entry of category.entries) {
        lines.push(`  {${category.namespace}::${entry.symbol}, "${entry.symbol}", "${entry.manifestId}"},`);
      }
      lines.push('};');
      lines.push(
        `const size_t ${category.tableName}Count = sizeof(${category.tableName}) / sizeof(${category.tableName}[0]);`,
      );
    }
    lines.push('');
    lines.push(
      `const ManifestSymbolEntry* ${category.lookupName}(uint32_t id) {`,
    );
    lines.push(`  for (size_t index = 0; index < ${category.tableName}Count; ++index) {`);
    lines.push(`    if (${category.tableName}[index].id == id) {`);
    lines.push(`      return &${category.tableName}[index];`);
    lines.push('    }');
    lines.push('  }');
    lines.push('  return nullptr;');
    lines.push('}');
    lines.push('');
  }

  return `${lines.join('\n')}\n`;
}
