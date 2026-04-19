import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { DynamicFormRenderer } from '@/manifest-v5/forms/DynamicFormRenderer';
import type { RuntimeForm } from '@/manifest-v5/model/runtime.types';

const form: RuntimeForm = {
  slug: 'timer_setup',
  submitActionSlug: 'start_timer',
  fields: [
    { slug: 'name', kind: 'text', label: 'Name', defaultIf: undefined, visibleIf: undefined, enabledIf: undefined, options: [] },
  ],
  valueSchema: {
    type: 'object',
    required: ['name'],
    properties: { name: { type: 'string', minLength: 1 } },
    additionalProperties: false,
  },
};

describe('DynamicFormRenderer', () => {
  it('submits values through the provided onSubmit', async () => {
    const onSubmit = jest.fn();
    const { getByTestId, getByText } = render(
      <DynamicFormRenderer form={form} ctx={{}} onSubmit={onSubmit} />,
    );
    fireEvent.changeText(getByTestId('field-name'), 'abc');
    fireEvent.press(getByText(/submit/i));
    await new Promise((r) => setImmediate(r));
    expect(onSubmit).toHaveBeenCalledWith('start_timer', { name: 'abc' });
  });

  it('blocks submit when validation fails', async () => {
    const onSubmit = jest.fn();
    const { getByText } = render(
      <DynamicFormRenderer form={form} ctx={{}} onSubmit={onSubmit} />,
    );
    fireEvent.press(getByText(/submit/i));
    await new Promise((r) => setImmediate(r));
    expect(onSubmit).not.toHaveBeenCalled();
  });
});