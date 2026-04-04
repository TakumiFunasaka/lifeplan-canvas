"use client";

import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { NumberInput } from "@/components/shared/number-input";
import { useLifePlanStore } from "@/hooks/use-lifeplan-store";

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
      {/* 挨拶 */}
      <div className="text-center space-y-1">
        <p className="text-2xl">✂️</p>
        <p className="text-sm text-gray-600">
          理容師としての人生、一緒にシミュレーションしよう！
        </p>
      </div>

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
            <NumberInput
              value={monthlyTakeHome}
              onChange={(v) => handleMonthlyChange(v)}
              suffix="万円/月"
              className="text-lg"
            />
            <p className="text-xs text-gray-400">
              毎月の口座に振り込まれる金額でOK！
            </p>
            <div className="rounded-xl bg-violet-50 px-3 py-2 text-xs text-violet-700">
              💡 理容師1年目の手取りは月15〜18万が一般的だよ
            </div>
            <div className="rounded-xl bg-violet-50 px-3 py-2 text-xs text-violet-700">
              → 額面年収に換算すると約<span className="font-bold">{profile.annualIncome}</span>万円
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <NumberInput
              value={profile.annualIncome}
              onChange={(v) => updateProfile({ annualIncome: v })}
              step={10}
              suffix="万円/年"
              className="text-lg"
            />
            <p className="text-xs text-gray-400">
              源泉徴収票の「支払金額」がこれ。わからなければ手取り月給で入力してね
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
