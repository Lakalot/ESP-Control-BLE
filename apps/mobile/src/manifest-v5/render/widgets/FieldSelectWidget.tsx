import React from 'react';
import { Text, View, Pressable } from 'react-native';
import { Controller, useFormContext } from 'react-hook-form';
import { palette, radius } from '../../../ui/theme/ui';

export function FieldSelectWidget({ name, label, options }: { name: string; label: string; options: readonly string[] }) {
  const { control } = useFormContext();
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange } }) => (
        <View style={{ backgroundColor: palette.panelInset, borderRadius: radius.md, padding: 12 }}>
          <Text style={{ color: palette.muted, marginBottom: 8 }}>{label}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {options.map((opt) => (
              <Pressable
                key={opt}
                onPress={() => onChange(opt)}
                style={{
                  padding: 8,
                  borderRadius: radius.sm,
                  backgroundColor: value === opt ? palette.accentAlt : palette.panel,
                }}
              >
                <Text style={{ color: value === opt ? palette.black : palette.text }}>{opt}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}
    />
  );
}