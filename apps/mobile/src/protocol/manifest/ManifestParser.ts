import {
  CmdOptions,
  CmdType,
  ManifestCommand,
  ManifestNode,
  NodeKind,
  NodeOptions,
  NodeStyle,
  NodeVariant,
  ParsedManifest,
} from '../../types/manifest.types';

export class ManifestParseError extends Error {
  constructor(message: string) {
    super(`ManifestParser: ${message}`);
  }
}

const ECB_MANIFEST_VERSION_4 = 0x04;
const ECB_NODE_PARENT_NONE = 0xff;
const ECB_NODE_REF_NONE = 0xff;

const ECB_OPT_UNIT = 0x01;
const ECB_OPT_ICON = 0x02;
const ECB_OPT_COLOR = 0x03;
const ECB_OPT_CONFIRM = 0x04;
const ECB_OPT_REFRESH_MS = 0x05;
const ECB_OPT_STEP = 0x06;
const ECB_OPT_FORMAT = 0x07;
const ECB_OPT_SCALE = 0x08;
const ECB_OPT_MIN_LABEL = 0x09;
const ECB_OPT_MAX_LABEL = 0x0a;
const ECB_OPT_DANGEROUS = 0x0b;
const ECB_OPT_DISABLED = 0x0c;
const ECB_OPT_BADGE = 0x0d;
const ECB_OPT_CHOICES = 0x0e;
const ECB_OPT_HINT = 0x0f;

const ECB_NODE_OPT_TITLE = 0x20;
const ECB_NODE_OPT_SUBTITLE = 0x21;
const ECB_NODE_OPT_COLUMNS = 0x22;
const ECB_NODE_OPT_SPAN = 0x23;
const ECB_NODE_OPT_VARIANT = 0x24;
const ECB_NODE_OPT_STYLE = 0x25;
const ECB_NODE_OPT_COLLAPSED = 0x26;
const ECB_NODE_OPT_GAP = 0x27;
const ECB_NODE_OPT_TEXT = 0x28;

const decoder = new TextDecoder();

function readU16(optVal: Uint8Array): number {
  if (optVal.length !== 2) {
    throw new ManifestParseError(`Expected 2 bytes, got ${optVal.length}`);
  }

  return (optVal[0] << 8) | optVal[1];
}

function readText(optVal: Uint8Array): string {
  return decoder.decode(optVal);
}

function readU8(optVal: Uint8Array): number {
  if (optVal.length !== 1) {
    throw new ManifestParseError(`Expected 1 byte, got ${optVal.length}`);
  }

  return optVal[0];
}

function assertCmdType(type: number): asserts type is CmdType {
  if (!Object.values(CmdType).includes(type)) {
    throw new ManifestParseError(`Unknown command type: 0x${type.toString(16)}`);
  }
}

function assertNodeKind(kind: number): asserts kind is NodeKind {
  if (!Object.values(NodeKind).includes(kind)) {
    throw new ManifestParseError(`Unknown node kind: 0x${kind.toString(16)}`);
  }
}

function assertNodeVariant(variant: number): asserts variant is NodeVariant {
  if (!Object.values(NodeVariant).includes(variant)) {
    throw new ManifestParseError(`Unknown node variant: 0x${variant.toString(16)}`);
  }
}

function assertNodeStyle(style: number): asserts style is NodeStyle {
  if (!Object.values(NodeStyle).includes(style)) {
    throw new ManifestParseError(`Unknown node style: 0x${style.toString(16)}`);
  }
}

