import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const proto = readFileSync(join(__dirname, '../../../proto/manifest_v5.proto'), 'utf8');

describe('manifest_v5.proto runtime messages', () => {
  it('declares ResourceSnapshot with repeated ResourceValue', () => {
    expect(proto).toMatch(/message ResourceSnapshot\s*\{[\s\S]*repeated ResourceValue values\s*=\s*1;[\s\S]*\}/);
  });
  it('declares ResourceDelta with uint32 resource_id and oneof value', () => {
    expect(proto).toMatch(/message ResourceDelta\s*\{[\s\S]*uint32 resource_id\s*=\s*1;[\s\S]*oneof value[\s\S]*\}/);
  });
  it('declares InvokeAction with uint32 action_id and bytes payload', () => {
    expect(proto).toMatch(/message InvokeAction\s*\{[\s\S]*uint32 action_id\s*=\s*1;[\s\S]*bytes payload\s*=\s*2;[\s\S]*\}/);
  });
  it('declares InvokeResult with correlation_id, status, bytes payload', () => {
    expect(proto).toMatch(/message InvokeResult\s*\{[\s\S]*uint32 correlation_id\s*=\s*1;[\s\S]*Status status\s*=\s*2;[\s\S]*bytes payload\s*=\s*3;[\s\S]*\}/);
  });
  it('declares Subscribe and Unsubscribe with repeated uint32 resource_ids', () => {
    expect(proto).toMatch(/message Subscribe\s*\{[\s\S]*repeated uint32 resource_ids\s*=\s*1[\s\S]*\}/);
    expect(proto).toMatch(/message Unsubscribe\s*\{[\s\S]*repeated uint32 resource_ids\s*=\s*1[\s\S]*\}/);
  });
});
