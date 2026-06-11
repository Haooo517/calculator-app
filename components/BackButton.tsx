import { useRouter } from 'expo-router';
import { ArrowLeft } from 'phosphor-react-native';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../lib/theme';

export function BackButton() {
  const router = useRouter();
  const { theme } = useTheme();
  return (
    <TouchableOpacity
      onPress={() => router.back()}
      activeOpacity={0.7}
      style={[
        styles.btn,
        { backgroundColor: theme.cardBg, borderRadius: theme.radius * 0.8 },
        theme.cardBorder && {
          borderWidth: theme.cardBorder.width,
          borderColor: theme.cardBorder.color,
        },
      ]}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <ArrowLeft size={18} color={theme.text} weight="bold" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
});
