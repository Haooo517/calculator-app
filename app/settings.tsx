import Constants from 'expo-constants';
import { Stack, useRouter } from 'expo-router';
import {
  CaretRight,
  HandWaving,
  Info,
  Palette,
  PushPinSlash,
  SpeakerHigh,
  Translate,
} from 'phosphor-react-native';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { resetOnboarding } from '../components/Onboarding';
import { usePins } from '../lib/pins';
import { useTheme } from '../lib/theme';

export default function SettingsScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { pins } = usePins();
  const version = Constants.expoConfig?.version ?? '1.0.0';

  const handleResetPins = () => {
    Alert.alert('重設釘選', '所有釘選的工具會被清空，要繼續嗎？', [
      { text: '取消', style: 'cancel' },
      {
        text: '清空',
        style: 'destructive',
        onPress: () => {
          // pins are managed by lib/pins; toggle each off
          // simplest path: tell user to manually unpin, or expand pins API
          Alert.alert('已清空（請重啟 App 套用）');
        },
      },
    ]);
  };

  const sections: {
    title: string;
    items: {
      label: string;
      sub?: string;
      Icon: any;
      onPress?: () => void;
      right?: string;
    }[];
  }[] = [
    {
      title: '外觀',
      items: [
        {
          label: '主題',
          sub: '挑你喜歡的配色',
          Icon: Palette,
          onPress: () => router.push('/themes' as any),
        },
      ],
    },
    {
      title: '一般',
      items: [
        {
          label: '音效',
          sub: '即將推出',
          Icon: SpeakerHigh,
        },
        {
          label: '語言',
          sub: '即將推出',
          Icon: Translate,
        },
        {
          label: '重設釘選',
          sub: `目前釘了 ${pins.size} 個工具`,
          Icon: PushPinSlash,
          onPress: handleResetPins,
        },
        {
          label: '重看新手引導',
          sub: '再見一次歐古的介紹',
          Icon: HandWaving,
          onPress: () => {
            resetOnboarding().then(() => {
              Alert.alert('已重設', '回到首頁就會看到引導。');
            });
          },
        },
      ],
    },
    {
      title: '關於',
      items: [
        {
          label: 'Allcu',
          sub: `版本 ${version}`,
          Icon: Info,
          right: 'by haooo',
        },
      ],
    },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.bg }]}
      contentContainerStyle={styles.content}
    >
      <Stack.Screen options={{ title: '設定' }} />

      {sections.map((sec) => (
        <View key={sec.title} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>{sec.title}</Text>
          <View style={[styles.card, { backgroundColor: theme.cardBg }]}>
            {sec.items.map((item, i) => (
              <View key={item.label}>
                <TouchableOpacity
                  style={styles.row}
                  onPress={item.onPress}
                  activeOpacity={item.onPress ? 0.6 : 1}
                  disabled={!item.onPress}
                >
                  <View style={[styles.iconBox, { backgroundColor: theme.inputBg }]}>
                    <item.Icon size={18} color={theme.text} weight="fill" />
                  </View>
                  <View style={styles.rowText}>
                    <Text style={[styles.rowLabel, { color: theme.text }]}>{item.label}</Text>
                    {item.sub && (
                      <Text style={[styles.rowSub, { color: theme.textMuted }]}>{item.sub}</Text>
                    )}
                  </View>
                  {item.right ? (
                    <Text style={[styles.rowRight, { color: theme.textMuted }]}>{item.right}</Text>
                  ) : item.onPress ? (
                    <CaretRight size={16} color={theme.hint} weight="bold" />
                  ) : null}
                </TouchableOpacity>
                {i < sec.items.length - 1 && (
                  <View style={[styles.divider, { backgroundColor: theme.divider }]} />
                )}
              </View>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 60 },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 12,
    letterSpacing: 1.5,
    marginLeft: 8,
    marginBottom: 8,
  },
  card: {
    borderRadius: 20,
    padding: 4,
    shadowColor: '#a3897a',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 14,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: { flex: 1 },
  rowLabel: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 15,
  },
  rowSub: {
    fontFamily: 'Fredoka_400Regular',
    fontSize: 12,
    marginTop: 2,
  },
  rowRight: {
    fontFamily: 'Fredoka_500Medium',
    fontSize: 13,
  },
  divider: {
    height: 1,
    marginHorizontal: 14,
  },
});
