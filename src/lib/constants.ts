import type { JobPreset, LifestylePreset, LifeEventTemplate } from "./types";

export const JOB_PRESETS: JobPreset[] = [
  { id: "it_engineer", label: "ITエンジニア", emoji: "💻", startingSalary: 350, growthRate: 0.03, peakAge: 40, peakSalary: 750 },
  { id: "sales", label: "営業", emoji: "🤝", startingSalary: 320, growthRate: 0.025, peakAge: 45, peakSalary: 650 },
  { id: "office_work", label: "事務・管理", emoji: "📋", startingSalary: 300, growthRate: 0.02, peakAge: 50, peakSalary: 550 },
  { id: "consulting", label: "コンサル", emoji: "🧠", startingSalary: 400, growthRate: 0.04, peakAge: 38, peakSalary: 900 },
  { id: "public_servant", label: "公務員", emoji: "🏛️", startingSalary: 300, growthRate: 0.02, peakAge: 55, peakSalary: 650 },
  { id: "medical", label: "医療系", emoji: "🏥", startingSalary: 350, growthRate: 0.025, peakAge: 45, peakSalary: 700 },
  { id: "creative", label: "クリエイティブ", emoji: "🎨", startingSalary: 280, growthRate: 0.02, peakAge: 40, peakSalary: 550 },
  { id: "barber", label: "理容師・美容師", emoji: "✂️", startingSalary: 250, growthRate: 0.02, peakAge: 35, peakSalary: 400 },
  { id: "service", label: "サービス・接客", emoji: "🍽️", startingSalary: 260, growthRate: 0.015, peakAge: 45, peakSalary: 420 },
  { id: "other", label: "その他", emoji: "📌", startingSalary: 300, growthRate: 0.02, peakAge: 45, peakSalary: 550 },
];

export const LIFESTYLE_PRESETS: LifestylePreset[] = [
  { id: "saver", label: "節約家", emoji: "🐿️", savingsRate: 0.3, description: "自炊中心、サブスクは厳選、飲み会も控えめ" },
  { id: "normal", label: "ふつう", emoji: "🙂", savingsRate: 0.15, description: "たまに外食、推しには課金、でも貯金も意識" },
  { id: "spender", label: "楽しむ派", emoji: "🎉", savingsRate: 0.05, description: "人生は一度きり！旅行もグルメも我慢しない" },
];

// ライフイベントテンプレート（現実的なコスト感）
export const LIFE_EVENT_TEMPLATES: LifeEventTemplate[] = [
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
    id: "home",
    label: "マイホーム",
    emoji: "🏠",
    defaultAge: 35,
    lumpCost: 600, // 頭金・諸費用（物件4000万の15%）
    annualCost: 120, // ローン月10万×12ヶ月（3400万借入・35年・金利1.5%）
    durationYears: 35,
    description: "頭金600万+ローン月10万×35年",
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
    id: "skill_investment",
    label: "自己投資",
    emoji: "📚",
    defaultAge: 23,
    lumpCost: 0,
    annualCost: 20, // スクール・資格・書籍
    durationYears: 10,
    description: "スクール・資格・書籍で年20万→年収UPにつながる",
  },
  {
    id: "independence",
    label: "独立・開業",
    emoji: "🏪",
    defaultAge: 30,
    lumpCost: 500, // 開業資金
    annualCost: 0,
    durationYears: 0,
    description: "開業資金（店舗・設備・運転資金）",
  },
];

export const EFFECTIVE_TAX_RATE = 0.2;
export const PENSION_MONTHLY = 15; // 万円
export const RETIREMENT_AGE = 65;
export const SIMULATION_END_AGE = 80;
export const SELF_INVESTMENT_INCOME_BOOST = 0.01; // 自己投資で追加年1%昇給
export const DEFAULT_INVESTMENT_RETURN = 0.05;

export const STEP_LABELS = [
  { title: "あなたについて", subtitle: "年齢と年収を教えて！" },
  { title: "貯金のこと", subtitle: "今どのくらい貯まってる？" },
  { title: "生活スタイル", subtitle: "お金の使い方は？" },
  { title: "やりたいこと", subtitle: "人生でやりたいことは？" },
  { title: "お金を増やす", subtitle: "投資に興味ある？" },
];
