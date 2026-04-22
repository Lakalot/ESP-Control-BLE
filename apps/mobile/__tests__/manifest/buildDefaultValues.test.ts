import { buildDefaultValues } from '@/manifest/forms/buildDefaultValues';
import type { RuntimeForm } from '@/manifest/model/runtime.types';

const form: RuntimeForm = {
  slug: 'timer_setup',
  submitActionSlug: 'start_timer',
  fields: [
    { slug: 'duration_ms', kind: 'duration', label: 'Duration', defaultIf: 60000, visibleIf: undefined, enabledIf: undefined, options: [] },
    { slug: 'mode', kind: 'select', label: 'Mode', defaultIf: { var: 'resource.mode' }, visibleIf: undefined, enabledIf: undefined, options: ['auto', 'manual'] },
    { slug: 'name', kind: 'text', label: 'Name', defaultIf: undefined, visibleIf: undefined, enabledIf: undefined, options: [] },
  ],
  valueSchema: undefined,
};

describe('buildDefaultValues', () => {
  it('evaluates defaultIf rules against the provided context', () => {
    const defaults = buildDefaultValues(form, { 'resource.mode': 'auto' });
    expect(defaults).toEqual({ duration_ms: 60000, mode: 'auto', name: '' });
  });

  it('falls back to kind-appropriate empty for fields without defaultIf', () => {
    const defaults = buildDefaultValues(form, {});
    expect(defaults.name).toBe('');
    expect(defaults.mode).toBe(null);
    expect(defaults.duration_ms).toBe(60000);
  });
});