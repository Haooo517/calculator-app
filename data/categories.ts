export type Calculator = {
  id: string;
  title: string;
  subtitle: string;
  route?: string;
  comingSoon?: boolean;
};

export type Category = {
  id: string;
  title: string;
  nameEn: string;
  subtitle: string;
  bg: string;
  accent: string;
  calculators: Calculator[];
};

export const CATEGORIES: Category[] = [
  {
    id: 'favorites',
    title: '釘選',
    nameEn: 'PINNED',
    subtitle: '最常用的工具，一鍵打開。',
    bg: '#ffd4ba',
    accent: '#c4623a',
    calculators: [],
  },
  {
    id: 'life',
    title: '生活',
    nameEn: 'LIFESTYLE',
    subtitle: '日常會用到的計算工具。',
    bg: '#b8d8ff',
    accent: '#2c5fa8',
    calculators: [
      { id: 'basic', title: '基本計算機', subtitle: '加減乘除', route: '/calculator/basic' },
      { id: 'percent', title: '百分比計算', subtitle: '折扣、稅金、增減', route: '/calculator/percent' },
      { id: 'date', title: '日期計算', subtitle: '日期間隔、推算', route: '/calculator/date' },
      { id: 'age', title: '年齡計算', subtitle: '虛歲、實歲、活了幾天', route: '/calculator/age' },
      { id: 'timezone', title: '時區換算', subtitle: '世界時間', route: '/calculator/timezone' },
      { id: 'gas', title: '油耗計算', subtitle: '加油花費', route: '/calculator/gas' },
    ],
  },
  {
    id: 'science',
    title: '科學',
    nameEn: 'SCIENCE',
    subtitle: '科學、工程、單位換算工具。',
    bg: '#b8e6d2',
    accent: '#2d8765',
    calculators: [
      { id: 'scientific', title: '科學計算機', subtitle: '三角函數、對數', route: '/calculator/scientific' },
      { id: 'engineering', title: '工程計算機', subtitle: '進位、位元運算', route: '/calculator/engineering' },
      { id: 'unit', title: '單位換算', subtitle: '長度、重量、溫度', route: '/calculator/unit' },
      { id: 'equation', title: '方程式求解', subtitle: '一元、二元方程式', route: '/calculator/equation' },
    ],
  },
  {
    id: 'wealth',
    title: '財富',
    nameEn: 'WEALTH',
    subtitle: '理財、消費、貸款相關計算。',
    bg: '#ffe082',
    accent: '#8d6e00',
    calculators: [
      { id: 'currency', title: '匯率換算', subtitle: '即時匯率', route: '/calculator/currency' },
      { id: 'loan', title: '貸款試算', subtitle: '月付、利息', route: '/calculator/loan' },
      { id: 'money-score', title: '金錢評分', subtitle: '理財健康分數', route: '/calculator/money-score' },
      { id: 'compound', title: '複利計算', subtitle: '長期投資試算', route: '/calculator/compound' },
      { id: 'bookkeeping', title: '記帳', subtitle: '收支管理', comingSoon: true },
    ],
  },
  {
    id: 'gambling',
    title: '博弈',
    nameEn: 'GAMBLING',
    subtitle: '撲克、麻將、桌遊計分工具。',
    bg: '#d4baf0',
    accent: '#6a3da8',
    calculators: [
      { id: 'big2', title: '大老二點數', subtitle: '四人計分', route: '/calculator/big2' },
      { id: 'mahjong', title: '麻將台數', subtitle: '台數計算', route: '/calculator/mahjong' },
      { id: 'poker-odds', title: '撲克勝率', subtitle: '德州撲克', route: '/calculator/poker-odds' },
      { id: 'lottery', title: '樂透機率', subtitle: '中獎機率試算', route: '/calculator/lottery' },
    ],
  },
  {
    id: 'health',
    title: '健康',
    nameEn: 'HEALTH',
    subtitle: '身體數據與健康指標。',
    bg: '#ffc4d4',
    accent: '#c2456a',
    calculators: [
      { id: 'bmi', title: 'BMI 計算', subtitle: '身體質量指數', route: '/calculator/bmi' },
      { id: 'calorie', title: '熱量計算', subtitle: '每日所需熱量', route: '/calculator/calorie' },
      { id: 'pregnancy', title: '預產期', subtitle: '懷孕週數', route: '/calculator/pregnancy' },
      { id: 'heart-rate', title: '心率區間', subtitle: '運動心率', route: '/calculator/heart-rate' },
      { id: 'water', title: '水分攝取', subtitle: '每日建議量', route: '/calculator/water' },
    ],
  },
  {
    id: 'design',
    title: '設計',
    nameEn: 'DESIGN',
    subtitle: '色彩、比例、字級相關計算。',
    bg: '#f0c4e8',
    accent: '#8a3a8d',
    calculators: [
      { id: 'color', title: '色彩換算', subtitle: 'RGB / HEX / HSL', route: '/calculator/color' },
      { id: 'aspect-ratio', title: '寬高比', subtitle: '16:9、4:3', route: '/calculator/aspect-ratio' },
      { id: 'golden-ratio', title: '黃金比例', subtitle: '1:1.618', route: '/calculator/golden-ratio' },
      { id: 'font-size', title: '字級換算', subtitle: 'px / rem / pt', route: '/calculator/font-size' },
    ],
  },
  {
    id: 'time',
    title: '時間',
    nameEn: 'TIME',
    subtitle: '計時、工時、年資管理。',
    bg: '#d4d8e0',
    accent: '#4a5868',
    calculators: [
      { id: 'countdown', title: '倒數計時', subtitle: '專注倒數', route: '/calculator/countdown' },
      { id: 'pomodoro', title: '番茄鐘', subtitle: '專注計時', route: '/calculator/pomodoro' },
      { id: 'work-hours', title: '工時計算', subtitle: '時數加總', route: '/calculator/work-hours' },
      { id: 'seniority', title: '年資計算', subtitle: '到職至今、特休', route: '/calculator/seniority' },
    ],
  },
  {
    id: 'education',
    title: '教育',
    nameEn: 'EDUCATION',
    subtitle: '學業相關計算工具。',
    bg: '#e0c890',
    accent: '#786020',
    calculators: [
      { id: 'gpa', title: 'GPA 計算', subtitle: '學期平均', route: '/calculator/gpa' },
      { id: 'weighted-avg', title: '加權平均', subtitle: '考試成績', route: '/calculator/weighted-avg' },
      { id: 'word-count', title: '字數統計', subtitle: '文章字數', route: '/calculator/word-count' },
      { id: 'student-loan', title: '學貸試算', subtitle: '每月償還', route: '/calculator/student-loan' },
    ],
  },
  {
    id: 'cooking',
    title: '烹飪',
    nameEn: 'COOKING',
    subtitle: '食譜、溫度、份量換算。',
    bg: '#f5b8a8',
    accent: '#a8443a',
    calculators: [
      { id: 'recipe-scale', title: '食譜倍率', subtitle: '人數換算', route: '/calculator/recipe-scale' },
      { id: 'oven-temp', title: '烤箱溫度', subtitle: '°C / °F / Gas Mark', route: '/calculator/oven-temp' },
      { id: 'ingredient-sub', title: '食材替換', subtitle: '替代比例', route: '/calculator/ingredient-sub' },
    ],
  },
  {
    id: 'game',
    title: '小遊戲',
    nameEn: 'MINI GAMES',
    subtitle: '跟計算和反應有關的小遊戲。',
    bg: '#c4e8a8',
    accent: '#5a8a30',
    calculators: [
      { id: 'speed-math', title: '速算', subtitle: '限時內算對幾題', route: '/game/speed-math' },
      { id: 'tap-speed', title: '手速測試', subtitle: '10 秒按幾下', route: '/game/tap-speed' },
      { id: 'blind-timer', title: '盲計時', subtitle: '不看時間估秒數', route: '/game/blind-timer' },
      { id: 'distance', title: '盲測距離', subtitle: '考驗位置記憶', route: '/game/distance' },
      { id: 'tracking', title: '追物體', subtitle: '點移動的方塊', route: '/game/tracking' },
      { id: 'ad-game', title: '廣告糞遊', subtitle: '嘲諷手遊生態（假廣告）', route: '/game/ad-game' },
    ],
  },
];

export const getCategoryById = (id: string) => CATEGORIES.find((c) => c.id === id);
