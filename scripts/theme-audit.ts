// 主題對比度稽核：node 跑，不進 App bundle
// 用法：npx esbuild scripts/theme-audit.ts --bundle --format=cjs --platform=node \
//   --alias:@react-native-async-storage/async-storage=./scripts/async-stub.js \
//   --outfile=scripts/theme-audit.cjs && node scripts/theme-audit.cjs
import { ALL_THEMES } from '../lib/theme';

const hexToRgb = (hex: string): [number, number, number] | null => {
  const m = hex.replace('#', '');
  const s = m.length === 3 ? m.split('').map((c) => c + c).join('') : m;
  if (s.length !== 6 || /[^0-9a-fA-F]/.test(s)) return null;
  return [parseInt(s.slice(0, 2), 16), parseInt(s.slice(2, 4), 16), parseInt(s.slice(4, 6), 16)];
};

const lum = (rgb: [number, number, number]) => {
  const [r, g, b] = rgb.map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const contrast = (a: string, b: string): number | null => {
  const ra = hexToRgb(a);
  const rb = hexToRgb(b);
  if (!ra || !rb) return null;
  const la = lum(ra);
  const lb = lum(rb);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
};

type Issue = { theme: string; pair: string; fg: string; bg: string; ratio: number; min: number };
const issues: Issue[] = [];

const check = (themeName: string, pair: string, fg: string | undefined, bg: string | undefined, min: number) => {
  if (!fg || !bg) return;
  const r = contrast(fg, bg);
  if (r !== null && r < min) {
    issues.push({ theme: themeName, pair, fg, bg, ratio: Math.round(r * 100) / 100, min });
  }
};

for (const t of ALL_THEMES) {
  const n = t.id;
  // 主文字（內文等級，門檻 4.5）
  check(n, 'text/bg', t.text, t.bg, 4.5);
  check(n, 'text/cardBg', t.text, t.cardBg, 4.5);
  check(n, 'text/inputBg', t.text, t.inputBg, 4.5);
  // 次要文字（門檻 3.0，本來就刻意淡一點）
  check(n, 'textMuted/bg', t.textMuted, t.bg, 3.0);
  check(n, 'textMuted/cardBg', t.textMuted, t.cardBg, 3.0);
  // LCD 螢幕文字（大字+粗體，門檻 3.0）
  check(n, 'lcdText/lcdScreen', t.lcdText, t.lcdScreen, 3.0);
  // LCD 品牌字在框上
  check(n, 'lcdBrand/lcdFrame', t.lcdBrandColor ?? t.brandColor, t.lcdFrame, 2.0);
  // 分類 icon（大圖形，門檻 2.0）與 hero 標題（大字，門檻 2.5）
  if (t.categoryPalette) {
    for (const [cat, p] of Object.entries(t.categoryPalette)) {
      check(n, `icon ${cat} accent/iconBg`, p.accent, p.bg, 2.0);
      check(n, `hero ${cat} accent/heroBg`, p.accent, t.heroBg ?? p.bg, 2.5);
    }
  }
}

if (!issues.length) {
  console.log('ALL CLEAN');
} else {
  issues.sort((a, b) => a.ratio - b.ratio);
  for (const i of issues) {
    console.log(
      `${i.theme.padEnd(14)} ${i.pair.padEnd(28)} ${i.fg} on ${i.bg}  ratio ${i.ratio} (need ${i.min})`
    );
  }
  console.log(`\n${issues.length} issues`);
}
