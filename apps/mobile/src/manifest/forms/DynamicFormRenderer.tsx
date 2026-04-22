import React, { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { FormProvider, useForm } from 'react-hook-form';
import type { RuntimeForm, RuntimeFormField } from '../model/runtime.types';
import type { FlatRuleContext } from '../rules/ruleContext';
import { buildDefaultValues } from './buildDefaultValues';
import { buildFormResolver } from './buildFormResolver';
import { FieldTextWidget } from '../render/widgets/FieldTextWidget';
import { FieldNumberWidget } from '../render/widgets/FieldNumberWidget';
import { FieldDurationWidget } from '../render/widgets/FieldDurationWidget';
import { FieldSelectWidget } from '../render/widgets/FieldSelectWidget';
import { evaluateRule } from '../rules/evaluateRule';

export interface DynamicFormRendererProps {
  form: RuntimeForm;
  ctx: FlatRuleContext;
  onSubmit: (actionSlug: string, values: Record<string, unknown>) => void;
}

const FIELD_COMPONENT = {
  text: FieldTextWidget,
  number: FieldNumberWidget,
  duration: FieldDurationWidget,
  select: FieldSelectWidget,
} as const;

export function DynamicFormRenderer({ form, ctx, onSubmit }: DynamicFormRendererProps) {
  const defaults = useMemo(() => buildDefaultValues(form, ctx), [form, ctx]);
  const resolver = useMemo(
    () => (form.valueSchema ? buildFormResolver(form.valueSchema) : undefined),
    [form.valueSchema],
  );
  const methods = useForm({ defaultValues: defaults, resolver });

  const visibleFields = form.fields.filter((f: RuntimeFormField) =>
    Boolean(evaluateRule(f.visibleIf, ctx)),
  );

  return (
    <FormProvider {...methods}>
      <View style={{ gap: 12 }}>
        {visibleFields.map((f) => {
          const Cmp = FIELD_COMPONENT[f.kind];
          return <Cmp key={f.slug} name={f.slug} label={f.label} options={f.options} />;
        })}
        <Pressable
          onPress={methods.handleSubmit((values) => onSubmit(form.submitActionSlug, values))}
        >
          <Text>Submit</Text>
        </Pressable>
      </View>
    </FormProvider>
  );
}