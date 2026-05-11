import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { CaretRight, Lock } from 'phosphor-react-native';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CategoryIcon } from '../../components/CategoryIcon';
import { getCategoryById } from '../../data/categories';

export default function CategoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const category = getCategoryById(id);

  if (!category) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: '' }} />
        <Text style={styles.notFound}>找不到這個分類</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: category.title, headerTransparent: true }} />

      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.indexNum}>SECTION</Text>
            <Text style={[styles.indexEn, { color: category.accent }]}>{category.nameEn}</Text>
          </View>
          <CategoryIcon id={category.id} size={40} color={category.accent} />
        </View>
        <Text style={styles.title}>{category.title}</Text>
        <Text style={styles.subtitle}>{category.subtitle}</Text>
        <View style={[styles.accentBar, { backgroundColor: category.accent }]} />
      </View>

      <View style={styles.list}>
        {category.calculators.map((calc, i) => (
          <TouchableOpacity
            key={calc.id}
            style={[styles.row, calc.comingSoon && styles.rowDisabled]}
            onPress={() => calc.route && router.push(calc.route as any)}
            activeOpacity={calc.comingSoon ? 1 : 0.6}
          >
            <Text style={styles.rowNum}>{String(i + 1).padStart(2, '0')}</Text>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>{calc.title}</Text>
              <Text style={styles.rowSub}>{calc.subtitle}</Text>
            </View>
            {calc.comingSoon ? (
              <Lock size={18} color="#807868" weight="duotone" />
            ) : (
              <CaretRight size={20} color={category.accent} weight="bold" />
            )}
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>· {category.calculators.length} TOOLS ·</Text>
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
    paddingBottom: 60,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 110,
    paddingBottom: 36,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  indexNum: {
    fontFamily: 'Fraunces_400Regular',
    fontSize: 11,
    color: C.textMuted,
    letterSpacing: 2.5,
    marginBottom: 4,
  },
  indexEn: {
    fontSize: 12,
    letterSpacing: 3,
    fontWeight: '700',
  },
  title: {
    fontFamily: 'Fraunces_700Bold',
    fontSize: 56,
    color: C.text,
    letterSpacing: -2,
    lineHeight: 60,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: C.textMuted,
    lineHeight: 22,
    marginBottom: 22,
  },
  accentBar: {
    height: 3,
    width: 48,
    borderRadius: 2,
  },
  list: {
    paddingHorizontal: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 22,
    borderTopWidth: 1,
    borderTopColor: C.border,
    gap: 18,
  },
  rowDisabled: {
    opacity: 0.4,
  },
  rowNum: {
    fontFamily: 'Fraunces_400Regular',
    fontSize: 14,
    color: C.textMuted,
    width: 24,
    letterSpacing: 1,
  },
  rowText: {
    flex: 1,
  },
  rowTitle: {
    fontFamily: 'Fraunces_700Bold',
    fontSize: 22,
    color: C.text,
    letterSpacing: -0.5,
    marginBottom: 2,
  },
  rowSub: {
    fontSize: 13,
    color: C.textMuted,
  },
  footer: {
    alignItems: 'center',
    marginTop: 28,
    paddingHorizontal: 24,
  },
  footerText: {
    fontSize: 10,
    color: C.textMuted,
    letterSpacing: 4,
    fontWeight: '700',
  },
  notFound: {
    color: C.text,
    textAlign: 'center',
    marginTop: 100,
    fontSize: 18,
  },
});
