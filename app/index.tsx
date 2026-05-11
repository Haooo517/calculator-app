import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CategoryIcon, IconStyle } from '../components/CategoryIcon';
import { CATEGORIES } from '../data/categories';

const STYLES: { id: IconStyle; label: string }[] = [
  { id: 'emoji', label: 'Emoji' },
  { id: 'lucide', label: 'Lucide' },
  { id: 'phosphor', label: 'Phosphor' },
];

export default function HomeScreen() {
  const router = useRouter();
  const [iconStyle, setIconStyle] = useState<IconStyle>('lucide');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>計算機集合</Text>
        <Text style={styles.subtitle}>選擇分類</Text>
      </View>

      <View style={styles.switcher}>
        {STYLES.map((s) => (
          <TouchableOpacity
            key={s.id}
            style={[styles.switchBtn, iconStyle === s.id && styles.switchBtnActive]}
            onPress={() => setIconStyle(s.id)}
          >
            <Text style={[styles.switchText, iconStyle === s.id && styles.switchTextActive]}>
              {s.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.grid}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.card, { backgroundColor: cat.color }]}
            onPress={() => router.push(`/category/${cat.id}` as any)}
            activeOpacity={0.8}
          >
            <CategoryIcon categoryId={cat.id} style={iconStyle} size={44} />
            <View>
              <Text style={styles.cardTitle}>{cat.title}</Text>
              <Text style={styles.cardSubtitle}>{cat.subtitle}</Text>
              <Text style={styles.cardCount}>{cat.calculators.length} 個工具</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#8892b0',
  },
  switcher: {
    flexDirection: 'row',
    marginHorizontal: 24,
    marginBottom: 12,
    backgroundColor: '#0f1729',
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  switchBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  switchBtnActive: {
    backgroundColor: '#e67e22',
  },
  switchText: {
    color: '#8892b0',
    fontSize: 13,
    fontWeight: '600',
  },
  switchTextActive: {
    color: '#fff',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    gap: 12,
  },
  card: {
    width: '47%',
    aspectRatio: 1,
    borderRadius: 20,
    padding: 20,
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 6,
  },
  cardCount: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '600',
  },
});
