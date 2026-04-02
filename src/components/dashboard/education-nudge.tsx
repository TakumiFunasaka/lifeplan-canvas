"use client";

import type { UserProfile, YearlyData } from "@/lib/types";

interface Nudge {
  emoji: string;
  title: string;
  body: string;
  color: string;
}

export function EducationNudge({
  profile,
  data,
}: {
  profile: UserProfile;
  data: YearlyData[];
}) {
  const nudges: Nudge[] = [];
  const isInvesting = profile.investment.isInvesting && profile.investment.monthlyAmount > 0;

  // 投資してない人向け
  if (!isInvesting) {
    const years = 65 - profile.age;
    nudges.push({
      emoji: "📊",
      title: "月1万円から始めるだけで…",
      body: `年利5%で${years}年間運用すると、元本${years * 12}万円が約${Math.round(years * 12 * 1.6)}万円に。差額はまるまる「お金が稼いだお金」！`,
      color: "bg-violet-50 border-violet-200",
    });
  }

  // 5年遅れの影響
  if (isInvesting && profile.age < 30) {
    const years = 65 - profile.age;
    const monthly = profile.investment.monthlyAmount;
    const r = 0.05 / 12;
    const fvNow = monthly * ((Math.pow(1 + r, years * 12) - 1) / r);
    const fvLater = monthly * ((Math.pow(1 + r, (years - 5) * 12) - 1) / r);
    const diff = Math.round(fvNow - fvLater);
    if (diff > 0) {
      nudges.push({
        emoji: "⏰",
        title: "5年遅く始めるとどうなる？",
        body: `今始めた場合と5年後に始めた場合で、約${diff}万円の差がつく。若いうちのスタートは最強の武器！`,
        color: "bg-amber-50 border-amber-200",
      });
    }
  }

  // 自己投資してる人への応援
  const hasSelfInvest = (profile.events ?? []).some(
    (e) => e.id === "skill_investment" || e.label.includes("自己投資")
  );
  if (hasSelfInvest) {
    nudges.push({
      emoji: "🚀",
      title: "入金力UP = 最強の投資",
      body: "スキルアップで年収が上がれば、投資に回せる額も増える。自己投資→年収UP→投資額UP、この好循環が人生を変える！",
      color: "bg-emerald-50 border-emerald-200",
    });
  }

  // ライフイベント多い人
  if ((profile.events ?? []).length >= 5) {
    nudges.push({
      emoji: "🎯",
      title: "やりたいこと、全部叶えるには",
      body: "たくさんの夢があるのは素晴らしい！実現するためにも、早めの資産形成がカギ。優先順位をつけてみるのもアリ。",
      color: "bg-pink-50 border-pink-200",
    });
  }

  // 貯蓄ゼロ警告
  const goesNegative = data.find((d) =>
    isInvesting ? d.savingsWithInvestment < 0 : d.savings < 0
  );
  if (goesNegative) {
    nudges.push({
      emoji: "🆘",
      title: "このままだと赤字になるかも",
      body: `今の計画だと${goesNegative.age}歳で貯金が底をつく予測。パラメータを調整して、黒字キープできるプランを探ってみよう！`,
      color: "bg-red-50 border-red-200",
    });
  }

  if (nudges.length === 0) return null;

  return (
    <div className="space-y-3">
      <p className="font-bold text-sm">📝 知っておきたいこと</p>
      {nudges.map((nudge, i) => (
        <div key={i} className={`rounded-2xl border p-4 ${nudge.color}`}>
          <p className="font-medium text-sm">{nudge.emoji} {nudge.title}</p>
          <p className="text-xs text-gray-700 mt-1 leading-relaxed">{nudge.body}</p>
        </div>
      ))}
    </div>
  );
}
