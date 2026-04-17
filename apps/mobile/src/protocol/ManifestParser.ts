import { CmdType, ManifestCommand, ParsedManifest } from '../types/manifest.types';

export class ManifestParseError extends Error {
  constructor(message: string) {
    super(`ManifestParser: ${message}`);
  }
}

export function parseManifest(buffer: Uint8Array): ParsedManifest {
  if (buffer.length < 2) {
    throw new ManifestParseError('Buffer trop court (< 2 bytes)');
  }

  const version = buffer[0];
  const nbCmds = buffer[1];
  const commands: ManifestCommand[] = [];
  let offset = 2;

  for (let i = 0; i < nbCmds; i++) {
    if (offset + 3 > buffer.length) {
      throw new ManifestParseError(`CMD_ENTRY ${i} tronqué à l'offset ${offset}`);
    }

    const id = buffer[offset++];
    const type = buffer[offset++] as CmdType;
    const nameLen = buffer[offset++];

    if (offset + nameLen > buffer.length) {
      throw new ManifestParseError(`NAME tronqué pour CMD_ID ${id}`);
    }

    const nameBytes = buffer.slice(offset, offset + nameLen);
    const name = new TextDecoder().decode(nameBytes);
    offset += nameLen;

    const cmd: ManifestCommand = { id, type, name };

    if (type === CmdType.RANGE) {
      if (offset + 4 > buffer.length) {
        throw new ManifestParseError(`PARAMS RANGE tronqués pour CMD_ID ${id}`);
      }
      const view = new DataView(buffer.buffer, buffer.byteOffset + offset, 4);
      cmd.params = {
        min: view.getInt16(0, false),
        max: view.getInt16(2, false),
      };
      offset += 4;
    }

    commands.push(cmd);
  }

  return { version, commands };
}
