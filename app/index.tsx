import { Stack, useRouter } from 'expo-router';
import { CaretRight, GearSix } from 'phosphor-react-native';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CategoryIcon } from '../components/CategoryIcon';
import { LCDScreen } from '../components/LCDScreen';
import { Onboarding } from '../components/Onboarding';
import { CATEGORIES } from '../data/categories';
import { usePins } from '../lib/pins';
import { categoryColors, useTheme } from '../lib/theme';

export default function HomeScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { pins } = usePins();
  const go = (id: string) => router.push(`/category/${id}` as any);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.bg }]}
      contentContainerStyle={styles.content}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <Onboarding />

      <View style={styles.topBar}>
        <TouchableOpacity
          style={[styles.iconBtn, { backgroundColor: theme.cardBg }]}
          onPress={() => router.push('/settings' as any)}
          activeOpacity={0.7}
        >
          <GearSix size={20} color={theme.text} weight="fill" />
        </TouchableOpacity>
      </View>

      <LCDScreen />

      <View style={styles.list}>
        {CATEGORIES.map((cat) => {
          const colors = categoryColors(theme, cat.id, { bg: cat.bg, accent: cat.accent });
          return (
            <TouchableOpacity
              key={cat.id}
              style={[styles.row, { backgroundColor: theme.cardBg, borderRadius: theme.radius }]}
              onPress={() => go(cat.id)}
              activeOpacity={0.8}
            >
              <View style={[styles.iconBox, { backgroundColor: colors.bg, borderRadius: theme.radius * 0.85 }]}>
                <CategoryIcon id={cat.id} size={28} color={colors.accent} weight="fill" />
              </View>

              <View style={styles.rowMid}>
                <Text style={[styles.rowTitle, { color: theme.text }]}>{cat.title}</Text>
                <View style={styles.rowMetaWrap}>
                  <Text
                    style={[
                      styles.rowMetaEn,
                      {
                        color: colors.accent,
                        fontFamily: theme.font?.display ?? 'Fredoka_600SemiBold',
                      },
                    ]}
                  >
                    {cat.nameEn}
                  </Text>
                  <View style={[styles.dot, { backgroundColor: colors.accent }]} />
                  <Text style={[styles.rowMetaCount, { color: theme.textMuted }]}>
                    {cat.id === 'favorites' ? pins.size : cat.calculators.length} 個工具
                  </Text>
                </View>
              </View>

              <CaretRight size={20} color={theme.hint} weight="bold" />
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 56,
    paddingBottom: 48,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 10,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#a3897a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  list: {
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
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
  },
});
