import Feather from '@expo/vector-icons/Feather';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { palette, radius, withAlpha } from '../../../ui/theme/ui';
import type { RuntimeNavBarItem } from '../../model/runtime.types';

function resolveIconName(name: string): keyof typeof Feather.glyphMap {
  return (name in Feather.glyphMap ? name : 'circle') as keyof typeof Feather.glyphMap;
}

export function BottomNavBar({
  items,
  activeScreenSlug,
  onSelect,
}: {
  items: readonly RuntimeNavBarItem[];
  activeScreenSlug: string;
  onSelect: (screenSlug: string) => void;
}) {
  return (
    <View testID="bottom-nav" style={styles.shell}>
      {items.map((item) => {
        const active = item.screenSlug === activeScreenSlug;
        return (
          <Pressable
            key={item.id}
            accessibilityRole="button"
            onPress={() => onSelect(item.screenSlug)}
            style={[styles.item, active && styles.itemActive]}
          >
            <Feather
              name={resolveIconName(item.icon)}
              size={16}
              color={active ? palette.accent : palette.subtle}
            />
            <Text style={[styles.label, active && styles.labelActive]}>{item.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: withAlpha(palette.borderStrong, 0.6),
    backgroundColor: palette.panel,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: radius.md,
  },
  itemActive: {
    backgroundColor: withAlpha(palette.accent, 0.14),
  },
  label: {
    color: palette.subtle,
    fontSize: 12,
    fontWeight: '600',
  },
  labelActive: {
    color: palette.text,
  },
});
