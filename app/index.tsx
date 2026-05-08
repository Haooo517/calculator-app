import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native';

const CATEGORIES = [
  {
    id: 'basic',
    title: '基本計算機',
    subtitle: '加減乘除',
    icon: '🔢',
    color: '#16213e',
    route: '/basic',
  },
  {
    id: 'scientific',
    title: '科學計算機',
    subtitle: '三角函數、對數',
    icon: '🧮',
    color: '#0f3460',
    route: '/scientific',
    comingSoon: true,
  },
  {
    id: 'unit',
    title: '單位換算',
    subtitle: '長度、重量、溫度',
    icon: '📏',
    color: '#533483',
    route: '/unit',
    comingSoon: true,
  },
  {
    id: 'finance',
    title: '金融計算機',
    subtitle: '利率、貸款試算',
    icon: '💰',
    color: '#1a5276',
    route: '/finance',
    comingSoon: true,
  },
];

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>計算機集合</Text>
        <Text style={styles.subtitle}>選擇你需要的計算機</Text>
      </View>
      <ScrollView contentContainerStyle={styles.grid}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.card, { backgroundColor: cat.color }]}
            onPress={() => !cat.comingSoon && router.push(cat.route as any)}
            activeOpacity={cat.comingSoon ? 1 : 0.8}
          >
            <Text style={styles.cardIcon}>{cat.icon}</Text>
            <Text style={styles.cardTitle}>{cat.title}</Text>
            <Text style={styles.cardSubtitle}>{cat.subtitle}</Text>
            {cat.comingSoon && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>即將推出</Text>
              </View>
            )}
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
    paddingBottom: 24,
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
    justifyContent: 'flex-end',
    position: 'relative',
    overflow: 'hidden',
  },
  cardIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  },
  badge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
  },
});
