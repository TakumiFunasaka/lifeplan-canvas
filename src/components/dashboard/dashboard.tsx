"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { useLifePlanStore } from "@/hooks/use-lifeplan-store";
import { simulate } from "@/lib/simulation";
import { diagnose } from "@/lib/diagnosis";
import type { YearlyData, UserProfile } from "@/lib/types";
import { AssetChart } from "./asset-chart";
import { YabaiMeter } from "./yabai-meter";
import { InvestmentGap } from "./investment-gap";
import { BalanceMeter } from "./balance-meter";
import { WhatIfPanel } from "./what-if-panel";
import { EducationNudge } from "./education-nudge";
import { WhatIfCompare } from "./what-if-compare";
import { Button } from "@/components/ui/button";

function IndependenceMilestone({
  data,
  profile,
  isInvesting,
}: {
  data: YearlyData[];
  profile: UserProfile;
  isInvesting: boolean;
}) {
  const events = profile.events ?? [];
  const indepEvent = events.find((e) => e.id === "independence");
  if (!indepEvent) return null;

  const selfFund = indepEvent.lumpCost || 100;
  const atIndep = data.find((d) => d.age === indepEvent.age);
  const assetsAtIndep = atIndep
    ? isInvesting ? atIndep.savingsWithInvestment : atIndep.savings
    : 0;
  const yearsUntil = indepEvent.age - profile.age;
  const monthlyNeeded = yearsUntil > 0 ? Math.round((selfFund - profile.currentSavings) / yearsUntil / 12 * 10) / 10 : 0;
  const isReady = assetsAtIndep >= selfFund;

  return (
    <div className={`rounded-3xl p-5 ${isReady ? "bg-emerald-50 border border-emerald-200" : "bg-orange-50 border border-orange-200"}`}>
      <p className="font-bold text-sm">🏪 独立・開業ロードマップ</p>
      <div className="mt-3 space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-gray-600">目標時期</span>
          <span className="font-bold">{indepEvent.age}歳（あと{yearsUntil}年）</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-gray-600">必要な自己資金</span>
          <span className="font-bold">{selfFund}万円〜</span>
        </div>
        {indepEvent.loan && (
          <>
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">借入額</span>
              <span className="font-bold">{indepEvent.loan.amount.toLocaleString()}万円</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">返済</span>
              <span className="font-bold">
                {(() => {
                  const r = indepEvent.loan.interestRate / 100;
                  const n = indepEvent.loan.repaymentYears;
                  const a = indepEvent.loan.amount;
                  const annual = r > 0 ? a * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : a / n;
                  return `月${(annual / 12).toFixed(1)}万 × ${n}年`;
                })()}
              </span>
            </div>
          </>
        )}
        <div className="flex justify-between text-xs">
          <span className="text-gray-600">{indepEvent.age}歳時点の予測資産</span>
          <span className={`font-bold ${isReady ? "text-emerald-600" : "text-orange-600"}`}>
            {Math.round(assetsAtIndep).toLocaleString()}万円
          </span>
        </div>

        {/* プログレスバー */}
        <div className="w-full h-3 bg-white/60 rounded-full overflow-hidden mt-1">
          <div
            className={`h-full rounded-full transition-all duration-700 ${isReady ? "bg-emerald-500" : "bg-orange-400"}`}
            style={{ width: `${Math.min(100, (assetsAtIndep / selfFund) * 100)}%` }}
          />
        </div>

        {!isReady && monthlyNeeded > 0 && (
          <p className="text-xs text-orange-700 mt-1">
            💡 あと月<span className="font-bold">{monthlyNeeded}万円</span>ずつ貯めれば間に合う計算。
            結婚も考えるなら、もう少し余裕を持って計画しよう
          </p>
        )}
        {isReady && (
          <p className="text-xs text-emerald-700 mt-1">
            ✅ 自己資金はクリアできそう！運転資金に余裕があるとさらに安心
          </p>
        )}
      </div>
    </div>
  );
}

function formatMan(v: number) {
  if (Math.abs(v) >= 10000) return `${(v / 10000).toFixed(1)}億円`;
  return `${Math.round(v).toLocaleString()}万円`;
}

