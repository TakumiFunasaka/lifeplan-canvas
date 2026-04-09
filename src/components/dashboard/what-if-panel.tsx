"use client";

import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { NumberInput } from "@/components/shared/number-input";
import { useLifePlanStore } from "@/hooks/use-lifeplan-store";
import { LIFE_EVENT_TEMPLATES, EXPENSE_LABELS, DEFAULT_CHILD_EDUCATION, LIFESTYLE_PRESETS } from "@/lib/constants";
import type { LifeEvent, ExpenseBreakdown, ChildEducation, EducationLevel } from "@/lib/types";

// --- 投資利率プリセット ---
const RETURN_PRESETS = [
  { label: "安定型", rate: 0.03, emoji: "🛡️", desc: "債券中心。リスク小、リターン小" },
  { label: "バランス型", rate: 0.05, emoji: "⚖️", desc: "株式+債券の王道。長期ならほぼこれ" },
  { label: "積極型", rate: 0.07, emoji: "🔥", desc: "株式中心。リターン大だが下落リスクも大" },
];

// --- 教育段階ラベル ---
const EDU_STAGES: { key: keyof ChildEducation; label: string }[] = [
  { key: "preschool", label: "幼稚園" },
  { key: "elementary", label: "小学校" },
  { key: "middle", label: "中学校" },
  { key: "high", label: "高校" },
  { key: "university", label: "大学" },
];

