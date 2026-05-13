import { StyleSheet } from 'react-native';
import Svg, { Circle, Defs, Pattern, Rect } from 'react-native-svg';

type Props = {
  type: 'dots' | 'stripes' | 'candy';
  color: string;
  color2?: string;
  opacity?: number;
};

export function BackgroundPattern({ type, color, color2, opacity = 0.18 }: Props) {
  return (
    <Svg width="100%" height="100%" style={StyleSheet.absoluteFillObject} pointerEvents="none">
      <Defs>
        {type === 'dots' ? (
          <Pattern id="bg-dots" x={0} y={0} width={26} height={26} patternUnits="userSpaceOnUse">
            <Circle cx={6} cy={6} r={2.4} fill={color} opacity={opacity} />
            <Circle cx={19} cy={19} r={2.4} fill={color} opacity={opacity} />
          </Pattern>
        ) : type === 'stripes' ? (
          <Pattern
            id="bg-stripes"
            x={0}
            y={0}
            width={18}
            height={18}
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <Rect width={6} height={18} fill={color} opacity={opacity} />
          </Pattern>
        ) : (
          // candy cane: 兩色交錯斜紋
          <Pattern
            id="bg-candy"
            x={0}
            y={0}
            width={16}
            height={16}
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(35)"
          >
            <Rect width={16} height={16} fill={color2 ?? '#ffffff'} opacity={opacity * 2.5} />
            <Rect x={0} y={0} width={8} height={16} fill={color} opacity={opacity * 3.5} />
          </Pattern>
        )}
      </Defs>
      <Rect width="100%" height="100%" fill={`url(#bg-${type})`} />
    </Svg>
  );
}
