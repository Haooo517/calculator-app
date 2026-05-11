export type Calculator = {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  route?: string;
  comingSoon?: boolean;
};

export type Category = {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  calculators: Calculator[];
};

export const CATEGORIES: Category[] = [
  {
    id: 'basic',
    title: '基本',
    subtitle: '日常計算',
    icon: '🔢',
    color: '#16213e',
    calculators: [
      {
        id: 'basic',
        title: '基本計算機',
        subtitle: '加減乘除',
        icon: '➕',
        route: '/calculator/basic',
      },
      { id: 'percent', title: '百分比計算', subtitle: '折扣、稅金', icon: '％', comingSoon: true },
      { id: 'date', title: '日期計算', subtitle: '日期間隔', icon: '📅', comingSoon: true },
    ],
  },
  {
    id: 'science',
    title: '科學',
    subtitle: '專業計算工具',
    icon: '🧪',
    color: '#0f3460',
    calculators: [
      { id: 'scientific', title: '科學計算機', subtitle: '三角函數、對數', icon: '🧮', comingSoon: true },
      { id: 'engineering', title: '工程計算機', subtitle: '進位、邏輯運算', icon: '⚙️', comingSoon: true },
      { id: 'unit', title: '單位換算', subtitle: '長度、重量、溫度', icon: '📏', comingSoon: true },
      { id: 'equation', title: '方程式求解', subtitle: '一元、二元方程式', icon: '𝒙', comingSoon: true },
    ],
  },
  {
    id: 'wealth',
    title: '財富',
    subtitle: '理財與金錢管理',
    icon: '💰',
    color: '#1a5276',
    calculators: [
      { id: 'currency', title: '匯率換算', subtitle: '即時匯率', icon: '💱', comingSoon: true },
      { id: 'bookkeeping', title: '記帳', subtitle: '收支管理', icon: '📒', comingSoon: true },
      { id: 'money-score', title: '金錢評分', subtitle: '理財健康分數', icon: '⭐', comingSoon: true },
      { id: 'loan', title: '貸款試算', subtitle: '月付、利息', icon: '🏦', comingSoon: true },
      { id: 'tip', title: '小費計算', subtitle: 'AA、含稅', icon: '🍽️', comingSoon: true },
    ],
  },
  {
    id: 'gambling',
    title: '博弈',
    subtitle: '桌遊計分工具',
    icon: '🎲',
    color: '#533483',
    calculators: [
      { id: 'big2', title: '大老二點數', subtitle: '四人計分', icon: '🃏', comingSoon: true },
      { id: 'mahjong', title: '麻將台數', subtitle: '台數查詢', icon: '🀄', comingSoon: true },
      { id: 'poker-odds', title: '撲克勝率', subtitle: '德州撲克', icon: '♠️', comingSoon: true },
    ],
  },
  {
    id: 'health',
    title: '健康',
    subtitle: '身體數據',
    icon: '💪',
    color: '#117a65',
    calculators: [
      { id: 'bmi', title: 'BMI 計算', subtitle: '身體質量指數', icon: '⚖️', comingSoon: true },
      { id: 'calorie', title: '熱量計算', subtitle: '每日所需', icon: '🔥', comingSoon: true },
      { id: 'pregnancy', title: '預產期', subtitle: '懷孕週數', icon: '👶', comingSoon: true },
    ],
  },
  {
    id: 'life',
    title: '生活',
    subtitle: '其他實用工具',
    icon: '🛠️',
    color: '#a04000',
    calculators: [
      { id: 'age', title: '年齡計算', subtitle: '虛歲、實歲', icon: '🎂', comingSoon: true },
      { id: 'timezone', title: '時區換算', subtitle: '世界時間', icon: '🌐', comingSoon: true },
      { id: 'gas', title: '油耗計算', subtitle: '加油花費', icon: '⛽', comingSoon: true },
    ],
  },
];

export const getCategoryById = (id: string) => CATEGORIES.find((c) => c.id === id);
