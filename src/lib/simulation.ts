import type { UserProfile, YearlyData } from "./types";
import {
  LIFESTYLE_PRESETS,
  EFFECTIVE_TAX_RATE,
  PENSION_MONTHLY,
  RETIREMENT_AGE,
  SIMULATION_END_AGE,
  SELF_INVESTMENT_INCOME_BOOST,
} from "./constants";

export function simulate(profile: UserProfile): YearlyData[] {
  const lifestyle = LIFESTYLE_PRESETS.find((l) => l.id === profile.lifestyle)!;
  const events = profile.events ?? [];
  const sg = profile.salaryGrowth ?? { annualRaisePercent: 2, peakIncome: 550 };

  const data: YearlyData[] = [];
  let income = profile.annualIncome || 300;
  let cashNoInvest = profile.currentSavings;
  let cashWithInvest = profile.currentSavings;
  let investmentBalance = 0;

  // 自己投資イベント
  const selfInvEvent = events.find(
    (e) => e.id === "skill_investment" || e.label.includes("自己投資")
  );

  for (let age = profile.age; age <= SIMULATION_END_AGE; age++) {
    // --- 昇給 ---
    if (age > profile.age && age < RETIREMENT_AGE) {
      const raiseRate = sg.annualRaisePercent / 100;
      const selfBoost =
        selfInvEvent && age >= selfInvEvent.age && age < selfInvEvent.age + selfInvEvent.durationYears
          ? SELF_INVESTMENT_INCOME_BOOST
          : 0;

      // ゴール年収に達するまで昇給、超えたら停止
      if (income < sg.peakIncome) {
        income = Math.min(income * (1 + raiseRate + selfBoost), sg.peakIncome);
      } else if (selfBoost > 0) {
        // 自己投資ブーストはゴール超えても適用
        income *= 1 + selfBoost;
      }
    }

    const currentIncome = age >= RETIREMENT_AGE ? PENSION_MONTHLY * 12 : income;
    const takeHome = age >= RETIREMENT_AGE ? currentIncome : currentIncome * (1 - EFFECTIVE_TAX_RATE);
    const baseExpense = age >= RETIREMENT_AGE ? takeHome * 0.85 : takeHome * (1 - lifestyle.savingsRate);

    // --- ライフイベント費用 ---
    let eventCost = 0;
    const yearEventLabels: string[] = [];

    for (const event of events) {
      // 一時費用（初回）
      if (age === event.age && event.lumpCost > 0) {
        eventCost += event.lumpCost;
        yearEventLabels.push(`${event.emoji}${event.label}`);
      }

      // 買い替えサイクル（初回以降、サイクルごとに一時費用が再発生）
      if (
        event.replaceCycleYears &&
        event.replaceCycleYears > 0 &&
        age > event.age &&
        event.lumpCost > 0 &&
        (age - event.age) % event.replaceCycleYears === 0 &&
        event.durationYears > 0 &&
        age < event.age + event.durationYears
      ) {
        eventCost += event.lumpCost;
        yearEventLabels.push(`${event.emoji}買替え`);
      }

      // 継続費用
      if (
        event.annualCost > 0 &&
        event.durationYears > 0 &&
        age >= event.age &&
        age < event.age + event.durationYears
      ) {
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
    // 投資額算出: 比率モードなら手取りから計算、固定額モードならそのまま
    const annualInvestAmount = inv.isInvesting
      ? inv.useRatioMode
        ? takeHome * (inv.ratioPercent / 100)
        : inv.monthlyAmount * 12
      : 0;

    if (annualInvestAmount > 0) {
      const annualInvest = annualInvestAmount;
      if (age < RETIREMENT_AGE) {
        cashWithInvest += annualNet - annualInvest;
        investmentBalance += annualInvest;
        investmentBalance *= 1 + profile.investment.expectedReturn;
      } else {
        cashWithInvest += annualNet;
        investmentBalance *= 1 + profile.investment.expectedReturn * 0.5;
      }
    } else {
      cashWithInvest += annualNet;
    }

    data.push({
      age,
      savings: Math.round(cashNoInvest),
      savingsWithInvestment: Math.round(cashWithInvest + investmentBalance),
      income: Math.round(currentIncome),
      investmentBalance: Math.round(investmentBalance),
      eventLabels: yearEventLabels,
    });
  }

  return data;
}
