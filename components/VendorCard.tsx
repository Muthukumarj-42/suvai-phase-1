import React from "react";
import { useRouter } from "next/navigation";
import { Star, ChevronRight } from "lucide-react";

interface VendorCardProps {
  id: string;
  stallName: string;
  stallNameEn: string;
  foodType: "idli_dosa" | "kothu" | "parotta" | "pani_puri" | "juice" | "others";
  rating: number | null;
  reviewCount: number;
  suvaiCertified: boolean;
  distance?: string;
  isOpen?: boolean;
  isActive?: boolean;
  lang?: "ta" | "en";
  onClick?: () => void;
  directionsUrl?: string;
}

const typeStyles = {
  idli_dosa: {
    colors: ["#E87722", "#c85f12"],
    pillBg: "rgba(232, 119, 34, 0.1)",
    pillText: "#E87722",
  },
  kothu: {
    colors: ["#c0453a", "#9c342b"],
    pillBg: "rgba(192, 69, 58, 0.1)",
    pillText: "#c0453a",
  },
  parotta: {
    colors: ["#d98a1f", "#b06d12"],
    pillBg: "rgba(217, 138, 31, 0.1)",
    pillText: "#d98a1f",
  },
  pani_puri: {
    colors: ["#2f7d4a", "#1f5c34"],
    pillBg: "rgba(47, 125, 74, 0.1)",
    pillText: "#2f7d4a",
  },
  juice: {
    colors: ["#0ea5e9", "#0369a1"],
    pillBg: "rgba(14, 165, 233, 0.1)",
    pillText: "#0284c7",
  },
  others: {
    colors: ["#64748b", "#475569"],
    pillBg: "rgba(100, 116, 139, 0.1)",
    pillText: "#475569",
  },
};

const cardTranslations = {
  ta: {
    reviews: "விமர்சனங்கள்",
    newRating: "புதியது",
    certified: "சுவை சான்றளிக்கப்பட்டது",
    idli_dosa: "இட்லி/தோசை",
    kothu: "கொத்து",
    parotta: "பரோட்டா",
    pani_puri: "பானி பூரி",
    juice: "ஜூஸ்",
    others: "மற்றவை"
  },
  en: {
    reviews: "reviews",
    newRating: "New",
    certified: "Suvai Certified",
    idli_dosa: "Idli/Dosa",
    kothu: "Kothu",
    parotta: "Parotta",
    pani_puri: "Pani Puri",
    juice: "Juice",
    others: "Others"
  }
};

function getFoodGraphic(type: string) {
  switch (type) {
    case "idli_dosa":
      return (
        <svg width="60" height="60" viewBox="0 0 74 74" className="object-contain">
          <defs>
            <radialGradient id="steelg" cx="35%" cy="30%" r="75%">
              <stop offset="0%" stopColor="#f3f1ea" />
              <stop offset="100%" stopColor="#cfd0cc" />
            </radialGradient>
          </defs>
          <ellipse cx="37" cy="46" rx="27" ry="15" fill="url(#steelg)" stroke="#b7b8b2" strokeWidth="1" />
          <ellipse cx="37" cy="44" rx="21" ry="11" fill="#e7e5dd" />
          <circle cx="27" cy="41" r="7.2" fill="#fdfcf7" stroke="#e3e0d2" strokeWidth="1" />
          <circle cx="41" cy="39" r="7.6" fill="#fffef9" stroke="#e3e0d2" strokeWidth="1" />
          <circle cx="33" cy="49" r="6.8" fill="#f8f6ef" stroke="#e3e0d2" strokeWidth="1" />
          <circle cx="52" cy="47" r="5.5" fill="#c0453a" />
          <path d="M48 45c1 1.5 3 1.5 4 0M48.5 48.5c1 1 3 1 4 0" stroke="#8f2e26" strokeWidth="1" fill="none" strokeLinecap="round" />
          <circle cx="19" cy="49" r="4.6" fill="#4d7a2f" />
          <path d="M25 20c-2 4-1 7 1 9M35 18c-1 4 0 7 2 9M45 21c1 4 0 6-1 8" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" opacity=".8" />
        </svg>
      );
    case "kothu":
      return (
        <svg width="60" height="60" viewBox="0 0 74 74" className="object-contain">
          <defs>
            <radialGradient id="tawag" cx="50%" cy="35%" r="70%">
              <stop offset="0%" stopColor="#4a4a48" />
              <stop offset="100%" stopColor="#252422" />
            </radialGradient>
          </defs>
          <ellipse cx="37" cy="45" rx="29" ry="16" fill="url(#tawag)" />
          <ellipse cx="37" cy="43" rx="24" ry="12" fill="#1c1b19" opacity=".5" />
          <g>
            <rect x="16" y="38" width="15" height="5" rx="2.5" fill="#f0b448" transform="rotate(-8 20 40)" />
            <rect x="24" y="34" width="16" height="5" rx="2.5" fill="#e79b2e" transform="rotate(6 30 36)" />
            <rect x="30" y="40" width="17" height="5" rx="2.5" fill="#f0b448" transform="rotate(-4 38 42)" />
            <rect x="20" y="44" width="16" height="5" rx="2.5" fill="#e79b2e" transform="rotate(10 28 46)" />
            <rect x="36" y="36" width="14" height="5" rx="2.5" fill="#f2c169" transform="rotate(-12 42 38)" />
          </g>
          <circle cx="26" cy="40" r="1.3" fill="#fce9a8" />
          <circle cx="44" cy="41" r="1.3" fill="#fce9a8" />
          <circle cx="33" cy="47" r="1.1" fill="#c0453a" />
          <circle cx="40" cy="45" r="1.1" fill="#4d7a2f" />
          <path d="M22 24c-1 4 0 6 2 8M35 21c-1 4 0 7 2 9M46 25c1 3 0 6-1 8" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" opacity=".7" />
        </svg>
      );
    case "pani_puri":
      return (
        <svg width="60" height="60" viewBox="0 0 74 74" className="object-contain">
          <ellipse cx="37" cy="49" rx="22" ry="8" fill="#dba85a" />
          <circle cx="27" cy="34" r="9" fill="#f0c878" stroke="#c68f3f" strokeWidth="1.3" />
          <circle cx="41" cy="30" r="8" fill="#f2cd82" stroke="#c68f3f" strokeWidth="1.3" />
          <circle cx="48" cy="40" r="7.5" fill="#eec06e" stroke="#c68f3f" strokeWidth="1.3" />
          <circle cx="30" cy="46" r="4.5" fill="#4d7a2f" />
        </svg>
      );
    default:
      return (
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="opacity-95">
          <path d="M4 12h16a8 8 0 0 1-16 0z" />
          <path d="M3 20h18" />
          <path d="M9 5c0 1-1 1-1 2M12 4c0 1-1 1-1 2M15 5c0 1-1 1-1 2" />
        </svg>
      );
  }
}

