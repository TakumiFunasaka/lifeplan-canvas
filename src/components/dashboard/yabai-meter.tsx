"use client";

import type { Diagnosis } from "@/lib/types";

const colorMap: Record<string, { bg: string; text: string; bar: string }> = {
  emerald: { bg: "bg-emerald-50", text: "text-emerald-700", bar: "bg-emerald-500" },
  sky: { bg: "bg-sky-50", text: "text-sky-700", bar: "bg-sky-500" },
  amber: { bg: "bg-amber-50", text: "text-amber-700", bar: "bg-amber-500" },
  orange: { bg: "bg-orange-50", text: "text-orange-700", bar: "bg-orange-500" },
  red: { bg: "bg-red-50", text: "text-red-700", bar: "bg-red-500" },
};

export function YabaiMeter({ diagnosis }: { diagnosis: Diagnosis }) {
  const colors = colorMap[diagnosis.color] || colorMap.amber;

  return (
    <div className={`rounded-3xl p-5 ${colors.bg}`}>
      <div className="flex items-center gap-3 mb-3">
        <span className="text-4xl">{diagnosis.emoji}</span>
        <div>
          <p className={`text-xl font-bold ${colors.text}`}>
            {diagnosis.label}
          </p>
          <p className="text-xs text-gray-500">スコア: {diagnosis.score}点</p>
        </div>
      </div>

      {/* スコアバー */}
      <div className="w-full h-3 bg-white/60 rounded-full overflow-hidden mb-4">
        <div
          className={`h-full rounded-full transition-all duration-700 ${colors.bar}`}
          style={{ width: `${diagnosis.score}%` }}
        />
      </div>

      {/* メッセージ */}
      <div className="space-y-2">
        {diagnosis.messages.map((msg, i) => (
          <p key={i} className="text-sm text-gray-700 leading-relaxed">
            {msg}
          </p>
        ))}
      </div>
    </div>
  );
}
