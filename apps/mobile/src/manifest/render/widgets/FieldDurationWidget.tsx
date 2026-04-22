import React from 'react';
import { TextInput } from 'react-native';
import { Controller, useFormContext } from 'react-hook-form';
import { palette, radius } from '../../../ui/theme/ui';

export function FieldDurationWidget({ name, label }: { name: string; label: string }) {
  const { control } = useFormContext();
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange } }) => (
        <TextInput
          testID={`field-${name}`}
          value={value != null ? String(value) : ''}
          onChangeText={(val) => {
            const num = Number(val);
            onChange(isNaN(num) ? val : num);
          }}
          keyboardType="numeric"
          placeholder={label + ' (ms)'}
          placeholderTextColor={palette.muted}
          style={{
            backgroundColor: palette.panelInset,
            borderRadius: radius.md,
            padding: 12,
            color: palette.text,
          }}
        />
      )}
    />
  );
}