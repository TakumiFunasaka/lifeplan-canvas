"use client";

import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectableCard } from "@/components/shared/selectable-card";
import { useLifePlanStore } from "@/hooks/use-lifeplan-store";
import { JOB_PRESETS } from "@/lib/constants";

type IncomeMode = "annual" | "monthly_take_home";

// 手取り月給 → 額面年収の概算変換
// 手取り = 額面 × 0.75〜0.8（社保+税金で20〜25%引かれる）
// ボーナスなしの場合: 額面年収 ≒ 手取り月給 ÷ 0.8 × 12
// ボーナスありの場合はもっと複雑だが、新社会人はボーナス少なめなので単純計算
function takeHomeToAnnual(monthlyTakeHome: number): number {
  return Math.round((monthlyTakeHome / 0.8) * 12);
}

function annualToMonthlyTakeHome(annual: number): number {
  return Math.round((annual * 0.8) / 12);
}

export function StepAgeJob() {
  const profile = useLifePlanStore((s) => s.profile);
  const updateProfile = useLifePlanStore((s) => s.updateProfile);
  const [mode, setMode] = useState<IncomeMode>("monthly_take_home");
  const [monthlyTakeHome, setMonthlyTakeHome] = useState(
    annualToMonthlyTakeHome(profile.annualIncome)
  );

  const handleModeSwitch = (newMode: IncomeMode) => {
    if (newMode === mode) return;
    if (newMode === "monthly_take_home") {
      setMonthlyTakeHome(annualToMonthlyTakeHome(profile.annualIncome));
    }
    setMode(newMode);
  };

  const handleMonthlyChange = (value: number) => {
    setMonthlyTakeHome(value);
    updateProfile({ annualIncome: takeHomeToAnnual(value) });
  };

  return (
    <div className="space-y-6">
      {/* 年齢 */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <Label className="text-base font-medium">何歳？</Label>
          <span className="text-lg font-bold text-violet-600 tabular-nums">
            {profile.age}歳
          </span>
        </div>
        <Slider
          min={18}
          max={40}
          value={[profile.age]}
          onValueChange={(v) => updateProfile({ age: Array.isArray(v) ? v[0] : v })}
        />
      </div>

      {/* 収入入力 */}
      <div className="space-y-3">
        <Label className="text-base font-medium">お給料はどのくらい？</Label>

        {/* モード切替 */}
        <div className="flex rounded-xl bg-gray-100 p-1">
          <button
            type="button"
            onClick={() => handleModeSwitch("monthly_take_home")}
            className={`flex-1 rounded-lg py-1.5 text-xs font-medium transition-all ${
              mode === "monthly_take_home"
                ? "bg-white text-violet-700 shadow-sm"
                : "text-gray-500"
            }`}
          >
            手取り月給
          </button>
          <button
            type="button"
            onClick={() => handleModeSwitch("annual")}
            className={`flex-1 rounded-lg py-1.5 text-xs font-medium transition-all ${
              mode === "annual"
                ? "bg-white text-violet-700 shadow-sm"
                : "text-gray-500"
            }`}
          >
            額面年収
          </button>
        </div>

        {mode === "monthly_take_home" ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={0}
                step={1}
                value={monthlyTakeHome}
                onChange={(e) => handleMonthlyChange(Math.max(0, Number(e.target.value)))}
                className="text-lg font-bold text-center"
              />
              <span className="text-sm text-gray-500 whitespace-nowrap">万円/月</span>
            </div>
            <p className="text-xs text-gray-400">
              毎月の口座に振り込まれる金額でOK！
            </p>
            <div className="rounded-xl bg-violet-50 px-3 py-2 text-xs text-violet-700">
              → 額面年収に換算すると約<span className="font-bold">{profile.annualIncome}</span>万円
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={0}
                step={10}
                value={profile.annualIncome}
                onChange={(e) =>
                  updateProfile({ annualIncome: Math.max(0, Number(e.target.value)) })
                }
                className="text-lg font-bold text-center"
              />
              <span className="text-sm text-gray-500 whitespace-nowrap">万円/年</span>
            </div>
            <p className="text-xs text-gray-400">
              源泉徴収票の「支払金額」がこれ。わからなければ手取り月給で入力してね
            </p>
          </div>
        )}
      </div>

      {/* 職種 */}
      <div className="space-y-3">
        <Label className="text-base font-medium">どんな仕事？</Label>
        <p className="text-xs text-gray-400">
          昇給ペースの参考にするよ（年収には影響しないので気軽に選んでね）
        </p>
        <div className="grid grid-cols-3 gap-2">
          {JOB_PRESETS.map((job) => (
            <SelectableCard
              key={job.id}
              emoji={job.emoji}
              label={job.label}
              selected={profile.jobCategory === job.id}
              onClick={() => updateProfile({ jobCategory: job.id })}
              compact
            />
          ))}
        </div>
      </div>
    </div>
  );
}
