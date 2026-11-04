import { Pressable, StyleSheet, Text, type ViewStyle } from 'react-native';
import type { Key, KeyRole } from '../keys';

type CalculatorKeyProps = {
  compact: boolean;
  item: Key;
  onPress: (label: string) => void;
};

export function CalculatorKey({
  compact,
  item,
  onPress,
}: CalculatorKeyProps) {
  const accessibilityLabel =
    item.label === 'AC'
      ? 'Wyczyść wyświetlacz'
      : item.label === '⌫'
        ? 'Usuń ostatni znak'
        : `Dodaj ${item.label}`;

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      onPress={() => onPress(item.label)}
      style={({ pressed }) => [
        styles.key,
        ROLE_VIEW[item.role],
        { flex: item.span ?? 1 },
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
  digitKey: {
    backgroundColor: '#23395d',
  },
  operatorKey: {
    backgroundColor: '#315c9b',
  },
  equalsKey: {
    backgroundColor: '#16805d',
  },
  clearKey: {
    backgroundColor: '#b42318',
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

const ROLE_VIEW: Record<KeyRole, ViewStyle> = {
  digit: styles.digitKey,
  operator: styles.operatorKey,
  equals: styles.equalsKey,
  clear: styles.clearKey,
};