function decodeCommandOptions(buf: Uint8Array, offset: number, nbOptions: number): [CmdOptions, number] {
  const opts: CmdOptions = {};

  for (let i = 0; i < nbOptions; i += 1) {
    if (offset + 2 > buf.length) {
      throw new ManifestParseError('Command option TLV truncated');
    }

    const optType = buf[offset++];
    const optLen = buf[offset++];
    if (offset + optLen > buf.length) {
      throw new ManifestParseError(`Command option value truncated (type=0x${optType.toString(16)})`);
    }

    const optVal = buf.slice(offset, offset + optLen);
    offset += optLen;

    switch (optType) {
      case ECB_OPT_UNIT:
        opts.unit = readText(optVal);
        break;
      case ECB_OPT_ICON:
        opts.icon = readText(optVal);
        break;
      case ECB_OPT_COLOR:
        opts.color = readText(optVal);
        break;
      case ECB_OPT_CONFIRM:
        opts.confirm = readText(optVal);
        break;
      case ECB_OPT_REFRESH_MS:
        opts.refreshMs = readU16(optVal);
        break;
      case ECB_OPT_STEP:
        opts.step = readU16(optVal);
        break;
      case ECB_OPT_FORMAT:
        opts.format = readText(optVal);
        break;
      case ECB_OPT_SCALE:
        opts.scale = readU16(optVal);
        break;
      case ECB_OPT_MIN_LABEL:
        opts.minLabel = readText(optVal);
        break;
      case ECB_OPT_MAX_LABEL:
        opts.maxLabel = readText(optVal);
        break;
      case ECB_OPT_DANGEROUS:
        opts.dangerous = true;
        break;
      case ECB_OPT_DISABLED:
        opts.disabled = true;
        break;
      case ECB_OPT_BADGE:
        opts.badge = readText(optVal);
        break;
      case ECB_OPT_CHOICES:
        opts.choices = readText(optVal);
        break;
      case ECB_OPT_HINT:
        opts.hint = readText(optVal);
        break;
      default:
        throw new ManifestParseError(`Unknown command option: 0x${optType.toString(16)}`);
    }
  }

  return [opts, offset];
}

function decodeNodeOptions(buf: Uint8Array, offset: number, nbOptions: number): [NodeOptions, number] {
  const opts: NodeOptions = {};

  for (let i = 0; i < nbOptions; i += 1) {
    if (offset + 2 > buf.length) {
      throw new ManifestParseError('Node option TLV truncated');
    }

    const optType = buf[offset++];
    const optLen = buf[offset++];
    if (offset + optLen > buf.length) {
      throw new ManifestParseError(`Node option value truncated (type=0x${optType.toString(16)})`);
    }

    const optVal = buf.slice(offset, offset + optLen);
    offset += optLen;

    switch (optType) {
      case ECB_NODE_OPT_TITLE:
        opts.title = readText(optVal);
        break;
      case ECB_NODE_OPT_SUBTITLE:
        opts.subtitle = readText(optVal);
        break;
      case ECB_NODE_OPT_TEXT:
        opts.text = readText(optVal);
        break;
      case ECB_NODE_OPT_COLUMNS:
        opts.columns = readU8(optVal);
        break;
      case ECB_NODE_OPT_SPAN:
        opts.span = readU8(optVal);
        break;
      case ECB_NODE_OPT_VARIANT: {
        const variant = readU8(optVal);
        assertNodeVariant(variant);
        opts.variant = variant;
        break;
      }
      case ECB_NODE_OPT_STYLE: {
        const style = readU8(optVal);
        assertNodeStyle(style);
        opts.style = style;
        break;
      }
      case ECB_NODE_OPT_COLLAPSED:
        opts.collapsed = true;
        break;
      case ECB_NODE_OPT_GAP:
        opts.gap = readU8(optVal);
        break;
      default:
        throw new ManifestParseError(`Unknown node option: 0x${optType.toString(16)}`);
    }
  }

  return [opts, offset];
}

function parseCommand(buf: Uint8Array, offset: number): [ManifestCommand, number] {
  if (offset + 4 > buf.length) {
    throw new ManifestParseError(`Command truncated at offset ${offset}`);
  }

  const id = buf[offset++];
  const typeValue = buf[offset++];
  const nameLen = buf[offset++];
  assertCmdType(typeValue);

  if (offset + nameLen > buf.length) {
    throw new ManifestParseError(`Name truncated for command id=${id}`);
  }

  const name = readText(buf.slice(offset, offset + nameLen));
  offset += nameLen;

  const command: ManifestCommand = {
    id,
    type: typeValue,
    name,
    options: {},
  };

  if (typeValue === CmdType.RANGE) {
    if (offset + 4 > buf.length) {
      throw new ManifestParseError(`Range params truncated for command id=${id}`);
    }

    const view = new DataView(buf.buffer, buf.byteOffset + offset, 4);
    command.params = {
      min: view.getInt16(0, false),
      max: view.getInt16(2, false),
    };
    offset += 4;
  }

  const nbOptions = buf[offset++];
  const [options, nextOffset] = decodeCommandOptions(buf, offset, nbOptions);
  command.options = options;
  return [command, nextOffset];
}

