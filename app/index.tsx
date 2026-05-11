import { useRouter } from 'expo-router';
import { Sparkle } from 'phosphor-react-native';
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
          <Text style={styles.greet}>嗨！</Text>
          <Sparkle size={28} color="#ffb84d" weight="fill" />
        </View>
        <Text style={styles.title}>挑一個工具吧</Text>
        <Text style={styles.subtitle}>有 6 種類型，全部都很好用 ✿</Text>
      </View>

      <View style={styles.grid}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.card, { backgroundColor: cat.bg }]}
            onPress={() => go(cat.id)}
            activeOpacity={0.85}
          >
            <View style={styles.iconWrap}>
              <CategoryIcon id={cat.id} size={42} color={cat.accent} weight="fill" />
            </View>
            <View>
              <Text style={[styles.cardTitle, { color: cat.accent }]}>{cat.title}</Text>
              <Text style={[styles.cardCount, { color: cat.accent }]}>
                {cat.calculators.length} 個工具
              </Text>
            </View>
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
    marginBottom: 24,
  },
  greetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  greet: {
    fontFamily: 'Fredoka_500Medium',
    fontSize: 18,
    color: '#8a7a6c',
  },
  title: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 38,
    color: '#2d2520',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Fredoka_400Regular',
    fontSize: 15,
    color: '#8a7a6c',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  card: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 28,
    padding: 20,
    justifyContent: 'space-between',
    shadowColor: '#a3897a',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 24,
    letterSpacing: -0.3,
    marginBottom: 2,
  },
  cardCount: {
    fontFamily: 'Fredoka_500Medium',
    fontSize: 13,
    opacity: 0.75,
  },
});
