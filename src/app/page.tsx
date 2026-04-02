"use client";

import { useLifePlanStore } from "@/hooks/use-lifeplan-store";
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";
import dynamic from "next/dynamic";

const Dashboard = dynamic(
  () => import("@/components/dashboard/dashboard").then((mod) => mod.Dashboard),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-gradient-to-b from-violet-50 via-pink-50 to-amber-50 flex items-center justify-center">
        <p className="text-violet-400 animate-pulse">計算中...</p>
      </div>
    ),
  }
);

export default function Home() {
  const onboardingComplete = useLifePlanStore((s) => s.onboardingComplete);
  const hydrated = useLifePlanStore((s) => s.hydrated);

  // Zustand hydration待ち
  if (!hydrated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-violet-50 via-pink-50 to-amber-50 flex items-center justify-center">
        <p className="text-violet-400 animate-pulse text-lg">🔮</p>
      </div>
    );
  }

  return onboardingComplete ? <Dashboard /> : <OnboardingFlow />;
}
