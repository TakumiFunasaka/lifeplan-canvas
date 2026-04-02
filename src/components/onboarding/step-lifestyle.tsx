"use client";

import { SelectableCard } from "@/components/shared/selectable-card";
import { useLifePlanStore } from "@/hooks/use-lifeplan-store";
import { LIFESTYLE_PRESETS } from "@/lib/constants";

export function StepLifestyle() {
  const profile = useLifePlanStore((s) => s.profile);
  const updateProfile = useLifePlanStore((s) => s.updateProfile);

  return (
    <div className="space-y-6">
      <p className="text-center text-gray-600">
        自分に一番近いのはどれ？
      </p>

      <div className="grid grid-cols-1 gap-3">
        {LIFESTYLE_PRESETS.map((ls) => (
          <SelectableCard
            key={ls.id}
            emoji={ls.emoji}
            label={ls.label}
            description={ls.description}
            selected={profile.lifestyle === ls.id}
            onClick={() => updateProfile({ lifestyle: ls.id })}
          />
        ))}
      </div>

      <p className="text-center text-xs text-gray-400">
        これは貯蓄率の目安に使うよ。あとから調整できるから気軽に選んでね
      </p>
    </div>
  );
}
