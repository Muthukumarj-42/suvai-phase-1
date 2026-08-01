"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Compass, Search, Heart, MapPin, Star } from "lucide-react";
import { createBrowserClientInstance } from "@/lib/supabase/client";
import CategoryChip from "@/components/CategoryChip";
import LanguageToggle from "@/components/LanguageToggle";
import VendorCard from "@/components/VendorCard";
import BottomNav from "@/components/BottomNav";
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from "@react-google-maps/api";

// Fallback seed profiles
const FALLBACK_VENDORS = [
  { id: "v1", stall_name: "முருகன் இட்லி கடை", stall_name_en: "Murugan Idli Kadai", food_type: "idli_dosa", phone: "9876543210", lat: 11.5037, lng: 77.2452, rating: 4.8, review_count: 312, suvai_certified: true, established_year: 1994, is_open: true, views_count: 47, favourites_count: 28 },
  { id: "v2", stall_name: "செல்வா கொத்து சென்டர்", stall_name_en: "Selva Kothu Center", food_type: "kothu", phone: "9876543211", lat: 11.5054, lng: 77.2494, rating: 4.6, review_count: 188, suvai_certified: true, established_year: 2005, is_open: true, views_count: 120, favourites_count: 42 },
  { id: "v3", stall_name: "ராஜா பானி பூரி", stall_name_en: "Raja Pani Puri", food_type: "pani_puri", phone: "9876543212", lat: 11.5004, lng: 77.2394, rating: 4.2, review_count: 94, suvai_certified: false, established_year: 2012, is_open: true, views_count: 35, favourites_count: 12 },
  { id: "v4", stall_name: "அம்மா பரோட்டா ஸ்டால்", stall_name_en: "Amma Parotta Stall", food_type: "parotta", phone: "9876543213", lat: 11.4954, lng: 77.2344, rating: 4.5, review_count: 140, suvai_certified: false, established_year: 2000, is_open: true, views_count: 80, favourites_count: 20 },
  { id: "v5", stall_name: "கண்ணன் தோசை மனை", stall_name_en: "Kannan Dosai Manai", food_type: "idli_dosa", phone: "9876543214", lat: 11.5074, lng: 77.2474, rating: 4.4, review_count: 97, suvai_certified: false, established_year: 1998, is_open: true, views_count: 55, favourites_count: 15 },
  { id: "v6", stall_name: "வெற்றி கொத்து பார்சல்", stall_name_en: "Vetri Kothu Parcel", food_type: "kothu", phone: "9876543215", lat: 11.4984, lng: 77.2514, rating: 4.3, review_count: 74, suvai_certified: true, established_year: 2018, is_open: true, views_count: 65, favourites_count: 18 }
];

// Haversine formula to compute distance in km
function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Helper to convert lat/lng to visual coordinate values on the SVG canvas (fallback only)
function getPinCoordinates(id: string, lat: number, lng: number, isDesktop = false) {
  const centerLat = 11.5034;
  const centerLng = 77.2444;
  const scale = isDesktop ? 6000 : 3500;
  const cx = isDesktop ? 300 : 196;
  const cy = isDesktop ? 400 : 426;

  const dx = (lng - centerLng) * scale + cx;
  const dy = -(lat - centerLat) * scale + cy;

  return {
    x: Math.max(30, Math.min(isDesktop ? 700 : 360, dx)),
    y: Math.max(100, Math.min(isDesktop ? 750 : 720, dy))
  };
}

const homeTranslations = {
  ta: {
    location: "சத்தியமங்கலம், தமிழ்நாடு",
    title: "சுவை",
    searchPlaceholder: "இட்லி, கொத்து, பரோட்டா தேடுங்கள்...",
    nearMe: "அருகில்",
    stallsFound: "கடைகள் கண்டறியப்பட்டன",
    stallsNearYou: "கடைகள் அருகில் உள்ளன",
    sortNearest: "வரிசைப்படுத்து: அருகில்",
    vendorCTA: "நீங்கள் ஒரு வியாபாரியா? இலவசமாக சேர்க்கவும் →",
    noMatchTitle: "கடைகள் எதுவும் கிடைக்கவில்லை",
    noMatchDesc: "மற்றொரு உணவு வகையை தேர்ந்தெடுக்கவும்",
    nearMeDesktop: "அருகில் (முகப்பு இடம்)"
  },
  en: {
    location: "Sathyamangalam, Tamil Nadu",
    title: "Suvai",
    searchPlaceholder: "Search idli, dosa, kothu...",
    nearMe: "Near Me",
    stallsFound: "stalls found",
    stallsNearYou: "stalls near you",
    sortNearest: "Sort: Nearest",
    vendorCTA: "Are you a vendor? List your stall free →",
    noMatchTitle: "No stalls match this filter",
    noMatchDesc: "Try shifting chips to see all stalls.",
    nearMeDesktop: "Near Me (Center Location)"
  }
};

