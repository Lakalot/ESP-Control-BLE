import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const proto = readFileSync(join(__dirname, '../../../proto/manifest_v5.proto'), 'utf8');

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
});
