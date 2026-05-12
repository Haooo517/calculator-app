import { useRouter } from 'expo-router';
import { CaretLeft } from 'phosphor-react-native';
import { TouchableOpacity } from 'react-native';

export function BackButton() {
  const router = useRouter();
  return (
    <TouchableOpacity
      onPress={() => router.back()}
      style={{ padding: 6, marginLeft: -4 }}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <CaretLeft size={22} color="#2d2520" weight="bold" />
    </TouchableOpacity>
  );
}
