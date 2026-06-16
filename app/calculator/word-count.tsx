import { Stack } from 'expo-router';
import { Eraser } from 'phosphor-react-native';
import { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { FocusInput } from '../../components/FocusInput';
import { Mascot } from '../../components/Mascot';
import { haptics } from '../../lib/haptics';
import { useTheme } from '../../lib/theme';

const EDU_BG = '#e0c890';
const EDU_FG = '#786020';

const countStats = (text: string) => {
  const totalChars = text.length;
  const charsNoSpace = text.replace(/\s/g, '').length;
  const cjkChars = (text.match(/[一-鿿]/g) ?? []).length;
  const englishWords = (text.match(/[a-zA-Z]+(?:'[a-zA-Z]+)?/g) ?? []).length;
  const lines = text.length === 0 ? 0 : text.split('\n').length;

  let paragraphs = 0;
  let inParagraph = false;
  for (const line of text.split('\n')) {
    if (line.trim().length > 0) {
      if (!inParagraph) {
        paragraphs += 1;
        inParagraph = true;
      }
    } else {
      inParagraph = false;
    }
  }

  return { totalChars, charsNoSpace, cjkChars, englishWords, lines, paragraphs };
};

export default function WordCountCalculator() {
  const { theme } = useTheme();
  const [text, setText] = useState('');

  const stats = useMemo(() => countStats(text), [text]);
  const hasText = text.length > 0;

  const clearAll = () => {
    haptics.warning();
    setText('');
  };

  const items = [
    { label: '總字元（含空白）', value: stats.totalChars },
    { label: '總字元（不含空白）', value: stats.charsNoSpace },
    { label: '中文字數', value: stats.cjkChars },
    { label: '英文單字數', value: stats.englishWords },
    { label: '行數', value: stats.lines },
    { label: '段落數', value: stats.paragraphs },
  ];

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen options={{ title: '字數統計' }} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={[styles.title, { color: theme.text }]}>字數統計</Text>
        <Text style={[styles.subtitle, { color: theme.textMuted }]}>貼上或打字，邊打邊幫你數</Text>

        <View style={[styles.inputCard, { backgroundColor: theme.cardBg }]}>
          <FocusInput
            style={[styles.textArea, { color: theme.text }]}
            value={text}
            onChangeText={setText}
            placeholder="在這裡輸入或貼上文字…"
            placeholderTextColor={theme.hint}
            multiline
            textAlignVertical="top"
          />
        </View>

        <View style={[styles.mascotStrip, { backgroundColor: hasText ? EDU_BG : theme.cardBg }]}>
          <Mascot
            expression={hasText ? 'happy' : 'sleepy'}
            color={hasText ? EDU_FG : theme.hint}
            size={40}
          />
          <Text style={[styles.mascotText, { color: hasText ? EDU_FG : theme.hint }]}>
            {hasText ? '算好了，隨打隨更新！' : '等你打點什麼，我來數'}
          </Text>
          {hasText && (
            <TouchableOpacity style={styles.clearBtn} onPress={clearAll} activeOpacity={0.7}>
              <Eraser size={15} color="#c2456a" weight="bold" />
              <Text style={styles.clearBtnText}>全部清空</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.grid}>
          {items.map((item) => (
            <View key={item.label} style={[styles.statCard, { backgroundColor: theme.cardBg }]}>
              <Text style={[styles.statValue, { color: hasText ? EDU_FG : theme.hint }]}>
                {item.value}
              </Text>
              <Text style={[styles.statLabel, { color: theme.textMuted }]}>{item.label}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 60 },
  title: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 32,
    letterSpacing: -0.5,
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Fredoka_400Regular',
    fontSize: 14,
    marginBottom: 22,
    textAlign: 'center',
  },
  inputCard: {
    borderRadius: 24,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#a3897a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  textArea: {
    fontFamily: 'Fredoka_400Regular',
    fontSize: 16,
    height: 160,
    padding: 0,
    lineHeight: 24,
  },
  mascotStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
    shadowColor: '#a3897a',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  mascotText: {
    flex: 1,
    fontFamily: 'Fredoka_500Medium',
    fontSize: 14,
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  clearBtnText: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 12,
    color: '#c2456a',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCard: {
    width: '48%',
    flexGrow: 1,
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 14,
    alignItems: 'center',
    gap: 2,
    shadowColor: '#a3897a',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  statValue: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 30,
    letterSpacing: -1,
  },
  statLabel: {
    fontFamily: 'Fredoka_500Medium',
    fontSize: 12,
  },
});
