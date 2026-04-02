// --- 職種カテゴリ ---
export type JobCategory =
  | "it_engineer"
  | "sales"
  | "office_work"
  | "consulting"
  | "public_servant"
  | "medical"
  | "creative"
  | "barber"
  | "service"
  | "other";

export interface JobPreset {
  id: JobCategory;
  label: string;
  emoji: string;
  startingSalary: number;
  growthRate: number;
  peakAge: number;
  peakSalary: number;
}

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
  childEducation?: ChildEducation; // 子どもイベント用
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
  jobCategory: JobCategory;
  annualIncome: number;
  currentSavings: number;
  lifestyle: LifestyleType;
  events: LifeEvent[];
  investment: InvestmentProfile;
  salaryGrowth: SalaryGrowth;
  spouse: SpouseProfile;
  expenseBreakdown: ExpenseBreakdown;
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
