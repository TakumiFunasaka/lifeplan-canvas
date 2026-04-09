import type { LifestylePreset, LifeEventTemplate, ExpenseBreakdown, ChildEducation } from "./types";

export const LIFESTYLE_PRESETS: LifestylePreset[] = [
  { id: "saver", label: "節約家", emoji: "🐿️", savingsRate: 0.3, description: "自炊中心、サブスクは厳選、飲み会も月1回" },
  { id: "normal", label: "ふつう", emoji: "🙂", savingsRate: 0.15, description: "たまに外食、推しには課金、でも開業資金も意識" },
  { id: "spender", label: "楽しむ派", emoji: "🎉", savingsRate: 0.05, description: "休みの日は全力で楽しむ！旅行もグルメも我慢しない" },
];

// ライフイベントテンプレート（理容師向け・現実的なコスト感）
export const LIFE_EVENT_TEMPLATES: LifeEventTemplate[] = [
  {
    id: "independence",
    label: "独立・開業",
    emoji: "🏪",
    defaultAge: 30,
    lumpCost: 100, // 自己資金（公庫借入とは別に必要な手持ち）
    annualCost: 85, // 店舗家賃36万+光熱費12万+材料費12万+保険6万+雑費19万≒年85万
    durationYears: 30,
    description: "自己資金100万+公庫借入。店舗維持費(家賃・光熱費・材料費等)年85万",
  },
  {
    id: "marriage",
    label: "結婚",
    emoji: "💒",
    defaultAge: 28,
    lumpCost: 470, // ゼクシィ調査: 挙式357万+新生活100万+指輪等
    annualCost: 0,
    durationYears: 0,
    description: "挙式・披露宴・新生活・指輪等で平均470万",
  },
  {
    id: "child_1",
    label: "子ども（1人目）",
    emoji: "👶",
    defaultAge: 30,
    lumpCost: 50, // 出産費用（自己負担分）
    annualCost: 100, // MEXT調査: 養育費+教育費 公立メインで年約100万
    durationYears: 22,
    description: "出産50万+養育・教育費 年100万×22年",
  },
  {
    id: "child_2",
    label: "子ども（2人目）",
    emoji: "👶",
    defaultAge: 33,
    lumpCost: 50,
    annualCost: 100,
    durationYears: 22,
    description: "2人目も同程度。きょうだい割引はほぼない…",
  },
  {
    id: "car",
    label: "車（維持+買替え込み）",
    emoji: "🚗",
    defaultAge: 25,
    lumpCost: 250, // 初回購入
    annualCost: 45, // JAF調査: 保険7万+税金5万+車検積立8万+ガス12万+駐車場13万≒45万/年
    durationYears: 45,
    replaceCycleYears: 8, // 8年ごとに250万で買い替え
    description: "購入250万+維持費年45万、8年ごとに買い替え",
  },
  {
    id: "contest",
    label: "コンテスト挑戦",
    emoji: "🏆",
    defaultAge: 22,
    lumpCost: 0,
    annualCost: 10, // 出場費・練習費・ウィッグ代等
    durationYears: 5,
    description: "技術コンテスト出場費・練習費・ウィッグ代で年10万×5年",
  },
  {
    id: "skill_investment",
    label: "技術講習・セミナー",
    emoji: "✂️",
    defaultAge: 22,
    lumpCost: 0,
    annualCost: 15, // カット講習、カラー講習等
    durationYears: 10,
    description: "カット講習・カラー講習等で年15万×10年→技術力UPで指名増",
  },
  {
    id: "overseas_travel",
    label: "海外旅行（年1）",
    emoji: "✈️",
    defaultAge: 23,
    lumpCost: 0,
    annualCost: 25, // アジア〜欧州平均で1回25万
    durationYears: 40,
    description: "年1回の海外旅行、1回あたり約25万",
  },
  {
    id: "oshi_katsu",
    label: "推し活",
    emoji: "🎤",
    defaultAge: 22,
    lumpCost: 0,
    annualCost: 15, // グッズ・ライブ・遠征
    durationYears: 15,
    description: "ライブ・グッズ・遠征で年15万くらい",
  },
  {
    id: "home",
    label: "マイホーム",
    emoji: "🏠",
    defaultAge: 35,
    lumpCost: 600, // 頭金・諸費用（物件4000万の15%）
    annualCost: 150, // ローン月10万+固定資産税15万+修繕積立10万+火災保険5万≒年150万
    durationYears: 35,
    description: "頭金600万+ローン・税・修繕で月12.5万×35年",
  },
];

export const EFFECTIVE_TAX_RATE = 0.2;
export const PENSION_MONTHLY = 15; // 万円
export const RETIREMENT_AGE = 65;
export const SIMULATION_END_AGE = 80;
export const SELF_INVESTMENT_INCOME_BOOST = 0.01; // 自己投資で追加年1%昇給
export const DEFAULT_INVESTMENT_RETURN = 0.05;

// 教育費（年間・万円）- 文科省「子供の学習費調査」ベース
export const EDUCATION_COSTS: Record<string, { public: number; private: number }> = {
  preschool:  { public: 17, private: 31 },   // 幼稚園（3年間）
  elementary: { public: 35, private: 167 },   // 小学校
  middle:     { public: 54, private: 144 },   // 中学校
  high:       { public: 51, private: 105 },   // 高校
  university: { public: 115, private: 185 },  // 大学（学費+生活費）
};

// 子どもの年齢→教育段階
export function getEducationStage(childAge: number): keyof ChildEducation | null {
  if (childAge >= 3 && childAge < 6) return "preschool";
  if (childAge >= 6 && childAge < 12) return "elementary";
  if (childAge >= 12 && childAge < 15) return "middle";
  if (childAge >= 15 && childAge < 18) return "high";
  if (childAge >= 18 && childAge < 22) return "university";
  return null;
}

export const DEFAULT_CHILD_EDUCATION: ChildEducation = {
  preschool: "public",
  elementary: "public",
  middle: "public",
  high: "public",
  university: "public",
};

// 支出内訳のデフォルト（月額・万円・一人暮らし想定）
export const DEFAULT_EXPENSE: ExpenseBreakdown = {
  housing: 6,
  food: 4,
  utilities: 1.5,
  transport: 1,
  insurance: 0.5,
  entertainment: 2,
  clothing: 1,
  misc: 1,
};

export const EXPENSE_LABELS: Record<keyof ExpenseBreakdown, { label: string; emoji: string }> = {
  housing: { label: "家賃・住居", emoji: "🏠" },
  food: { label: "食費", emoji: "🍽️" },
  utilities: { label: "光熱・通信", emoji: "💡" },
  transport: { label: "交通費", emoji: "🚃" },
  insurance: { label: "保険", emoji: "🛡️" },
  entertainment: { label: "交際・趣味", emoji: "🎮" },
  clothing: { label: "衣服・美容", emoji: "👕" },
  misc: { label: "その他", emoji: "📦" },
};

export const STEP_LABELS = [
  { title: "あなたについて", subtitle: "年齢とお給料を教えて！" },
  { title: "貯金のこと", subtitle: "今どのくらい貯まってる？" },
  { title: "生活スタイル", subtitle: "お金の使い方は？" },
  { title: "やりたいこと", subtitle: "独立？結婚？コンテスト？" },
  { title: "お金を増やす", subtitle: "投資に興味ある？" },
];
