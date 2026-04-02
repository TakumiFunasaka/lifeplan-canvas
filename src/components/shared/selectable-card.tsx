"use client";

import { cn } from "@/lib/utils";

interface SelectableCardProps {
  emoji: string;
  label: string;
  description?: string;
  selected: boolean;
  onClick: () => void;
  compact?: boolean;
}

export function SelectableCard({
  emoji,
  label,
  description,
  selected,
  onClick,
  compact,
}: SelectableCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 rounded-2xl border-2 p-3 text-center transition-all active:scale-95",
        compact ? "p-2" : "p-3",
        selected
          ? "border-violet-400 bg-violet-50 shadow-md shadow-violet-100"
          : "border-gray-200 bg-white hover:border-violet-200 hover:bg-violet-50/30"
      )}
    >
      <span className={compact ? "text-2xl" : "text-3xl"}>{emoji}</span>
      <span className={cn("font-medium", compact ? "text-xs" : "text-sm")}>
        {label}
      </span>
      {description && !compact && (
        <span className="text-xs text-gray-500 leading-tight">{description}</span>
      )}
    </button>
  );
}
