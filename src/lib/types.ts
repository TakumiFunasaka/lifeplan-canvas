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
  startingSalary: number; // 万円/年
  growthRate: number; // 年間昇給率
  peakAge: number;
  peakSalary: number; // 万円/年
}

// --- 生活スタイル ---
export type LifestyleType = "saver" | "normal" | "spender";

export interface LifestylePreset {
  id: LifestyleType;
  label: string;
  emoji: string;
  savingsRate: number; // 手取りに対する貯蓄率
  description: string;
}

// --- ライフイベント ---
export interface LifeEvent {
  id: string;
  label: string;
  emoji: string;
  age: number; // 発生年齢
  lumpCost: number; // 一時費用（万円）
  annualCost: number; // 年間継続費用（万円）
  durationYears: number; // 継続年数（0=一時のみ）
  replaceCycleYears?: number; // 買い替えサイクル（年）。設定すると一時費用がサイクルごとに再発生
  isCustom?: boolean;
}

// プリセットイベントの定義（テンプレート）
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

// --- 投資プロファイル ---
export interface InvestmentProfile {
  isInvesting: boolean;
  knowsNisa: boolean;
  monthlyAmount: number; // 万円/月（固定額モード時）
  expectedReturn: number; // 年利（小数: 0.05 = 5%）
  useRatioMode: boolean; // true=手取りの%で投資, false=固定額
  ratioPercent: number; // 手取りに対する投資割合（%表記: 10 = 10%）
}

// --- 昇給設定 ---
export interface SalaryGrowth {
  annualRaisePercent: number; // 年間昇給率（%表記: 2 = 2%）
  peakIncome: number; // ゴール年収（万円）
}

// --- ユーザープロファイル ---
export interface UserProfile {
  age: number;
  jobCategory: JobCategory;
  annualIncome: number; // 万円（ユーザー入力）
  currentSavings: number; // 万円
  lifestyle: LifestyleType;
  events: LifeEvent[];
  investment: InvestmentProfile;
  salaryGrowth: SalaryGrowth;
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

// --- オンボーディング ---
export type OnboardingStep = 0 | 1 | 2 | 3 | 4;
