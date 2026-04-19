import { describe, expect, it } from '@jest/globals';
import { BleRuntime } from '../../src/manifest-v5/runtime/BleRuntime';
import { createFixtureBleDevice } from '../../src/manifest-v5/runtime/BleRuntime.fixture';
import { encodeFrame, FrameKind } from '../../src/manifest-v5/runtime/frameCodecV5';
import { Writer, Reader } from 'protobufjs/minimal';
import { default as root } from '../../src/manifest-v5/generated/manifest_v5.pbjs';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const manifest_v5 = (root as any).esp_control.v5;
const FIXTURE = resolve(__dirname, '..', '..', 'assets', 'manifest_v5_demo.pb');
const testManifestBytes = new Uint8Array(readFileSync(FIXTURE));

describe('BleRuntime', () => {
  it('resolves invokeAction when the device replies with InvokeResult', async () => {
    const device = createFixtureBleDevice();
    const rt = new BleRuntime(device);
    
    const resultFrame = (() => {
      const msg = manifest_v5.InvokeResult.create({
        correlationId: 1, status: manifest_v5.Status.STATUS_OK, payload: new Uint8Array([1]),
      });
      const body = manifest_v5.InvokeResult.encode(msg, new Writer()).finish();
      return encodeFrame(FrameKind.InvokeResult, 0, body);
    })();
    
    // We need to preload manifest for invokeAction to find actionId
    (device as any).manifestBytes = testManifestBytes;
    await rt.loadManifest();

    const invokePromise = rt.invokeAction('relay.toggle', {});
    
    setTimeout(() => {
        device.queueIncoming(resultFrame);
    }, 100);
    
    const reply = await invokePromise;
    expect(reply.status).toBe('ok');
    expect(Array.from(reply.payload ?? new Uint8Array())).toEqual([1]);
  }, 10000);

  it('loads the manifest from chunk + eof frames and resolves ids from the manifest', async () => {
    const device = createFixtureBleDevice();
    const runtime = new BleRuntime(device);
    (device as any).manifestBytes = testManifestBytes;
    const manifest = await runtime.loadManifest();
    expect(manifest.actions.has('relay.toggle')).toBe(true);
    
    // Monkey patch write to send InvokeResult
    const originalWrite = device.write;
    device.write = async (frame: Uint8Array) => {
        await originalWrite.call(device, frame);
        
        // Decode frame to get correlationId
        // Assuming frame starts with 4 bytes header (kind, flags, length)
        const frameBody = frame.slice(4); 
        const invokeAction = manifest_v5.InvokeAction.decode(new Reader(frameBody));
        
        // Send result back
        const msg = manifest_v5.InvokeResult.create({
            correlationId: invokeAction.correlationId,
            status: manifest_v5.Status.STATUS_OK, 
            payload: new Uint8Array([1]),
        });
        const body = manifest_v5.InvokeResult.encode(msg, new Writer()).finish();
        device.queueIncoming(encodeFrame(FrameKind.InvokeResult, 0, body));
    };

    const result = await runtime.invokeAction('relay.toggle', { value: true });
    expect(result.status).toBe('ok');
  }, 10000);
});
