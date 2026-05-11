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
      <Stack.Screen options={{ title: category.title }} />

      <View style={[styles.hero, { backgroundColor: category.bg }]}>
        <View style={styles.heroIconWrap}>
          <CategoryIcon id={category.id} size={48} color={category.accent} weight="fill" />
        </View>
        <Text style={[styles.heroTitle, { color: category.accent }]}>{category.title}</Text>
        <Text style={[styles.heroSubtitle, { color: category.accent }]}>{category.subtitle}</Text>
      </View>

      <View style={styles.list}>
        {category.calculators.map((calc) => (
          <TouchableOpacity
            key={calc.id}
            style={[styles.row, calc.comingSoon && styles.rowDisabled]}
            onPress={() => calc.route && router.push(calc.route as any)}
            activeOpacity={calc.comingSoon ? 1 : 0.75}
          >
            <View style={[styles.rowDot, { backgroundColor: category.bg }]} />
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>{calc.title}</Text>
              <Text style={styles.rowSub}>{calc.subtitle}</Text>
            </View>
            {calc.comingSoon ? (
              <Lock size={18} color="#a3897a" weight="duotone" />
            ) : (
              <CaretRight size={20} color={category.accent} weight="bold" />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff8ed',
  },
  content: {
    padding: 20,
    paddingBottom: 48,
  },
  hero: {
    borderRadius: 28,
    padding: 24,
    marginBottom: 18,
    shadowColor: '#a3897a',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  heroIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  heroTitle: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 32,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  heroSubtitle: {
    fontFamily: 'Fredoka_400Regular',
    fontSize: 14,
    opacity: 0.85,
    lineHeight: 20,
  },
  list: {
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 18,
    paddingHorizontal: 18,
    borderRadius: 20,
    gap: 14,
    shadowColor: '#a3897a',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  rowDisabled: {
    opacity: 0.55,
  },
  rowDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  rowText: {
    flex: 1,
  },
  rowTitle: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 17,
    color: '#2d2520',
    marginBottom: 2,
  },
  rowSub: {
    fontFamily: 'Fredoka_400Regular',
    fontSize: 13,
    color: '#8a7a6c',
  },
  notFound: {
    color: '#2d2520',
    textAlign: 'center',
    marginTop: 100,
    fontSize: 18,
    fontFamily: 'Fredoka_500Medium',
  },
});
