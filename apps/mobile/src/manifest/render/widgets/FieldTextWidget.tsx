import React from 'react';
import { TextInput } from 'react-native';
import { Controller, useFormContext } from 'react-hook-form';
import { palette, radius } from '../../../ui/theme/ui';

export function FieldTextWidget({ name, label }: { name: string; label: string }) {
  const { control } = useFormContext();
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange } }) => (
        <TextInput
          testID={`field-${name}`}
          value={typeof value === 'string' ? value : ''}
          onChangeText={onChange}
          placeholder={label}
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