import { Stack } from 'expo-router';
import { Backspace } from 'phosphor-react-native';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Op = '÷' | '×' | '−' | '+' | '^' | null;
type Angle = 'DEG' | 'RAD';

const OPERATORS: Op[] = ['÷', '×', '−', '+', '^'];
const BACK = 'BACK';
const NUMBER_GRID = [
  ['C', '±', '%', '÷'],
  ['7', '8', '9', '×'],
  ['4', '5', '6', '−'],
  ['1', '2', '3', '+'],
  ['0', '.', BACK, '='],
];

const SCI_ROWS: { label: string; key: string }[][] = [
  [
    { label: 'sin', key: 'sin' },
    { label: 'cos', key: 'cos' },
    { label: 'tan', key: 'tan' },
    { label: 'π', key: 'pi' },
    { label: 'e', key: 'e' },
  ],
  [
    { label: 'log', key: 'log' },
    { label: 'ln', key: 'ln' },
    { label: '√', key: 'sqrt' },
    { label: 'x²', key: 'sq' },
    { label: 'x^y', key: '^' },
  ],
];

const fmt = (n: number) => {
  if (!isFinite(n)) return 'Error';
  if (Number.isInteger(n)) return String(n);
  return parseFloat(n.toFixed(10)).toString();
};

