"use client";

import { useState, useMemo } from "react";
import { Slider } from "@/components/ui/slider";
import type { UserProfile, YearlyData } from "@/lib/types";
import { RETIREMENT_AGE, SIMULATION_END_AGE } from "@/lib/constants";

function formatMan(v: number) {
  return `${Math.round(v).toLocaleString()}万`;
}

interface Props {
  profile: UserProfile;
  data: YearlyData[];
}

export function SimplePL({ profile, data }: Props) {
  const [selectedAge, setSelectedAge] = useState(profile.age);
  const yearData = data.find((d) => d.age === selectedAge);
  if (!yearData) return null;

  const isRetired = selectedAge >= RETIREMENT_AGE;
  const isInvesting = profile.investment.isInvesting && profile.investment.monthlyAmount > 0;

  // 年間の手取り(万円)
  const income = yearData.income * 0.8; // 概算手取り
  const pensionIncome = isRetired ? yearData.income : 0;
  const takeHome = isRetired ? pensionIncome : income;

  // 投資額(年)の概算: savingsWithInvestment - savingsの差から逆算はできないので概算
  const desiredInvest = isInvesting && !isRetired
    ? (profile.investment.useRatioMode
        ? takeHome * (profile.investment.ratioPercent / 100)
        : profile.investment.monthlyAmount * 12)
    : 0;

  // 支出 = 手取り - 年間キャッシュフロー変化(概算)
  const prevData = data.find((d) => d.age === selectedAge - 1);
  const cashChange = prevData
    ? (isInvesting
        ? yearData.savingsWithInvestment - prevData.savingsWithInvestment
        : yearData.savings - prevData.savings)
    : 0;
  // 支出概算 = 手取り - キャッシュ変化 (投資なしベースで)
  const savingsChange = prevData ? yearData.savings - prevData.savings : 0;
  const estimatedExpense = takeHome - savingsChange;
  const surplus = takeHome - estimatedExpense;
  const actualInvest = Math.max(0, Math.min(desiredInvest, surplus));
  const cashLeft = surplus - actualInvest;

  // バーの幅を計算
  const total = Math.max(takeHome, 1);
  const expensePct = Math.min(100, Math.max(0, (estimatedExpense / total) * 100));
  const investPct = Math.min(100 - expensePct, Math.max(0, (actualInvest / total) * 100));
  const cashPct = Math.max(0, 100 - expensePct - investPct);

  // イベント
  const events = yearData.eventLabels;

  return (
    <div className="rounded-3xl bg-white p-4 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <p className="font-bold text-sm">💰 月のお金の流れ</p>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-violet-600 tabular-nums w-12 text-right">{selectedAge}歳</span>
          {isRetired && <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">年金生活</span>}
        </div>
      </div>

      <Slider
        min={profile.age}
        max={SIMULATION_END_AGE}
        step={1}
        value={[selectedAge]}
        onValueChange={(v) => setSelectedAge(Array.isArray(v) ? v[0] : v)}
        className="mb-4"
      />

      {events.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {events.map((e, i) => (
            <span key={i} className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">{e}</span>
          ))}
        </div>
      )}

      {/* 月額表示 */}
      <div className="space-y-2 mb-3">
        <div className="flex justify-between text-xs">
          <span className="text-gray-500">{isRetired ? '年金(月)' : '手取り(月)'}</span>
          <span className="font-bold text-emerald-600">{formatMan(Math.round(takeHome / 12))}円</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-gray-500">支出(月)</span>
          <span className="font-bold text-red-500">-{formatMan(Math.round(estimatedExpense / 12))}円</span>
        </div>
        <div className="h-px bg-gray-100" />
        <div className="flex justify-between text-xs">
          <span className="text-gray-500">余り(月)</span>
          <span className={`font-bold ${surplus >= 0 ? 'text-gray-700' : 'text-red-500'}`}>
            {surplus >= 0 ? '' : ''}{formatMan(Math.round(surplus / 12))}円
          </span>
        </div>
        {actualInvest > 0 && (
          <>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">→ うち投資</span>
              <span className="font-bold text-violet-600">{formatMan(Math.round(actualInvest / 12))}円</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">→ 貯金</span>
              <span className="font-bold text-blue-600">{formatMan(Math.round(cashLeft / 12))}円</span>
            </div>
          </>
        )}
        {desiredInvest > 0 && actualInvest < desiredInvest * 0.9 && !isRetired && (
          <p className="text-[10px] text-amber-600 bg-amber-50 rounded-lg px-2 py-1">
            ⚠️ 余りが少なくて、希望額(月{formatMan(Math.round(desiredInvest / 12))}円)まで投資できてない計算
          </p>
        )}
      </div>

      {/* ビジュアルバー */}
      <div className="w-full h-6 rounded-full overflow-hidden flex bg-gray-100">
        <div className="bg-red-400 h-full transition-all duration-300 flex items-center justify-center" style={{ width: `${expensePct}%` }}>
          {expensePct > 20 && <span className="text-[9px] text-white font-medium">支出</span>}
        </div>
        {investPct > 0 && (
          <div className="bg-violet-500 h-full transition-all duration-300 flex items-center justify-center" style={{ width: `${investPct}%` }}>
            {investPct > 10 && <span className="text-[9px] text-white font-medium">投資</span>}
          </div>
        )}
        {cashPct > 0 && (
          <div className="bg-blue-400 h-full transition-all duration-300 flex items-center justify-center" style={{ width: `${cashPct}%` }}>
            {cashPct > 10 && <span className="text-[9px] text-white font-medium">貯金</span>}
          </div>
        )}
      </div>
      <div className="flex justify-between text-[9px] text-gray-400 mt-1">
        <span>0%</span>
        <span>手取りの内訳</span>
        <span>100%</span>
      </div>
    </div>
  );
}
