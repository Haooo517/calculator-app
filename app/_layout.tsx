import {
  Fredoka_400Regular,
  Fredoka_500Medium,
  Fredoka_600SemiBold,
  Fredoka_700Bold,
} from '@expo-google-fonts/fredoka';
import { Fraunces_700Bold } from '@expo-google-fonts/fraunces';
import { PixelifySans_700Bold } from '@expo-google-fonts/pixelify-sans';
import { PressStart2P_400Regular } from '@expo-google-fonts/press-start-2p';
import { ShareTechMono_400Regular } from '@expo-google-fonts/share-tech-mono';
import { SpaceMono_700Bold } from '@expo-google-fonts/space-mono';
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
          headerBackButtonDisplayMode: 'minimal',
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
  });

  if (!loaded) return <View style={{ flex: 1, backgroundColor: '#fff8ed' }} />;

  return (
    <ThemeProvider>
      <StackWithTheme />
    </ThemeProvider>
  );
}
