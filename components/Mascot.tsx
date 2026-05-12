import { useEffect, useRef } from 'react';
import { Animated, Easing, ImageStyle, StyleProp } from 'react-native';

export type MascotExpression = 'default';

const SOURCES: Record<MascotExpression, any> = {
  default: require('../assets/allcu/default.png'),
};

type Props = {
  expression?: MascotExpression;
  size?: number;
  style?: StyleProp<ImageStyle>;
  bob?: boolean;
};

export function Mascot({ expression = 'default', size = 32, style, bob = true }: Props) {
  const bobAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!bob) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bobAnim, {
          toValue: 1,
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(bobAnim, {
          toValue: 0,
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [bob, bobAnim]);

  const translateY = bobAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -3] });

  return (
    <Animated.Image
      source={SOURCES[expression]}
      style={[{ width: size, height: size, transform: [{ translateY }] }, style]}
      resizeMode="contain"
    />
  );
}
