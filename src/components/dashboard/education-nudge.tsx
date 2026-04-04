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
  const events = profile.events ?? [];
  const isInvesting = profile.investment.isInvesting && profile.investment.monthlyAmount > 0;

  const hasIndependence = events.some((e) => e.id === "independence");
  const hasSelfInvest = events.some(
    (e) => e.id === "skill_investment" || e.id === "contest" || e.label.includes("講習") || e.label.includes("自己投資")
  );
  const hasMarriage = events.some((e) => e.id === "marriage");

  // --- 独立・開業を目指す人向け ---
  if (hasIndependence) {
    const indepEvent = events.find((e) => e.id === "independence")!;
    const yearsUntil = indepEvent.age - profile.age;
    const selfFundNeeded = indepEvent.lumpCost || 100;

    nudges.push({
      emoji: "🏪",
      title: `独立まであと${yearsUntil}年。自己資金${selfFundNeeded}万円、貯められる？`,
      body: `日本政策金融公庫から1000万円借りるにしても、自己資金は最低${selfFundNeeded}万円必要。さらに運転資金があると安心。${hasMarriage ? "結婚資金も並行して貯めるなら、計画的に動かないとキツい。" : ""}今から毎月いくら貯められるか、逆算してみよう！`,
      color: "bg-orange-50 border-orange-300",
    });

    if (hasSelfInvest) {
      nudges.push({
        emoji: "✂️",
        title: "技術が自己資金を生む",
        body: "技術講習やコンテストへの挑戦は「お金を使う」んじゃなくて「将来の自分に投資する」こと。技術が上がれば指名が増え、収入が上がり、自己資金も早く貯まる。自己投資あっての自己資金！",
        color: "bg-emerald-50 border-emerald-200",
      });
    } else {
      nudges.push({
        emoji: "📚",
        title: "自己投資、してる？",
        body: "独立を目指すなら、技術講習やコンテストへの挑戦は欠かせない。お金はかかるけど、技術力は独立後の集客力に直結する。「自己投資」イベントも追加してみて！",
        color: "bg-amber-50 border-amber-200",
      });
    }
  }

  // --- 投資してない人向け ---
  if (!isInvesting && !hasIndependence) {
    const years = 65 - profile.age;
    nudges.push({
      emoji: "📊",
      title: "月1万円から始めるだけで…",
      body: `年利5%で${years}年間運用すると、元本${years * 12}万円が約${Math.round(years * 12 * 1.6)}万円に。差額はまるまる「お金が稼いだお金」！`,
      color: "bg-violet-50 border-violet-200",
    });
  }

  // 独立目指す人の投資タイミング
  if (!isInvesting && hasIndependence) {
    nudges.push({
      emoji: "📈",
      title: "独立資金を貯めつつ、投資も始められる",
      body: "全額貯金じゃなくても、月5000円でもNISAで積み立てておくと、独立後の安心材料になる。開業してからだと忙しくて始められないかも！",
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

  // 自己投資（独立以外の文脈）
  if (hasSelfInvest && !hasIndependence) {
    nudges.push({
      emoji: "🚀",
      title: "入金力UP = 最強の投資",
      body: "スキルアップで年収が上がれば、投資に回せる額も増える。自己投資→年収UP→投資額UP、この好循環が人生を変える！",
      color: "bg-emerald-50 border-emerald-200",
    });
  }

  // ライフイベント多い人
  if (events.length >= 5) {
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
      emoji: "🚨",
      title: "このプラン、途中で破綻する",
      body: `${goesNegative.age}歳で資産がマイナスに。マイナス＝借金が必要ってこと。借金には利子がつくから、一度ハマると抜け出すのがめちゃくちゃ大変。「最後はプラスだからOK」じゃない。途中で一度でもマイナスになるプランは現実的に成り立たないよ。支出を減らす・イベント時期をずらす・収入を上げる、どれかで黒字をキープできるプランを探ろう！`,
      color: "bg-red-50 border-red-300",
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