export default function ScientificCalculator() {
  const [display, setDisplay] = useState('0');
  const [prevValue, setPrevValue] = useState<number | null>(null);
  const [operator, setOperator] = useState<Op>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [angleMode, setAngleMode] = useState<Angle>('DEG');

  const handleNumber = (num: string) => {
    if (waitingForOperand) {
      setDisplay(num);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const handleDecimal = () => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
      return;
    }
    if (!display.includes('.')) setDisplay(display + '.');
  };

  const calculate = (a: number, b: number, op: Op): number => {
    switch (op) {
      case '+': return a + b;
      case '−': return a - b;
      case '×': return a * b;
      case '÷': return b !== 0 ? a / b : NaN;
      case '^': return Math.pow(a, b);
      default: return b;
    }
  };

  const handleOperator = (op: Op) => {
    const current = parseFloat(display);
    if (prevValue !== null && !waitingForOperand) {
      const result = calculate(prevValue, current, operator);
      setDisplay(fmt(result));
      setPrevValue(result);
    } else {
      setPrevValue(current);
    }
    setOperator(op);
    setWaitingForOperand(true);
  };

  const handleEquals = () => {
    if (prevValue === null || operator === null) return;
    const result = calculate(prevValue, parseFloat(display), operator);
    setDisplay(fmt(result));
    setPrevValue(null);
    setOperator(null);
    setWaitingForOperand(true);
  };

  const handleClear = () => {
    setDisplay('0');
    setPrevValue(null);
    setOperator(null);
    setWaitingForOperand(false);
  };

  const handleSign = () => setDisplay(fmt(parseFloat(display) * -1));
  const handlePercent = () => setDisplay(fmt(parseFloat(display) / 100));
  const handleBackspace = () => {
    if (display.length > 1) setDisplay(display.slice(0, -1));
    else setDisplay('0');
  };

  const applyUnary = (key: string) => {
    const x = parseFloat(display);
    let result: number;
    const toRad = (d: number) => (angleMode === 'DEG' ? (d * Math.PI) / 180 : d);
    switch (key) {
      case 'sin': result = Math.sin(toRad(x)); break;
      case 'cos': result = Math.cos(toRad(x)); break;
      case 'tan': result = Math.tan(toRad(x)); break;
      case 'log': result = Math.log10(x); break;
      case 'ln': result = Math.log(x); break;
      case 'sqrt': result = Math.sqrt(x); break;
      case 'sq': result = x * x; break;
      case 'pi': result = Math.PI; break;
      case 'e': result = Math.E; break;
      default: return;
    }
    setDisplay(fmt(result));
    setWaitingForOperand(true);
  };

  const handleSci = (key: string) => {
    if (key === '^') return handleOperator('^');
    applyUnary(key);
  };

  const handleBasic = (btn: string) => {
    if (btn >= '0' && btn <= '9') return handleNumber(btn);
    if (btn === '.') return handleDecimal();
    if (OPERATORS.includes(btn as Op)) return handleOperator(btn as Op);
    if (btn === '=') return handleEquals();
    if (btn === 'C') return handleClear();
    if (btn === '±') return handleSign();
    if (btn === '%') return handlePercent();
    if (btn === BACK) return handleBackspace();
  };

  const isOpActive = (btn: string) => OPERATORS.includes(btn as Op) && btn === operator && waitingForOperand;

  const fontSize = display.length > 9 ? 36 : display.length > 6 ? 50 : 64;

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: '科學計算機' }} />

      <View style={styles.displayArea}>
        <View style={styles.modeRow}>
          <TouchableOpacity onPress={() => setAngleMode((m) => (m === 'DEG' ? 'RAD' : 'DEG'))} style={styles.modeBtn} activeOpacity={0.7}>
            <Text style={styles.modeText}>{angleMode}</Text>
          </TouchableOpacity>
          {operator && prevValue !== null && (
            <Text style={styles.expression}>
              {prevValue} {operator}
            </Text>
          )}
        </View>
        <Text style={[styles.display, { fontSize }]} numberOfLines={1} adjustsFontSizeToFit>
          {display}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.keys}>
        <View style={styles.sci}>
          {SCI_ROWS.map((row, ri) => (
            <View key={ri} style={styles.sciRow}>
              {row.map((b) => (
                <TouchableOpacity
                  key={b.key}
                  style={styles.sciBtn}
                  onPress={() => handleSci(b.key)}
                  activeOpacity={0.75}
                >
                  <Text style={styles.sciText}>{b.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>

        <View style={styles.numpad}>
          {NUMBER_GRID.map((row, ri) => (
            <View key={ri} style={styles.numRow}>
              {row.map((btn) => {
                const isOp = OPERATORS.includes(btn as Op);
                const isFunc = ['C', '±', '%', BACK].includes(btn);
                const isEq = btn === '=';
                const opActive = isOp && isOpActive(btn);
                return (
                  <TouchableOpacity
                    key={btn}
                    style={[
                      styles.numBtn,
                      isOp && styles.btnOp,
                      opActive && styles.btnOpActive,
                      isFunc && styles.btnFunc,
                      isEq && styles.btnEq,
                    ]}
                    onPress={() => handleBasic(btn)}
                    activeOpacity={0.75}
                  >
                    {btn === BACK ? (
                      <Backspace size={24} color="#8a6a4a" weight="bold" />
                    ) : (
                      <Text
                        style={[
                          styles.numText,
                          isOp && styles.numTextOp,
                          opActive && styles.numTextOpActive,
                          isFunc && styles.numTextFunc,
                          isEq && styles.numTextEq,
                        ]}
                      >
                        {btn}
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const C = {
  bg: '#fff8ed',
  card: '#fff',
  text: '#2d2520',
  hint: '#a3897a',
  muted: '#8a7a6c',
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  displayArea: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 16,
    alignItems: 'flex-end',
  },
  modeRow: { flexDirection: 'row', alignItems: 'center', alignSelf: 'stretch', justifyContent: 'space-between' },
  modeBtn: {
    backgroundColor: '#b8e6d2', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 12,
  },
  modeText: { fontFamily: 'Fredoka_700Bold', fontSize: 12, color: '#2d8765', letterSpacing: 1 },
  expression: { fontFamily: 'Fredoka_500Medium', fontSize: 18, color: C.hint },
  display: { fontFamily: 'Fredoka_700Bold', color: C.text, letterSpacing: -1.5, marginTop: 8 },
  keys: { padding: 12, gap: 8, paddingBottom: 32 },
  sci: { gap: 8, marginBottom: 6 },
  sciRow: { flexDirection: 'row', gap: 8 },
  sciBtn: {
    flex: 1, paddingVertical: 12, backgroundColor: '#b8e6d2', borderRadius: 14, alignItems: 'center',
    shadowColor: C.hint, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 1,
  },
  sciText: { fontFamily: 'Fredoka_700Bold', fontSize: 15, color: '#2d8765' },
  numpad: { gap: 8 },
  numRow: { flexDirection: 'row', gap: 8 },
  numBtn: {
    flex: 1, aspectRatio: 1, backgroundColor: C.card, borderRadius: 999,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: C.hint, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.12, shadowRadius: 6, elevation: 2,
  },
  btnOp: { backgroundColor: '#ffd4ba' },
  btnOpActive: { backgroundColor: '#c4623a' },
  btnFunc: { backgroundColor: '#f1e3d0' },
  btnEq: { backgroundColor: '#c4623a' },
  numText: { fontFamily: 'Fredoka_600SemiBold', fontSize: 24, color: C.text },
  numTextOp: { color: '#c4623a' },
  numTextOpActive: { color: '#fff' },
  numTextFunc: { color: '#8a6a4a', fontSize: 20 },
  numTextEq: { color: '#fff' },
});
