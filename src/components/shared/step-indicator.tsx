"use client";

import { cn } from "@/lib/utils";
import type { OnboardingStep } from "@/lib/types";

export function StepIndicator({ current, total }: { current: OnboardingStep; total: number }) {
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={cn(
            "h-2 rounded-full transition-all duration-300",
            i === current
              ? "w-8 bg-violet-500"
              : i < current
                ? "w-2 bg-violet-300"
                : "w-2 bg-gray-200"
          )}
        />
      ))}
    </div>
  );
}
