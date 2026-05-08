import { Stack } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const BUTTONS = [
  ['C', '±', '%', '÷'],
  ['7', '8', '9', '×'],
  ['4', '5', '6', '−'],
  ['1', '2', '3', '+'],
  ['0', '.', '⌫', '='],
];

const OPERATORS = ['÷', '×', '−', '+'];

type Operator = '÷' | '×' | '−' | '+' | null;

export default function BasicCalculator() {
  const [display, setDisplay] = useState('0');
  const [prevValue, setPrevValue] = useState<number | null>(null);
  const [operator, setOperator] = useState<Operator>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

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

  const handleOperator = (op: Operator) => {
    const current = parseFloat(display);
    if (prevValue !== null && !waitingForOperand) {
      const result = calculate(prevValue, current, operator);
      setDisplay(String(result));
      setPrevValue(result);
    } else {
      setPrevValue(current);
    }
    setOperator(op);
    setWaitingForOperand(true);
  };

  const calculate = (a: number, b: number, op: Operator): number => {
    switch (op) {
      case '+': return a + b;
      case '−': return a - b;
      case '×': return a * b;
      case '÷': return b !== 0 ? a / b : 0;
      default: return b;
    }
  };

  const handleEquals = () => {
    if (prevValue === null || operator === null) return;
    const current = parseFloat(display);
    const result = calculate(prevValue, current, operator);
    const resultStr = Number.isInteger(result)
      ? String(result)
      : parseFloat(result.toFixed(10)).toString();
    setDisplay(resultStr);
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

  const handleSign = () => {
    setDisplay(String(parseFloat(display) * -1));
  };

  const handlePercent = () => {
    setDisplay(String(parseFloat(display) / 100));
  };

  const handleBackspace = () => {
    if (display.length > 1) setDisplay(display.slice(0, -1));
    else setDisplay('0');
  };

  const handlePress = (btn: string) => {
    if (btn >= '0' && btn <= '9') return handleNumber(btn);
    if (btn === '.') return handleDecimal();
    if (OPERATORS.includes(btn)) return handleOperator(btn as Operator);
    if (btn === '=') return handleEquals();
    if (btn === 'C') return handleClear();
    if (btn === '±') return handleSign();
    if (btn === '%') return handlePercent();
    if (btn === '⌫') return handleBackspace();
  };

  const isOperatorActive = (btn: string) => OPERATORS.includes(btn) && btn === operator && waitingForOperand;

  const getButtonStyle = (btn: string) => {
    if (btn === '=') return [styles.btn, styles.btnEquals];
    if (OPERATORS.includes(btn)) return [styles.btn, styles.btnOperator, isOperatorActive(btn) && styles.btnOperatorActive];
    if (['C', '±', '%'].includes(btn)) return [styles.btn, styles.btnFunction];
    return [styles.btn, styles.btnNumber];
  };

  const getTextStyle = (btn: string) => {
    if (['C', '±', '%'].includes(btn)) return [styles.btnText, styles.btnTextFunction];
    return styles.btnText;
  };

  const fontSize = display.length > 9 ? 36 : display.length > 6 ? 48 : 64;

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: '基本計算機' }} />

      <View style={styles.displayArea}>
        {operator && prevValue !== null && (
          <Text style={styles.expression}>
            {prevValue} {operator}
          </Text>
        )}
        <Text style={[styles.display, { fontSize }]} numberOfLines={1} adjustsFontSizeToFit>
          {display}
        </Text>
      </View>

      <View style={styles.buttons}>
        {BUTTONS.map((row, ri) => (
          <View key={ri} style={styles.row}>
            {row.map((btn) => (
              <TouchableOpacity
                key={btn}
                style={getButtonStyle(btn)}
                onPress={() => handlePress(btn)}
                activeOpacity={0.7}
              >
                <Text style={getTextStyle(btn)}>{btn}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  displayArea: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  expression: {
    fontSize: 20,
    color: '#8892b0',
    marginBottom: 4,
  },
  display: {
    color: '#fff',
    fontWeight: '300',
  },
  buttons: {
    padding: 12,
    gap: 10,
    paddingBottom: 32,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  btn: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnNumber: {
    backgroundColor: '#16213e',
  },
  btnOperator: {
    backgroundColor: '#e67e22',
  },
  btnOperatorActive: {
    backgroundColor: '#fff',
  },
  btnEquals: {
    backgroundColor: '#e67e22',
  },
  btnFunction: {
    backgroundColor: '#2c3e50',
  },
  btnText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: '500',
  },
  btnTextFunction: {
    color: '#ecf0f1',
  },
});
