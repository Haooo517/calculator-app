import { Stack, useRouter } from 'expo-router';
import { CaretRight } from 'phosphor-react-native';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CategoryIcon } from '../components/CategoryIcon';
import { LCDScreen } from '../components/LCDScreen';
import { CATEGORIES } from '../data/categories';
import { usePins } from '../lib/pins';

export default function HomeScreen() {
  const router = useRouter();
  const { pins } = usePins();
  const go = (id: string) => router.push(`/category/${id}` as any);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ headerShown: false }} />
      <LCDScreen />

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
                <Text style={styles.rowMetaCount}>
                  {cat.id === 'favorites' ? pins.size : cat.calculators.length} 個工具
                </Text>
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
