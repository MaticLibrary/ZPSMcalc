import { useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { evaluateExpression, formatResult } from './calculator';

type Screen = 'exercise' | 'calculator';

const tabs: { id: Screen; label: string }[] = [
  { id: 'exercise', label: 'Ćwiczenie' },
  { id: 'calculator', label: 'Kalkulator' },
];

const basicKeys = [
  ['AC', '±', '%', '÷'],
  ['7', '8', '9', '×'],
  ['4', '5', '6', '−'],
  ['1', '2', '3', '+'],
  ['0', ',', '⌫', '='],
];

const extendedKeys = [
  ['(', ')'],
  ['x²', '√('],
  ['1/x', '^'],
  ['π', 'e'],
  ['AC', '⌫'],
];

const binaryOperators = ['+', '−', '×', '÷', '^'];

function findLastOperandStart(expression: string): number | null {
  const end = expression.length;
  const lastCharacter = expression[end - 1];
  let start: number;

  if (lastCharacter === ')') {
    let depth = 0;
    start = -1;
    for (let index = end - 1; index >= 0; index -= 1) {
      if (expression[index] === ')') {
        depth += 1;
      } else if (expression[index] === '(') {
        depth -= 1;
        if (depth === 0) {
          start = index;
          break;
        }
      }
    }
    if (start < 0) {
      return null;
    }
    if (start > 0 && expression[start - 1] === '√') {
      start -= 1;
    }
  } else {
    const operandMatch = expression.match(
      /(?:\d+(?:[.,]\d*)?(?:[eE][+-]?\d+)?|[.,]\d+|π|e)%*$/,
    );
    if (!operandMatch) {
      return null;
    }
    start = end - operandMatch[0].length;
  }

  const precedingCharacter = expression[start - 1];
  const signIsUnary =
    precedingCharacter === '−' &&
    (start === 1 ||
      binaryOperators.includes(expression[start - 2]) ||
      expression[start - 2] === '(');
  return signIsUnary ? start - 1 : start;
}

function endsWithValue(expression: string): boolean {
  return /(?:\d|π|e|%|\))$/.test(expression);
}

type KeypadProps = {
  compact: boolean;
  rows: string[][];
  onPress: (symbol: string) => void;
};

