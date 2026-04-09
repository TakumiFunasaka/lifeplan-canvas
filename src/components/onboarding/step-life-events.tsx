"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { NumberInput } from "@/components/shared/number-input";
import { useLifePlanStore } from "@/hooks/use-lifeplan-store";
import { LIFE_EVENT_TEMPLATES, DEFAULT_CHILD_EDUCATION } from "@/lib/constants";
import type { LifeEvent } from "@/lib/types";

function formatCost(lump: number, annual: number) {
  const parts: string[] = [];
  if (lump > 0) parts.push(`${lump}万`);
  if (annual > 0) parts.push(`年${annual}万`);
  return parts.join(" + ") || "0万";
}

export function StepLifeEvents() {
  const events = useLifePlanStore((s) => s.profile.events);
  const addEvent = useLifePlanStore((s) => s.addEvent);
  const removeEvent = useLifePlanStore((s) => s.removeEvent);
  const age = useLifePlanStore((s) => s.profile.age);

  const [showCustom, setShowCustom] = useState(false);
  const [customLabel, setCustomLabel] = useState("");
  const [customLump, setCustomLump] = useState(0);
  const [customAnnual, setCustomAnnual] = useState(0);
  const [customDuration, setCustomDuration] = useState(0);
  const [customAge, setCustomAge] = useState(age + 5);

  const selectedIds = events.map((e) => e.id);

  const toggleTemplate = (templateId: string) => {
    if (selectedIds.includes(templateId)) {
      removeEvent(templateId);
    } else {
      const template = LIFE_EVENT_TEMPLATES.find((t) => t.id === templateId)!;
      const event: LifeEvent = {
        id: template.id,
        label: template.label,
        emoji: template.emoji,
        age: Math.max(template.defaultAge, age),
        lumpCost: template.lumpCost,
        annualCost: template.annualCost,
        durationYears: template.durationYears,
        replaceCycleYears: template.replaceCycleYears,
        ...(template.id.startsWith("child_") ? { childEducation: { ...DEFAULT_CHILD_EDUCATION } } : {}),
        ...(template.id === "independence" ? { loan: { amount: 1000, repaymentYears: 10, interestRate: 2 } } : {}),
        ...(template.id === "home" ? { loan: { amount: 3400, repaymentYears: 35, interestRate: 1.5 } } : {}),
      };
      addEvent(event);
    }
  };

  const addCustomEvent = () => {
    if (!customLabel.trim()) return;
    const event: LifeEvent = {
      id: `custom_${Date.now()}`,
      label: customLabel,
      emoji: "🏷️",
      age: customAge,
      lumpCost: customLump,
      annualCost: customAnnual,
      durationYears: customDuration,
      isCustom: true,
    };
    addEvent(event);
    setCustomLabel("");
    setCustomLump(0);
    setCustomAnnual(0);
    setCustomDuration(0);
    setShowCustom(false);
  };

  return (
    <div className="space-y-4">
      <p className="text-center text-gray-600">
        人生でやりたいこと、全部選んでみて！
        <br />
        <span className="text-xs text-gray-400">
          複数選択OK。自分だけのイベントも追加できるよ
        </span>
      </p>

      {/* テンプレートグリッド */}
      <div className="grid grid-cols-2 gap-2">
        {LIFE_EVENT_TEMPLATES.map((template) => (
          <button
            key={template.id}
            type="button"
            onClick={() => toggleTemplate(template.id)}
            className={`flex flex-col items-center gap-1 rounded-2xl border-2 p-3 text-center transition-all active:scale-95 ${
              selectedIds.includes(template.id)
                ? "border-violet-400 bg-violet-50 shadow-md shadow-violet-100"
                : "border-gray-200 bg-white hover:border-violet-200"
            }`}
          >
            <span className="text-2xl">{template.emoji}</span>
            <span className="text-xs font-medium">{template.label}</span>
            <span className="text-[10px] text-gray-400 leading-tight">
              {formatCost(template.lumpCost, template.annualCost)}
            </span>
          </button>
        ))}
      </div>

      {/* 選択済み一覧 */}
      {events.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs text-gray-500 font-medium">
            選択中（{events.length}個）
          </p>
          {events.filter((e) => e.isCustom).map((event) => (
            <div
              key={event.id}
              className="flex items-center justify-between rounded-xl bg-violet-50 px-3 py-1.5 text-xs"
            >
              <span>
                {event.emoji} {event.label}（{event.age}歳〜、{formatCost(event.lumpCost, event.annualCost)}）
              </span>
              <button
                type="button"
                onClick={() => removeEvent(event.id)}
                className="text-gray-400 hover:text-red-500 ml-2"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* カスタムイベント追加 */}
      {!showCustom ? (
        <button
          type="button"
          onClick={() => setShowCustom(true)}
          className="w-full rounded-2xl border-2 border-dashed border-gray-300 p-3 text-sm text-gray-500 hover:border-violet-300 hover:text-violet-500 transition-colors"
        >
          + 自分だけのイベントを追加
        </button>
      ) : (
        <div className="rounded-2xl border-2 border-violet-200 bg-violet-50/50 p-4 space-y-3 animate-in fade-in duration-200">
          <p className="text-sm font-medium text-violet-700">カスタムイベント</p>
          <input
            placeholder="イベント名（例: 独立開業、留学）"
            value={customLabel}
            onChange={(e) => setCustomLabel(e.target.value)}
            className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
          <div className="grid grid-cols-2 gap-2">
            <div><label className="text-[10px] text-gray-500">一時費用（万円）</label><NumberInput value={customLump} onChange={setCustomLump} /></div>
            <div><label className="text-[10px] text-gray-500">年齢</label><NumberInput value={customAge} min={age} max={80} onChange={setCustomAge} /></div>
            <div><label className="text-[10px] text-gray-500">年間費用（万円）</label><NumberInput value={customAnnual} onChange={setCustomAnnual} /></div>
            <div><label className="text-[10px] text-gray-500">何年間？</label><NumberInput value={customDuration} onChange={setCustomDuration} /></div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCustom(false)}
              className="flex-1 rounded-xl"
            >
              キャンセル
            </Button>
            <Button
              size="sm"
              onClick={addCustomEvent}
              disabled={!customLabel.trim()}
              className="flex-1 rounded-xl bg-violet-500 hover:bg-violet-600 text-white"
            >
              追加
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
