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

  // 結婚イベントの年齢を取得
  const marriageEvent = events.find((e) => e.id === "marriage");
  const marriageAge = marriageEvent?.age ?? 999;

  // 自己投資イベント（技術講習・コンテスト含む）
  const selfInvEvent = events.find(
    (e) => e.id === "skill_investment" || e.id === "contest" || e.label.includes("講習") || e.label.includes("自己投資")
  );

  // 支出内訳から月額支出を算出（年額に変換）
  const monthlyExpense = getMonthlyExpenseTotal(eb);
  // 支出内訳モードの場合はlifestyleのsavingsRateの代わりに使う
  const useExpenseBreakdown = monthlyExpense > 0;

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

      // 配偶者の昇給（結婚後）
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
    const myIncome = age >= RETIREMENT_AGE ? PENSION_MONTHLY * 12 : income;
    const partnerIncome = isMarried
      ? (age >= RETIREMENT_AGE ? PENSION_MONTHLY * 12 * 0.7 : spouseIncome) // 配偶者年金は7掛け概算
      : 0;
    const householdIncome = myIncome + partnerIncome;

    // --- 手取り ---
    const takeHome = age >= RETIREMENT_AGE
      ? householdIncome
      : householdIncome * (1 - EFFECTIVE_TAX_RATE);

    // --- 基本生活費 ---
    // 年齢とともに支出が年0.5%ずつ上がる（生活水準の自然上昇）
    const yearsFromStart = age - profile.age;
    const expenseGrowth = Math.pow(1.005, yearsFromStart);

    let baseExpense: number;
    if (age >= RETIREMENT_AGE) {
      baseExpense = takeHome * 0.85;
    } else if (useExpenseBreakdown) {
      baseExpense = monthlyExpense * 12 * expenseGrowth;
      // 結婚後は1.8倍（2人分の生活費、ただし住居等は共有）
      if (isMarried) baseExpense *= 1.8;
    } else {
      baseExpense = takeHome * (1 - lifestyle.savingsRate) * expenseGrowth;
      if (isMarried) baseExpense *= 1.8;
    }

    // --- ライフイベント費用 ---
    let eventCost = 0;
    const yearEventLabels: string[] = [];

    for (const event of events) {
      // 子どもイベントは教育レベルに応じてコスト計算
      const isChildEvent = event.id.startsWith("child_");
      if (isChildEvent && event.childEducation) {
        const childAge = age - event.age;
        if (childAge >= 0 && childAge < 22) {
          const stage = getEducationStage(childAge);
          if (stage) {
            const level = event.childEducation[stage];
            const costs = EDUCATION_COSTS[stage];
            eventCost += costs[level];
          } else if (childAge < 3) {
            eventCost += 40; // 0-2歳: 保育・育児費年40万
          }
          if (childAge === 0) yearEventLabels.push(`${event.emoji}${event.label}`);
        }
        // 出産費用
        if (age === event.age && event.lumpCost > 0) {
          eventCost += event.lumpCost;
        }
        continue;
      }

      // 借入モデル: 借入年に資金が入り（一時費用と相殺）、返済が発生
      if (event.loan && event.loan.amount > 0) {
        if (age === event.age) {
          // 借入額が手元に入る（プラス）→ 一時費用（自己資金）と相殺
          eventCost += event.lumpCost - event.loan.amount; // 自己資金100 - 借入1000 = -900（手元に残る）
          yearEventLabels.push(`${event.emoji}${event.label}`);
        }
        // 返済（元利均等の年間返済額）
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

      // 一時費用
      if (age === event.age && event.lumpCost > 0) {
        eventCost += event.lumpCost;
        yearEventLabels.push(`${event.emoji}${event.label}`);
      }

      // 買い替えサイクル
      if (
        event.replaceCycleYears && event.replaceCycleYears > 0 &&
        age > event.age && event.lumpCost > 0 &&
        (age - event.age) % event.replaceCycleYears === 0 &&
        event.durationYears > 0 && age < event.age + event.durationYears
      ) {
        eventCost += event.lumpCost;
        yearEventLabels.push(`${event.emoji}買替え`);
      }

      // 継続費用
      if (event.annualCost > 0 && event.durationYears > 0 &&
        age >= event.age && age < event.age + event.durationYears) {
        eventCost += event.annualCost;
        if (age === event.age && !yearEventLabels.some((l) => l.includes(event.label))) {
          yearEventLabels.push(`${event.emoji}${event.label}`);
        }
      }
    }

    // --- 年間収支 ---
    const annualNet = takeHome - baseExpense - eventCost;
    cashNoInvest += annualNet;

    const inv = profile.investment;
    const annualInvestAmount = inv.isInvesting
      ? inv.useRatioMode
        ? takeHome * (inv.ratioPercent / 100)
        : inv.monthlyAmount * 12
      : 0;

    if (annualInvestAmount > 0) {
      if (age < RETIREMENT_AGE) {
        cashWithInvest += annualNet - annualInvestAmount;
        investmentBalance += annualInvestAmount;
        investmentBalance *= 1 + inv.expectedReturn;
      } else {
        cashWithInvest += annualNet;
        investmentBalance *= 1 + inv.expectedReturn * 0.5;
      }
    } else {
      cashWithInvest += annualNet;
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
