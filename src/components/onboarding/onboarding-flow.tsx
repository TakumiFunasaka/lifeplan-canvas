"use client";

import { useLifePlanStore } from "@/hooks/use-lifeplan-store";
import { STEP_LABELS } from "@/lib/constants";
import { StepIndicator } from "@/components/shared/step-indicator";
import { Button } from "@/components/ui/button";
import { StepAgeJob } from "./step-age-job";
import { StepSavings } from "./step-savings";
import { StepLifestyle } from "./step-lifestyle";
import { StepLifeEvents } from "./step-life-events";
import { StepInvestment } from "./step-investment";

const STEPS = [StepAgeJob, StepSavings, StepLifestyle, StepLifeEvents, StepInvestment];

export function OnboardingFlow() {
  const currentStep = useLifePlanStore((s) => s.currentStep);
  const nextStep = useLifePlanStore((s) => s.nextStep);
  const prevStep = useLifePlanStore((s) => s.prevStep);
  const completeOnboarding = useLifePlanStore((s) => s.completeOnboarding);

  const stepInfo = STEP_LABELS[currentStep];
  const StepComponent = STEPS[currentStep];
  const isLast = currentStep === 4;

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 via-pink-50 to-amber-50 px-4 py-6">
      <div className="mx-auto max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-1">
          <h1 className="text-xl font-bold text-violet-800">
            LifePlan Canvas
          </h1>
          <StepIndicator current={currentStep} total={5} />
        </div>

        {/* Step title */}
        <div className="text-center space-y-1">
          <h2 className="text-lg font-bold">{stepInfo.title}</h2>
          <p className="text-sm text-gray-500">{stepInfo.subtitle}</p>
        </div>

        {/* Step content */}
        <div className="rounded-3xl bg-white/80 backdrop-blur-sm p-5 shadow-sm">
          <StepComponent />
        </div>

        {/* Navigation */}
        <div className="flex gap-3">
          {currentStep > 0 && (
            <Button
              variant="outline"
              onClick={prevStep}
              className="flex-1 rounded-2xl h-12"
            >
              もどる
            </Button>
          )}
          <Button
            onClick={isLast ? completeOnboarding : nextStep}
            className="flex-1 rounded-2xl h-12 bg-violet-500 hover:bg-violet-600 text-white font-medium"
          >
            {isLast ? "結果を見る 🔮" : "つぎへ →"}
          </Button>
        </div>

        {/* Step count */}
        <p className="text-center text-xs text-gray-400">
          {currentStep + 1} / 5
        </p>
      </div>
    </div>
  );
}
