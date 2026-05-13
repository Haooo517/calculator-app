import { StyleSheet } from 'react-native';
import Svg, { Circle, Defs, Pattern, Rect } from 'react-native-svg';

type Props = {
  type: 'dots' | 'stripes';
  color: string;
  opacity?: number;
};

export function BackgroundPattern({ type, color, opacity = 0.18 }: Props) {
  return (
    <Svg width="100%" height="100%" style={StyleSheet.absoluteFillObject} pointerEvents="none">
      <Defs>
        {type === 'dots' ? (
          <Pattern id="bg-dots" x={0} y={0} width={26} height={26} patternUnits="userSpaceOnUse">
            <Circle cx={6} cy={6} r={2.4} fill={color} opacity={opacity} />
            <Circle cx={19} cy={19} r={2.4} fill={color} opacity={opacity} />
          </Pattern>
        ) : (
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
        )}
      </Defs>
      <Rect width="100%" height="100%" fill={`url(#bg-${type})`} />
    </Svg>
  );
}
