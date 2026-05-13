import { Stack } from 'expo-router';
import { Check, Lock, Moon, Sun } from 'phosphor-react-native';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ALL_THEMES, Theme, useTheme } from '../lib/theme';

export default function ThemesScreen() {
  const { theme, themeId, setThemeId } = useTheme();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.bg }]}
      contentContainerStyle={styles.content}
    >
      <Stack.Screen options={{ title: '主題' }} />

      <Text style={[styles.title, { color: theme.text }]}>挑一個喜歡的</Text>
      <Text style={[styles.subtitle, { color: theme.textMuted }]}>
        免費的可以隨意切換，付費主題即將開放
      </Text>

      <View style={styles.grid}>
        {ALL_THEMES.map((t) => (
          <ThemeCard
            key={t.id}
            target={t}
            active={t.id === themeId}
            locked={t.isPremium}
            onSelect={() => setThemeId(t.id)}
          />
        ))}
      </View>
    </ScrollView>
  );
}

function ThemeCard({
  target,
  active,
  locked,
  onSelect,
}: {
  target: Theme;
  active: boolean;
  locked: boolean;
  onSelect: () => void;
}) {
  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: target.cardBg,
          borderColor: active ? target.brandColor : 'transparent',
        },
      ]}
      onPress={() => !locked && onSelect()}
      activeOpacity={locked ? 1 : 0.85}
    >
      <View style={[styles.preview, { backgroundColor: target.bg }]}>
        <View style={[styles.previewLcd, { backgroundColor: target.lcdFrame }]}>
          <View
            style={[
              styles.previewScreen,
              { backgroundColor: target.lcdScreen, borderColor: target.lcdBorder },
            ]}
          >
            <Text style={[styles.previewFace, { color: target.lcdText }]}>
              [ · U · ]
            </Text>
          </View>
        </View>
        <View style={styles.previewCards}>
          <View style={[styles.previewCard, { backgroundColor: target.cardBg }]}>
            <View style={[styles.previewDot, { backgroundColor: target.brandColor }]} />
            <View style={[styles.previewBar, { backgroundColor: target.text, opacity: 0.7 }]} />
          </View>
          <View style={[styles.previewCard, { backgroundColor: target.cardBg }]}>
            <View style={[styles.previewDot, { backgroundColor: target.brandColor, opacity: 0.5 }]} />
            <View style={[styles.previewBar, { backgroundColor: target.text, opacity: 0.5 }]} />
          </View>
        </View>
      </View>

      <View style={styles.info}>
        <View style={styles.infoTop}>
          {target.isDark ? (
            <Moon size={14} color={target.text} weight="fill" />
          ) : (
            <Sun size={14} color={target.text} weight="fill" />
          )}
          <Text style={[styles.name, { color: target.text }]} numberOfLines={1}>
            {target.name}
          </Text>
        </View>
        <View style={styles.infoBottom}>
          {locked ? (
            <View style={styles.lockRow}>
              <Lock size={11} color={target.textMuted} weight="duotone" />
              <Text style={[styles.lockText, { color: target.textMuted }]}>即將開放</Text>
            </View>
          ) : active ? (
            <View style={[styles.activeBadge, { backgroundColor: target.brandColor }]}>
              <Check size={11} color="#fff" weight="bold" />
              <Text style={styles.activeText}>使用中</Text>
            </View>
          ) : (
            <Text style={[styles.useText, { color: target.brandColor }]}>輕點套用</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 60 },
  title: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 26,
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Fredoka_400Regular',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 22,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  card: {
    width: '48%',
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 2,
    shadowColor: '#a3897a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  preview: {
    aspectRatio: 1,
    padding: 8,
    gap: 6,
  },
  previewLcd: {
    borderRadius: 10,
    padding: 6,
  },
  previewScreen: {
    borderRadius: 6,
    padding: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 36,
  },
  previewFace: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 13,
    letterSpacing: 1,
  },
  previewCards: {
    flexDirection: 'row',
    gap: 4,
  },
  previewCard: {
    flex: 1,
    borderRadius: 6,
    padding: 5,
    gap: 4,
  },
  previewDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  previewBar: {
    height: 3,
    borderRadius: 2,
  },
  info: {
    padding: 12,
    gap: 6,
  },
  infoTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  name: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 13,
    flex: 1,
  },
  infoBottom: {},
  lockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  lockText: {
    fontFamily: 'Fredoka_500Medium',
    fontSize: 11,
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  activeText: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 10,
    color: '#fff',
    letterSpacing: 0.5,
  },
  useText: {
    fontFamily: 'Fredoka_500Medium',
    fontSize: 11,
  },
});
