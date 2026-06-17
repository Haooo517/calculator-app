import {
  Fredoka_400Regular,
  Fredoka_500Medium,
  Fredoka_600SemiBold,
  Fredoka_700Bold,
} from '@expo-google-fonts/fredoka';
import { Caveat_700Bold } from '@expo-google-fonts/caveat';
import { Fraunces_700Bold } from '@expo-google-fonts/fraunces';
import { MaShanZheng_400Regular } from '@expo-google-fonts/ma-shan-zheng';
import { NotoSansTC_500Medium, NotoSansTC_700Bold } from '@expo-google-fonts/noto-sans-tc';
import { PixelifySans_700Bold } from '@expo-google-fonts/pixelify-sans';
import { PressStart2P_400Regular } from '@expo-google-fonts/press-start-2p';
import { ShareTechMono_400Regular } from '@expo-google-fonts/share-tech-mono';
import { SpaceMono_700Bold } from '@expo-google-fonts/space-mono';
import { VT323_400Regular } from '@expo-google-fonts/vt323';
import { ZCOOLKuaiLe_400Regular } from '@expo-google-fonts/zcool-kuaile';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BackButton } from '../components/BackButton';
import { ThemeProvider, useTheme } from '../lib/theme';

// 自訂 header：純 RN 元件，取代原生 header，避開 iOS 26 對返回鈕加的 liquid glass 玻璃框
function CustomHeader({ title, canGoBack }: { title?: string; canGoBack: boolean }) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ backgroundColor: theme.bg, paddingTop: insets.top }}>
      <View style={styles.headerRow}>
        <View style={styles.headerSide}>{canGoBack ? <BackButton /> : null}</View>
        <Text
          numberOfLines={1}
          style={[
            styles.headerTitle,
            { color: theme.text, fontFamily: theme.font?.display ?? 'Fredoka_700Bold' },
          ]}
        >
          {title ?? ''}
        </Text>
        <View style={styles.headerSide} />
      </View>
    </View>
  );
}

function StackWithTheme() {
  const { theme } = useTheme();
  return (
    <>
      <StatusBar style={theme.isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          header: ({ options, back }) => (
            <CustomHeader title={options.title} canGoBack={!!back} />
          ),
          contentStyle: { backgroundColor: theme.bg },
        }}
      />
    </>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({
    Fredoka_400Regular,
    Fredoka_500Medium,
    Fredoka_600SemiBold,
    Fredoka_700Bold,
    PressStart2P_400Regular,
    PixelifySans_700Bold,
    ShareTechMono_400Regular,
    SpaceMono_700Bold,
    Fraunces_700Bold,
    VT323_400Regular,
    Caveat_700Bold,
    ZCOOLKuaiLe_400Regular,
    MaShanZheng_400Regular,
    NotoSansTC_500Medium,
    NotoSansTC_700Bold,
  });

  if (!loaded) return <View style={{ flex: 1, backgroundColor: '#fff8ed' }} />;

  return (
    <ThemeProvider>
      <StackWithTheme />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  headerSide: {
    width: 44,
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    letterSpacing: -0.2,
  },
});