function parseNode(
  buf: Uint8Array,
  offset: number,
  knownNodeIds: Set<number>,
  commandMap: Map<number, ManifestCommand>,
): [ManifestNode, number] {
  if (offset + 5 > buf.length) {
    throw new ManifestParseError(`Node truncated at offset ${offset}`);
  }

  const id = buf[offset++];
  const rawParentId = buf[offset++];
  const kindValue = buf[offset++];
  const refId = buf[offset++];
  const nbOptions = buf[offset++];

  if (knownNodeIds.has(id)) {
    throw new ManifestParseError(`Duplicate node id: ${id}`);
  }

  assertNodeKind(kindValue);

  const parentId = rawParentId === ECB_NODE_PARENT_NONE ? null : rawParentId;
  if (parentId != null && !knownNodeIds.has(parentId)) {
    throw new ManifestParseError(`Node ${id} references unknown parent ${parentId}`);
  }

  if (kindValue === NodeKind.COMMAND) {
    if (refId === ECB_NODE_REF_NONE || !commandMap.has(refId)) {
      throw new ManifestParseError(`Command node ${id} references unknown command ${refId}`);
    }
  } else if (refId !== ECB_NODE_REF_NONE) {
    throw new ManifestParseError(`Node ${id} must not carry refId ${refId}`);
  }

  const [options, nextOffset] = decodeNodeOptions(buf, offset, nbOptions);
  const command = kindValue === NodeKind.COMMAND ? commandMap.get(refId) : undefined;

  const node: ManifestNode = {
    id,
    parentId,
    kind: kindValue,
    refId: kindValue === NodeKind.COMMAND ? refId : undefined,
    options,
    children: [],
    command,
  };

  knownNodeIds.add(id);
  return [node, nextOffset];
}

export function parseManifest(buffer: Uint8Array): ParsedManifest {
  if (buffer.length < 4) {
    throw new ManifestParseError('Buffer too short (< 4 bytes)');
  }

  const version = buffer[0];
  if (version !== ECB_MANIFEST_VERSION_4) {
    throw new ManifestParseError(`Unsupported manifest version: 0x${version.toString(16)}`);
  }

  const commandCount = buffer[2];
  let offset = 3;
  const commands: ManifestCommand[] = [];
  const commandMap = new Map<number, ManifestCommand>();

  for (let i = 0; i < commandCount; i += 1) {
    const [command, nextOffset] = parseCommand(buffer, offset);
    if (commandMap.has(command.id)) {
      throw new ManifestParseError(`Duplicate command id: ${command.id}`);
    }

    commands.push(command);
    commandMap.set(command.id, command);
    offset = nextOffset;
  }

  if (offset >= buffer.length) {
    throw new ManifestParseError('Missing node count');
  }

  const nodeCount = buffer[offset++];
  const knownNodeIds = new Set<number>();
  const nodes: ManifestNode[] = [];

  for (let i = 0; i < nodeCount; i += 1) {
    const [node, nextOffset] = parseNode(buffer, offset, knownNodeIds, commandMap);
    nodes.push(node);
    offset = nextOffset;
  }

  if (offset !== buffer.length) {
    throw new ManifestParseError(`Unexpected trailing bytes at offset ${offset}`);
  }

  const nodeMap = new Map<number, ManifestNode>();
  nodes.forEach((node) => nodeMap.set(node.id, node));

  const rootNodes: ManifestNode[] = [];
  nodes.forEach((node) => {
    if (node.parentId == null) {
      rootNodes.push(node);
      return;
    }

    const parent = nodeMap.get(node.parentId);
    if (!parent) {
      throw new ManifestParseError(`Missing parent ${node.parentId} for node ${node.id}`);
    }
    parent.children.push(node);
  });

  return {
    version,
    commands,
    nodes,
    rootNodes,
  };
}
