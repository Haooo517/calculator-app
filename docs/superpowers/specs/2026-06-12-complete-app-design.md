# Allculator 完工計畫（2026-06-12 定案）

把 App 做到「內容完整」：所有 comingSoon 計算機與小遊戲實作完成、全部頁面接上主題系統、解鎖框架就位。

## 已拍板的範圍決策

| 決策 | 結論 |
|---|---|
| 賺錢機制 | 做「解鎖框架」：鎖定 UI + AsyncStorage 解鎖紀錄 + 模擬購買流程；真 IAP 之後只換付款那一步 |
| 語言切換 i18n | 這次跳過，維持「即將推出」 |
| 音效 | 這次跳過，維持「即將推出」（觸感回饋已覆蓋按鍵體驗） |
| 記帳 | 這次跳過，維持 comingSoon（它是獨立小 App，之後專門做） |

## 工程內容

### A. 修 Bug
- `lib/pins.ts` 補 `clearAllPins()`，設定頁「重設釘選」接真清空（目前是假 Alert）
- 新增 `lib/scores.ts`：遊戲最高分 AsyncStorage 持久化（支援越高越好 / 越低越好兩種模式），速算、手速接上
- 刪除根目錄 `index.ts`（pre-router 殘留，entry 已是 `expo-router/entry`），解掉 tsc 的 App/app 大小寫衝突

### B. 既有 18 個計算機接主題（原路線圖未完成項）
所有 `app/calculator/*.tsx` 目前 hard-code classic-light 色票。統一改 `useTheme()`：

色票對應表（hard-coded → theme token）：
- `#fff8ed` → `theme.bg`
- `#fff` / `#ffffff`（卡片）→ `theme.cardBg`
- `#2d2520` → `theme.text`
- `#8a7a6c` → `theme.textMuted`
- `#a3897a`（淡字）→ `theme.hint`；（陰影色維持不動）
- `#f1e3d0` → `theme.divider`
- `#c8b8a8`（placeholder）→ `theme.hint`
- 輸入框底 → `theme.inputBg`
- 狀態色（結果卡的 pastel bg + 深色 fg 配對）可保留字面值，但要確認在暗色主題卡片上可讀

### C. 新計算機（20 個）
- 設計：色彩換算（HEX↔RGB↔HSL+色塊預覽）、寬高比、黃金比例、字級換算（px↔rem↔pt）
- 烹飪：食譜倍率、烤箱溫度（°C↔°F↔Gas Mark）、食材替換（常見替代表）
- 教育：GPA（4.0/4.3 可切）、加權平均、字數統計（全形/半形）、學貸試算（預設台灣學貸利率）
- 健康：心率區間（220-age / Tanaka、Karvonen 可選）、水分攝取
- 時間：倒數計時（in-app only，背景不響）、番茄鐘（25/5）、工時計算、年資計算（台灣勞基法特休）
- 財富：複利計算
- 博弈：樂透機率（大樂透/威力彩/539 preset + 自訂）、撲克勝率（選牌器 + Monte Carlo ~5000 局）

### D. 新遊戲（4 個）
- 盲計時：目標秒數憑感覺按停，誤差計分
- 盲測距離：兩點短暫顯示，slider 估距離
- 追物體：移動方塊越點越快，30 秒計數
- 廣告糞遊：嘲諷向假廣告（歐古扮廣告、按鈕逃跑），不接真廣告
全部接 `lib/scores.ts`。

### E. 解鎖框架
- `lib/purchases.ts`：已購清單（`theme:<id>`、`allcu-plus`、`ad-free`）+ `useOwnership()`
- 主題頁鎖定改 `isPremium && !owned`（移除 `__DEV__` 全開），預覽 Modal 加「模擬購買」→ 確認 → 解鎖 → 套用
- `allcu-plus` 解鎖全部；設定頁加 dev-only「重置購買紀錄」

### F. 驗證與收尾
- 每 phase：`tsc --noEmit` 通過才 commit（Haooo 風格訊息），push 到 origin/main
- 主題打磨：`expo start --web` + Preview 截圖抽查 19 個主題（對比、LCD 可讀性、分類頁 hero、icon 可見度）
- 更新 `ROADMAP.md` 勾選狀態

## 新計算機統一規範（subagent prompt 共用）
- 一檔一計算機：`app/calculator/<id>.tsx`（遊戲在 `app/game/`），default export + `Stack.Screen` title
- 必用 `useTheme()`：表面/文字/分隔線/placeholder 全走 theme token，不 hard-code 表面色
- 字體：Fredoka 家族（與既有一致）；輸入用 `KeyboardAvoidingView` + `keyboardShouldPersistTaps="handled"`
- 觸感：選項輕點 `haptics.light()`、主要動作 `haptics.soft()`、明確的計算完成 `haptics.success()`（useMemo 自動算的不用）
- 歐古：結果區放 Mascot 表情反應（參考 bmi.tsx 模式），placeholder 用 sleepy
- 完成後到 `data/categories.ts` 拿掉該項 `comingSoon`、補 `route`

## 執行順序（每 phase 一個 commit + push）
0. 修 Bug（A）
1. 既有計算機接主題（B，分 3 批平行 subagent）
2. 設計 4 + 烹飪 3（平行 subagent）
3. 教育 4 + 健康 2（平行 subagent）
4. 時間 4（平行 subagent）
5. 財富 1 + 博弈 2（撲克親自寫）
6. 遊戲 4
7. 解鎖框架（E）
8. 主題打磨 + ROADMAP 更新（F）
