import type { YearlyData, UserProfile, Diagnosis, YabaiLevel } from "./types";
import { RETIREMENT_AGE } from "./constants";

export function diagnose(data: YearlyData[], profile: UserProfile): Diagnosis {
  const messages: string[] = [];
  let score = 50;

  const isInvesting = profile.investment.isInvesting && profile.investment.monthlyAmount > 0;

  // 65歳時点の資産
  const atRetirement = data.find((d) => d.age === RETIREMENT_AGE);
  const retirementAssets = atRetirement
    ? (isInvesting ? atRetirement.savingsWithInvestment : atRetirement.savings)
    : 0;

  if (retirementAssets >= 3000) {
    score += 20;
    messages.push("老後資金はかなり安心できるレベル！");
  } else if (retirementAssets >= 2000) {
    score += 10;
    messages.push("老後2000万円問題はクリアしてるね");
  } else if (retirementAssets >= 1000) {
    messages.push("老後資金がちょっと心もとないかも…2000万は欲しい");
  } else if (retirementAssets >= 0) {
    score -= 15;
    messages.push("65歳時点の資産がかなり少ない…老後が厳しくなりそう");
  } else {
    score -= 25;
    messages.push("退職時点で赤字になっちゃう…今すぐ対策が必要！");
  }

  // 80歳時点
  const atEnd = data[data.length - 1];
  const endAssets = isInvesting ? atEnd.savingsWithInvestment : atEnd.savings;

  if (endAssets < 0) {
    score -= 15;
    messages.push("80歳までに資金が尽きる計算…これはマジでヤバい");
  } else if (endAssets < 500) {
    score -= 5;
    messages.push("80歳時点でギリギリ。突発的な出費に耐えられないかも");
  }

  // 貯蓄がマイナスになるタイミング
  const goesNegative = data.find((d) =>
    isInvesting ? d.savingsWithInvestment < 0 : d.savings < 0
  );
  if (goesNegative) {
    score -= 10;
    messages.push(`${goesNegative.age}歳で資産がマイナスに突入する予測。計画の見直しが必要`);
  }

  // 投資
  if (!isInvesting) {
    score -= 10;
    messages.push("投資をしてないと、お金が増えるチャンスを逃してる。NISAだけでも始めてみて！");
  } else if (profile.investment.monthlyAmount >= 3) {
    score += 10;
    messages.push("投資を続けてるの、素晴らしい！複利の力で将来大きな差になるよ");
  } else {
    score += 5;
    messages.push("投資を始めてるのはGood！余裕ができたら少しずつ増やしてみて");
  }

  // 投資ありとなしの差
  if (isInvesting && atRetirement) {
    const gap = atRetirement.savingsWithInvestment - atRetirement.savings;
    if (gap > 500) {
      messages.push(`投資のおかげで65歳時点で約${Math.round(gap)}万円多くなる計算！`);
    }
  }

  // 生活スタイル
  if (profile.lifestyle === "spender") {
    score -= 5;
    messages.push("楽しむのは大事だけど、将来の自分にも少し投資してあげて");
  } else if (profile.lifestyle === "saver") {
    score += 5;
    messages.push("堅実でいいね！でも経験にもお金を使うと人生豊かになるよ");
  }

  // 自己投資
  const events = profile.events ?? [];
  const hasSelfInvest = events.some(
    (e) => e.id === "skill_investment" || e.id === "contest" || e.label.includes("講習") || e.label.includes("自己投資")
  );
  if (hasSelfInvest) {
    score += 5;
    messages.push("自己投資してるの最高！入金力を上げるのが最強の投資");
  }

  // 独立・開業の準備度
  const indepEvent = events.find((e) => e.id === "independence");
  if (indepEvent) {
    const selfFund = indepEvent.lumpCost || 100;
    const atIndep = data.find((d) => d.age === indepEvent.age);
    if (atIndep) {
      const assetsAtIndep = isInvesting ? atIndep.savingsWithInvestment : atIndep.savings;
      if (assetsAtIndep >= selfFund * 2) {
        score += 5;
        messages.push(`${indepEvent.age}歳の独立時に自己資金${selfFund}万の2倍以上ある計算。運転資金にも余裕がありそう！`);
      } else if (assetsAtIndep >= selfFund) {
        messages.push(`${indepEvent.age}歳時点で自己資金${selfFund}万はギリギリ確保できそう。もう少し余裕があると安心`);
      } else {
        score -= 10;
        messages.push(`${indepEvent.age}歳の独立時に自己資金が足りない予測…！毎月の貯蓄を見直すか、独立時期を少し後ろにずらしてみて`);
      }
    }
    if (hasSelfInvest) {
      score += 3;
      messages.push("技術講習やコンテストへの挑戦は、独立後の集客力に直結。自己投資あっての自己資金！");
    }
  }

  score = Math.max(0, Math.min(100, score));

  let level: YabaiLevel;
  let label: string;
  let emoji: string;
  let color: string;

  if (score >= 75) {
    level = "safe"; label = "安泰！"; emoji = "😊"; color = "emerald";
  } else if (score >= 55) {
    level = "ok"; label = "まあまあ"; emoji = "🙂"; color = "sky";
  } else if (score >= 40) {
    level = "warning"; label = "ちょっと注意"; emoji = "⚠️"; color = "amber";
  } else if (score >= 25) {
    level = "yabai"; label = "ヤバいかも"; emoji = "😰"; color = "orange";
  } else {
    level = "very_yabai"; label = "超ヤバい"; emoji = "🚨"; color = "red";
  }

  return { level, score, label, emoji, color, messages };
}
