import { useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

type Screen = 'exercise' | 'calculator';

const tabs: { id: Screen; label: string }[] = [
  { id: 'exercise', label: 'Ćwiczenie' },
  { id: 'calculator', label: 'Kalkulator' },
];

const calculatorButtons = ['7', '8', '9', '÷'];

export default function App() {
  const [screen, setScreen] = useState<Screen>('exercise');
  const [visible, setVisible] = useState(false);
  const [expression, setExpression] = useState('');
  const displayRef = useRef<ScrollView>(null);

  function append(symbol: string): void {
    setExpression((currentExpression) => currentExpression + symbol);
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
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
                  <Text style={styles.name}>Jan Kowalski</Text>
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
            <View style={styles.calculatorHeader}>
              <Text style={styles.eyebrow}>POCZĄTEK PROJEKTU</Text>
              <Text style={styles.title}>Kalkulator</Text>
            </View>
            <View style={styles.display}>
              <ScrollView
                contentContainerStyle={styles.displayContent}
                horizontal
                onContentSizeChange={() =>
                  displayRef.current?.scrollToEnd({ animated: true })
                }
                ref={displayRef}
                showsHorizontalScrollIndicator={false}
              >
                <Text numberOfLines={1} style={styles.expression}>
                  {expression || '0'}
                </Text>
              </ScrollView>
            </View>
            <View style={styles.keypad}>
              {calculatorButtons.map((symbol) => (
                <Pressable
                  accessibilityLabel={`Dodaj ${symbol}`}
                  accessibilityRole="button"
                  key={symbol}
                  onPress={() => append(symbol)}
                  style={({ pressed }) => [
                    styles.key,
                    pressed && styles.pressedKey,
                  ]}
                >
                  <Text style={styles.keyLabel}>{symbol}</Text>
                </Pressable>
              ))}
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
    paddingTop: 24,
    paddingBottom: 20,
  },
  display: {
    backgroundColor: '#ffffff',
    borderColor: '#e2e7ef',
    borderRadius: 22,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    marginBottom: 20,
    minHeight: 120,
    paddingHorizontal: 20,
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
  keypad: {
    flexDirection: 'row',
    gap: 10,
    paddingBottom: 20,
  },
  key: {
    alignItems: 'center',
    backgroundColor: '#23395d',
    borderRadius: 18,
    flex: 1,
    justifyContent: 'center',
    minHeight: 68,
  },
  pressedKey: {
    backgroundColor: '#315c9b',
  },
  keyLabel: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '600',
  },
});
