import { useRouter } from 'expo-router';
import { CaretRight, Sparkle } from 'phosphor-react-native';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CategoryIcon } from '../components/CategoryIcon';
import { CATEGORIES } from '../data/categories';

export default function HomeScreen() {
  const router = useRouter();
  const go = (id: string) => router.push(`/category/${id}` as any);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.greetRow}>
          <Sparkle size={20} color="#ffb84d" weight="fill" />
          <Text style={styles.greet}>嗨！</Text>
        </View>
        <Text style={styles.title}>挑一個工具吧</Text>
        <Text style={styles.subtitle}>有 5 種類型，全部都很好用</Text>
      </View>

      <View style={styles.list}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={styles.row}
            onPress={() => go(cat.id)}
            activeOpacity={0.8}
          >
            <View style={[styles.iconBox, { backgroundColor: cat.bg }]}>
              <CategoryIcon id={cat.id} size={28} color={cat.accent} weight="fill" />
            </View>

            <View style={styles.rowMid}>
              <Text style={styles.rowTitle}>{cat.title}</Text>
              <View style={styles.rowMetaWrap}>
                <Text style={[styles.rowMetaEn, { color: cat.accent }]}>{cat.nameEn}</Text>
                <View style={[styles.dot, { backgroundColor: cat.accent }]} />
                <Text style={styles.rowMetaCount}>{cat.calculators.length} 個工具</Text>
              </View>
            </View>

            <CaretRight size={20} color="#a3897a" weight="bold" />
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
    paddingTop: 56,
    paddingBottom: 48,
  },
  header: {
    paddingHorizontal: 4,
    marginBottom: 28,
  },
  greetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 4,
  },
  greet: {
    fontFamily: 'Fredoka_500Medium',
    fontSize: 16,
    color: '#8a7a6c',
  },
  title: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 38,
    color: '#2d2520',
    letterSpacing: -0.5,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Fredoka_400Regular',
    fontSize: 15,
    color: '#8a7a6c',
    textAlign: 'center',
  },
  list: {
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 16,
    gap: 16,
    shadowColor: '#a3897a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  iconBox: {
    width: 58,
    height: 58,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowMid: {
    flex: 1,
  },
  rowTitle: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 22,
    color: '#2d2520',
    letterSpacing: -0.3,
    marginBottom: 3,
  },
  rowMetaWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rowMetaEn: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 11,
    letterSpacing: 1.5,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    opacity: 0.5,
  },
  rowMetaCount: {
    fontFamily: 'Fredoka_500Medium',
    fontSize: 13,
    color: '#8a7a6c',
  },
});
