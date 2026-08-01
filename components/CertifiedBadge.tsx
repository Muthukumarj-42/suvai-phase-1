import React from "react";

interface CertifiedBadgeProps {
  size?: "sm" | "md" | "lg";
  bilingual?: boolean;
}

export default function CertifiedBadge({ size = "md", bilingual = false }: CertifiedBadgeProps) {
  const isSm = size === "sm";
  const isLg = size === "lg";

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full bg-[#1a5c2a] text-white shadow-md shadow-black/10 ${
        isSm 
          ? "px-2 py-0.5 text-[10px] font-extrabold" 
          : isLg 
            ? "px-4 py-2 text-sm font-extrabold shadow-lg shadow-black/25" 
            : "px-3 py-1.5 text-xs font-extrabold"
      }`}
    >
      <svg
        width={isSm ? "12" : isLg ? "22" : "15"}
        height={isSm ? "12" : isLg ? "22" : "15"}
        viewBox="0 0 24 24"
        className="shrink-0"
      >
        <path
          d="M12 2l7 3v6c0 5-3 8.5-7 10-4-1.5-7-5-7-10V5z"
          fill="#ffffff"
          stroke="none"
        />
        <path
          d="M8.3 12.2l2.4 2.4 4.6-4.8"
          fill="none"
          stroke="#1a5c2a"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="tracking-wide">
        Suvai Certified
        {bilingual && isLg && (
          <span className="block ta text-[11px] font-normal text-green-100 mt-0.5">
            சுகாதாரம் சரிபார்க்கப்பட்டது
          </span>
        )}
      </span>
    </div>
  );
}
