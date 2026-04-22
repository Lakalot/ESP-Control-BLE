import { describe, expect, it } from 'vitest';
import { Value } from '@sinclair/typebox/value';
import { FirmwareSymbol, Label, SlugId, TokenRef } from '../src/schema/primitives.js';

describe('SlugId', () => {
  it('accepts lowercase dotted slugs', () => {
    expect(Value.Check(SlugId, 'relay.auto')).toBe(true);
    expect(Value.Check(SlugId, 'home')).toBe(true);
  });

  it('rejects spaces, uppercase, and path separators', () => {
    expect(Value.Check(SlugId, 'Relay')).toBe(false);
    expect(Value.Check(SlugId, 'relay auto')).toBe(false);
    expect(Value.Check(SlugId, 'relay/auto')).toBe(false);
    expect(Value.Check(SlugId, '')).toBe(false);
  });
});

describe('Label', () => {
  it('accepts short human-readable text', () => {
    expect(Value.Check(Label, 'Main Power')).toBe(true);
  });
});

describe('TokenRef', () => {
  it('accepts dotted token references', () => {
    expect(Value.Check(TokenRef, 'tone.success')).toBe(true);
    expect(Value.Check(TokenRef, 'surface.panel')).toBe(true);
  });

  it('rejects malformed token references', () => {
    expect(Value.Check(TokenRef, 'tone')).toBe(false);
    expect(Value.Check(TokenRef, 'tone/success')).toBe(false);
  });
});

describe('FirmwareSymbol', () => {
  it('accepts lowercase firmware-safe identifiers', () => {
    expect(Value.Check(FirmwareSymbol, 'relay_auto')).toBe(true);
    expect(Value.Check(FirmwareSymbol, 'home_screen')).toBe(true);
  });

  it('rejects reserved or malformed identifiers', () => {
    expect(Value.Check(FirmwareSymbol, 'and')).toBe(false);
    expect(Value.Check(FirmwareSymbol, '__relay_auto')).toBe(false);
    expect(Value.Check(FirmwareSymbol, '9relay_auto')).toBe(false);
  });
});
