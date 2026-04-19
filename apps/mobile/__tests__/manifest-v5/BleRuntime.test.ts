import { describe, expect, it } from '@jest/globals';
import { BleRuntime } from '../../src/manifest-v5/runtime/BleRuntime';
import { createFixtureBleDevice } from '../../src/manifest-v5/runtime/BleRuntime.fixture';
import { encodeFrame, FrameKind } from '../../src/manifest-v5/runtime/frameCodecV5';
import { Writer } from 'protobufjs/minimal';
import { default as root } from '../../src/manifest-v5/generated/manifest_v5.pbjs';
const manifest_v5 = (root as any).esp_control.v5;

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
    
    const invokePromise = rt.invokeAction('toggle', {});
    
    setTimeout(() => {
        device.queueIncoming(resultFrame);
        console.log("Incoming queued");
    }, 100);
    
    const reply = await invokePromise;
    expect(reply.status).toBe('ok');
    expect(Array.from(reply.payload ?? new Uint8Array())).toEqual([1]);
  }, 10000);
});