export default function VendorCard({
  id,
  stallName,
  stallNameEn,
  foodType,
  rating,
  reviewCount,
  suvaiCertified,
  distance = "0.3 km",
  isOpen = true,
  isActive = false,
  lang = "ta",
  onClick,
  directionsUrl,
}: VendorCardProps) {
  const style = typeStyles[foodType] || typeStyles.others;
  const t = cardTranslations[lang];
  const router = useRouter();

  const handleCardClick = (e: React.MouseEvent) => {
    // If the user clicked inside the directions action button, ignore card routing
    if ((e.target as HTMLElement).closest(".directions-btn")) {
      return;
    }
    if (onClick) {
      onClick();
    } else {
      router.push(`/vendor/${id}`);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={`flex gap-4 bg-white border rounded-2.5xl p-4 cursor-pointer transition-all duration-200 relative select-none hover:-translate-y-0.5 active:scale-[0.99] ${
        isActive
          ? "border-[#E87722] ring-2 ring-[#E87722]/20 shadow-[0_10px_24px_-14px_rgba(232,119,34,0.6)]"
          : "border-[#f0ebe0] shadow-[0_6px_16px_-14px_rgba(30,40,20,0.15)] hover:border-[#d0c9bd] hover:shadow-[0_8px_20px_-10px_rgba(30,40,20,0.25)]"
      }`}
    >
      {/* Food Icon / Gradient Box */}
      <div
        className="relative shrink-0 w-[74px] h-[74px] rounded-2xl flex items-center justify-center"
        style={{
          background: `linear-gradient(140deg, ${style.colors[0]}, ${style.colors[1]})`,
        }}
      >
        {getFoodGraphic(foodType)}

        {/* Small certified check badge nested on icon */}
        {suvaiCertified && (
          <div className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-[#1a5c2a] flex items-center justify-center border-2 border-white">
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fff"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        )}
      </div>

      {/* Info Details */}
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        {lang === "ta" ? (
          <h3 className="ta text-base font-extrabold text-[#173d1f] line-clamp-1 leading-tight">
            {stallName}
          </h3>
        ) : (
          <h3 className="text-base font-extrabold text-[#173d1f] line-clamp-1 leading-tight">
            {stallNameEn}
          </h3>
        )}

        <div className="flex items-center gap-2 mt-2 flex-wrap text-slate-700">
          <span
            className="text-[10px] font-extrabold px-2 py-0.5 rounded-lg shrink-0 ta"
            style={{ backgroundColor: style.pillBg, color: style.pillText }}
          >
            {t[foodType] || t.others}
          </span>

          <span className="flex items-center gap-0.5 text-xs font-extrabold text-[#173d1f]">
            <Star size={12} className="fill-[#E87722] stroke-[#E87722]" />
            {rating ? rating.toFixed(1) : t.newRating}
          </span>

          <span className="text-[11px] font-bold text-[#9a9486] shrink-0 ta">
            · {reviewCount} {t.reviews}
          </span>
        </div>

        {/* Certified Badge Pill below meta (optional in list) */}
        {suvaiCertified && (
          <div className="inline-flex items-center gap-1.5 mt-2 bg-[#1a5c2a] px-2.5 py-1 rounded-full w-fit">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="#ffffff" className="shrink-0">
              <path d="M12 2l7 3v6c0 5-3 8.5-7 10-4-1.5-7-5-7-10V5z" />
            </svg>
            <span className="text-[9px] font-black text-white uppercase tracking-wider ta">
              {t.certified}
            </span>
          </div>
        )}
      </div>

      {/* Right Column details (distance, arrow) */}
      <div className="flex flex-col items-end justify-between self-stretch shrink-0">
        <span className="text-[10px] font-extrabold text-[#E87722] bg-[#fdf0e5] px-2 py-0.5 rounded-lg">
          {distance}
        </span>
        
        {directionsUrl && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              window.open(directionsUrl, "_blank");
            }}
            title="Get Directions"
            className="directions-btn w-7 h-7 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 flex items-center justify-center text-emerald-700 cursor-pointer transition-colors mt-1.5 active:scale-95"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="3 11 22 2 13 21 11 13 3 11" />
            </svg>
          </button>
        )}

        <div className="w-[30px] h-[30px] rounded-xl bg-[#f4f1ea] flex items-center justify-center text-[#8a8577] mt-1.5">
          <ChevronRight size={16} />
        </div>
      </div>
    </div>
  );
}
