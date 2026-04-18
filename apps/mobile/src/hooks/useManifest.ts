import { useDeviceStore } from '../store/deviceStore';
import { CmdType, ManifestCommand } from '../types/manifest.types';

export function useManifest() {
  const manifest = useDeviceStore((s) => s.manifest);
  const commandValues = useDeviceStore((s) => s.commandValues);
  const commandUpdatedAt = useDeviceStore((s) => s.commandUpdatedAt);
  const pendingCommands = useDeviceStore((s) => s.pendingCommands);

  const getCommandsByType = (type: CmdType): ManifestCommand[] =>
    manifest?.commands.filter((c) => c.type === type) ?? [];

  return {
    manifest,
    commandValues,
    commandUpdatedAt,
    pendingCommands,
    getCommandsByType,
    hasManifest: manifest !== null,
  };
}
