import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import * as pb from '../src/generated/manifest_v5.pbjs.js';

const proto = readFileSync(join(__dirname, '../../../proto/manifest_v5.proto'), 'utf8');
const root = pb.esp_control.v5;

describe('manifest_v5.proto runtime messages', () => {
  it('declares CommonValue', () => {
    expect(proto).toMatch(/message CommonValue\s*\{[\s\S]*oneof kind[\s\S]*\}/);
  });

  it('declares CommonObject', () => {
    expect(proto).toMatch(/message CommonObject\s*\{[\s\S]*repeated CommonField fields\s*=\s*1;[\s\S]*\}/);
  });

  it('declares CommonList', () => {
    expect(proto).toMatch(/message CommonList\s*\{[\s\S]*repeated CommonValue items\s*=\s*1;[\s\S]*\}/);
  });

  it('declares InvokeAction with CommonValue payload at field 3', () => {
    expect(proto).toMatch(
      /message InvokeAction\s*\{[\s\S]*uint32 action_id\s*=\s*1;[\s\S]*uint32 correlation_id\s*=\s*2;[\s\S]*CommonValue payload\s*=\s*3;[\s\S]*\}/,
    );
  });

  it('declares InvokeResult with CommonValue payload at field 3', () => {
    expect(proto).toMatch(
      /message InvokeResult\s*\{[\s\S]*uint32 correlation_id\s*=\s*1;[\s\S]*Status status\s*=\s*2;[\s\S]*CommonValue payload\s*=\s*3;[\s\S]*string message\s*=\s*4;[\s\S]*\}/,
    );
  });

  it('declares ResourceSnapshot and ResourceDelta with CommonValue plus subscribe messages', () => {
    expect(proto).toMatch(/message ResourceSnapshot\s*\{[\s\S]*repeated ResourceValue values\s*=\s*1;[\s\S]*uint32 generation\s*=\s*2;[\s\S]*\}/);
    expect(proto).toMatch(/message ResourceDelta\s*\{[\s\S]*uint32 resource_id\s*=\s*1;[\s\S]*CommonValue value\s*=\s*2;[\s\S]*uint32 generation\s*=\s*3;[\s\S]*\}/);
    expect(proto).toMatch(/message Subscribe\s*\{[\s\S]*repeated uint32 resource_ids\s*=\s*1;[\s\S]*\}/);
    expect(proto).toMatch(/message Unsubscribe\s*\{[\s\S]*repeated uint32 resource_ids\s*=\s*1;[\s\S]*\}/);
  });

  it('round-trips a nested CommonValue through generated ResourceDelta bindings', () => {
    const message = root.ResourceDelta.create({
      resourceId: 7,
      generation: 11,
      value: {
        objectValue: {
          fields: [
            {
              keyIdx: 1,
              value: {
                listValue: {
                  items: [{ uintValue: 42 }, { stringValue: 'ready' }],
                },
              },
            },
            {
              keyIdx: 2,
              value: { boolValue: true },
            },
          ],
        },
      },
    });

    const encoded = root.ResourceDelta.encode(message).finish();
    const decoded = root.ResourceDelta.decode(encoded);
    const plain = root.ResourceDelta.toObject(decoded, {
      defaults: true,
      longs: Number,
    });

    expect(plain).toMatchObject({
      resourceId: 7,
      generation: 11,
      value: {
        objectValue: {
          fields: [
            {
              keyIdx: 1,
              value: {
                listValue: {
                  items: [{ uintValue: 42 }, { stringValue: 'ready' }],
                },
              },
            },
            {
              keyIdx: 2,
              value: { boolValue: true },
            },
          ],
        },
      },
    });
  });
});
