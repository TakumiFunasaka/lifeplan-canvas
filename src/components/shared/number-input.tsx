"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";

interface NumberInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  className?: string;
  placeholder?: string;
}

export function NumberInput({
  value,
  onChange,
  min = 0,
  max = 99999,
  step = 1,
  suffix,
  className,
  placeholder,
}: NumberInputProps) {
  const [rawText, setRawText] = useState<string | null>(null);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const text = e.target.value;
      // 空欄は0扱い、編集中はそのまま表示
      if (text === "" || text === "-") {
        setRawText(text);
        return;
      }
      setRawText(text);
      const parsed = parseFloat(text);
      if (!isNaN(parsed)) {
        onChange(Math.min(max, Math.max(min, parsed)));
      }
    },
    [onChange, min, max]
  );

  const handleBlur = useCallback(() => {
    // フォーカスを外したらクリーンな値に戻す
    setRawText(null);
  }, []);

  const handleFocus = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      // フォーカス時にテキストとして設定（先頭0なし）
      setRawText(value.toString());
      // 全選択で上書きしやすく
      e.target.select();
    },
    [value]
  );

  const displayValue = rawText !== null ? rawText : value.toString();

  return (
    <div className="flex items-center gap-1.5">
      <input
        type="text"
        inputMode="decimal"
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        step={step}
        placeholder={placeholder}
        className={cn(
          "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none",
          "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
          "text-center font-bold tabular-nums",
          "md:text-sm",
          className
        )}
      />
      {suffix && (
        <span className="text-sm text-gray-500 whitespace-nowrap">{suffix}</span>
      )}
    </div>
  );
}