export default function DiscoveryHome() {
  const [lang, setLang] = useState<"ta" | "en">("en");
  const [activeTab, setActiveTab] = useState("discover");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);
  
  // Geolocation & permissions states
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationPermission, setLocationPermission] = useState<"loading" | "granted" | "denied">("loading");
  
  // Mobile Snapping Bottom Sheet height config
  const [sheetState, setSheetState] = useState<"peek" | "half" | "full">("half");
  const [isDesktop, setIsDesktop] = useState(false);
  
  const [vendors, setVendors] = useState<any[]>([]);
  const [dbStatus, setDbStatus] = useState<"loading" | "connected" | "fallback">("loading");

  // Default center coordinates (Sathyamangalam)
  const defaultCenter = { lat: 11.5034, lng: 77.2444 };
  const [mapCenter, setMapCenter] = useState(defaultCenter);

  const t = homeTranslations[lang];

  // Google Maps JS API loader
  const googleMapsKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const isMapsKeyConfigured = googleMapsKey && googleMapsKey !== "your-google-maps-api-key";

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: isMapsKeyConfigured ? googleMapsKey : "",
  });

  // Screen size detection
  useEffect(() => {
    const checkScreen = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  // Request user live geolocation on mount
  useEffect(() => {
    if (typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(coords);
          setLocationPermission("granted");
          setMapCenter(coords);
        },
        (error) => {
          console.warn("Geolocation access denied or failed:", error);
          setLocationPermission("denied");
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      setLocationPermission("denied");
    }
  }, []);

  // Supabase data loading
  useEffect(() => {
    async function fetchVendors() {
      try {
        const supabase = createBrowserClientInstance();
        const { data, error } = await supabase
          .from("vendors")
          .select("*")
          .order("stall_name_en", { ascending: true });

        if (error) throw error;

        if (data && data.length > 0) {
          setVendors(data);
          setDbStatus("connected");
        } else {
          setVendors(FALLBACK_VENDORS);
          setDbStatus("connected");
        }
      } catch (err) {
        console.warn("Supabase connection failed, using offline fallback data:", err);
        setVendors(FALLBACK_VENDORS);
        setDbStatus("fallback");
      }
    }

    fetchVendors();
  }, []);

  // Center map on selected vendor
  useEffect(() => {
    if (selectedVendorId) {
      const selected = vendors.find(v => v.id === selectedVendorId);
      if (selected && selected.lat && selected.lng) {
        setMapCenter({ lat: selected.lat, lng: selected.lng });
      }
    }
  }, [selectedVendorId, vendors]);

  // Filter category choices
  const categoryChips = [
    { id: "All", ta: "அனைத்தும்", en: "All", certified: false },
    { id: "idli_dosa", ta: "இட்லி/தோசை", en: "Idli/Dosa", certified: false },
    { id: "kothu", ta: "கொத்து", en: "Kothu", certified: false },
    { id: "parotta", ta: "பரோட்டா", en: "Parotta", certified: false },
    { id: "pani_puri", ta: "பானி பூரி", en: "Pani Puri", certified: false },
    { id: "Certified Only", ta: "சான்றிதழ் பெற்றவை", en: "Certified Only", certified: true }
  ];

  // Calculate distance values from current reference lat/lng
  const referenceLat = userLocation?.lat ?? defaultCenter.lat;
  const referenceLng = userLocation?.lng ?? defaultCenter.lng;

  const vendorsWithDistance = vendors.map((v) => {
    const dist = calculateHaversineDistance(
      referenceLat,
      referenceLng,
      v.lat || defaultCenter.lat,
      v.lng || defaultCenter.lng
    );
    return {
      ...v,
      distanceVal: dist,
      distanceStr: dist < 1 
        ? `${Math.round(dist * 1000)} m` 
        : `${dist.toFixed(1)} km`
    };
  });

  // Filter and sort vendors by distance
  const filteredVendors = vendorsWithDistance
    .filter((vendor) => {
      const matchesSearch =
        vendor.stall_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vendor.stall_name_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vendor.food_type.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (selectedCategory === "All") return true;
      if (selectedCategory === "Certified Only") return vendor.suvai_certified;
      return vendor.food_type === selectedCategory;
    })
    .sort((a, b) => a.distanceVal - b.distanceVal);

  const handleRecenter = () => {
    setSelectedVendorId(null);
    setSheetState("half");
    if (userLocation) {
      setMapCenter(userLocation);
    } else {
      setMapCenter(defaultCenter);
    }
  };

  const handleSelectVendor = (id: string) => {
    setSelectedVendorId(id);
    setSheetState("half");

    // Smooth scroll the sidebar to display the selected card on desktop
    if (isDesktop) {
      const cardElement = document.getElementById(`desktop-card-${id}`);
      if (cardElement) {
        cardElement.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  };

  const sheetTops = {
    full: "top-[120px] bottom-[106px]",
    half: "top-[430px] bottom-[106px]",
    peek: "top-[640px] bottom-[106px]"
  };

  // Fallback SVG Map Graphic
  const renderMapGraphic = () => (
    <svg viewBox={isDesktop ? "0 0 800 852" : "0 0 393 852"} className="w-full h-full object-cover select-none">
      <rect width={isDesktop ? 800 : 393} height="852" fill="#eef2e6" />
      <rect x={isDesktop ? "-40" : "-20"} y="120" width={isDesktop ? "300" : "150"} height="150" rx="16" fill="#d6e5c4" />
      <rect x={isDesktop ? "500" : "250"} y="60" width={isDesktop ? "360" : "180"} height="130" rx="16" fill="#d6e5c4" />
      <rect x={isDesktop ? "550" : "270"} y="420" width={isDesktop ? "320" : "160"} height="150" rx="16" fill="#dbe7cb" />
      <rect x={isDesktop ? "-60" : "-30"} y="520" width={isDesktop ? "280" : "140"} height="160" rx="16" fill="#dbe7cb" />
      <path d={isDesktop 
        ? "M-20 300 C 180 330, 240 280, 400 320 C 560 360, 680 320, 840 350 L 840 430 C 680 400, 560 440, 400 400 C 240 360, 180 410, -20 380 Z"
        : "M-20 300 C 80 330, 120 280, 200 320 C 280 360, 340 320, 420 350 L 420 430 C 340 400, 280 440, 200 400 C 120 360, 80 410, -20 380 Z"} 
        fill="#bcd6e0" 
      />
      <g stroke="#f7f4ee" strokeLinecap="round">
        <line x1={isDesktop ? "350" : "196"} y1="-10" x2={isDesktop ? "350" : "196"} y2="870" strokeWidth="26" />
        <line x1="-10" y1="240" x2={isDesktop ? "820" : "410"} y2="240" strokeWidth="22" />
        <line x1="-10" y1="600" x2={isDesktop ? "820" : "410"} y2="600" strokeWidth="22" />
        <line x1={isDesktop ? "150" : "90"} y1="-10" x2={isDesktop ? "150" : "90"} y2="870" strokeWidth="14" />
        <line x1={isDesktop ? "600" : "310"} y1="-10" x2={isDesktop ? "600" : "310"} y2="870" strokeWidth="14" />
        <line x1="-10" y1="450" x2={isDesktop ? "820" : "410"} y2="450" strokeWidth="12" />
        <line x1="-10" y1="740" x2={isDesktop ? "820" : "410"} y2="740" strokeWidth="12" />
      </g>
    </svg>
  );

  // Common Search bar subcomponent
  const renderSearchBar = () => (
    <div className="flex items-center gap-2.5 bg-white border border-[#ece5d8] rounded-2xl px-4.5 py-3.5 shadow-[0_8px_20px_-14px_rgba(30,40,20,0.35)] shrink-0">
      <Search size={18} className="text-[#8a8577] shrink-0" />
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder={t.searchPlaceholder}
        className="w-full bg-transparent border-none outline-none text-xs font-semibold text-[#173d1f] placeholder-[#a7a294] ta"
      />
    </div>
  );

  // Common Category scroll bar subcomponent
  const renderCategoryChips = () => (
    <div className="noscroll flex gap-2 overflow-x-auto scroll-smooth pb-0.5 shrink-0 bg-transparent">
      {categoryChips.map((chip) => {
        const label = lang === "ta" ? chip.ta : chip.en;
        return (
          <CategoryChip
            key={chip.id}
            label={label}
            active={selectedCategory === chip.id}
            certified={chip.certified}
            onClick={() => setSelectedCategory(chip.id)}
          />
        );
      })}
    </div>
  );

  return (
    <div className="w-full h-screen bg-[#FAF7F2] text-[#173d1f] font-sans antialiased overflow-hidden flex flex-col">
      
      {/* ===== 1. FULL WIDTH STATIC HEADER ===== */}
      <header className="w-full bg-[#FAF7F2] border-b border-[#ece5d8] px-5 py-3 shrink-0 z-20 flex items-center justify-between">
        <div>
          <div className="text-[11px] font-black text-[#E87722] flex items-center gap-1">
            <MapPin size={11} className="fill-[#E87722]" />
            <span className="ta font-extrabold">{t.location}</span>
          </div>
          <h1 className="text-2xl font-black text-[#1a5c2a] leading-none mt-0.5 select-none">
            {lang === "ta" ? "சுவை" : "Suvai"}
          </h1>
        </div>
        <LanguageToggle currentLang={lang} onChange={setLang} />
      </header>

      {/* ===== 2. LOWER AREA CONTAINER ===== */}
      <div className="flex-1 w-full relative flex overflow-hidden">
        
        {/* SIDEBAR: Static side panel on Desktop, Snapping bottom-sheet on Mobile */}
        <aside
          className={`absolute left-0 right-0 z-10 bg-[#FAF7F2] rounded-t-3.5xl shadow-[0_-14px_34px_-18px_rgba(20,40,20,0.45)] flex flex-col transition-all duration-300 
            lg:static lg:w-[420px] lg:h-full lg:rounded-none lg:shadow-none lg:border-r lg:border-[#ece5d8] lg:bg-[#FAF7F2] ${
              isDesktop ? "top-0 bottom-0" : sheetTops[sheetState]
            }`}
        >
          {/* Drag Handle (Mobile only) */}
          <div
            onClick={() => setSheetState((prev) => (prev === "half" ? "full" : prev === "full" ? "peek" : "half"))}
            className="py-3 cursor-pointer shrink-0 lg:hidden"
          >
            <div className="w-11 h-1.5 rounded-full bg-[#d8d1c4] mx-auto" />
          </div>

          {/* Desktop-only Search and Filters top padding */}
          <div className="hidden lg:block p-5 pb-2.5 space-y-4 shrink-0 bg-[#FAF7F2]">
            {renderSearchBar()}
            {renderCategoryChips()}
          </div>

          {/* Location permission fallback banner warnings */}
          {locationPermission === "denied" && (
            <div className="bg-[#fff9e6] border-b border-[#ffe699] px-5 py-2.5 text-xs text-[#997300] font-bold flex items-center justify-between shrink-0 select-none">
              <span>⚠️ Enable location permissions to find stalls closest to you.</span>
              <button 
                onClick={() => {
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                      (pos) => {
                        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                        setUserLocation(coords);
                        setLocationPermission("granted");
                        setMapCenter(coords);
                      },
                      () => {}
                    );
                  }
                }}
                className="underline font-black bg-transparent border-none cursor-pointer text-[#997300] hover:text-[#664d00]"
              >
                Retry
              </button>
            </div>
          )}

          {/* List Metadata Details */}
          <div className="flex items-center justify-between px-5 pb-3 pt-1 shrink-0 lg:px-5 lg:py-3.5 lg:border-b lg:border-[#ece5d8] lg:bg-white">
            <span className="text-sm font-black text-[#173d1f] lg:text-xs.5 lg:text-[#6f6a5c] ta">
              {filteredVendors.length} {isDesktop ? t.stallsFound : t.stallsNearYou}
            </span>
            <span className="text-xs font-extrabold text-[#E87722] cursor-pointer ta">{t.sortNearest}</span>
          </div>

          {/* Scrollable list of vendor cards */}
          <div className="noscroll flex-1 overflow-y-auto px-4 pb-24 lg:p-5 lg:space-y-3 lg:bg-[#FAF7F2]">
            {filteredVendors.length > 0 ? (
              filteredVendors.map((v) => (
                <div key={v.id} id={`desktop-card-${v.id}`}>
                  <VendorCard
                    id={v.id}
                    stallName={v.stall_name}
                    stallNameEn={v.stall_name_en}
                    foodType={v.food_type as any}
                    rating={v.rating}
                    reviewCount={v.review_count}
                    suvaiCertified={v.suvai_certified}
                    distance={v.distanceStr}
                    directionsUrl={
                      userLocation 
                        ? `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${v.lat},${v.lng}` 
                        : `https://www.google.com/maps/dir/?api=1&destination=${v.lat},${v.lng}`
                    }
                    isActive={selectedVendorId === v.id}
                    lang={lang}
                  />
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-[#9a9486] bg-white border border-[#f0ebe0] rounded-2xl p-6">
                <p className="font-extrabold text-sm text-[#6f6a5c] ta">{t.noMatchTitle}</p>
                <p className="text-xs mt-1.5 ta">{t.noMatchDesc}</p>
              </div>
            )}
          </div>

          {/* Vendor Register Banner */}
          <Link
            href="/vendor/register"
            className="absolute bottom-0 left-0 right-0 h-16 bg-[#E87722] hover:bg-[#d5671b] px-6 flex items-center justify-between text-white font-extrabold text-xs.5 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] z-10 transition-colors
              lg:static lg:h-14 lg:px-5 lg:shadow-none shrink-0"
          >
            <span className="ta font-black">{isDesktop ? (lang === "ta" ? "உணவு வியாபாரியா?" : "Are you a food vendor?") : t.vendorCTA}</span>
            {isDesktop && (
              <span className="flex items-center gap-1 hover:translate-x-0.5 transition-transform ta font-black">
                {lang === "ta" ? "இலவசமாக சேர்க்க →" : "List free →"}
              </span>
            )}
          </Link>
        </aside>

        {/* MAP MAIN PANEL: Google Maps API or SVG Fallback */}
        <main className="flex-1 h-full relative bg-[#eef1e8]">
          {isLoaded && isMapsKeyConfigured ? (
            <GoogleMap
              mapContainerClassName="w-full h-full"
              center={mapCenter}
              zoom={14}
              options={{
                disableDefaultUI: true,
                zoomControl: true,
                styles: [
                  {
                    featureType: "poi",
                    stylers: [{ visibility: "off" }]
                  }
                ]
              }}
            >
              {/* User location custom blue dot indicator */}
              {userLocation && (
                <Marker
                  position={userLocation}
                  icon={{
                    path: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z",
                    fillColor: "#3b82c4",
                    fillOpacity: 1,
                    strokeColor: "#ffffff",
                    strokeWeight: 2,
                    scale: 1.2,
                    anchor: { x: 12, y: 12 } as any
                  }}
                  zIndex={999}
                  title="You are here"
                />
              )}

              {/* Vendor markers ONLY from supabase vendors with custom vector pin shape */}
              {filteredVendors.map((v) => (
                <Marker
                  key={v.id}
                  position={{ lat: v.lat || defaultCenter.lat, lng: v.lng || defaultCenter.lng }}
                  onClick={() => handleSelectVendor(v.id)}
                  icon={{
                    path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
                    fillColor: v.suvai_certified ? "#1a5c2a" : "#E87722",
                    fillOpacity: 1,
                    strokeColor: "#ffffff",
                    strokeWeight: 1.5,
                    scale: 1.5,
                    anchor: { x: 12, y: 22 } as any
                  }}
                />
              ))}

              {/* Vendor InfoWindow Details popup */}
              {selectedVendorId && (
                <InfoWindow
                  position={{
                    lat: vendors.find(v => v.id === selectedVendorId)?.lat || defaultCenter.lat,
                    lng: vendors.find(v => v.id === selectedVendorId)?.lng || defaultCenter.lng
                  }}
                  onCloseClick={() => setSelectedVendorId(null)}
                >
                  {(() => {
                    const v = vendors.find(v => v.id === selectedVendorId);
                    if (!v) return null;
                    return (
                      <div className="p-1.5 max-w-[210px] text-[#173d1f] select-none font-sans">
                        <h4 className="font-black text-sm pr-2.5 leading-snug">{v.stall_name_en}</h4>
                        <div className="flex items-center gap-1.5 mt-2 text-[10px]">
                          <span className="bg-[#1a5c2a]/10 text-[#1a5c2a] px-2 py-0.5 rounded font-black uppercase text-[8px] tracking-wide">
                            {v.food_type.replace("_", "/")}
                          </span>
                          <span className="flex items-center gap-0.5 font-bold text-[#E87722]">
                            ⭐ {v.rating ? v.rating.toFixed(1) : "New"}
                          </span>
                        </div>
                        <Link
                          href={`/vendor/${v.id}`}
                          className="block text-[10px] font-black text-center text-white bg-[#1a5c2a] hover:bg-[#13461f] py-2 px-3.5 rounded-xl mt-3 no-underline transition-colors active:scale-95"
                        >
                          View Stall Profile
                        </Link>
                      </div>
                    );
                  })()}
                </InfoWindow>
              )}
            </GoogleMap>
          ) : (
            <>
              {renderMapGraphic()}

              {/* Fallback User Location dot */}
              <div
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: isDesktop ? "350px" : "196px",
                  top: isDesktop ? "400px" : "372px"
                }}
              >
                <div className="absolute left-1/2 top-1/2 w-7 h-7 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#3b82c4] animate-ping opacity-40" />
                <div className="relative w-4.5 h-4.5 rounded-full bg-[#3b82c4] border-3 border-white shadow-lg shadow-black/35" />
              </div>

              {/* Fallback SVG Pins */}
              {filteredVendors.map((v) => {
                const { x, y } = getPinCoordinates(v.id, v.lat || defaultCenter.lat, v.lng || defaultCenter.lng, isDesktop);
                const isSelected = selectedVendorId === v.id;
                const pinColor = v.suvai_certified ? "#1a5c2a" : "#E87722";

                return (
                  <div
                    key={v.id}
                    onClick={() => handleSelectVendor(v.id)}
                    style={{ left: `${x}px`, top: `${y}px` }}
                    className={`absolute -translate-x-1/2 -translate-y-full cursor-pointer z-10 transition-all duration-200 active:scale-95 ${
                      isSelected ? "scale-135 z-20" : "scale-100 hover:scale-105"
                    }`}
                  >
                    <svg width={isSelected ? "48" : "32"} height={isSelected ? "48" : "32"} viewBox="0 0 24 24" className="drop-shadow-[0_5px_6px_rgba(120,50,0,0.3)]">
                      <path d="M12 2C7.6 2 4 5.5 4 9.8c0 5.4 6.8 11.4 7.1 11.7.5.4 1.3.4 1.8 0C13.2 21.2 20 15.2 20 9.8 20 5.5 16.4 2 12 2z" fill={pinColor} stroke="#ffffff" strokeWidth="1.6" />
                      <circle cx="12" cy="9.6" r="3" fill="#ffffff" />
                      {v.suvai_certified && <path d="M10.4 9.6l1.1 1.1 2-2.1" fill="none" stroke={pinColor} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />}
                    </svg>
                  </div>
                );
              })}
            </>
          )}

          {/* Floating Mobile Headers (Only shown on mobile viewport where search floats directly above map) */}
          <div className="absolute top-0 left-0 right-0 z-10 px-4 pt-4 pb-6 bg-gradient-to-b from-[#FAF7F2]/80 to-transparent space-y-3.5 lg:hidden">
            {renderSearchBar()}
            {renderCategoryChips()}
          </div>

          {/* Floating Near Me FAB button */}
          <button
            onClick={handleRecenter}
            className="absolute bottom-6 right-6 z-10 flex items-center gap-2 bg-[#E87722] hover:bg-[#d5671b] active:scale-95 transition-all text-white font-extrabold text-xs.5 py-3.5 px-5 rounded-full shadow-[0_8px_24px_rgba(232,119,34,0.35)] border-none cursor-pointer"
          >
            <Compass size={18} />
            <span className="ta font-black">{isDesktop ? t.nearMeDesktop : t.nearMe}</span>
          </button>
        </main>

      </div>

      {/* ===== 3. MOBILE NAVIGATION TABS ===== */}
      <div className="lg:hidden shrink-0">
        <BottomNav mode="student" activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

    </div>
  );
}
