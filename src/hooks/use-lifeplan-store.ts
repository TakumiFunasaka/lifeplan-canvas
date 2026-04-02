import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserProfile, OnboardingStep, LifeEvent } from "@/lib/types";
import { DEFAULT_EXPENSE } from "@/lib/constants";

const defaultProfile: UserProfile = {
  age: 22,
  jobCategory: "other",
  annualIncome: 300,
  currentSavings: 50,
  lifestyle: "normal",
  events: [],
  investment: {
    isInvesting: false,
    knowsNisa: false,
    monthlyAmount: 0,
    expectedReturn: 0.05,
    useRatioMode: false,
    ratioPercent: 10,
  },
  salaryGrowth: {
    annualRaisePercent: 2,
    peakIncome: 550,
  },
  spouse: {
    enabled: false,
    annualIncome: 300,
    salaryGrowth: { annualRaisePercent: 2, peakIncome: 500 },
  },
  expenseBreakdown: { ...DEFAULT_EXPENSE },
};

interface LifePlanStore {
  currentStep: OnboardingStep;
  onboardingComplete: boolean;
  profile: UserProfile;
  hydrated: boolean;
  recalcTrigger: number;

  setStep: (step: OnboardingStep) => void;
  nextStep: () => void;
  prevStep: () => void;
  completeOnboarding: () => void;
  resetAll: () => void;
  updateProfile: (partial: Partial<UserProfile>) => void;
  updateInvestment: (partial: Partial<UserProfile["investment"]>) => void;
  addEvent: (event: LifeEvent) => void;
  removeEvent: (eventId: string) => void;
  updateEvent: (eventId: string, partial: Partial<LifeEvent>) => void;
  triggerRecalc: () => void;
}

export const useLifePlanStore = create<LifePlanStore>()(
  persist(
    (set, get) => ({
      currentStep: 0 as OnboardingStep,
      onboardingComplete: false,
      profile: { ...defaultProfile },
      hydrated: false,
      recalcTrigger: 0,

      setStep: (step) => set({ currentStep: step }),
      nextStep: () => {
        const s = get().currentStep;
        if (s < 4) set({ currentStep: (s + 1) as OnboardingStep });
      },
      prevStep: () => {
        const s = get().currentStep;
        if (s > 0) set({ currentStep: (s - 1) as OnboardingStep });
      },
      completeOnboarding: () => set({ onboardingComplete: true }),
      resetAll: () =>
        set({ currentStep: 0, onboardingComplete: false, profile: { ...defaultProfile } }),

      updateProfile: (partial) =>
        set((state) => ({ profile: { ...state.profile, ...partial } })),

      updateInvestment: (partial) =>
        set((state) => ({
          profile: { ...state.profile, investment: { ...state.profile.investment, ...partial } },
        })),

      addEvent: (event) =>
        set((state) => ({
          profile: { ...state.profile, events: [...state.profile.events, event] },
        })),

      removeEvent: (eventId) =>
        set((state) => ({
          profile: { ...state.profile, events: state.profile.events.filter((e) => e.id !== eventId) },
        })),

      updateEvent: (eventId, partial) =>
        set((state) => ({
          profile: {
            ...state.profile,
            events: state.profile.events.map((e) => (e.id === eventId ? { ...e, ...partial } : e)),
          },
        })),

      triggerRecalc: () => set((state) => ({ recalcTrigger: state.recalcTrigger + 1 })),
    }),
    {
      name: "lifeplan-store",
      version: 4,
      migrate: (persisted: unknown) => {
        const state = persisted as Record<string, unknown>;
        const profile = (state?.profile ?? {}) as Record<string, unknown>;
        if (!Array.isArray(profile.events)) profile.events = [];
        if (!profile.annualIncome) profile.annualIncome = 300;
        if (!profile.salaryGrowth) profile.salaryGrowth = { annualRaisePercent: 2, peakIncome: 550 };
        if (!profile.spouse) profile.spouse = { enabled: false, annualIncome: 300, salaryGrowth: { annualRaisePercent: 2, peakIncome: 500 } };
        if (!profile.expenseBreakdown) profile.expenseBreakdown = { ...DEFAULT_EXPENSE };
        return { ...state, profile } as unknown as LifePlanStore;
      },
      onRehydrateStorage: () => (state) => {
        if (state) {
          const p = state.profile;
          if (!Array.isArray(p.events)) p.events = [];
          if (!p.salaryGrowth) p.salaryGrowth = { annualRaisePercent: 2, peakIncome: 550 };
          if (!p.spouse) p.spouse = { enabled: false, annualIncome: 300, salaryGrowth: { annualRaisePercent: 2, peakIncome: 500 } };
          if (!p.expenseBreakdown) p.expenseBreakdown = { ...DEFAULT_EXPENSE };
          state.hydrated = true;
        }
      },
    }
  )
);
