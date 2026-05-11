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
    id: 'science',
    title: '科學',
    nameEn: 'SCIENCE',
    subtitle: '基本到工程的數學計算工具。',
    bg: '#b8e6d2',
    accent: '#2d8765',
    calculators: [
      { id: 'basic', title: '基本計算機', subtitle: '加減乘除', route: '/calculator/basic' },
      { id: 'scientific', title: '科學計算機', subtitle: '三角函數、對數', comingSoon: true },
      { id: 'engineering', title: '工程計算機', subtitle: '進位、邏輯運算', comingSoon: true },
      { id: 'unit', title: '單位換算', subtitle: '長度、重量、溫度', comingSoon: true },
      { id: 'equation', title: '方程式求解', subtitle: '一元、二元方程式', comingSoon: true },
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
      { id: 'tip', title: '小費計算', subtitle: 'AA、含稅', route: '/calculator/tip' },
      { id: 'percent', title: '百分比計算', subtitle: '折扣、稅金', comingSoon: true },
      { id: 'currency', title: '匯率換算', subtitle: '即時匯率', comingSoon: true },
      { id: 'bookkeeping', title: '記帳', subtitle: '收支管理', comingSoon: true },
      { id: 'loan', title: '貸款試算', subtitle: '月付、利息', comingSoon: true },
      { id: 'money-score', title: '金錢評分', subtitle: '理財健康分數', comingSoon: true },
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
      { id: 'big2', title: '大老二點數', subtitle: '四人計分', comingSoon: true },
      { id: 'mahjong', title: '麻將台數', subtitle: '台數查詢', comingSoon: true },
      { id: 'poker-odds', title: '撲克勝率', subtitle: '德州撲克', comingSoon: true },
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
      { id: 'calorie', title: '熱量計算', subtitle: '每日所需', comingSoon: true },
      { id: 'pregnancy', title: '預產期', subtitle: '懷孕週數', comingSoon: true },
    ],
  },
  {
    id: 'life',
    title: '生活',
    nameEn: 'LIFESTYLE',
    subtitle: '日常生活實用小工具。',
    bg: '#b8d8ff',
    accent: '#2c5fa8',
    calculators: [
      { id: 'date', title: '日期計算', subtitle: '日期間隔', comingSoon: true },
      { id: 'age', title: '年齡計算', subtitle: '虛歲、實歲', comingSoon: true },
      { id: 'timezone', title: '時區換算', subtitle: '世界時間', comingSoon: true },
      { id: 'gas', title: '油耗計算', subtitle: '加油花費', comingSoon: true },
    ],
  },
];

export const getCategoryById = (id: string) => CATEGORIES.find((c) => c.id === id);
