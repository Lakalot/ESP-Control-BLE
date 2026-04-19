export interface IBleTransport {
  connect(deviceId: string, serviceUUID?: string): Promise<void>;
  disconnect(): Promise<void>;
  readManifest(): Promise<Uint8Array>;
  writeCommand(data: Uint8Array): Promise<void>;
  subscribe(
    onData: (data: Uint8Array) => void,
    onError: (error: Error) => void,
  ): () => void;
}
