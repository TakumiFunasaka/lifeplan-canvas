"use client";

import type { YearlyData } from "@/lib/types";
import { RETIREMENT_AGE } from "@/lib/constants";

function formatMan(v: number) {
  if (Math.abs(v) >= 10000) return `${(v / 10000).toFixed(1)}億円`;
  return `${Math.round(v).toLocaleString()}万円`;
}

export function InvestmentGap({
  data,
  isInvesting,
}: {
  data: YearlyData[];
  isInvesting: boolean;
}) {
  const atRetirement = data.find((d) => d.age === RETIREMENT_AGE);
  if (!atRetirement) return null;

  const startAge = data[0]?.age ?? 22;
  const years = RETIREMENT_AGE - startAge;

  if (!isInvesting) {
    // 月3万円で仮に計算して見せる
    const monthlyAmount = 3;
    const totalPrincipal = monthlyAmount * 12 * years;
    // 複利概算（月積立の将来価値）
    const r = 0.05 / 12;
    const n = years * 12;
    const fv = monthlyAmount * ((Math.pow(1 + r, n) - 1) / r);
    const gain = Math.round(fv - totalPrincipal);

    return (
      <div className="rounded-3xl bg-gradient-to-r from-violet-100 to-pink-100 p-5">
        <p className="font-bold text-violet-800 text-lg">💸 投資してないとどうなる？</p>
        <p className="mt-2 text-sm text-gray-700">
          もし月{monthlyAmount}万円を年利5%で{years}年間運用したら…
        </p>
        <p className="text-3xl font-bold text-violet-600 mt-2">
          +{formatMan(gain)}の利益
        </p>
        <p className="text-xs text-gray-500 mt-1">
          元本{formatMan(totalPrincipal)}に対して{formatMan(gain)}も増える。これが複利の力！
        </p>
      </div>
    );
  }

  const gap = atRetirement.savingsWithInvestment - atRetirement.savings;
  if (gap <= 0) return null;

  return (
    <div className="rounded-3xl bg-gradient-to-r from-violet-100 to-emerald-100 p-5">
      <p className="font-bold text-violet-800 text-lg">✨ 投資の効果</p>
      <p className="mt-1 text-sm text-gray-600">
        {RETIREMENT_AGE}歳時点で投資してた場合としてない場合の差
      </p>
      <p className="text-3xl font-bold text-emerald-600 mt-2">+{formatMan(gap)}</p>
      <p className="text-xs text-gray-500 mt-1">
        コツコツ積立 × 複利の力 = この差。始めるのが早いほど大きくなるよ
      </p>
    </div>
  );
}
