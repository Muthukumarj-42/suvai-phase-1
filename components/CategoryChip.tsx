import React from "react";

interface CategoryChipProps {
  label: string;
  active: boolean;
  onClick: () => void;
  certified?: boolean;
}

export default function CategoryChip({
  label,
  active,
  onClick,
  certified = false,
}: CategoryChipProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 shrink-0 border rounded-full px-4.5 py-2 text-xs font-bold transition-all duration-150 cursor-pointer ${
        active
          ? "border-[#1a5c2a] bg-[#1a5c2a] text-white"
          : "border-[#e4ddce] bg-white text-[#4a4636] hover:bg-slate-50"
      }`}
    >
      {certified && (
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke={active ? "#ffffff" : "#1a5c2a"}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="shrink-0"
        >
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      )}
      <span className="whitespace-nowrap">{label}</span>
    </button>
  );
}
