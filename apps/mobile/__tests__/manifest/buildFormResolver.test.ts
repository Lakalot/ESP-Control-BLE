import { buildFormResolver } from '@/manifest/forms/buildFormResolver';

const schema = {
  type: 'object',
  required: ['name'],
  properties: {
    name: { type: 'string', minLength: 1, maxLength: 20 },
    count: { type: 'integer', minimum: 1 },
  },
  additionalProperties: false,
};

describe('buildFormResolver', () => {
  it('returns values when valid', async () => {
    const resolver = buildFormResolver(schema);
    const res = await resolver({ name: 'ok', count: 2 }, undefined, { fields: {}, shouldUseNativeValidation: false } as never);
    expect(res.errors).toEqual({});
    expect(res.values).toEqual({ name: 'ok', count: 2 });
  });

  it('maps Ajv errors to RHF field errors', async () => {
    const resolver = buildFormResolver(schema);
    const res = await resolver({ count: 0 }, undefined, { fields: {}, shouldUseNativeValidation: false } as never);
    expect(Object.keys(res.errors)).toEqual(expect.arrayContaining(['name', 'count']));
    expect(res.errors.name!.message).toMatch(/required/);
  });
});