"use client";

import { useState, useMemo } from "react";
import type { UserProfile, YearlyData } from "@/lib/types";
import { simulate } from "@/lib/simulation";

function formatMan(v: number) {
  if (Math.abs(v) >= 10000) return `${(v / 10000).toFixed(1)}億`;
  return `${Math.round(v).toLocaleString()}万`;
}

interface Props {
  profile: UserProfile;
  currentData: YearlyData[];
}

export function WhatIfCompare({ profile, currentData }: Props) {
  const events = profile.events ?? [];
  const comparableEvents = events.filter(
    (e) => e.lumpCost > 50 || e.annualCost > 20 || e.id.startsWith("child_") || e.id === "independence" || e.id === "marriage" || e.id === "home"
  );

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const altData = useMemo(() => {
    if (selectedIds.size === 0) return null;
    const altProfile = {
      ...profile,
      events: events.filter((e) => !selectedIds.has(e.id)),
    };
    return simulate(altProfile);
  }, [profile, events, selectedIds]);

  if (comparableEvents.length === 0) return null;

  const isInvesting = profile.investment.isInvesting && profile.investment.monthlyAmount > 0;
  const currentFinal = isInvesting
    ? currentData[currentData.length - 1]?.savingsWithInvestment ?? 0
    : currentData[currentData.length - 1]?.savings ?? 0;
  const altFinal = altData
    ? (isInvesting
        ? altData[altData.length - 1]?.savingsWithInvestment ?? 0
        : altData[altData.length - 1]?.savings ?? 0)
    : 0;
  const diff = altFinal - currentFinal;

  const selectedLabels = comparableEvents
    .filter((e) => selectedIds.has(e.id))
    .map((e) => e.label);

  const labelText = selectedLabels.length === 1
    ? selectedLabels[0]
    : selectedLabels.length <= 3
      ? selectedLabels.join("・")
      : `${selectedLabels.slice(0, 2).join("・")}ほか${selectedLabels.length - 2}件`;

  return (
    <div className="rounded-3xl bg-white p-4 shadow-sm border border-gray-100">
      <p className="font-bold text-sm mb-1">🔀 もし◯◯しなかったら？</p>
      <p className="text-[10px] text-gray-400 mb-3">複数選択OK — まとめて外した場合の差がわかる</p>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {comparableEvents.map((e) => (
          <button
            key={e.id}
            onClick={() => toggle(e.id)}
            className={`text-xs px-3 py-1.5 rounded-full transition-all ${
              selectedIds.has(e.id)
                ? "bg-violet-600 text-white shadow-sm"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {e.emoji} {e.label}
          </button>
        ))}
      </div>

      {selectedIds.size > 0 && altData && (
        <div className="bg-violet-50 rounded-2xl p-3 space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-gray-600">現在のプラン（80歳）</span>
            <span className="font-bold">{formatMan(currentFinal)}円</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-600">{labelText}なしの場合</span>
            <span className="font-bold">{formatMan(altFinal)}円</span>
          </div>
          <div className="border-t border-violet-200 pt-2 flex justify-between text-xs">
            <span className="text-gray-600">差額</span>
            <span className={`font-bold ${diff >= 0 ? "text-emerald-600" : "text-red-500"}`}>
              {diff >= 0 ? "+" : ""}{formatMan(diff)}円
            </span>
          </div>
          <p className="text-[10px] text-gray-500 mt-1">
            {diff > 0
              ? `${labelText}で生涯${formatMan(Math.abs(diff))}のコスト。でもお金だけじゃ測れない価値もあるよね 😊`
              : `${labelText}がある方が資産は増える計算！`
            }
          </p>
        </div>
      )}
    </div>
  );
}
