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
import { View } from 'react-native';
import { BackButton } from '../components/BackButton';
import { ThemeProvider, useTheme } from '../lib/theme';

function StackWithTheme() {
  const { theme } = useTheme();
  return (
    <>
      <StatusBar style={theme.isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: theme.bg },
          headerTintColor: theme.text,
          headerTitleStyle: { fontFamily: 'Fredoka_700Bold', fontSize: 20, color: theme.text },
          headerTitleAlign: 'center',
          headerShadowVisible: false,
          headerBackVisible: false, // 關掉 iOS 預設的玻璃圓框
          headerLeft: ({ canGoBack }) => (canGoBack ? <BackButton /> : null),
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
