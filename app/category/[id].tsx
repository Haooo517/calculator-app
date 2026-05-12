import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { CaretRight, Lock, PushPin } from 'phosphor-react-native';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CategoryIcon } from '../../components/CategoryIcon';
import { Calculator, getCategoryById } from '../../data/categories';
import { getPinnedCalculators, usePins } from '../../lib/pins';

export default function CategoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const category = getCategoryById(id);
  const { pins, toggle, isPinned } = usePins();

  if (!category) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: '' }} />
        <Text style={styles.notFound}>找不到這個分類</Text>
      </View>
    );
  }

  const isFavorites = category.id === 'favorites';
  const calculators: Calculator[] = isFavorites
    ? getPinnedCalculators(pins)
    : category.calculators;

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

      {calculators.length === 0 ? (
        <View style={styles.empty}>
          <PushPin size={36} color="#c8b8a8" weight="duotone" />
          <Text style={styles.emptyTitle}>還沒釘選任何工具</Text>
          <Text style={styles.emptySub}>到其他分類點 📌 圖示就會出現在這裡</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {calculators.map((calc) => {
            const pinned = isPinned(calc.id);
            return (
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
                {!calc.comingSoon && (
                  <TouchableOpacity
                    onPress={() => toggle(calc.id)}
                    style={styles.pinBtn}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <PushPin
                      size={18}
                      color={pinned ? category.accent : '#c8b8a8'}
                      weight={pinned ? 'fill' : 'regular'}
                    />
                  </TouchableOpacity>
                )}
                {calc.comingSoon ? (
                  <Lock size={18} color="#a3897a" weight="duotone" />
                ) : (
                  <CaretRight size={20} color={category.accent} weight="bold" />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      )}
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
    alignItems: 'center',
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
    textAlign: 'center',
  },
  heroSubtitle: {
    fontFamily: 'Fredoka_400Regular',
    fontSize: 14,
    opacity: 0.85,
    lineHeight: 20,
    textAlign: 'center',
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
  pinBtn: {
    padding: 4,
  },
  empty: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 36,
    alignItems: 'center',
    gap: 10,
    borderWidth: 2,
    borderColor: '#f1e3d0',
    borderStyle: 'dashed',
  },
  emptyTitle: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 16,
    color: '#2d2520',
    marginTop: 4,
  },
  emptySub: {
    fontFamily: 'Fredoka_400Regular',
    fontSize: 13,
    color: '#8a7a6c',
    textAlign: 'center',
  },
  notFound: {
    color: '#2d2520',
    textAlign: 'center',
    marginTop: 100,
    fontSize: 18,
    fontFamily: 'Fredoka_500Medium',
  },
});
