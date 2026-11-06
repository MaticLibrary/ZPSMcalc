import { Pressable, StyleSheet, Text, type ViewStyle } from 'react-native';
import type { Key, KeyRole } from '../keys';

type CalculatorKeyProps = {
  compact: boolean;
  item: Key;
  onPress: (label: string) => void;
  theme: 'light' | 'dark';
};

export function CalculatorKey({
  compact,
  item,
  onPress,
  theme,
}: CalculatorKeyProps) {
  const accessibilityLabel =
    item.label === 'AC'
      ? 'Wyczyść wyświetlacz'
      : item.label === '⌫'
        ? 'Usuń ostatni znak'
        : `Dodaj ${item.label}`;

  const roleBackgrounds: Record<KeyRole, string> =
    theme === 'dark'
      ? {
          digit: '#161d29',
          operator: '#232d39',
          equals: '#a9895a',
          clear: '#5f474d',
        }
      : {
          digit: '#23395d',
          operator: '#315c9b',
          equals: '#16805d',
          clear: '#b42318',
        };

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      onPress={() => onPress(item.label)}
      style={({ pressed }) => [
        styles.key,
        { flex: item.span ?? 1, backgroundColor: roleBackgrounds[item.role] },
        pressed && styles.pressedKey,
      ]}
    >
      <Text style={[styles.keyLabel, compact && styles.keyLabelLandscape]}>
        {item.label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  key: {
    alignItems: 'center',
    borderRadius: 18,
    justifyContent: 'center',
  },
  pressedKey: {
    opacity: 0.75,
  },
  keyLabel: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '600',
  },
  keyLabelLandscape: {
    fontSize: 18,
  },
});
