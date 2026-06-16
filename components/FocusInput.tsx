import { useRef } from 'react';
import { Animated, TextInput, TextInputProps } from 'react-native';
import { useTheme } from '../lib/theme';

const AnimatedInput = Animated.createAnimatedComponent(TextInput);

type Props = TextInputProps & {
  /** 聚焦發光顏色，預設用主題 brandColor */
  glowColor?: string;
};

// 直接取代 <TextInput />：聚焦時輸入框「微放大 + 發光暈」。
// 只動 transform 與 shadow（不影響版面、不位移），所以任何既有 layout 都能安全套用。
export function FocusInput({ glowColor, style, onFocus, onBlur, placeholderTextColor, ...rest }: Props) {
  const { theme } = useTheme();
  const anim = useRef(new Animated.Value(0)).current;
  const accent = glowColor ?? theme.brandColor;

  const to = (v: number) =>
    Animated.spring(anim, { toValue: v, useNativeDriver: false, speed: 18, bounciness: 8 }).start();

  const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.04] });
  const shadowOpacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.55] });

  return (
    <AnimatedInput
      {...rest}
      style={[
        style,
        {
          transform: [{ scale }],
          shadowColor: accent,
          shadowOpacity,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 0 },
        },
      ]}
      placeholderTextColor={placeholderTextColor ?? theme.hint}
      onFocus={(e) => {
        to(1);
        onFocus?.(e);
      }}
      onBlur={(e) => {
        to(0);
        onBlur?.(e);
      }}
    />
  );
}