function Keypad({ compact, rows, onPress }: KeypadProps) {
  return (
    <View style={styles.keypad}>
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.keyRow}>
          {row.map((symbol) => (
            <Pressable
              accessibilityLabel={
                symbol === 'AC'
                  ? 'Wyczyść wyświetlacz'
                  : symbol === '⌫'
                    ? 'Usuń ostatni znak'
                    : `Dodaj ${symbol}`
              }
              accessibilityRole="button"
              key={symbol}
              onPress={() => onPress(symbol)}
              style={({ pressed }) => [
                styles.key,
                pressed && styles.pressedKey,
              ]}
            >
              <Text
                style={[
                  styles.keyLabel,
                  compact && styles.keyLabelLandscape,
                ]}
              >
                {symbol}
              </Text>
            </Pressable>
          ))}
        </View>
      ))}
    </View>
  );
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('exercise');
  const [visible, setVisible] = useState(false);
  const [expression, setExpression] = useState('');
  const [calculationError, setCalculationError] = useState('');
  const [justEvaluated, setJustEvaluated] = useState(false);
  const displayRef = useRef<ScrollView>(null);
  const { width, height } = useWindowDimensions();
  const landscape = width > height;

  function appendOperand(currentExpression: string, operand: string): string {
    const lastCharacter = currentExpression[currentExpression.length - 1];
    const needsMultiplication =
      endsWithValue(currentExpression) &&
      (operand === '(' ||
        operand === '√(' ||
        operand === 'π' ||
        operand === 'e' ||
        (/\d/.test(operand) &&
          (lastCharacter === ')' ||
            lastCharacter === '%' ||
            lastCharacter === 'π' ||
            lastCharacter === 'e')));
    return `${currentExpression}${needsMultiplication ? '×' : ''}${operand}`;
  }

  function handleCalculatorButton(symbol: string): void {
    if (symbol === 'AC') {
      setExpression('');
      setCalculationError('');
      setJustEvaluated(false);
      return;
    }

    if (symbol === '⌫') {
      setExpression((currentExpression) => currentExpression.slice(0, -1));
      setCalculationError('');
      setJustEvaluated(false);
      return;
    }

    if (symbol === '=') {
      try {
        setExpression(formatResult(evaluateExpression(expression)));
        setCalculationError('');
        setJustEvaluated(true);
      } catch (error) {
        if (!(error instanceof Error)) {
          throw error;
        }
        setCalculationError(error.message);
        setJustEvaluated(false);
      }
      return;
    }

    if (symbol === '±') {
      setExpression((currentExpression) => {
        const operandStart = findLastOperandStart(currentExpression);
        if (operandStart === null) {
          const lastCharacter = currentExpression[currentExpression.length - 1];
          const previousCharacter = currentExpression.slice(-2, -1);
          const lastMinusIsUnary =
            lastCharacter === '−' &&
            (currentExpression.length === 1 ||
              binaryOperators.includes(previousCharacter) ||
              previousCharacter === '(');
          if (lastMinusIsUnary) {
            return currentExpression;
          }
          return (lastCharacter && binaryOperators.includes(lastCharacter)) ||
              lastCharacter === '('
            ? currentExpression + '−'
            : currentExpression || '−';
        }
        const hasUnaryMinus = currentExpression[operandStart] === '−';
        return hasUnaryMinus
          ? currentExpression.slice(0, operandStart) +
              currentExpression.slice(operandStart + 1)
          : currentExpression.slice(0, operandStart) +
              '−' +
              currentExpression.slice(operandStart);
      });
      setCalculationError('');
      setJustEvaluated(false);
      return;
    }

    if (symbol === '1/x') {
      setExpression((currentExpression) => {
        const operandStart = findLastOperandStart(currentExpression);
        if (operandStart === null) {
          return currentExpression;
        }
        const operand = currentExpression.slice(operandStart);
        const prefix = currentExpression.slice(0, operandStart);
        if (prefix.endsWith('^')) {
          return `${prefix.slice(0, -1)}^(1/(${operand}))`;
        }
        return `${prefix}1/(${operand})`;
      });
      setCalculationError('');
      setJustEvaluated(false);
      return;
    }

    if (symbol === 'x²' || symbol === '^') {
      setExpression((currentExpression) => {
        const operandStart = findLastOperandStart(currentExpression);
        if (operandStart === null) {
          return currentExpression;
        }
        const operand = currentExpression.slice(operandStart);
        if (operand.startsWith('−')) {
          return (
            currentExpression.slice(0, operandStart) +
            `(${operand})^${symbol === 'x²' ? '2' : ''}`
          );
        }
        return currentExpression + (symbol === 'x²' ? '^2' : '^');
      });
      setCalculationError('');
      setJustEvaluated(false);
      return;
    }

    if (symbol === '%') {
      setExpression((currentExpression) =>
        endsWithValue(currentExpression) &&
        currentExpression[currentExpression.length - 1] !== '%'
          ? currentExpression + '%'
          : currentExpression,
      );
      setCalculationError('');
      setJustEvaluated(false);
      return;
    }

    if (symbol === ',') {
      setExpression((currentExpression) => {
        if (justEvaluated) {
          return '0,';
        }
        const currentNumber = currentExpression.match(
          /(?:\d+(?:[.,]\d*)?|[.,]\d+)(?:[eE][+-]?\d+)?$/,
        );
        if (currentNumber) {
          return currentNumber[0].includes(',')
            ? currentExpression
            : currentExpression + ',';
        }
        if (endsWithValue(currentExpression)) {
          return currentExpression + '×0,';
        }
        return currentExpression + '0,';
      });
      setCalculationError('');
      setJustEvaluated(false);
      return;
    }

    if (binaryOperators.includes(symbol)) {
      setExpression((currentExpression) => {
        if (justEvaluated) {
          return currentExpression + symbol;
        }
        const lastCharacter = currentExpression[currentExpression.length - 1];
        if (lastCharacter && binaryOperators.includes(lastCharacter)) {
          if (symbol === '−' && lastCharacter !== '−') {
            return currentExpression + symbol;
          }
          const unaryMinus =
            lastCharacter === '−' &&
            currentExpression.length > 1 &&
            binaryOperators.includes(currentExpression.slice(-2, -1));
          const removeCount = unaryMinus ? 2 : 1;
          return currentExpression.slice(0, -removeCount) + symbol;
        }
        if (currentExpression.length === 0) {
          return symbol === '−' ? symbol : currentExpression;
        }
        return currentExpression + symbol;
      });
      setCalculationError('');
      setJustEvaluated(false);
      return;
    }

    if (symbol === ')') {
      setExpression((currentExpression) => {
        const openCount = (currentExpression.match(/\(/g) ?? []).length;
        const closeCount = (currentExpression.match(/\)/g) ?? []).length;
        return openCount > closeCount && endsWithValue(currentExpression)
          ? currentExpression + ')'
          : currentExpression;
      });
      setCalculationError('');
      setJustEvaluated(false);
      return;
    }

    setExpression((currentExpression) => {
      const startFresh = justEvaluated;
      const base = startFresh ? '' : currentExpression;
      if (/^\d$/.test(symbol)) {
        return appendOperand(base, symbol);
      }
      if (symbol === '(' || symbol === '√(' || symbol === 'π' || symbol === 'e') {
        return appendOperand(base, symbol);
      }
      return base + symbol;
    });
    setCalculationError('');
    setJustEvaluated(false);
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView
        edges={['top', 'bottom', 'left', 'right']}
        style={styles.safeArea}
      >
        <StatusBar style="dark" />
        <View style={styles.tabs}>
          {tabs.map((tab) => (
            <Pressable
              accessibilityRole="tab"
              accessibilityState={{ selected: screen === tab.id }}
              key={tab.id}
              onPress={() => setScreen(tab.id)}
              style={[styles.tab, screen === tab.id && styles.selectedTab]}
            >
              <Text
                style={[
                  styles.tabLabel,
                  screen === tab.id && styles.selectedTabLabel,
                ]}
              >
                {tab.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {screen === 'exercise' ? (
          <View style={styles.page}>
            <View style={styles.exerciseHeader}>
              <Text style={styles.eyebrow}>PIERWSZA APLIKACJA</Text>
              <Text style={styles.title}>Flexbox i stan</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ expanded: visible }}
                onPress={() => setVisible((currentVisible) => !currentVisible)}
                style={styles.nameButton}
              >
                <Text style={styles.nameButtonLabel}>
                  {visible ? 'Ukryj imię i nazwisko' : 'Pokaż imię i nazwisko'}
                </Text>
              </Pressable>
              {visible && (
                <View style={styles.nameCard}>
                  <Text style={styles.name}>Robert Kłusek</Text>
                  <Text style={styles.nameCaption}>Widok sterowany stanem</Text>
                </View>
              )}
            </View>

            <View style={styles.middle}>
              <View style={[styles.zone, styles.zoneOne]}>
                <Text style={styles.zoneNumber}>01</Text>
                <Text style={styles.zoneLabel}>Komponent</Text>
              </View>
              <View style={[styles.zone, styles.zoneTwo]}>
                <Text style={styles.zoneNumber}>02</Text>
                <Text style={styles.zoneLabel}>Flexbox</Text>
              </View>
              <View style={[styles.zone, styles.zoneThree]}>
                <Text style={styles.zoneNumber}>03</Text>
                <Text style={styles.zoneLabel}>Stan</Text>
              </View>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerLabel}>ZPSM · LABORATORIUM 3</Text>
            </View>
          </View>
        ) : (
          <View style={styles.page}>
            <View
              style={[
                styles.calculatorHeader,
                landscape && styles.calculatorHeaderLandscape,
              ]}
            >
              <Text style={styles.eyebrow}>POCZĄTEK PROJEKTU</Text>
              <Text
                style={[
                  styles.title,
                  landscape && styles.calculatorTitleLandscape,
                ]}
              >
                Kalkulator
              </Text>
            </View>
            <View
              style={[
                styles.display,
                landscape && styles.displayLandscape,
              ]}
            >
              <ScrollView
                contentContainerStyle={styles.displayContent}
                horizontal
                onContentSizeChange={() =>
                  displayRef.current?.scrollToEnd({ animated: true })
                }
                ref={displayRef}
                showsHorizontalScrollIndicator={false}
              >
                <Text
                  numberOfLines={1}
                  style={[
                    styles.expression,
                    landscape && styles.expressionLandscape,
                    calculationError && styles.errorExpression,
                  ]}
                >
                  {calculationError || expression || '0'}
                </Text>
              </ScrollView>
            </View>
            <View
              style={[
                styles.keypads,
                landscape && styles.keypadsLandscape,
              ]}
            >
              <Keypad
                compact={landscape}
                rows={basicKeys}
                onPress={handleCalculatorButton}
              />
              {landscape && (
                <Keypad
                  compact
                  rows={extendedKeys}
                  onPress={handleCalculatorButton}
                />
              )}
            </View>
          </View>
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f7fb',
  },
  tabs: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  tab: {
    alignItems: 'center',
    borderRadius: 18,
    backgroundColor: '#e8ecf4',
    flex: 1,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 12,
  },
  selectedTab: {
    backgroundColor: '#23395d',
  },
  tabLabel: {
    color: '#46536a',
    fontSize: 15,
    fontWeight: '600',
  },
  selectedTabLabel: {
    color: '#ffffff',
  },
  page: {
    flex: 1,
    paddingHorizontal: 20,
  },
  exerciseHeader: {
    gap: 8,
    paddingTop: 14,
    paddingBottom: 12,
  },
  eyebrow: {
    color: '#67758d',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.4,
  },
  title: {
    color: '#18243a',
    fontSize: 30,
    fontWeight: '700',
  },
  nameButton: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#315c9b',
    borderRadius: 14,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 18,
  },
  nameButtonLabel: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  nameCard: {
    backgroundColor: '#e5edf9',
    borderRadius: 16,
    gap: 3,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  name: {
    color: '#18243a',
    fontSize: 18,
    fontWeight: '700',
  },
  nameCaption: {
    color: '#596983',
    fontSize: 13,
  },
  middle: {
    flex: 1,
    justifyContent: 'space-around',
    paddingVertical: 8,
  },
  zone: {
    alignItems: 'center',
    borderRadius: 22,
    flexDirection: 'row',
    gap: 16,
    minHeight: 76,
    paddingHorizontal: 20,
  },
  zoneOne: {
    backgroundColor: '#e6edf8',
  },
  zoneTwo: {
    backgroundColor: '#e4f1ec',
  },
  zoneThree: {
    backgroundColor: '#f8eddf',
  },
  zoneNumber: {
    color: '#315c9b',
    fontSize: 18,
    fontWeight: '700',
  },
  zoneLabel: {
    color: '#18243a',
    fontSize: 18,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
  },
  footerLabel: {
    color: '#67758d',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  calculatorHeader: {
    gap: 8,
    paddingTop: 12,
    paddingBottom: 12,
  },
  calculatorHeaderLandscape: {
    gap: 2,
    paddingTop: 2,
    paddingBottom: 4,
  },
  calculatorTitleLandscape: {
    fontSize: 22,
  },
  display: {
    backgroundColor: '#ffffff',
    borderColor: '#e2e7ef',
    borderRadius: 22,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    marginBottom: 10,
    minHeight: 64,
    paddingHorizontal: 20,
  },
  displayLandscape: {
    flex: 0.6,
    marginBottom: 6,
    minHeight: 40,
  },
  displayContent: {
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  expression: {
    color: '#18243a',
    fontSize: 44,
    fontWeight: '500',
    textAlign: 'right',
  },
  errorExpression: {
    color: '#b42318',
    fontSize: 18,
  },
  expressionLandscape: {
    fontSize: 30,
  },
  keypads: {
    flex: 2,
    paddingBottom: 10,
  },
  keypadsLandscape: {
    flexDirection: 'row',
    gap: 8,
  },
  keypad: {
    flex: 1,
    gap: 8,
  },
  keyRow: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
  },
  key: {
    alignItems: 'center',
    backgroundColor: '#23395d',
    borderRadius: 18,
    flex: 1,
    justifyContent: 'center',
  },
  pressedKey: {
    backgroundColor: '#315c9b',
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
