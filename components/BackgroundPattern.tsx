import { StyleSheet } from 'react-native';
import Svg, { Circle, Defs, Path, Pattern, Rect } from 'react-native-svg';

export type PatternType = 'dots' | 'stripes' | 'candy' | 'grid' | 'waves' | 'sparkle';

type Props = {
  type: PatternType;
  color: string;
  color2?: string;
  opacity?: number;
};

export function BackgroundPattern({ type, color, color2, opacity = 0.18 }: Props) {
  const id = `bg-${type}`;
  return (
    <Svg width="100%" height="100%" style={StyleSheet.absoluteFillObject} pointerEvents="none">
      <Defs>
        {type === 'dots' && (
          <Pattern id={id} x={0} y={0} width={26} height={26} patternUnits="userSpaceOnUse">
            <Circle cx={6} cy={6} r={2.4} fill={color} opacity={opacity} />
            <Circle cx={19} cy={19} r={2.4} fill={color} opacity={opacity} />
          </Pattern>
        )}

        {type === 'stripes' && (
          <Pattern
            id={id}
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

        {/* 數位網格：細十字線（賽博龐克） */}
        {type === 'grid' && (
          <Pattern id={id} x={0} y={0} width={24} height={24} patternUnits="userSpaceOnUse">
            <Path d="M24 0 H0 V24" stroke={color} strokeWidth={1} fill="none" opacity={opacity} />
          </Pattern>
        )}

        {/* 水波：連續正弦線（水族館） */}
        {type === 'waves' && (
          <Pattern id={id} x={0} y={0} width={44} height={20} patternUnits="userSpaceOnUse">
            <Path
              d="M0 10 Q 11 2 22 10 T 44 10"
              stroke={color}
              strokeWidth={1.6}
              fill="none"
              opacity={opacity}
            />
          </Pattern>
        )}

        {/* 星塵：大小兩顆四角星交錯（魔法） */}
        {type === 'sparkle' && (
          <Pattern id={id} x={0} y={0} width={48} height={48} patternUnits="userSpaceOnUse">
            <Path
              d="M12 3 C12.7 9.3 14.7 11.3 21 12 C14.7 12.7 12.7 14.7 12 21 C11.3 14.7 9.3 12.7 3 12 C9.3 11.3 11.3 9.3 12 3 Z"
              fill={color}
              opacity={opacity}
            />
            <Path
              d="M36 28 C36.4 31.6 37.4 32.6 41 33 C37.4 33.4 36.4 34.4 36 38 C35.6 34.4 34.6 33.4 31 33 C34.6 32.6 35.6 31.6 36 28 Z"
              fill={color}
              opacity={opacity * 0.7}
            />
          </Pattern>
        )}

        {/* 拐杖糖斜紋：白底另外全覆蓋（見下），這裡只畫斜的紅線 */}
        {type === 'candy' && (
          <Pattern
            id={id}
            x={0}
            y={0}
            width={20}
            height={20}
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <Rect x={0} y={0} width={4} height={20} fill={color} opacity={opacity} />
          </Pattern>
        )}
      </Defs>

      {/* candy 需要一層「不旋轉、全覆蓋」的白底，避免旋轉 pattern 在邊界露出底色 */}
      {type === 'candy' && color2 ? <Rect width="100%" height="100%" fill={color2} /> : null}

      <Rect width="100%" height="100%" fill={`url(#${id})`} />
    </Svg>
  );
}
