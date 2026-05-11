import { useRouter } from 'expo-router';
import { CaretRight } from 'phosphor-react-native';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CategoryIcon } from '../components/CategoryIcon';
import { CATEGORIES } from '../data/categories';

const formatDate = () => {
  const d = new Date();
  const m = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  return `${m[d.getMonth()]} ${String(d.getDate()).padStart(2, '0')} · ${d.getFullYear()}`;
};

export default function HomeScreen() {
  const router = useRouter();
  const go = (id: string) => router.push(`/category/${id}` as any);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.dateLabel}>{formatDate()}</Text>
      <Text style={styles.title}>計算機.</Text>
      <Text style={styles.subtitle}>六種類型工具，每天都用得到。</Text>

      <View style={styles.list}>
        {CATEGORIES.map((cat, i) => (
          <TouchableOpacity
            key={cat.id}
            style={styles.row}
            onPress={() => go(cat.id)}
            activeOpacity={0.6}
          >
            <Text style={styles.rowNum}>{String(i + 1).padStart(2, '0')}</Text>

            <View style={styles.rowIcon}>
              <CategoryIcon id={cat.id} size={32} color={cat.accent} />
            </View>

            <View style={styles.rowMid}>
              <Text style={styles.rowTitle}>{cat.title}</Text>
              <View style={styles.rowMetaWrap}>
                <Text style={[styles.rowMetaEn, { color: cat.accent }]}>{cat.nameEn}</Text>
                <Text style={styles.rowMetaDot}>·</Text>
                <Text style={styles.rowMetaCount}>{cat.calculators.length} TOOLS</Text>
              </View>
            </View>

            <CaretRight size={18} color="#807868" weight="bold" />
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.footer}>
        <View style={styles.footerLine} />
        <Text style={styles.footerText}>END</Text>
        <View style={styles.footerLine} />
      </View>
    </ScrollView>
  );
}

const C = {
  bg: '#0d0d0d',
  border: '#2a2826',
  text: '#f5f1e8',
  textMuted: '#807868',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },
  content: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 60,
  },
  dateLabel: {
    fontSize: 11,
    color: C.textMuted,
    letterSpacing: 3,
    fontWeight: '600',
    marginBottom: 24,
  },
  title: {
    fontFamily: 'Fraunces_700Bold',
    fontSize: 64,
    color: C.text,
    letterSpacing: -2,
    lineHeight: 68,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    color: C.textMuted,
    marginBottom: 40,
    lineHeight: 22,
  },
  list: {
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 22,
    borderTopWidth: 1,
    borderTopColor: C.border,
    gap: 16,
  },
  rowNum: {
    fontFamily: 'Fraunces_400Regular',
    fontSize: 14,
    color: C.textMuted,
    width: 26,
    letterSpacing: 1,
  },
  rowIcon: {
    width: 40,
    alignItems: 'center',
  },
  rowMid: {
    flex: 1,
  },
  rowTitle: {
    fontFamily: 'Fraunces_700Bold',
    fontSize: 28,
    color: C.text,
    letterSpacing: -0.8,
    marginBottom: 4,
  },
  rowMetaWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rowMetaEn: {
    fontSize: 11,
    letterSpacing: 2.5,
    fontWeight: '700',
  },
  rowMetaDot: {
    fontSize: 11,
    color: C.textMuted,
  },
  rowMetaCount: {
    fontSize: 10,
    color: C.textMuted,
    letterSpacing: 2,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
    gap: 12,
  },
  footerLine: {
    flex: 1,
    height: 1,
    backgroundColor: C.border,
  },
  footerText: {
    fontSize: 10,
    color: C.textMuted,
    letterSpacing: 4,
    fontWeight: '700',
  },
});
