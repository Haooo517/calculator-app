import { Image, ImageStyle, StyleProp } from 'react-native';

export type MascotExpression = 'default';

const SOURCES: Record<MascotExpression, any> = {
  default: require('../assets/allcu/default.png'),
};

type Props = {
  expression?: MascotExpression;
  size?: number;
  style?: StyleProp<ImageStyle>;
};

export function Mascot({ expression = 'default', size = 32, style }: Props) {
  return (
    <Image
      source={SOURCES[expression]}
      style={[{ width: size, height: size }, style]}
      resizeMode="contain"
    />
  );
}
