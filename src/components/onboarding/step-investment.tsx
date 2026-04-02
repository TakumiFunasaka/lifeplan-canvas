"use client";

import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { useLifePlanStore } from "@/hooks/use-lifeplan-store";

export function StepInvestment() {
  const investment = useLifePlanStore((s) => s.profile.investment);
  const updateInvestment = useLifePlanStore((s) => s.updateInvestment);

  return (
    <div className="space-y-6">
      {/* 投資知識レベル */}
      <div className="space-y-3">
        <p className="text-center text-gray-600">投資ってやったことある？</p>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => updateInvestment({ knowsNisa: true })}
            className={`rounded-2xl border-2 p-4 text-center transition-all active:scale-95 ${
              investment.knowsNisa
                ? "border-violet-400 bg-violet-50 shadow-md"
                : "border-gray-200 bg-white hover:border-violet-200"
            }`}
          >
            <span className="text-3xl">📈</span>
            <p className="text-sm font-medium mt-1">やってる / 知ってる</p>
          </button>
          <button
            type="button"
            onClick={() => updateInvestment({ knowsNisa: false })}
            className={`rounded-2xl border-2 p-4 text-center transition-all active:scale-95 ${
              !investment.knowsNisa
                ? "border-violet-400 bg-violet-50 shadow-md"
                : "border-gray-200 bg-white hover:border-violet-200"
            }`}
          >
            <span className="text-3xl">🤔</span>
            <p className="text-sm font-medium mt-1">よくわからない</p>
          </button>
        </div>
      </div>

      {/* NISAの説明（知らない人向け） */}
      {!investment.knowsNisa && (
        <div className="rounded-2xl bg-sky-50 p-4 text-sm text-sky-800 animate-in fade-in duration-300">
          <p className="font-medium">💡 投資ってなに？</p>
          <p className="mt-1">
            たとえば100万円を銀行に預けると、1年後に増えるのは<span className="font-bold">たった10円</span>。
            でも投資信託（プロがまとめて運用してくれるパック商品）に預けると、
            過去の実績では<span className="font-bold">年5万円くらい</span>増えてきた。
          </p>
          <p className="mt-2">
            もちろん減る年もあるけど、15年以上続ければ歴史上はほぼプラスになってる。
          </p>
          <p className="mt-2">
            <span className="font-bold">NISA</span>は国が「投資で増えた分に税金かけないよ」って作った制度。
            普通は増えた分の20%が税金で取られるけど、NISAなら<span className="font-bold">0円</span>！
          </p>
        </div>
      )}

      {/* 投資するかどうか + 金額 */}
      <div className="space-y-3">
        <p className="text-center text-sm text-gray-600 font-medium">
          {investment.knowsNisa
            ? "毎月いくら投資に回す？"
            : "もし投資を始めるとしたら、毎月いくら回せそう？"}
        </p>
        <div className="flex justify-between items-center">
          <Label className="text-sm text-gray-500">月額投資額</Label>
          <span className="text-lg font-bold text-violet-600 tabular-nums">
            {investment.monthlyAmount}万円
          </span>
        </div>
        <Slider
          min={0}
          max={10}
          step={0.5}
          value={[investment.monthlyAmount]}
          onValueChange={(v) => {
            const amount = Array.isArray(v) ? v[0] : v;
            updateInvestment({
              monthlyAmount: amount,
              isInvesting: amount > 0,
            });
          }}
        />
        <p className="text-xs text-gray-400 text-center">
          0万円＝投資しない。まずは0.5万円（5000円）からでもOK！
        </p>
      </div>

      {/* 投資しない場合の警告 */}
      {investment.monthlyAmount === 0 && (
        <div className="rounded-2xl bg-amber-50 p-4 text-sm text-amber-800 animate-in fade-in duration-300">
          <p className="font-medium">⚠️ 投資しない場合…</p>
          <p className="mt-1">
            貯金だけだと100万円を40年預けても増えるのはたった400円。
            投資なら年5%で約700万円になる可能性がある。
            この差をグラフで見てみよう！
          </p>
        </div>
      )}

      {investment.monthlyAmount > 0 && (
        <div className="rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-800 animate-in fade-in duration-300">
          <p className="font-medium">🎉 ナイス！</p>
          <p className="mt-1">
            月{investment.monthlyAmount}万円を年5%で30年運用すると…
            元本{Math.round(investment.monthlyAmount * 12 * 30)}万円が
            約{Math.round(investment.monthlyAmount * 12 * 30 * 1.7)}万円になる可能性！
          </p>
        </div>
      )}
    </div>
  );
}
