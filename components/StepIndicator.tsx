import React from "react";

interface StepIndicatorProps {
  currentStep: number;
  lang: "ta" | "en";
}

export default function StepIndicator({ currentStep, lang }: StepIndicatorProps) {
  const isTa = lang === "ta";

  const stepDefs = [
    { num: 1, labelTa: "அடிப்படை தகவல்", labelEn: "Basic Info" },
    { num: 2, labelTa: "இடம்", labelEn: "Location" },
    { num: 3, labelTa: "புகைப்படங்கள்", labelEn: "Photos" },
    { num: 4, labelTa: "உணவு பட்டியல்", labelEn: "Menu" },
  ];

  return (
    <div className="flex w-full justify-between items-start px-2 py-4 select-none">
      {stepDefs.map((step, idx) => {
        const isDone = step.num < currentStep;
        const isCurrent = step.num === currentStep;
        const isFuture = step.num > currentStep;
        
        return (
          <React.Fragment key={step.num}>
            {/* Step Circle & Text */}
            <div className="flex flex-col items-center gap-1.5 w-[76px] shrink-0">
              <div
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  isDone || isCurrent
                    ? "bg-[#1a5c2a] border-[#1a5c2a] text-white"
                    : "bg-white border-[#e4ddce] text-[#b3ad9d]"
                }`}
              >
                {isDone ? (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  step.num
                )}
              </div>
              <span
                className={`text-[10px] font-bold text-center tracking-tight leading-tight transition-all duration-300 ${
                  isCurrent
                    ? "text-[#1a5c2a]"
                    : isDone
                      ? "text-[#4a4636]"
                      : "text-[#b3ad9d]"
                }`}
              >
                {isTa ? step.labelTa : step.labelEn}
              </span>
            </div>

            {/* Connecting Line */}
            {idx < stepDefs.length - 1 && (
              <div
                className={`flex-1 h-0.5 mt-4 transition-all duration-300 ${
                  isDone ? "bg-[#1a5c2a]" : "bg-[#e4ddce]"
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
