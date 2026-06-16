import { StyleSheet } from 'react-native';
import Svg, { Circle, Defs, Path, Pattern, Rect } from 'react-native-svg';

export type PatternType = 'dots' | 'stripes' | 'candy' | 'grid' | 'waves' | 'sparkle';

type Props = {
  type: PatternType;
  color: string;
  color2?: string;
  opacity?: number;
};

// 無縫 45° 對角線（不用 patternTransform —— 原生 react-native-svg 對 patternTransform 支援有 bug，
// 會把旋轉後的 tile 裁切成碎片。改用三段 Path 自己鋪滿，web / iOS / Android 都正確）。
// 主線 x+y=tile，加左上、右下兩個角的補線讓相鄰 tile 接得起來。
const diagonal = (tile: number) =>
  `M-1 1 l2 -2 M0 ${tile} l${tile} -${tile} M${tile - 1} ${tile + 1} l2 -2`;

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

        {/* 斜紋：Path 對角線（不旋轉 pattern） */}
        {type === 'stripes' && (
          <Pattern id={id} x={0} y={0} width={16} height={16} patternUnits="userSpaceOnUse">
            <Path d={diagonal(16)} stroke={color} strokeWidth={5} opacity={opacity} fill="none" />
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

        {/* 拐杖糖斜紋：用原本的底色，疊上細細的斜白線（不旋轉 pattern、不蓋白底） */}
        {type === 'candy' && (
          <Pattern id={id} x={0} y={0} width={15} height={15} patternUnits="userSpaceOnUse">
            <Path d={diagonal(15)} stroke={color} strokeWidth={2.4} opacity={opacity} fill="none" />
          </Pattern>
        )}
      </Defs>

      <Rect width="100%" height="100%" fill={`url(#${id})`} />
    </Svg>
  );
}