// --- EventEditor ---
function EventEditor({
  event, minAge, onUpdate, onRemove,
}: {
  event: LifeEvent; minAge: number;
  onUpdate: (partial: Partial<LifeEvent>) => void; onRemove: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const isChild = event.id.startsWith("child_");

  const totalCost = event.lumpCost + event.annualCost * event.durationYears +
    (event.replaceCycleYears && event.durationYears > 0
      ? Math.floor(event.durationYears / event.replaceCycleYears) * event.lumpCost : 0);

  const edu = event.childEducation ?? DEFAULT_CHILD_EDUCATION;
  const toggleEdu = (stage: keyof ChildEducation) => {
    const newLevel: EducationLevel = edu[stage] === "public" ? "private" : "public";
    onUpdate({ childEducation: { ...edu, [stage]: newLevel } });
  };

  return (
    <div className="rounded-xl bg-gray-50 p-3 space-y-1.5">
      <div className="flex items-center justify-between">
        <button type="button" onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-xs font-medium text-left">
          <span>{event.emoji} {event.label}</span>
          {!isChild && <span className="text-[10px] text-gray-400">（計 約{totalCost.toLocaleString()}万）</span>}
          <span className="text-gray-300 text-[10px]">{expanded ? "▲" : "▼"}</span>
        </button>
        <button type="button" onClick={onRemove} className="text-xs text-gray-400 hover:text-red-500">削除</button>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-[10px] text-gray-500 w-8">時期</span>
        <Slider min={minAge} max={75} value={[event.age]}
          onValueChange={(v) => onUpdate({ age: Array.isArray(v) ? v[0] : v })} />
        <span className="text-xs font-medium tabular-nums w-10 text-right">{event.age}歳</span>
      </div>

      {expanded && (
        <div className="space-y-2 pt-1 animate-in fade-in slide-in-from-top-1 duration-150">
          {/* 子どもの教育レベル */}
          {isChild && (
            <div className="space-y-1.5">
              <p className="text-[10px] text-gray-500 font-medium">🎓 教育レベル（タップで切替）</p>
              <div className="grid grid-cols-2 gap-1">
                {EDU_STAGES.map(({ key, label }) => (
                  <button key={key} type="button" onClick={() => toggleEdu(key)}
                    className={`rounded-lg px-2 py-1 text-[10px] text-center transition-colors ${
                      edu[key] === "private"
                        ? "bg-amber-100 text-amber-800 border border-amber-300"
                        : "bg-gray-100 text-gray-600 border border-gray-200"
                    }`}>
                    {label}: {edu[key] === "private" ? "私立" : "公立"}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-gray-400">私立にするとコストが2〜4倍に</p>
            </div>
          )}

          {/* 通常コスト編集 */}
          {!isChild && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-gray-500">一時費用（万円）</label>
                <NumberInput value={event.lumpCost} onChange={(v) => onUpdate({ lumpCost: v })} />
              </div>
              <div>
                <label className="text-[10px] text-gray-500">年間費用（万円）</label>
                <NumberInput value={event.annualCost} onChange={(v) => onUpdate({ annualCost: v })} />
              </div>
              <div>
                <label className="text-[10px] text-gray-500">何年間</label>
                <NumberInput value={event.durationYears} onChange={(v) => onUpdate({ durationYears: v })} />
              </div>
              {(event.replaceCycleYears ?? 0) > 0 && (
                <div>
                  <label className="text-[10px] text-gray-500">買替えサイクル（年）</label>
                  <NumberInput value={event.replaceCycleYears ?? 8} min={1}
                    onChange={(v) => onUpdate({ replaceCycleYears: v })} />
                </div>
              )}
            </div>
          )}

          {/* 借入設定 */}
          {event.loan && (
            <div className="space-y-2 rounded-lg bg-sky-50 p-2.5">
              <p className="text-[10px] text-sky-700 font-medium">🏦 借入（公庫等）</p>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] text-gray-500">借入額（万）</label>
                  <NumberInput value={event.loan.amount}
                    onChange={(v) => onUpdate({ loan: { ...event.loan!, amount: v } })} />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500">返済期間（年）</label>
                  <NumberInput value={event.loan.repaymentYears} min={1} max={30}
                    onChange={(v) => onUpdate({ loan: { ...event.loan!, repaymentYears: v } })} />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500">金利（%）</label>
                  <NumberInput value={event.loan.interestRate} min={0} max={10} step={0.1}
                    onChange={(v) => onUpdate({ loan: { ...event.loan!, interestRate: v } })} />
                </div>
              </div>
              {(() => {
                const r = event.loan.interestRate / 100;
                const n = event.loan.repaymentYears;
                const a = event.loan.amount;
                const annual = r > 0 ? a * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : a / n;
                const total = annual * n;
                return (
                  <p className="text-[10px] text-sky-600">
                    → 年間返済 約{Math.round(annual)}万（月{(annual / 12).toFixed(1)}万）、返済総額 約{Math.round(total)}万
                  </p>
                );
              })()}
            </div>
          )}

          {/* 借入を追加するボタン（loanがないイベント） */}
          {!event.loan && !isChild && (
            <button type="button"
              onClick={() => onUpdate({ loan: { amount: 500, repaymentYears: 10, interestRate: 2 } })}
              className="w-full rounded-lg border border-dashed border-sky-300 p-1.5 text-[10px] text-sky-500 hover:bg-sky-50">
              + 借入を追加
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// --- メインパネル ---
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
  const [showExpense, setShowExpense] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newLump, setNewLump] = useState(0);
  const [newAnnual, setNewAnnual] = useState(0);
  const [newAge, setNewAge] = useState(profile.age + 5);
  const [newDuration, setNewDuration] = useState(0);

  const events = profile.events ?? [];
  const sg = profile.salaryGrowth ?? { annualRaisePercent: 2, peakIncome: 550 };
  const spouse = profile.spouse ?? { enabled: false, annualIncome: 300, salaryGrowth: { annualRaisePercent: 2, peakIncome: 500 } };
  const eb = profile.expenseBreakdown ?? {} as ExpenseBreakdown;
  const existingEventIds = events.map((e) => e.id);
  const availableTemplates = LIFE_EVENT_TEMPLATES.filter((t) => !existingEventIds.includes(t.id));

  const handleAddTemplate = (templateId: string) => {
    const template = LIFE_EVENT_TEMPLATES.find((t) => t.id === templateId)!;
    const event: LifeEvent = {
      id: template.id, label: template.label, emoji: template.emoji,
      age: Math.max(template.defaultAge, profile.age),
      lumpCost: template.lumpCost, annualCost: template.annualCost,
      durationYears: template.durationYears, replaceCycleYears: template.replaceCycleYears,
      ...(template.id.startsWith("child_") ? { childEducation: { ...DEFAULT_CHILD_EDUCATION } } : {}),
      ...(template.id === "independence" ? { loan: { amount: 1000, repaymentYears: 10, interestRate: 2 } } : {}),
      ...(template.id === "home" ? { loan: { amount: 3400, repaymentYears: 35, interestRate: 1.5 } } : {}),
    };
    addEvent(event);
  };

  const handleAddCustom = () => {
    if (!newLabel.trim()) return;
    addEvent({
      id: `custom_${Date.now()}`, label: newLabel, emoji: "🏷️", age: newAge,
      lumpCost: newLump, annualCost: newAnnual, durationYears: newDuration, isCustom: true,
    });
    setNewLabel(""); setNewLump(0); setNewAnnual(0); setNewDuration(0); setShowAddEvent(false);
  };

  const monthlyTotal = Object.values(eb).reduce((s, v) => s + (v || 0), 0);

  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm border border-gray-100">
      <button type="button" onClick={() => setOpen(!open)} className="w-full flex items-center justify-between">
        <span className="font-bold text-sm">🔧 パラメータを調整</span>
        <span className="text-gray-400 text-lg">{open ? "−" : "+"}</span>
      </button>

      {open && (
        <div className="mt-4 space-y-5 animate-in fade-in slide-in-from-top-2 duration-200">

          {/* === 年齢 === */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-sm">現在の年齢</Label>
              <span className="text-sm font-bold text-violet-600 tabular-nums">{profile.age}歳</span>
            </div>
            <Slider min={18} max={55} step={1} value={[profile.age]}
              onValueChange={(v) => updateProfile({ age: Array.isArray(v) ? v[0] : v })} />
          </div>

          {/* === ライフスタイル === */}
          <div className="space-y-2">
            <Label className="text-sm">お金の使い方</Label>
            <div className="grid grid-cols-3 gap-1.5">
              {LIFESTYLE_PRESETS.map((ls) => (
                <button key={ls.id} type="button"
                  onClick={() => updateProfile({ lifestyle: ls.id })}
                  className={`rounded-lg p-2 text-center transition-all ${
                    profile.lifestyle === ls.id
                      ? "bg-violet-100 border-2 border-violet-400"
                      : "bg-gray-50 border border-gray-200 hover:border-violet-200"
                  }`}>
                  <span className="text-lg">{ls.emoji}</span>
                  <p className="text-[10px] font-medium">{ls.label}</p>
                </button>
              ))}
            </div>
          </div>

          {/* === 収入セクション === */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-sm">年収</Label>
              <span className="text-sm font-bold text-violet-600 tabular-nums">{profile.annualIncome}万円</span>
            </div>
            <Slider min={150} max={2000} step={10} value={[profile.annualIncome]}
              onValueChange={(v) => updateProfile({ annualIncome: Array.isArray(v) ? v[0] : v })} />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-sm">現在の貯金額</Label>
              <span className="text-sm font-bold text-violet-600 tabular-nums">{profile.currentSavings}万円</span>
            </div>
            <Slider min={0} max={2000} step={10} value={[profile.currentSavings]}
              onValueChange={(v) => updateProfile({ currentSavings: Array.isArray(v) ? v[0] : v })} />
          </div>

          {/* 昇給 */}
          <div className="space-y-3 rounded-xl bg-gray-50 p-3">
            <p className="text-xs font-medium text-gray-700">📈 昇給カーブ</p>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">年間昇給率</span>
                <span className="text-xs font-bold text-violet-600 tabular-nums">{sg.annualRaisePercent}%</span>
              </div>
              <Slider min={0} max={8} step={0.5} value={[sg.annualRaisePercent]}
                onValueChange={(v) => updateProfile({ salaryGrowth: { ...sg, annualRaisePercent: Array.isArray(v) ? v[0] : v } })} />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">ゴール年収</span>
                <span className="text-xs font-bold text-violet-600 tabular-nums">{sg.peakIncome}万円</span>
              </div>
              <Slider min={profile.annualIncome} max={3000} step={50} value={[sg.peakIncome]}
                onValueChange={(v) => updateProfile({ salaryGrowth: { ...sg, peakIncome: Array.isArray(v) ? v[0] : v } })} />
            </div>
          </div>

          {/* === 配偶者 === */}
          <div className="space-y-3 rounded-xl bg-gray-50 p-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-gray-700">💑 配偶者の収入</p>
              <button type="button" onClick={() => updateProfile({ spouse: { ...spouse, enabled: !spouse.enabled } })}
                className={`rounded-full px-3 py-0.5 text-[10px] font-medium transition-colors ${
                  spouse.enabled ? "bg-violet-500 text-white" : "bg-gray-200 text-gray-500"}`}>
                {spouse.enabled ? "ON" : "OFF"}
              </button>
            </div>
            {spouse.enabled && (
              <div className="space-y-2 animate-in fade-in duration-200">
                <p className="text-[10px] text-gray-400">結婚後に配偶者の収入を合算してシミュレーション</p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">配偶者の年収</span>
                  <span className="text-xs font-bold text-violet-600 tabular-nums">{spouse.annualIncome}万円</span>
                </div>
                <Slider min={0} max={1500} step={10} value={[spouse.annualIncome]}
                  onValueChange={(v) => updateProfile({ spouse: { ...spouse, annualIncome: Array.isArray(v) ? v[0] : v } })} />
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">配偶者の昇給率</span>
                  <span className="text-xs font-bold text-violet-600 tabular-nums">{spouse.salaryGrowth.annualRaisePercent}%</span>
                </div>
                <Slider min={0} max={5} step={0.5} value={[spouse.salaryGrowth.annualRaisePercent]}
                  onValueChange={(v) => {
                    const r = Array.isArray(v) ? v[0] : v;
                    updateProfile({ spouse: { ...spouse, salaryGrowth: { ...spouse.salaryGrowth, annualRaisePercent: r } } });
                  }} />
              </div>
            )}
          </div>

          {/* === 支出内訳 === */}
          <div className="space-y-3 rounded-xl bg-gray-50 p-3">
            <button type="button" onClick={() => setShowExpense(!showExpense)}
              className="w-full flex items-center justify-between">
              <p className="text-xs font-medium text-gray-700">🧾 月の支出内訳</p>
              <span className="text-xs text-gray-500">合計 {monthlyTotal.toFixed(1)}万/月 ▸ 年{Math.round(monthlyTotal * 12)}万</span>
            </button>
            {showExpense && (
              <div className="space-y-2 animate-in fade-in duration-200">
                {(Object.keys(EXPENSE_LABELS) as (keyof ExpenseBreakdown)[]).map((key) => {
                  const info = EXPENSE_LABELS[key];
                  return (
                    <div key={key} className="flex items-center gap-2">
                      <span className="text-xs w-20 shrink-0">{info.emoji} {info.label}</span>
                      <Slider min={0} max={20} step={0.5} value={[eb[key] || 0]}
                        onValueChange={(v) => updateProfile({
                          expenseBreakdown: { ...eb, [key]: Array.isArray(v) ? v[0] : v },
                        })} />
                      <span className="text-xs font-medium tabular-nums w-12 text-right">{(eb[key] || 0).toFixed(1)}万</span>
                    </div>
                  );
                })}
                <p className="text-[10px] text-gray-400">
                  ここで設定した支出が生活費のベースになるよ。投資に回す余裕がどのくらいあるか確認してみて
                </p>
              </div>
            )}
          </div>

          {/* === 投資設定 === */}
          <div className="space-y-3 rounded-xl bg-gray-50 p-3">
            <p className="text-xs font-medium text-gray-700">💰 投資</p>

            {/* 利率選択 */}
            <div className="space-y-1.5">
              <span className="text-[10px] text-gray-500">運用スタイル（想定利回り）</span>
              <div className="grid grid-cols-3 gap-1.5">
                {RETURN_PRESETS.map((preset) => (
                  <button key={preset.rate} type="button"
                    onClick={() => updateInvestment({ expectedReturn: preset.rate })}
                    className={`rounded-lg p-2 text-center transition-all ${
                      Math.abs(profile.investment.expectedReturn - preset.rate) < 0.001
                        ? "bg-violet-100 border-2 border-violet-400"
                        : "bg-white border border-gray-200 hover:border-violet-200"
                    }`}>
                    <span className="text-lg">{preset.emoji}</span>
                    <p className="text-[10px] font-medium">{preset.label}</p>
                    <p className="text-[10px] text-violet-600 font-bold">年{(preset.rate * 100).toFixed(0)}%</p>
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-gray-400">
                ⚠️ 利回りが高いほどリターンも大きいけど、暴落時の下落も大きい。
                長期（15年以上）ならバランス型がおすすめ
              </p>
            </div>

            {/* 投資額モード */}
            <div className="flex rounded-lg bg-gray-200 p-0.5">
              <button type="button" onClick={() => updateInvestment({ useRatioMode: false })}
                className={`flex-1 rounded-md py-1 text-[10px] font-medium transition-all ${
                  !profile.investment.useRatioMode ? "bg-white text-violet-700 shadow-sm" : "text-gray-500"}`}>
                毎月○万円
              </button>
              <button type="button" onClick={() => updateInvestment({ useRatioMode: true })}
                className={`flex-1 rounded-md py-1 text-[10px] font-medium transition-all ${
                  profile.investment.useRatioMode ? "bg-white text-violet-700 shadow-sm" : "text-gray-500"}`}>
                手取りの○%
              </button>
            </div>

            {profile.investment.useRatioMode ? (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">投資割合</span>
                  <span className="text-xs font-bold text-violet-600 tabular-nums">{profile.investment.ratioPercent ?? 10}%</span>
                </div>
                <Slider min={0} max={40} step={1} value={[profile.investment.ratioPercent ?? 10]}
                  onValueChange={(v) => { const pct = Array.isArray(v) ? v[0] : v; updateInvestment({ ratioPercent: pct, isInvesting: pct > 0 }); }} />
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">毎月の投資額</span>
                  <span className="text-xs font-bold text-violet-600 tabular-nums">{profile.investment.monthlyAmount}万円</span>
                </div>
                <Slider min={0} max={15} step={0.5} value={[profile.investment.monthlyAmount]}
                  onValueChange={(v) => { const a = Array.isArray(v) ? v[0] : v; updateInvestment({ monthlyAmount: a, isInvesting: a > 0 }); }} />
              </div>
            )}
          </div>

          {/* === ライフイベント === */}
          {events.length > 0 && (
            <div className="space-y-3">
              <Label className="text-sm">ライフイベント</Label>
              {events.map((event) => (
                <EventEditor key={event.id} event={event} minAge={profile.age}
                  onUpdate={(partial) => updateEvent(event.id, partial)}
                  onRemove={() => removeEvent(event.id)} />
              ))}
            </div>
          )}

          {availableTemplates.length > 0 && (
            <div className="space-y-2">
              <button type="button" onClick={() => setShowTemplates(!showTemplates)}
                className="w-full rounded-xl border-2 border-dashed border-gray-200 p-2 text-xs text-gray-500 hover:border-violet-300 hover:text-violet-500">
                + イベントを追加（{availableTemplates.length}個のテンプレート）
              </button>
              {showTemplates && (
                <div className="grid grid-cols-2 gap-1.5 animate-in fade-in duration-200">
                  {availableTemplates.map((t) => (
                    <button key={t.id} type="button" onClick={() => handleAddTemplate(t.id)}
                      className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white p-2 text-left text-xs hover:border-violet-300 hover:bg-violet-50 transition-colors">
                      <span className="text-base">{t.emoji}</span>
                      <span className="text-gray-700">{t.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {!showAddEvent ? (
            <button type="button" onClick={() => setShowAddEvent(true)}
              className="w-full rounded-xl border-2 border-dashed border-gray-200 p-2 text-xs text-gray-500 hover:border-violet-300 hover:text-violet-500">
              + 自分だけのイベントを追加
            </button>
          ) : (
            <div className="rounded-xl border border-violet-200 bg-violet-50/50 p-3 space-y-2">
              <input placeholder="イベント名" value={newLabel} onChange={(e) => setNewLabel(e.target.value)}
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50" />
              <div className="grid grid-cols-2 gap-2">
                <div><label className="text-[10px] text-gray-500">一時費用（万）</label><NumberInput value={newLump} onChange={setNewLump} /></div>
                <div><label className="text-[10px] text-gray-500">年齢</label><NumberInput value={newAge} min={profile.age} max={80} onChange={setNewAge} /></div>
                <div><label className="text-[10px] text-gray-500">年間費用（万）</label><NumberInput value={newAnnual} onChange={setNewAnnual} /></div>
                <div><label className="text-[10px] text-gray-500">何年間？</label><NumberInput value={newDuration} onChange={setNewDuration} /></div>
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
