import React from "react";

interface LanguageToggleProps {
  currentLang: "ta" | "en";
  onChange: (lang: "ta" | "en") => void;
}

/**
 * Language toggle is hidden for now, keeping English only.
 * Returns null to hide from the UI without breaking page component imports.
 */
export default function LanguageToggle({ currentLang, onChange }: LanguageToggleProps) {
  return null;
}
