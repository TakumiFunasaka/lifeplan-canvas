"use client";

import type { UserProfile } from "@/lib/types";
import { LIFESTYLE_PRESETS } from "@/lib/constants";

export function BalanceMeter({ profile }: { profile: UserProfile }) {
  const lifestyle = LIFESTYLE_PRESETS.find((l) => l.id === profile.lifestyle)!;
  const savingsRate = lifestyle.savingsRate;
  const investRate = profile.investment.isInvesting
    ? Math.min(
        (profile.investment.monthlyAmount * 12) /
          (profile.annualIncome * 0.8),
        savingsRate
      )
    : 0;
  const selfInvestRate =
    (profile.events ?? []).some((e) => e.id === "skill_investment" || e.id === "contest" || e.label.includes("講習") || e.label.includes("自己投資")) ? 0.05 : 0;

  const consumptionRate = Math.max(
    0,
    1 - savingsRate - selfInvestRate
  );
  const pureInvestRate = investRate;
  const pureSavingsRate = Math.max(0, savingsRate - investRate);

  const segments = [
    { label: "消費", rate: consumptionRate, color: "bg-pink-400", emoji: "🛍️" },
    { label: "貯蓄", rate: pureSavingsRate, color: "bg-sky-400", emoji: "🏦" },
    { label: "投資", rate: pureInvestRate, color: "bg-violet-500", emoji: "📈" },
    { label: "自己投資", rate: selfInvestRate, color: "bg-amber-400", emoji: "📚" },
  ].filter((s) => s.rate > 0);

  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm border border-gray-100">
      <p className="font-bold text-sm mb-3">💰 お金の使い方バランス</p>

      {/* バー */}
      <div className="flex h-6 rounded-full overflow-hidden">
        {segments.map((seg) => (
          <div
            key={seg.label}
            className={`${seg.color} transition-all duration-500`}
            style={{ width: `${seg.rate * 100}%` }}
          />
        ))}
      </div>

      {/* ラベル */}
      <div className="flex flex-wrap gap-3 mt-3">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-1">
            <div className={`w-3 h-3 rounded-full ${seg.color}`} />
            <span className="text-xs text-gray-600">
              {seg.emoji} {seg.label} {Math.round(seg.rate * 100)}%
            </span>
          </div>
        ))}
      </div>

      {!profile.investment.isInvesting && (
        <p className="text-xs text-amber-600 mt-3">
          ⚠️ 投資が0%。少しでも回すと将来が大きく変わるよ
        </p>
      )}
    </div>
  );
}
