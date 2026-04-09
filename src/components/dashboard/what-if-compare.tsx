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
  // 比較可能なイベント（コスト影響が大きいもの）
  const comparableEvents = events.filter(
    (e) => e.lumpCost > 50 || e.annualCost > 20 || e.id.startsWith("child_") || e.id === "independence" || e.id === "marriage" || e.id === "home"
  );

  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const altData = useMemo(() => {
    if (!selectedEventId) return null;
    const altProfile = {
      ...profile,
      events: events.filter((e) => e.id !== selectedEventId),
    };
    return simulate(altProfile);
  }, [profile, events, selectedEventId]);

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

  return (
    <div className="rounded-3xl bg-white p-4 shadow-sm border border-gray-100">
      <p className="font-bold text-sm mb-3">🔀 もし◯◯しなかったら？</p>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {comparableEvents.map((e) => (
          <button
            key={e.id}
            onClick={() => setSelectedEventId(selectedEventId === e.id ? null : e.id)}
            className={`text-xs px-3 py-1.5 rounded-full transition-all ${
              selectedEventId === e.id
                ? "bg-violet-600 text-white shadow-sm"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {e.emoji} {e.label}
          </button>
        ))}
      </div>

      {selectedEventId && altData && (
        <div className="bg-violet-50 rounded-2xl p-3 space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-gray-600">現在のプラン（80歳）</span>
            <span className="font-bold">{formatMan(currentFinal)}円</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-600">{events.find(e => e.id === selectedEventId)?.label}なしの場合</span>
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
              ? `${events.find(e => e.id === selectedEventId)?.label}で生涯${formatMan(Math.abs(diff))}のコストがかかる計算。でもお金だけじゃ測れない価値もあるよね 😊`
              : `${events.find(e => e.id === selectedEventId)?.label}がある方が資産は増える計算！`
            }
          </p>
        </div>
      )}
    </div>
  );
}
