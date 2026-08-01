import React from "react";
import { Compass, Search, Heart, User, Home, Star, Settings } from "lucide-react";

interface BottomNavProps {
  mode: "student" | "vendor";
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function BottomNav({ mode, activeTab, onTabChange }: BottomNavProps) {
  const isStudent = mode === "student";

  const studentTabs = [
    { id: "discover", labelTa: "கண்டறியவும்", labelEn: "Discover", Icon: Compass },
    { id: "search", labelTa: "தேடல்", labelEn: "Search", Icon: Search },
    { id: "favourites", labelTa: "விருப்பமானவை", labelEn: "Favourites", Icon: Heart },
    { id: "profile", labelTa: "பதிவு", labelEn: "Profile", Icon: User },
  ];

  const vendorTabs = [
    { id: "home", labelTa: "முகப்பு", labelEn: "Home", Icon: Home },
    { id: "profile", labelTa: "என் Profile", labelEn: "Profile", Icon: User },
    { id: "reviews", labelTa: "விமர்சனங்கள்", labelEn: "Reviews", Icon: Star },
    { id: "settings", labelTa: "அமைப்புகள்", labelEn: "Settings", Icon: Settings },
  ];

  const tabs = isStudent ? studentTabs : vendorTabs;

  return (
    <div className="absolute bottom-0 left-0 right-0 z-20 bg-white border-t border-[#ece5d8] pb-5 pt-2 px-3 flex justify-around shadow-[0_-6px_22px_-16px_rgba(30,40,20,0.4)]">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const IconComponent = tab.Icon;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className="bg-transparent border-none cursor-pointer flex flex-col items-center gap-0.5 py-0.5 px-2.5 flex-1 transition-all"
          >
            <div className={`transition-colors duration-150 ${isActive ? "text-[#1a5c2a]" : "text-[#a7a294]"}`}>
              <IconComponent size={20} className={isActive ? "fill-[#1a5c2a]/10" : ""} />
            </div>
            <span
              className={`text-[9px] font-bold transition-colors duration-150 whitespace-nowrap ${
                isActive ? "text-[#1a5c2a]" : "text-[#a7a294]"
              }`}
            >
              {tab.labelEn}
            </span>
          </button>
        );
      })}
    </div>
  );
}
