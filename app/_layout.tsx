import {
  Fredoka_400Regular,
  Fredoka_500Medium,
  Fredoka_600SemiBold,
  Fredoka_700Bold,
  useFonts,
} from '@expo-google-fonts/fredoka';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';

export default function RootLayout() {
  const [loaded] = useFonts({
    Fredoka_400Regular,
    Fredoka_500Medium,
    Fredoka_600SemiBold,
    Fredoka_700Bold,
  });

  if (!loaded) return <View style={{ flex: 1, backgroundColor: '#fff8ed' }} />;

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#fff8ed' },
          headerTintColor: '#2d2520',
          headerTitleStyle: { fontFamily: 'Fredoka_700Bold', fontSize: 20 },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: '#fff8ed' },
        }}
      />
    </>
  );
}
