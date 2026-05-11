import { useRouter } from 'expo-router';
import LottieView from 'lottie-react-native';
import { ArrowUpRight } from 'phosphor-react-native';
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
  const [hero, ...rest] = CATEGORIES;
  const gridItems = rest.slice(0, 4);
  const last = rest[4];

  const go = (id: string) => router.push(`/category/${id}` as any);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.dateLabel}>{formatDate()}</Text>
      <Text style={styles.title}>計算機.</Text>
      <Text style={styles.subtitle}>六種類型工具，每天都用得到。</Text>

      <TouchableOpacity
        style={styles.hero}
        onPress={() => go(hero.id)}
        activeOpacity={0.85}
      >
        <View style={styles.heroLottie}>
          <LottieView
            source={require('../assets/animations/hero.json')}
            autoPlay
            loop
            style={{ width: 200, height: 200 }}
          />
        </View>
        <View style={styles.heroNumber}>
          <Text style={styles.indexNum}>01</Text>
          <Text style={[styles.indexEn, { color: hero.accent }]}>{hero.nameEn}</Text>
        </View>
        <View style={styles.heroBottom}>
          <Text style={styles.heroTitle}>{hero.title}</Text>
          <Text style={styles.heroDesc}>{hero.subtitle}</Text>
          <View style={styles.heroFooter}>
            <Text style={styles.toolCount}>{hero.calculators.length} TOOLS</Text>
            <ArrowUpRight size={22} color={hero.accent} weight="bold" />
          </View>
        </View>
      </TouchableOpacity>

      <View style={styles.grid}>
        {gridItems.map((cat, i) => (
          <TouchableOpacity
            key={cat.id}
            style={styles.card}
            onPress={() => go(cat.id)}
            activeOpacity={0.85}
          >
            <View style={styles.cardTop}>
              <View>
                <Text style={styles.indexNum}>{String(i + 2).padStart(2, '0')}</Text>
                <Text style={[styles.indexEn, { color: cat.accent }]}>{cat.nameEn}</Text>
              </View>
              <CategoryIcon id={cat.id} size={26} color={cat.accent} />
            </View>
            <View>
              <Text style={styles.cardTitle}>{cat.title}</Text>
              <Text style={styles.toolCount}>{cat.calculators.length} TOOLS</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.card, styles.cardWide]}
        onPress={() => go(last.id)}
        activeOpacity={0.85}
      >
        <View style={styles.cardWideLeft}>
          <Text style={styles.indexNum}>06</Text>
          <Text style={[styles.indexEn, { color: last.accent }]}>{last.nameEn}</Text>
          <Text style={[styles.cardTitle, { marginTop: 6 }]}>{last.title}</Text>
        </View>
        <View style={styles.cardWideRight}>
          <CategoryIcon id={last.id} size={32} color={last.accent} />
          <Text style={[styles.toolCount, { marginTop: 10 }]}>{last.calculators.length} TOOLS</Text>
        </View>
      </TouchableOpacity>

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
  card: '#161614',
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
    marginBottom: 36,
    lineHeight: 22,
  },
  hero: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 28,
    padding: 24,
    marginBottom: 12,
    height: 360,
    overflow: 'hidden',
    position: 'relative',
  },
  heroLottie: {
    position: 'absolute',
    top: -10,
    right: -10,
    opacity: 0.95,
  },
  heroNumber: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 10,
  },
  indexNum: {
    fontFamily: 'Fraunces_400Regular',
    fontSize: 13,
    color: C.textMuted,
    letterSpacing: 2,
  },
  indexEn: {
    fontSize: 11,
    letterSpacing: 3,
    fontWeight: '700',
  },
  heroBottom: {
    marginTop: 'auto',
  },
  heroTitle: {
    fontFamily: 'Fraunces_700Bold',
    fontSize: 48,
    color: C.text,
    letterSpacing: -2,
    marginBottom: 8,
  },
  heroDesc: {
    fontSize: 13,
    color: C.textMuted,
    marginBottom: 18,
    lineHeight: 20,
    maxWidth: '85%',
  },
  heroFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toolCount: {
    fontSize: 10,
    color: C.text,
    letterSpacing: 2.5,
    fontWeight: '700',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  card: {
    width: '48%',
    aspectRatio: 1,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 24,
    padding: 18,
    justifyContent: 'space-between',
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardTitle: {
    fontFamily: 'Fraunces_700Bold',
    fontSize: 26,
    color: C.text,
    letterSpacing: -0.8,
    marginBottom: 4,
  },
  cardWide: {
    width: '100%',
    aspectRatio: undefined,
    padding: 22,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cardWideLeft: {
    flex: 1,
  },
  cardWideRight: {
    alignItems: 'flex-end',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 28,
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
