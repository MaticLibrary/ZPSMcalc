import { StyleSheet, View } from 'react-native';
import type { Key } from '../keys';
import { CalculatorKey } from './CalculatorKey';

type KeypadProps = {
  compact: boolean;
  keys: Key[][];
  onPress: (label: string) => void;
};

export function Keypad({ compact, keys, onPress }: KeypadProps) {
  return (
    <View style={styles.keypad}>
      {keys.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.keyRow}>
          {row.map((item) => (
            <CalculatorKey
              compact={compact}
              item={item}
              key={item.label}
              onPress={onPress}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  keypad: {
    flex: 1,
    gap: 8,
  },
  keyRow: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
  },
});
