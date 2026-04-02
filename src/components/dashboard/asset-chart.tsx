"use client";

import { useEffect, useRef, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ReferenceDot,
} from "recharts";
import type { YearlyData } from "@/lib/types";

function formatYen(value: number) {
  if (Math.abs(value) >= 10000) return `${(value / 10000).toFixed(1)}億`;
  return `${value}万`;
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { value: number; dataKey: string; payload: YearlyData }[];
  label?: number;
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-xl bg-white/95 backdrop-blur px-3 py-2 text-xs shadow-lg border border-gray-100">
      <p className="font-bold text-sm">{d.age}歳</p>
      <p className="text-gray-500">年収: {formatYen(d.income)}円</p>
      <p className="text-violet-600">投資あり: {formatYen(d.savingsWithInvestment)}円</p>
      <p className="text-gray-400">投資なし: {formatYen(d.savings)}円</p>
      {d.eventLabels.length > 0 && (
        <p className="mt-1 text-amber-600 text-[10px]">{d.eventLabels.join("、")}</p>
      )}
    </div>
  );
}

export function AssetChart({
  data,
  showInvestment,
}: {
  data: YearlyData[];
  showInvestment: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const { width, height } = el.getBoundingClientRect();
      if (width > 0 && height > 0) setSize({ width: Math.floor(width), height: Math.floor(height) });
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const allValues = data.flatMap((d) =>
    showInvestment ? [d.savings, d.savingsWithInvestment] : [d.savings]
  );
  const minVal = Math.min(...allValues);
  const maxVal = Math.max(...allValues);
  const yMin = minVal < 0 ? Math.floor(minVal / 500) * 500 : 0;
  const yMax = Math.max(Math.ceil(maxVal / 500) * 500, 500);

  const eventMarkers = data.filter((d) => d.eventLabels.length > 0);

  return (
    <div ref={containerRef} className="w-full h-[280px] sm:h-[360px]">
      {size.width > 0 && size.height > 0 && (
        <AreaChart
          width={size.width}
          height={size.height}
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="gradInvest" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="gradNoInvest" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#94a3b8" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#94a3b8" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis
            dataKey="age"
            tick={{ fontSize: 11 }}
            tickFormatter={(v) => `${v}`}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 10 }}
            tickFormatter={formatYen}
            width={48}
            domain={[yMin, yMax]}
          />
          <Tooltip content={<CustomTooltip />} />
          {minVal < 0 && (
            <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="4 4" strokeWidth={1} />
          )}
          <ReferenceLine
            x={65}
            stroke="#94a3b8"
            strokeDasharray="2 4"
            strokeWidth={1}
            label={{ value: "退職", fontSize: 10, fill: "#94a3b8" }}
          />
          <Area
            type="monotone"
            dataKey="savings"
            stroke="#94a3b8"
            strokeWidth={1.5}
            strokeDasharray="4 2"
            fill="url(#gradNoInvest)"
            name="投資なし"
          />
          {showInvestment && (
            <Area
              type="monotone"
              dataKey="savingsWithInvestment"
              stroke="#8b5cf6"
              strokeWidth={2}
              fill="url(#gradInvest)"
              name="投資あり"
            />
          )}
          {eventMarkers.map((d) => (
            <ReferenceDot
              key={d.age}
              x={d.age}
              y={showInvestment ? d.savingsWithInvestment : d.savings}
              r={4}
              fill="#f59e0b"
              stroke="#fff"
              strokeWidth={2}
            />
          ))}
        </AreaChart>
      )}
    </div>
  );
}
