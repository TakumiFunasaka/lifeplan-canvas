// --- 生活スタイル ---
export type LifestyleType = "saver" | "normal" | "spender";

export interface LifestylePreset {
  id: LifestyleType;
  label: string;
  emoji: string;
  savingsRate: number;
  description: string;
}

// --- 支出内訳（月額・万円） ---
export interface ExpenseBreakdown {
  housing: number;       // 家賃・住居費
  food: number;          // 食費
  utilities: number;     // 水道光熱・通信
  transport: number;     // 交通費
  insurance: number;     // 保険
  entertainment: number; // 交際・趣味・娯楽
  clothing: number;      // 衣服・美容
  misc: number;          // その他・雑費
}

// --- ライフイベント ---
export type EducationLevel = "public" | "private";

export interface ChildEducation {
  preschool: EducationLevel;  // 幼稚園
  elementary: EducationLevel; // 小学校
  middle: EducationLevel;     // 中学校
  high: EducationLevel;       // 高校
  university: EducationLevel; // 大学
}

export interface LifeEvent {
  id: string;
  label: string;
  emoji: string;
  age: number;
  lumpCost: number;
  annualCost: number;
  durationYears: number;
  replaceCycleYears?: number;
  isCustom?: boolean;
  childEducation?: ChildEducation;
  // 借入モデル（独立開業等）
  loan?: {
    amount: number;      // 借入額（万円）
    repaymentYears: number; // 返済期間（年）
    interestRate: number;   // 年利（%表記: 2 = 2%）
  };
}

export interface LifeEventTemplate {
  id: string;
  label: string;
  emoji: string;
  defaultAge: number;
  lumpCost: number;
  annualCost: number;
  durationYears: number;
  replaceCycleYears?: number;
  description: string;
}

// --- 独立経営 ---
export type BusinessStyle = "solo" | "small_team" | "multi_shop";

export interface BusinessPlan {
  style: BusinessStyle;
  customerPrice: number;   // 客単価（円）
  dailyCustomers: number;  // 1日の客数
  workDaysPerMonth: number; // 月の営業日数
  monthlyRent: number;     // 店舗家賃（万円/月）
  staffCount: number;      // スタッフ数（自分除く）
  staffMonthlyCost: number; // スタッフ1人あたり月コスト（万円、給与+社保）
  otherMonthlyCost: number; // その他経費（材料費・光熱費・保険等、万円/月）
  growthRate: number;      // 年間成長率（客数の伸び %）
}

// --- 配偶者 ---
export interface SpouseProfile {
  enabled: boolean;
  annualIncome: number; // 万円
  salaryGrowth: SalaryGrowth;
}

// --- 投資プロファイル ---
export interface InvestmentProfile {
  isInvesting: boolean;
  knowsNisa: boolean;
  monthlyAmount: number;
  expectedReturn: number;
  useRatioMode: boolean;
  ratioPercent: number;
}

// --- 昇給設定 ---
export interface SalaryGrowth {
  annualRaisePercent: number;
  peakIncome: number;
}

// --- ユーザープロファイル ---
export interface UserProfile {
  age: number;
  annualIncome: number;
  currentSavings: number;
  lifestyle: LifestyleType;
  events: LifeEvent[];
  investment: InvestmentProfile;
  salaryGrowth: SalaryGrowth;
  spouse: SpouseProfile;
  expenseBreakdown: ExpenseBreakdown;
  businessPlan?: BusinessPlan;
}

// --- シミュレーション出力 ---
export interface YearlyData {
  age: number;
  savings: number;
  savingsWithInvestment: number;
  income: number;
  investmentBalance: number;
  eventLabels: string[];
}

// --- 診断 ---
export type YabaiLevel = "safe" | "ok" | "warning" | "yabai" | "very_yabai";

export interface Diagnosis {
  level: YabaiLevel;
  score: number;
  label: string;
  emoji: string;
  color: string;
  messages: string[];
}

export type OnboardingStep = 0 | 1 | 2 | 3 | 4;
