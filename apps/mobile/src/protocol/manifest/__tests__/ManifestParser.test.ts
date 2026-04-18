export {};
import { parseManifest } from '../ManifestParser';
import { CmdType, NodeKind, NodeStyle, NodeVariant } from '../../../types/manifest.types';

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(`FAIL: ${message}`);
  console.log(`  PASS: ${message}`);
}

function str(value: string): number[] {
  return Array.from(new TextEncoder().encode(value));
}

function tlv(tag: number, value: number[]): number[] {
  return [tag, value.length, ...value];
}

function flag(tag: number): number[] {
  return [tag, 0];
}

function command(bytes: number[]): number[] {
  return bytes;
}

function node(bytes: number[]): number[] {
  return bytes;
}

{
  const buf = Uint8Array.from([0x04, 0x00, 0x00, 0x00]);
  const manifest = parseManifest(buf);

  assert(manifest.version === 4, 'v4 version');
  assert(manifest.commands.length === 0, 'empty command table');
  assert(manifest.rootNodes.length === 0, 'empty root nodes');
}

{
  const toggleName = str('Toggle');
  const quickBadge = str('QUICK');
  const hint = str('Fast');
  const buf = Uint8Array.from([
    0x04,
    0x00,
    0x01,
    ...command([
      0x01,
      CmdType.ACTION,
      toggleName.length,
      ...toggleName,
      2,
      ...tlv(0x0d, quickBadge),
      ...tlv(0x0f, hint),
    ]),
    0x01,
    ...node([0x01, 0xff, NodeKind.COMMAND, 0x01, 0]),
  ]);

  const manifest = parseManifest(buf);
  const action = manifest.commands[0];
  const actionNode = manifest.rootNodes[0];

  assert(action.options.badge === 'QUICK', 'badge option');
  assert(action.options.hint === 'Fast', 'hint option');
  assert(actionNode.kind === NodeKind.COMMAND, 'command node kind');
  assert(actionNode.command?.id === 0x01, 'command node reference');
}

{
  const sectionTitle = str('Lighting');
  const sectionSubtitle = str('Power');
  const rangeName = str('Brightness');
  const buf = Uint8Array.from([
    0x04,
    0x00,
    0x01,
    ...command([
      0x02,
      CmdType.RANGE,
      rangeName.length,
      ...rangeName,
      0x00,
      0x00,
      0x00,
      0x64,
      0,
    ]),
    0x03,
    ...node([
      0x01,
      0xff,
      NodeKind.SECTION,
      0xff,
      3,
      ...tlv(0x20, sectionTitle),
      ...tlv(0x21, sectionSubtitle),
      ...flag(0x26),
    ]),
    ...node([
      0x02,
      0x01,
      NodeKind.GRID,
      0xff,
      2,
      ...tlv(0x22, [0x02]),
      ...tlv(0x27, [0x0c]),
    ]),
    ...node([
      0x03,
      0x02,
      NodeKind.COMMAND,
      0x02,
      3,
      ...tlv(0x23, [0x02]),
      ...tlv(0x24, [NodeVariant.HERO]),
      ...tlv(0x25, [NodeStyle.SURFACE]),
    ]),
  ]);

  const manifest = parseManifest(buf);
  const section = manifest.rootNodes[0];
  const grid = section.children[0];
  const commandNode = grid.children[0];

  assert(section.options.title === 'Lighting', 'section title');
  assert(section.options.subtitle === 'Power', 'section subtitle');
  assert(section.options.collapsed === true, 'section collapsed');
  assert(grid.options.columns === 2, 'grid columns');
  assert(grid.options.gap === 12, 'grid gap');
  assert(commandNode.options.span === 2, 'command span');
  assert(commandNode.options.variant === NodeVariant.HERO, 'command variant');
  assert(commandNode.options.style === NodeStyle.SURFACE, 'command style');
}

{
  const buf = Uint8Array.from([
    0x04,
    0x00,
    0x01,
    0x01,
    CmdType.ACTION,
    0x01,
    ...str('X'),
    0,
    0x01,
    0x02,
    0x09,
    NodeKind.COMMAND,
    0x01,
    0,
  ]);

  let errorCaught = false;
  try {
    parseManifest(buf);
  } catch (error) {
    errorCaught = true;
  }

  assert(errorCaught, 'rejects node with unknown parent');
}

console.log('\nAll ManifestParser tests passed.');
