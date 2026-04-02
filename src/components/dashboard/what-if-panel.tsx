"use client";

import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLifePlanStore } from "@/hooks/use-lifeplan-store";
import { LIFE_EVENT_TEMPLATES } from "@/lib/constants";
import type { LifeEvent } from "@/lib/types";

function EventEditor({
  event,
  minAge,
  onUpdate,
  onRemove,
}: {
  event: LifeEvent;
  minAge: number;
  onUpdate: (partial: Partial<LifeEvent>) => void;
  onRemove: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const totalCost =
    event.lumpCost +
    event.annualCost * event.durationYears +
    (event.replaceCycleYears && event.durationYears > 0
      ? Math.floor(event.durationYears / event.replaceCycleYears) * event.lumpCost
      : 0);

  return (
    <div className="rounded-xl bg-gray-50 p-3 space-y-1.5">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-xs font-medium text-left"
        >
          <span>{event.emoji} {event.label}</span>
          <span className="text-[10px] text-gray-400">
            （計 約{totalCost.toLocaleString()}万）
          </span>
          <span className="text-gray-300 text-[10px]">{expanded ? "▲" : "▼"}</span>
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="text-xs text-gray-400 hover:text-red-500"
        >
          削除
        </button>
      </div>

      {/* 時期スライダー（常に表示） */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-gray-500 w-8">時期</span>
        <Slider
          min={minAge}
          max={75}
          value={[event.age]}
          onValueChange={(v) => onUpdate({ age: Array.isArray(v) ? v[0] : v })}
        />
        <span className="text-xs font-medium tabular-nums w-10 text-right">{event.age}歳</span>
      </div>

      {/* 展開時: 詳細編集 */}
      {expanded && (
        <div className="space-y-2 pt-1 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-gray-500">一時費用（万円）</label>
              <Input
                type="number"
                min={0}
                value={event.lumpCost}
                onChange={(e) => onUpdate({ lumpCost: Math.max(0, Number(e.target.value)) })}
                className="h-7 text-xs"
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-500">年間費用（万円）</label>
              <Input
                type="number"
                min={0}
                value={event.annualCost}
                onChange={(e) => onUpdate({ annualCost: Math.max(0, Number(e.target.value)) })}
                className="h-7 text-xs"
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-500">何年間</label>
              <Input
                type="number"
                min={0}
                value={event.durationYears}
                onChange={(e) => onUpdate({ durationYears: Math.max(0, Number(e.target.value)) })}
                className="h-7 text-xs"
              />
            </div>
            {(event.replaceCycleYears ?? 0) > 0 && (
              <div>
                <label className="text-[10px] text-gray-500">買替えサイクル（年）</label>
                <Input
                  type="number"
                  min={1}
                  value={event.replaceCycleYears}
                  onChange={(e) => onUpdate({ replaceCycleYears: Math.max(1, Number(e.target.value)) })}
                  className="h-7 text-xs"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function WhatIfPanel() {
  const [open, setOpen] = useState(false);
  const profile = useLifePlanStore((s) => s.profile);
  const updateProfile = useLifePlanStore((s) => s.updateProfile);
  const updateInvestment = useLifePlanStore((s) => s.updateInvestment);
  const updateEvent = useLifePlanStore((s) => s.updateEvent);
  const addEvent = useLifePlanStore((s) => s.addEvent);
  const removeEvent = useLifePlanStore((s) => s.removeEvent);

  const [showAddEvent, setShowAddEvent] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newLump, setNewLump] = useState(0);
  const [newAnnual, setNewAnnual] = useState(0);
  const [newAge, setNewAge] = useState(profile.age + 5);
  const [newDuration, setNewDuration] = useState(0);

  const events = profile.events ?? [];
  const sg = profile.salaryGrowth ?? { annualRaisePercent: 2, peakIncome: 550 };
  const existingEventIds = events.map((e) => e.id);

  const availableTemplates = LIFE_EVENT_TEMPLATES.filter(
    (t) => !existingEventIds.includes(t.id)
  );

  const handleAddTemplate = (templateId: string) => {
    const template = LIFE_EVENT_TEMPLATES.find((t) => t.id === templateId)!;
    const event: LifeEvent = {
      id: template.id,
      label: template.label,
      emoji: template.emoji,
      age: Math.max(template.defaultAge, profile.age),
      lumpCost: template.lumpCost,
      annualCost: template.annualCost,
      durationYears: template.durationYears,
      replaceCycleYears: template.replaceCycleYears,
    };
    addEvent(event);
  };

  const handleAddCustom = () => {
    if (!newLabel.trim()) return;
    const event: LifeEvent = {
      id: `custom_${Date.now()}`,
      label: newLabel,
      emoji: "🏷️",
      age: newAge,
      lumpCost: newLump,
      annualCost: newAnnual,
      durationYears: newDuration,
      isCustom: true,
    };
    addEvent(event);
    setNewLabel("");
    setNewLump(0);
    setNewAnnual(0);
    setNewDuration(0);
    setShowAddEvent(false);
  };

  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm border border-gray-100">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between"
      >
        <span className="font-bold text-sm">🔧 パラメータを調整</span>
        <span className="text-gray-400 text-lg">{open ? "−" : "+"}</span>
      </button>

      {open && (
        <div className="mt-4 space-y-5 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* 年収 */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-sm">年収</Label>
              <span className="text-sm font-bold text-violet-600 tabular-nums">
                {profile.annualIncome}万円
              </span>
            </div>
            <Slider
              min={150}
              max={2000}
              step={10}
              value={[profile.annualIncome]}
              onValueChange={(v) =>
                updateProfile({ annualIncome: Array.isArray(v) ? v[0] : v })
              }
            />
          </div>

          {/* 現在の貯金額 */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-sm">現在の貯金額</Label>
              <span className="text-sm font-bold text-violet-600 tabular-nums">
                {profile.currentSavings}万円
              </span>
            </div>
            <Slider
              min={0}
              max={2000}
              step={10}
              value={[profile.currentSavings]}
              onValueChange={(v) =>
                updateProfile({ currentSavings: Array.isArray(v) ? v[0] : v })
              }
            />
          </div>

          {/* 昇給設定 */}
          <div className="space-y-3 rounded-xl bg-gray-50 p-3">
            <p className="text-xs font-medium text-gray-700">📈 昇給カーブ</p>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">年間昇給率</span>
                <span className="text-xs font-bold text-violet-600 tabular-nums">
                  {sg.annualRaisePercent}%
                </span>
              </div>
              <Slider
                min={0}
                max={8}
                step={0.5}
                value={[sg.annualRaisePercent]}
                onValueChange={(v) =>
                  updateProfile({
                    salaryGrowth: { ...sg, annualRaisePercent: Array.isArray(v) ? v[0] : v },
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">ゴール年収（これ以上は上がらない）</span>
                <span className="text-xs font-bold text-violet-600 tabular-nums">
                  {sg.peakIncome}万円
                </span>
              </div>
              <Slider
                min={profile.annualIncome}
                max={3000}
                step={50}
                value={[sg.peakIncome]}
                onValueChange={(v) =>
                  updateProfile({
                    salaryGrowth: { ...sg, peakIncome: Array.isArray(v) ? v[0] : v },
                  })
                }
              />
            </div>
            <p className="text-[10px] text-gray-400">
              今の{profile.annualIncome}万から年{sg.annualRaisePercent}%ずつ上がって、
              {sg.peakIncome}万で頭打ち
            </p>
          </div>

          {/* 投資設定 */}
          <div className="space-y-3 rounded-xl bg-gray-50 p-3">
            <p className="text-xs font-medium text-gray-700">💰 投資</p>

            {/* モード切替 */}
            <div className="flex rounded-lg bg-gray-200 p-0.5">
              <button
                type="button"
                onClick={() => updateInvestment({ useRatioMode: false })}
                className={`flex-1 rounded-md py-1 text-[10px] font-medium transition-all ${
                  !profile.investment.useRatioMode
                    ? "bg-white text-violet-700 shadow-sm"
                    : "text-gray-500"
                }`}
              >
                毎月○万円
              </button>
              <button
                type="button"
                onClick={() => updateInvestment({ useRatioMode: true })}
                className={`flex-1 rounded-md py-1 text-[10px] font-medium transition-all ${
                  profile.investment.useRatioMode
                    ? "bg-white text-violet-700 shadow-sm"
                    : "text-gray-500"
                }`}
              >
                手取りの○%
              </button>
            </div>

            {profile.investment.useRatioMode ? (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">手取りに対する投資割合</span>
                  <span className="text-xs font-bold text-violet-600 tabular-nums">
                    {profile.investment.ratioPercent ?? 10}%
                  </span>
                </div>
                <Slider
                  min={0}
                  max={40}
                  step={1}
                  value={[profile.investment.ratioPercent ?? 10]}
                  onValueChange={(v) => {
                    const pct = Array.isArray(v) ? v[0] : v;
                    updateInvestment({ ratioPercent: pct, isInvesting: pct > 0 });
                  }}
                />
                <p className="text-[10px] text-gray-400">
                  昇給すると投資額も自動で増える。年収が上がるほど加速！
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">毎月の投資額</span>
                  <span className="text-xs font-bold text-violet-600 tabular-nums">
                    {profile.investment.monthlyAmount}万円
                  </span>
                </div>
                <Slider
                  min={0}
                  max={15}
                  step={0.5}
                  value={[profile.investment.monthlyAmount]}
                  onValueChange={(v) => {
                    const amount = Array.isArray(v) ? v[0] : v;
                    updateInvestment({ monthlyAmount: amount, isInvesting: amount > 0 });
                  }}
                />
              </div>
            )}
          </div>

          {/* ライフイベント一覧 */}
          {events.length > 0 && (
            <div className="space-y-3">
              <Label className="text-sm">ライフイベント</Label>
              {events.map((event) => (
                <EventEditor
                  key={event.id}
                  event={event}
                  minAge={profile.age}
                  onUpdate={(partial) => updateEvent(event.id, partial)}
                  onRemove={() => removeEvent(event.id)}
                />
              ))}
            </div>
          )}

          {/* テンプレートから追加 */}
          {availableTemplates.length > 0 && (
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setShowTemplates(!showTemplates)}
                className="w-full rounded-xl border-2 border-dashed border-gray-200 p-2 text-xs text-gray-500 hover:border-violet-300 hover:text-violet-500"
              >
                + イベントを追加（{availableTemplates.length}個のテンプレート）
              </button>
              {showTemplates && (
                <div className="grid grid-cols-2 gap-1.5 animate-in fade-in duration-200">
                  {availableTemplates.map((template) => (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => handleAddTemplate(template.id)}
                      className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white p-2 text-left text-xs hover:border-violet-300 hover:bg-violet-50 transition-colors"
                    >
                      <span className="text-base">{template.emoji}</span>
                      <span className="text-gray-700">{template.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* カスタムイベント追加 */}
          {!showAddEvent ? (
            <button
              type="button"
              onClick={() => setShowAddEvent(true)}
              className="w-full rounded-xl border-2 border-dashed border-gray-200 p-2 text-xs text-gray-500 hover:border-violet-300 hover:text-violet-500"
            >
              + 自分だけのイベントを追加
            </button>
          ) : (
            <div className="rounded-xl border border-violet-200 bg-violet-50/50 p-3 space-y-2">
              <Input
                placeholder="イベント名"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                className="text-sm"
              />
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-gray-500">一時費用（万）</label>
                  <Input type="number" min={0} value={newLump} onChange={(e) => setNewLump(Number(e.target.value))} />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500">年齢</label>
                  <Input type="number" min={profile.age} max={80} value={newAge} onChange={(e) => setNewAge(Number(e.target.value))} />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500">年間費用（万）</label>
                  <Input type="number" min={0} value={newAnnual} onChange={(e) => setNewAnnual(Number(e.target.value))} />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500">何年間？</label>
                  <Input type="number" min={0} value={newDuration} onChange={(e) => setNewDuration(Number(e.target.value))} />
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowAddEvent(false)} className="flex-1 text-xs">キャンセル</Button>
                <Button size="sm" onClick={handleAddCustom} disabled={!newLabel.trim()} className="flex-1 text-xs bg-violet-500 text-white">追加</Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
