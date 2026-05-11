import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getCategoryById } from '../../data/categories';

export default function CategoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const category = getCategoryById(id);

  if (!category) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: '找不到分類' }} />
        <Text style={styles.notFound}>找不到這個分類</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: category.color }]}>
      <Stack.Screen
        options={{
          title: category.title,
          headerStyle: { backgroundColor: category.color },
        }}
      />

      <View style={styles.header}>
        <Text style={styles.headerIcon}>{category.icon}</Text>
        <Text style={styles.headerTitle}>{category.title}</Text>
        <Text style={styles.headerSubtitle}>{category.subtitle}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        {category.calculators.map((calc) => (
          <TouchableOpacity
            key={calc.id}
            style={[styles.item, calc.comingSoon && styles.itemDisabled]}
            onPress={() => calc.route && router.push(calc.route as any)}
            activeOpacity={calc.comingSoon ? 1 : 0.7}
          >
            <Text style={styles.itemIcon}>{calc.icon}</Text>
            <View style={styles.itemText}>
              <Text style={styles.itemTitle}>{calc.title}</Text>
              <Text style={styles.itemSubtitle}>{calc.subtitle}</Text>
            </View>
            {calc.comingSoon ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>即將推出</Text>
              </View>
            ) : (
              <Text style={styles.chevron}>›</Text>
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
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  headerIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  list: {
    padding: 12,
    gap: 10,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 16,
    borderRadius: 16,
    gap: 14,
  },
  itemDisabled: {
    opacity: 0.5,
  },
  itemIcon: {
    fontSize: 28,
    width: 44,
    textAlign: 'center',
  },
  itemText: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  itemSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
  },
  chevron: {
    fontSize: 28,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '300',
  },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
  },
  notFound: {
    color: '#fff',
    textAlign: 'center',
    marginTop: 100,
    fontSize: 18,
  },
});