export function Dashboard() {
  const profile = useLifePlanStore((s) => s.profile);
  const resetAll = useLifePlanStore((s) => s.resetAll);

  const data = useMemo(() => simulate(profile), [profile]);
  const diagnosis = useMemo(() => diagnose(data, profile), [data, profile]);

  const isInvesting = profile.investment.isInvesting && profile.investment.monthlyAmount > 0;
  const finalAssets = isInvesting
    ? data[data.length - 1]?.savingsWithInvestment ?? 0
    : data[data.length - 1]?.savings ?? 0;

  // 再計算フラッシュアニメーション
  const [flash, setFlash] = useState(false);
  const prevProfileRef = useRef(profile);
  useEffect(() => {
    if (prevProfileRef.current !== profile) {
      setFlash(true);
      const timer = setTimeout(() => setFlash(false), 600);
      prevProfileRef.current = profile;
      return () => clearTimeout(timer);
    }
  }, [profile]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 via-pink-50 to-amber-50 px-4 py-6">
      <div className="mx-auto max-w-md space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-violet-800">理容師のライフプラン</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={resetAll}
            className="text-xs text-gray-400"
          >
            やり直す
          </Button>
        </div>

        {/* 再計算インジケーター */}
        {flash && (
          <div className="text-center">
            <span className="inline-block text-xs text-violet-500 bg-violet-100 px-3 py-1 rounded-full animate-pulse">
              ✨ 再計算しました
            </span>
          </div>
        )}

        {/* ヤバい度 */}
        <YabaiMeter diagnosis={diagnosis} />

        {/* チャート */}
        <div
          className={`rounded-3xl bg-white p-4 shadow-sm border transition-all duration-300 ${
            flash ? "border-violet-300 shadow-violet-100 shadow-md" : "border-gray-100"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <p className="font-bold text-sm">📈 資産推移シミュレーション</p>
            <div className="flex items-center gap-3 text-[10px]">
              {isInvesting && (
                <span className="flex items-center gap-1">
                  <span className="w-3 h-0.5 bg-violet-500 rounded" />
                  投資あり
                </span>
              )}
              <span className="flex items-center gap-1">
                <span className="w-3 h-0.5 bg-gray-400 rounded" style={{ borderTop: "1px dashed" }} />
                投資なし
              </span>
            </div>
          </div>
          <AssetChart data={data} showInvestment={isInvesting} />
          {/* イベントラベル */}
          {(profile.events ?? []).length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {(profile.events ?? []).map((event) => (
                <span
                  key={event.id}
                  className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full"
                >
                  {event.emoji} {event.label}({event.age}歳)
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 80歳サマリー */}
        <div
          className={`rounded-3xl p-4 text-center transition-all duration-300 ${
            finalAssets >= 0
              ? "bg-emerald-50 border border-emerald-200"
              : "bg-red-50 border border-red-200"
          } ${flash ? "scale-[1.02]" : ""}`}
        >
          <p className="text-sm text-gray-600">80歳時点の資産</p>
          <p
            className={`text-2xl font-bold ${
              finalAssets >= 0 ? "text-emerald-600" : "text-red-500"
            }`}
          >
            {formatMan(finalAssets)}
          </p>
        </div>

        {/* 独立マイルストーン */}
        <IndependenceMilestone data={data} profile={profile} isInvesting={isInvesting} />

        {/* 投資効果 */}
        <InvestmentGap data={data} isInvesting={isInvesting} />

        {/* バランスメーター */}
        <BalanceMeter profile={profile} />

        {/* シナリオ比較 */}
        <WhatIfCompare profile={profile} currentData={data} />

        {/* パラメータ調整 */}
        <WhatIfPanel />

        {/* 教育ナッジ */}
        <EducationNudge profile={profile} data={data} />

        {/* 免責 */}
        <p className="text-center text-[10px] text-gray-400 pb-6">
          ※ 概算シミュレーションです。インフレ年1.5%を反映済み。税制変更・運用リスク等で結果は変わります
        </p>
      </div>
    </div>
  );
}
