import { Stack } from 'expo-router';
import { Check, Heart, Lock, Moon, Sun, X } from 'phosphor-react-native';
import { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ALL_THEMES, Theme, categoryColors, useTheme } from '../lib/theme';
import { useThemeFavorites } from '../lib/themeFavorites';

export default function ThemesScreen() {
  const { theme, themeId, setThemeId } = useTheme();
  const { isFav, toggle: toggleFav } = useThemeFavorites();
  const [preview, setPreview] = useState<Theme | null>(null);

  // 我的最愛排前面
  const sorted = [...ALL_THEMES].sort((a, b) => {
    const fa = isFav(a.id) ? 1 : 0;
    const fb = isFav(b.id) ? 1 : 0;
    return fb - fa;
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Stack.Screen options={{ title: '主題' }} />

        <Text style={[styles.title, { color: theme.text }]}>挑一個喜歡的</Text>
        <Text style={[styles.subtitle, { color: theme.textMuted }]}>
          輕點看預覽，按愛心收藏
        </Text>

        <View style={styles.list}>
          {sorted.map((t) => (
            <ThemeRow
              key={t.id}
              target={t}
              active={t.id === themeId}
              favorited={isFav(t.id)}
              onPress={() => setPreview(t)}
              onToggleFav={() => toggleFav(t.id)}
            />
          ))}
        </View>
      </ScrollView>

      <PreviewModal
        target={preview}
        visible={!!preview}
        onClose={() => setPreview(null)}
        onApply={() => {
          if (preview) {
            setThemeId(preview.id);
            setPreview(null);
          }
        }}
        active={preview?.id === themeId}
        favorited={preview ? isFav(preview.id) : false}
        onToggleFav={() => preview && toggleFav(preview.id)}
      />
    </View>
  );
}

// ============ 列表的單列：色卡 + 名字 + 愛心 ============
function ThemeRow({
  target,
  active,
  favorited,
  onPress,
  onToggleFav,
}: {
  target: Theme;
  active: boolean;
  favorited: boolean;
  onPress: () => void;
  onToggleFav: () => void;
}) {
  const { theme } = useTheme(); // 列本身用當前主題的卡片色，不被預覽主題影響

  // 取 4 色色卡：bg / cardBg / brandColor / lcdScreen
  const swatches = [target.bg, target.brandColor, target.lcdScreen, target.lcdText];

  return (
    <TouchableOpacity
      style={[
        styles.row,
        { backgroundColor: theme.cardBg },
        active && { borderColor: target.brandColor, borderWidth: 2 },
        theme.cardBorder && !active && {
          borderWidth: theme.cardBorder.width,
          borderColor: theme.cardBorder.color,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      {/* 左：色卡 */}
      <View style={styles.swatchWrap}>
        {swatches.map((c, i) => (
          <View key={i} style={[styles.swatch, { backgroundColor: c }]} />
        ))}
      </View>

      {/* 中：名稱 + 簡介 */}
      <View style={styles.rowMid}>
        <View style={styles.rowName}>
          {target.isDark ? (
            <Moon size={13} color={theme.text} weight="fill" />
          ) : (
            <Sun size={13} color={theme.text} weight="fill" />
          )}
          <Text
            style={[
              styles.rowTitle,
              {
                color: theme.text,
                fontFamily: theme.font?.displayCn ?? 'Fredoka_700Bold',
              },
            ]}
            numberOfLines={1}
          >
            {target.name}
          </Text>
          {active && (
            <View style={[styles.activeChip, { backgroundColor: target.brandColor }]}>
              <Check size={9} color="#fff" weight="bold" />
            </View>
          )}
        </View>
        {target.description && (
          <Text style={[styles.rowDesc, { color: theme.textMuted }]} numberOfLines={1}>
            {target.description}
          </Text>
        )}
      </View>

      {/* 右：愛心 */}
      <TouchableOpacity
        onPress={onToggleFav}
        style={styles.heartBtn}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Heart
          size={20}
          color={favorited ? '#e63060' : theme.hint}
          weight={favorited ? 'fill' : 'regular'}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

// ============ 預覽彈窗 ============
function PreviewModal({
  target,
  visible,
  onClose,
  onApply,
  active,
  favorited,
  onToggleFav,
}: {
  target: Theme | null;
  visible: boolean;
  onClose: () => void;
  onApply: () => void;
  active: boolean;
  favorited: boolean;
  onToggleFav: () => void;
}) {
  if (!target) return null;
  const locked = target.isPremium && !__DEV__;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[styles.modalCard, { backgroundColor: target.cardBg }]}
          onPress={(e) => e.stopPropagation()}
        >
          {/* 關閉鈕 */}
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <X size={20} color={target.text} weight="bold" />
          </TouchableOpacity>

          {/* 名字 + dark/light */}
          <View style={styles.modalHeader}>
            {target.isDark ? (
              <Moon size={16} color={target.text} weight="fill" />
            ) : (
              <Sun size={16} color={target.text} weight="fill" />
            )}
            <Text
              style={[
                styles.modalTitle,
                {
                  color: target.text,
                  fontFamily: target.font?.displayCn ?? 'Fredoka_700Bold',
                },
              ]}
            >
              {target.name}
            </Text>
          </View>

          {/* 描述 */}
          {target.description && (
            <Text style={[styles.modalDesc, { color: target.textMuted }]}>
              {target.description}
            </Text>
          )}

          {/* 兩張預覽圖 */}
          <View style={styles.modalShots}>
            <MiniHome target={target} />
            <MiniCalc target={target} />
          </View>

          {/* 底部按鈕：愛心 + 使用 */}
          <View style={styles.modalActions}>
            <TouchableOpacity
              onPress={onToggleFav}
              style={[
                styles.modalHeart,
                {
                  backgroundColor: target.inputBg,
                  borderRadius: target.radius * 0.5,
                },
                target.cardBorder && {
                  borderWidth: target.cardBorder.width,
                  borderColor: target.cardBorder.color,
                },
              ]}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <Heart
                size={22}
                color={favorited ? '#e63060' : target.textMuted}
                weight={favorited ? 'fill' : 'regular'}
              />
            </TouchableOpacity>

            {locked ? (
              <View
                style={[
                  styles.applyBtn,
                  styles.applyBtnLocked,
                  { backgroundColor: target.inputBg, borderRadius: target.radius * 0.5 },
                ]}
              >
                <Lock size={16} color={target.textMuted} weight="duotone" />
                <Text style={[styles.applyTextLocked, { color: target.textMuted }]}>
                  即將開放
                </Text>
              </View>
            ) : active ? (
              <View
                style={[
                  styles.applyBtn,
                  { backgroundColor: target.brandColor, borderRadius: target.radius * 0.5 },
                ]}
              >
                <Check size={16} color="#fff" weight="bold" />
                <Text style={styles.applyText}>使用中</Text>
              </View>
            ) : (
              <TouchableOpacity
                onPress={onApply}
                activeOpacity={0.8}
                style={[
                  styles.applyBtn,
                  { backgroundColor: target.brandColor, borderRadius: target.radius * 0.5 },
                ]}
              >
                <Text style={styles.applyText}>套用主題</Text>
              </TouchableOpacity>
            )}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ============ Mini Home (彈窗用) ============
function MiniHome({ target }: { target: Theme }) {
  const cats = ['favorites', 'life', 'science'];
  return (
    <View style={[shotStyles.phone, { backgroundColor: target.bg }]}>
      <View style={[shotStyles.lcdFrame, { backgroundColor: target.lcdFrame }]}>
        <View
          style={[
            shotStyles.lcdScreen,
            { backgroundColor: target.lcdScreen, borderColor: target.lcdBorder },
          ]}
        >
          <Text style={[shotStyles.lcdFace, { color: target.lcdText }]}>[· U ·]</Text>
        </View>
      </View>
      <View style={shotStyles.rowList}>
        {cats.map((id) => {
          const c = categoryColors(target, id, { bg: '#ddd', accent: target.brandColor });
          return (
            <View
              key={id}
              style={[
                shotStyles.miniRow,
                { backgroundColor: target.cardBg },
                target.cardBorder && {
                  borderWidth: 0.5,
                  borderColor: target.cardBorder.color,
                },
              ]}
            >
              <View style={[shotStyles.miniIcon, { backgroundColor: c.bg }]}>
                <View style={[shotStyles.miniDot, { backgroundColor: c.accent }]} />
              </View>
              <View style={shotStyles.miniBars}>
                <View
                  style={[
                    shotStyles.miniBar,
                    { backgroundColor: target.text, opacity: 0.85, width: '70%' },
                  ]}
                />
                <View
                  style={[
                    shotStyles.miniBar,
                    { backgroundColor: c.accent, opacity: 0.7, width: '40%', height: 2 },
                  ]}
                />
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

// ============ Mini Calculator (彈窗用) ============
function MiniCalc({ target }: { target: Theme }) {
  const numCells = ['7','8','9','/','4','5','6','*','1','2','3','-','0','.','=','+'];
  const operatorChars = new Set(['/', '*', '-', '+', '=']);
  const fnRow = ['C', '±', '%'];

  return (
    <View style={[shotStyles.phone, { backgroundColor: target.bg }]}>
      <View style={[shotStyles.lcdFrame, { backgroundColor: target.lcdFrame }]}>
        <View
          style={[
            shotStyles.lcdScreen,
            { backgroundColor: target.lcdScreen, borderColor: target.lcdBorder },
          ]}
        >
          <Text style={[shotStyles.calcDigits, { color: target.lcdText }]} numberOfLines={1}>
            1,234
          </Text>
        </View>
      </View>
      <View style={shotStyles.btnRow}>
        {fnRow.map((c) => (
          <View key={c} style={[shotStyles.btn, { backgroundColor: target.inputBg }]}>
            <Text style={[shotStyles.btnText, { color: target.text }]}>{c}</Text>
          </View>
        ))}
        <View style={[shotStyles.btn, { backgroundColor: target.brandColor }]}>
          <Text style={[shotStyles.btnText, { color: '#fff' }]}>÷</Text>
        </View>
      </View>
      {[0, 4, 8, 12].map((rowStart) => (
        <View key={rowStart} style={shotStyles.btnRow}>
          {numCells.slice(rowStart, rowStart + 4).map((c, i) => {
            const isOp = operatorChars.has(c);
            return (
              <View
                key={`${rowStart}-${i}`}
                style={[
                  shotStyles.btn,
                  { backgroundColor: isOp ? target.brandColor : target.cardBg },
                  target.cardBorder && !isOp && {
                    borderWidth: 0.5,
                    borderColor: target.cardBorder.color,
                  },
                ]}
              >
                <Text style={[shotStyles.btnText, { color: isOp ? '#fff' : target.text }]}>
                  {c}
                </Text>
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const shotStyles = StyleSheet.create({
  phone: {
    flex: 1,
    aspectRatio: 0.5,
    borderRadius: 12,
    padding: 6,
    gap: 5,
    overflow: 'hidden',
  },
  lcdFrame: {
    borderRadius: 7,
    padding: 4,
  },
  lcdScreen: {
    borderRadius: 5,
    paddingHorizontal: 4,
    paddingVertical: 6,
    borderWidth: 0.5,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 28,
  },
  lcdFace: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 10,
    letterSpacing: 0.5,
  },
  calcDigits: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 14,
    letterSpacing: 0.5,
  },
  rowList: {
    gap: 3,
    flex: 1,
  },
  miniRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 6,
    padding: 4,
    gap: 5,
    flex: 1,
  },
  miniIcon: {
    width: 16,
    height: 16,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  miniBars: { flex: 1, gap: 2 },
  miniBar: { height: 3, borderRadius: 1.5 },
  btnRow: { flexDirection: 'row', gap: 3 },
  btn: {
    flex: 1,
    aspectRatio: 1.1,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 8,
  },
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 60 },
  title: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 26,
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Fredoka_400Regular',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 22,
  },
  list: { gap: 10 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 18,
    gap: 12,
    shadowColor: '#a3897a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  swatchWrap: {
    flexDirection: 'row',
    gap: 3,
  },
  swatch: {
    width: 14,
    height: 32,
    borderRadius: 4,
  },
  rowMid: { flex: 1, gap: 2 },
  rowName: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  rowTitle: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 15,
    flexShrink: 1,
  },
  rowDesc: {
    fontFamily: 'Fredoka_400Regular',
    fontSize: 11,
  },
  activeChip: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartBtn: { padding: 6 },

  // Modal
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 22,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
  },
  closeBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    padding: 4,
    zIndex: 2,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
    paddingRight: 30,
  },
  modalTitle: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 20,
    flexShrink: 1,
  },
  modalDesc: {
    fontFamily: 'Fredoka_400Regular',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 14,
  },
  modalShots: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'stretch',
  },
  modalHeart: {
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
  },
  applyBtnLocked: {},
  applyText: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 15,
    color: '#fff',
    letterSpacing: 0.5,
  },
  applyTextLocked: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 14,
  },
});
