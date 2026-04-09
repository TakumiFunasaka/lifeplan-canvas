import type { UserProfile, YearlyData, ExpenseBreakdown } from "./types";
import {
  LIFESTYLE_PRESETS,
  EFFECTIVE_TAX_RATE,
  PENSION_MONTHLY,
  RETIREMENT_AGE,
  SIMULATION_END_AGE,
  SELF_INVESTMENT_INCOME_BOOST,
  EDUCATION_COSTS,
  getEducationStage,
  DEFAULT_EXPENSE,
} from "./constants";

function getMonthlyExpenseTotal(eb: ExpenseBreakdown): number {
  return Object.values(eb).reduce((s, v) => s + (v || 0), 0);
}

// インフレ率（年）
const INFLATION_RATE = 0.015;
// 退職後の投資リターン倍率（現役時の20%に低下）
const POST_RETIREMENT_RETURN_RATIO = 0.2;
// 退職後に現金がこの額(万円)を下回ったら投資を取り崩す
const DRAWDOWN_BUFFER = 300;

export function simulate(profile: UserProfile): YearlyData[] {
  const lifestyle = LIFESTYLE_PRESETS.find((l) => l.id === profile.lifestyle)!;
  const events = profile.events ?? [];
  const sg = profile.salaryGrowth ?? { annualRaisePercent: 2, peakIncome: 550 };
  const spouse = profile.spouse ?? { enabled: false, annualIncome: 0, salaryGrowth: { annualRaisePercent: 2, peakIncome: 500 } };
  const eb = profile.expenseBreakdown ?? DEFAULT_EXPENSE;

  const data: YearlyData[] = [];
  let income = profile.annualIncome || 300;
  let spouseIncome = spouse.annualIncome || 0;
  let cashNoInvest = profile.currentSavings;
  let cashWithInvest = profile.currentSavings;
  let investmentBalance = 0;

  const marriageEvent = events.find((e) => e.id === "marriage");
  const marriageAge = marriageEvent?.age ?? 999;

  const selfInvEvent = events.find(
    (e) => e.id === "skill_investment" || e.id === "contest" || e.label.includes("講習") || e.label.includes("自己投資")
  );

  // 独立イベント
  const independenceEvent = events.find((e) => e.id === "independence");
  const independenceAge = independenceEvent?.age ?? 999;

  const monthlyExpense = getMonthlyExpenseTotal(eb);
  const useExpenseBreakdown = monthlyExpense > 0;

  // マイホームイベントの年齢を取得(購入後は家賃ゼロ)
  const homeEvent = events.find((e) => e.id === "home");
  const homeAge = homeEvent?.age ?? 999;
  const housingExpense = eb.housing ?? 0; // 月額家賃(万円)

  for (let age = profile.age; age <= SIMULATION_END_AGE; age++) {
    // --- 昇給 ---
    if (age > profile.age && age < RETIREMENT_AGE) {
      const raiseRate = sg.annualRaisePercent / 100;
      const selfBoost =
        selfInvEvent && age >= selfInvEvent.age && age < selfInvEvent.age + selfInvEvent.durationYears
          ? SELF_INVESTMENT_INCOME_BOOST : 0;
      if (income < sg.peakIncome) {
        income = Math.min(income * (1 + raiseRate + selfBoost), sg.peakIncome);
      } else if (selfBoost > 0) {
        income *= 1 + selfBoost;
      }

      if (spouse.enabled && age > marriageAge) {
        const spSg = spouse.salaryGrowth;
        const spRaise = spSg.annualRaisePercent / 100;
        if (spouseIncome < spSg.peakIncome) {
          spouseIncome = Math.min(spouseIncome * (1 + spRaise), spSg.peakIncome);
        }
      }
    }

    // --- 世帯収入 ---
    const isMarried = spouse.enabled && age >= marriageAge;
    const isRetired = age >= RETIREMENT_AGE;

    // 年金: 報酬比例の簡易計算（平均年収ベース）
    const selfPension = PENSION_MONTHLY * 12; // 基礎年金180万
    const selfKousei = Math.round(income * 0.005481 * Math.min(age - profile.age, 40) / 10); // 報酬比例の概算
    const myIncome = isRetired ? selfPension + selfKousei : income;
    const partnerIncome = isMarried
      ? (isRetired ? selfPension * 0.7 : spouseIncome)
      : 0;
    const householdIncome = myIncome + partnerIncome;

    // --- 手取り ---
    const takeHome = isRetired
      ? householdIncome
      : householdIncome * (1 - EFFECTIVE_TAX_RATE);

    // --- 基本生活費 ---
    const yearsFromStart = age - profile.age;
    const inflationFactor = Math.pow(1 + INFLATION_RATE, yearsFromStart);

    let baseExpense: number;
    if (isRetired) {
      // 退職後: 現役時の支出の70%（子供独立、ローン完済等を反映）
      if (useExpenseBreakdown) {
        baseExpense = monthlyExpense * 12 * 0.7 * inflationFactor;
      } else {
        baseExpense = takeHome * 0.85;
      }
    } else if (useExpenseBreakdown) {
      // マイホーム購入後は家賃分を差し引く
      const effectiveMonthly = age >= homeAge
        ? monthlyExpense - housingExpense
        : monthlyExpense;
      baseExpense = effectiveMonthly * 12 * inflationFactor;
      if (isMarried) baseExpense *= 1.5;
    } else {
      baseExpense = takeHome * (1 - lifestyle.savingsRate) * inflationFactor;
      if (isMarried) baseExpense *= 1.5;
      // ライフスタイルモードでもマイホーム後は家賃相当(月6万≒年72万)を削減
      if (age >= homeAge) baseExpense -= 72 * inflationFactor;
    }

    // --- 支出フェーズ簡易版: 独立後は経費が増える ---
    if (age >= independenceAge && age < RETIREMENT_AGE) {
      // 独立後は売上が収入だが、経費率が高い(店舗維持費等)
      // ただしイベントの年間コストに含まれているので、ここでは追加しない
      // 代わりに独立後の生活費を若干下げる（通勤費等が減る）
      baseExpense *= 0.95;
    }

    // --- ライフイベント費用 ---
    let eventCost = 0;
    const yearEventLabels: string[] = [];

    for (const event of events) {
      const isChildEvent = event.id.startsWith("child_");
      if (isChildEvent && event.childEducation) {
        const childAge = age - event.age;
        if (childAge >= 0 && childAge < 22) {
          const stage = getEducationStage(childAge);
          if (stage) {
            const level = event.childEducation[stage];
            const costs = EDUCATION_COSTS[stage];
            eventCost += costs[level] * inflationFactor; // 教育費にもインフレ適用
          } else if (childAge < 3) {
            eventCost += 40 * inflationFactor;
          }
          if (childAge === 0) yearEventLabels.push(`${event.emoji}${event.label}`);
        }
        if (age === event.age && event.lumpCost > 0) {
          eventCost += event.lumpCost;
        }
        continue;
      }

      if (event.loan && event.loan.amount > 0) {
        if (age === event.age) {
          eventCost += event.lumpCost - event.loan.amount;
          yearEventLabels.push(`${event.emoji}${event.label}`);
        }
        const r = event.loan.interestRate / 100;
        const n = event.loan.repaymentYears;
        const annualRepay = r > 0
          ? event.loan.amount * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
          : event.loan.amount / n;
        if (age >= event.age && age < event.age + n) {
          eventCost += annualRepay;
          if (age === event.age) yearEventLabels.push("📋返済開始");
        }
        continue;
      }

      // 一時費用(将来のイベントにはインフレ適用)
      if (age === event.age && event.lumpCost > 0) {
        const yearsUntilEvent = event.age - profile.age;
        const lumpInflation = Math.pow(1 + INFLATION_RATE, Math.max(0, yearsUntilEvent));
        eventCost += event.lumpCost * lumpInflation;
        yearEventLabels.push(`${event.emoji}${event.label}`);
      }

      // 買い替えサイクル(インフレ適用)
      if (
        event.replaceCycleYears && event.replaceCycleYears > 0 &&
        age > event.age && event.lumpCost > 0 &&
        (age - event.age) % event.replaceCycleYears === 0 &&
        event.durationYears > 0 && age < event.age + event.durationYears
      ) {
        eventCost += event.lumpCost * inflationFactor;
        yearEventLabels.push(`${event.emoji}買替え`);
      }

      // 継続費用(インフレ適用)
      if (event.annualCost > 0 && event.durationYears > 0 &&
        age >= event.age && age < event.age + event.durationYears) {
        eventCost += event.annualCost * inflationFactor;
        if (age === event.age && !yearEventLabels.some((l) => l.includes(event.label))) {
          yearEventLabels.push(`${event.emoji}${event.label}`);
        }
      }
    }

    // --- 年間収支 ---
    const annualNet = takeHome - baseExpense - eventCost;

    const DEBT_INTEREST = 0.05;

    // 投資なしケース
    cashNoInvest += annualNet;
    if (cashNoInvest < 0) {
      cashNoInvest *= 1 + DEBT_INTEREST;
    }

    // 投資ありケース
    const inv = profile.investment;
    const canInvest = cashWithInvest >= 0;

    // 希望投資額
    let desiredInvestAmount = (inv.isInvesting && canInvest)
      ? inv.useRatioMode
        ? takeHome * (inv.ratioPercent / 100)
        : inv.monthlyAmount * 12
      : 0;

    // 余剰連動: 投資前の余剰でキャップ
    if (desiredInvestAmount > 0 && !isRetired) {
      const surplus = annualNet; // 投資前の年間余剰
      desiredInvestAmount = Math.max(0, Math.min(desiredInvestAmount, surplus));
    }

    if (isRetired) {
      // 退職後: 積立停止、リターン低下
      cashWithInvest += annualNet;
      investmentBalance *= 1 + inv.expectedReturn * POST_RETIREMENT_RETURN_RATIO;

      // 取り崩し: 現金がバッファ以下なら投資を売却
      if (cashWithInvest < DRAWDOWN_BUFFER && investmentBalance > 0) {
        const needed = DRAWDOWN_BUFFER - cashWithInvest + Math.abs(Math.min(0, annualNet));
        const drawdown = Math.min(needed, investmentBalance);
        cashWithInvest += drawdown;
        investmentBalance -= drawdown;
      }
    } else if (desiredInvestAmount > 0) {
      cashWithInvest += annualNet - desiredInvestAmount;
      investmentBalance += desiredInvestAmount;
      investmentBalance *= 1 + inv.expectedReturn;
    } else {
      cashWithInvest += annualNet;
    }

    if (cashWithInvest + investmentBalance < 0) {
      cashWithInvest *= 1 + DEBT_INTEREST;
    }

    data.push({
      age,
      savings: Math.round(cashNoInvest),
      savingsWithInvestment: Math.round(cashWithInvest + investmentBalance),
      income: Math.round(householdIncome),
      investmentBalance: Math.round(investmentBalance),
      eventLabels: yearEventLabels,
    });
  }

  return data;
}
