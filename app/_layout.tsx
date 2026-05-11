import {
  Fraunces_400Regular,
  Fraunces_700Bold,
  useFonts,
} from '@expo-google-fonts/fraunces';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';

export default function RootLayout() {
  const [loaded] = useFonts({
    Fraunces_400Regular,
    Fraunces_700Bold,
  });

  if (!loaded) return <View style={{ flex: 1, backgroundColor: '#0d0d0d' }} />;

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#0d0d0d' },
          headerTintColor: '#f5f1e8',
          headerTitleStyle: { fontFamily: 'Fraunces_700Bold', fontSize: 18 },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: '#0d0d0d' },
        }}
      />
    </>
  );
}
