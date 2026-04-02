"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLifePlanStore } from "@/hooks/use-lifeplan-store";

export function StepSavings() {
  const profile = useLifePlanStore((s) => s.profile);
  const updateProfile = useLifePlanStore((s) => s.updateProfile);

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <span className="text-5xl">🏦</span>
        <p className="text-gray-600">
          正直に教えて！今いくら貯まってる？
          <br />
          <span className="text-xs text-gray-400">0でも全然OK、ここからがスタート</span>
        </p>
      </div>

      <div className="space-y-2">
        <Label className="text-base font-medium">現在の貯金額</Label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={0}
            step={10}
            value={profile.currentSavings}
            onChange={(e) =>
              updateProfile({ currentSavings: Math.max(0, Number(e.target.value)) })
            }
            className="text-xl font-bold text-center"
          />
          <span className="text-sm text-gray-500 whitespace-nowrap">万円</span>
        </div>
      </div>

      <div className="rounded-2xl bg-amber-50 p-4 text-sm text-amber-800">
        <p className="font-medium">💡 ちなみに…</p>
        <p className="mt-1">
          20代の平均貯金額は約176万円（中央値は20万円）。
          ほとんどの人がそんなに貯まってないから、焦らなくて大丈夫！
        </p>
      </div>
    </div>
  );
}
