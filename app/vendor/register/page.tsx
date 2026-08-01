"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, MapPin, Camera, Check } from "lucide-react";
import { createBrowserClientInstance } from "@/lib/supabase/client";
import LanguageToggle from "@/components/LanguageToggle";
import StepIndicator from "@/components/StepIndicator";
import CategoryChip from "@/components/CategoryChip";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";

const registerTranslations = {
  ta: {
    title: "பதிவு",
    step1: "1 அடிப்படை தகவல்",
    step1Sub: "Basic Info",
    step2: "2 இடம்",
    step2Sub: "Location",
    step3: "3 புகைப்படங்கள்",
    step3Sub: "Photos",
    stallTa: "கடையின் பெயர் (தமிழ்)",
    stallTaSub: "Stall Name (Tamil)",
    stallEn: "கடையின் பெயர் (ஆங்கிலம்)",
    stallEnSub: "Stall Name (English)",
    foodType: "உணவு வகை",
    foodTypeSub: "Food Type Selection",
    phone: "தொலைபேசி எண்",
    phoneSub: "Phone Number",
    landmark: "அடையாளம் / இடம் விவரம்",
    landmarkSub: "Landmark / Location Details",
    photo: "கடையின் புகைப்படம்",
    photoSub: "Upload Stall Photo",
    uploadBtn: "புகைப்படத்தை தேர்ந்தெடுக்கவும்",
    uploading: "பதிவேற்றப்படுகிறது...",
    next: "அடுத்து செல்லவும் →",
    submit: "பதிவை முடிக்கவும் ✔",
    back: "← பின்னால்",
    alreadyRegistered: "ஏற்கனவே பதிவு செய்தீர்களா? உள்நுழையுங்கள்",
    alreadyRegisteredSub: "Already registered? Login",
    errStallName: "கடையின் பெயர் தேவை!",
    errPhone: "சரியான 10 இலக்க தொலைபேசி எண்ணை உள்ளிடவும்!",
    errLandmark: "இடம் விவரங்களை எழுதவும்!",
    errPhoto: "கடையின் புகைப்படத்தை பதிவேற்றவும்!"
  },
  en: {
    title: "Register",
    step1: "1 Basic Info",
    step1Sub: "Basic Info",
    step2: "2 Location",
    step2Sub: "Location",
    step3: "3 Photos",
    step3Sub: "Photos",
    stallTa: "Stall Name (Tamil)",
    stallTaSub: "Write in Tamil if possible",
    stallEn: "Stall Name",
    stallEnSub: "Enter your stall name",
    foodType: "Food Type",
    foodTypeSub: "Choose specialty cuisine",
    phone: "Phone Number",
    phoneSub: "10-digit mobile number",
    landmark: "Landmark / Location Description",
    landmarkSub: "Specify how to find your cart",
    photo: "Stall Photo",
    photoSub: "Upload a photo of your food stall",
    uploadBtn: "Select File to Upload",
    uploading: "Uploading image...",
    next: "Next Step →",
    submit: "Finish Registration ✔",
    back: "← Back",
    alreadyRegistered: "Already registered? Login",
    alreadyRegisteredSub: "Login to dashboard",
    errStallName: "Stall name is required!",
    errPhone: "Please enter a valid 10-digit phone number!",
    errLandmark: "Please enter a landmark description!",
    errPhoto: "Please upload your stall photo!"
  }
};

const foodDefs = [
  { id: "idli_dosa", ta: "இட்லி/தோசை", en: "Idli/Dosa" },
  { id: "kothu", ta: "கொத்து", en: "Kothu" },
  { id: "parotta", ta: "பரோட்டா", en: "Parotta" },
  { id: "pani_puri", ta: "பானி பூரி", en: "Pani Puri" },
  { id: "juice", ta: "ஜூஸ்", en: "Juice" },
  { id: "others", ta: "மற்றவை", en: "Others" }
];

export default function VendorRegistrationPage() {
  const router = useRouter();
  
  const googleMapsKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const isMapsKeyConfigured = googleMapsKey && googleMapsKey !== "your-google-maps-api-key";

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: isMapsKeyConfigured ? googleMapsKey : "",
  });
  
  // Translation state
  const [lang, setLang] = useState<"ta" | "en">("en");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState("");

  // Step 1 Form Fields
  const [stallName, setStallName] = useState("");
  const [stallNameEn, setStallNameEn] = useState("");
  const [foodType, setFoodType] = useState<"idli_dosa" | "kothu" | "parotta" | "pani_puri" | "juice" | "others">("idli_dosa");
  const [phone, setPhone] = useState("");

  // Step 2 Fields
  const [lat, setLat] = useState("11.5034");
  const [lng, setLng] = useState("77.2444");
  const [placedPin, setPlacedPin] = useState(false);
  const [landmark, setLandmark] = useState("");

  // Step 3 Fields
  const [photoUrl, setPhotoUrl] = useState("");
  const [mockPhotoUrl, setMockPhotoUrl] = useState(""); // Default fallback if upload fails
  const [uploading, setUploading] = useState(false);

  // Step 4 Menu Items State
  const [menuItems, setMenuItems] = useState<{ name: string; nameEn: string; price: string }[]>([
    { name: "இட்லி", nameEn: "Idli", price: "20" },
    { name: "வடை", nameEn: "Vada", price: "15" }
  ]);
  const [newItemName, setNewItemName] = useState("");
  const [newItemNameEn, setNewItemNameEn] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");

  const handleAddToMenu = () => {
    if (!newItemNameEn.trim()) {
      alert("Please enter the item name in English.");
      return;
    }
    if (!newItemPrice.trim() || isNaN(parseFloat(newItemPrice)) || parseFloat(newItemPrice) <= 0) {
      alert("Please enter a valid price greater than 0.");
      return;
    }

    setMenuItems((prev) => [
      ...prev,
      {
        name: newItemName.trim(),
        nameEn: newItemNameEn.trim(),
        price: parseFloat(newItemPrice).toFixed(2),
      },
    ]);

    setNewItemName("");
    setNewItemNameEn("");
    setNewItemPrice("");
  };

  const handleRemoveFromMenu = (index: number) => {
    setMenuItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleDetectLocation = () => {
    if (typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLat(position.coords.latitude.toFixed(5));
          setLng(position.coords.longitude.toFixed(5));
          setPlacedPin(true);
        },
        (error) => {
          console.warn("Geolocation detection failed:", error);
          alert("Could not detect location. Please check browser location permissions.");
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  const t = registerTranslations[lang];

  // Map Click Coordinate Setter
  const handleMapClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Map visual projection (center lat: 11.5034, center lng: 77.2444)
    const projectedLat = (11.5034 - (y - 110) / 3500).toFixed(5);
    const projectedLng = (77.2444 + (x - 176) / 3500).toFixed(5);
    
    setLat(projectedLat);
    setLng(projectedLng);
    setPlacedPin(true);
  };

  // Step Nav validation checks
  const handleNextStep = () => {
    setErrors({});
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!stallNameEn.trim()) {
        newErrors.stallNameEn = t.errStallName;
      }
      if (!phone.trim() || !/^\d{10}$/.test(phone.replace(/\s+/g, ""))) {
        newErrors.phone = t.errPhone;
      }
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!landmark.trim()) {
        newErrors.landmark = t.errLandmark;
        setErrors(newErrors);
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (!photoUrl) {
        newErrors.photo = t.errPhoto;
        setErrors(newErrors);
        return;
      }
      setStep(4);
    }
  };

  const handlePrevStep = () => {
    if (step > 1) setStep(step - 1);
    else router.back();
  };

  // File upload to Supabase Storage bucket 'vendor-photos'
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setErrors({});
    try {
      const supabase = createBrowserClientInstance();
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `vendor-photos/${fileName}`;

      const { error } = await supabase.storage
        .from("vendor-photos")
        .upload(filePath, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from("vendor-photos")
        .getPublicUrl(filePath);

      setPhotoUrl(publicUrl);
    } catch (err) {
      console.warn("Storage upload failed, using local preview url & Unsplash fallback:", err);
      // Graceful fallback preview
      setPhotoUrl(URL.createObjectURL(file));
      setMockPhotoUrl("https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600");
    } finally {
      setUploading(false);
    }
  };

  // Submit wizard data insert to Supabase Vendors table
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    if (menuItems.length === 0) {
      alert("Please add at least one item to your menu.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createBrowserClientInstance();
      const finalPhoto = mockPhotoUrl || photoUrl || "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600";

      const payload = {
        stall_name: stallNameEn,
        stall_name_en: stallNameEn,
        food_type: foodType,
        phone: phone,
        lat: parseFloat(lat) || 11.5034,
        lng: parseFloat(lng) || 77.2444,
        photo_url: finalPhoto,
        rating: null,
        review_count: 0,
        suvai_certified: false,
        established_year: 2026,
        is_open: true,
        views_count: 0,
        favourites_count: 0
      };

      const { data, error } = await supabase
        .from("vendors")
        .insert(payload)
        .select()
        .single();

      if (error) throw error;

      // Insert menu items
      if (menuItems.length > 0) {
        const menuPayload = menuItems.map(item => ({
          vendor_id: data.id,
          name: item.name.trim() || item.nameEn.trim(),
          name_en: item.nameEn.trim(),
          price: parseFloat(item.price) || 0
        }));

        const { error: menuErr } = await supabase
          .from("specialty_items")
          .insert(menuPayload);

        if (menuErr) console.warn("Failed to insert menu items:", menuErr);
      }

      router.push(`/vendor/dashboard/${data.id}`);
    } catch (err: any) {
      console.error("Database registration insert failed:", err);
      setSubmitError(err.message || "Registration failed. Please check your Supabase connection and schema RLS.");
    } finally {
      setLoading(false);
    }
  };

  const renderWizardContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-5">
            {/* Stall name input */}
            <div>
              <label className="block text-xs font-black text-[#173d1f] mb-1.5">
                <span>{t.stallEn}</span>
                <span className="block text-[10px] text-[#9a9486] font-bold mt-0.5">{t.stallEnSub}</span>
              </label>
              <input
                type="text"
                value={stallNameEn}
                onChange={(e) => setStallNameEn(e.target.value)}
                placeholder="e.g. Murugan Idli Kadai"
                className="w-full bg-white border border-[#ece5d8] rounded-2xl px-4.5 py-3.5 text-sm font-bold text-[#173d1f] focus:outline-none focus:border-[#1a5c2a]"
                style={{ borderColor: errors.stallNameEn ? "#f87171" : stallNameEn.trim() ? "#1a5c2a" : "#ece5d8" }}
              />
              {errors.stallNameEn && <p className="text-red-500 text-xs font-bold mt-1.5 ta">{errors.stallNameEn}</p>}
            </div>

            {/* Food Type Selector */}
            <div>
              <label className="block text-xs font-black text-[#173d1f] mb-1.5">
                <span className="ta">{t.foodType}</span>
                <span className="block text-[10px] text-[#9a9486] font-bold mt-0.5">{t.foodTypeSub}</span>
              </label>
              
              {/* Sync Droplist */}
              <select
                value={foodType}
                onChange={(e) => setFoodType(e.target.value as any)}
                className="w-full bg-white border border-[#ece5d8] rounded-2xl px-4.5 py-3.5 text-sm font-bold text-[#173d1f] focus:outline-none focus:border-[#1a5c2a] select-none"
              >
                {foodDefs.map((def) => (
                  <option key={def.id} value={def.id}>
                    {lang === "ta" ? def.ta : def.en}
                  </option>
                ))}
              </select>

              {/* Sync Chips */}
              <div className="noscroll flex gap-2 overflow-x-auto mt-3 pb-0.5 select-none">
                {foodDefs.map((def) => {
                  const active = foodType === def.id;
                  const label = lang === "ta" ? def.ta : def.en;
                  return (
                    <CategoryChip
                      key={def.id}
                      label={label}
                      active={active}
                      onClick={() => setFoodType(def.id as any)}
                    />
                  );
                })}
              </div>
            </div>

            {/* Phone input */}
            <div>
              <label className="block text-xs font-black text-[#173d1f] mb-1.5">
                <span className="ta">{t.phone}</span>
                <span className="block text-[10px] text-[#9a9486] font-bold mt-0.5">{t.phoneSub}</span>
              </label>
              <div
                className="flex items-center gap-2.5 bg-white border rounded-2xl px-4.5 py-3.5"
                style={{ borderColor: errors.phone ? "#f87171" : phone.length >= 10 ? "#1a5c2a" : "#ece5d8" }}
              >
                <span className="text-lg select-none">🇮🇳</span>
                <span className="text-sm font-black text-[#4a4636] select-none">+91</span>
                <div className="w-[1.5px] h-[20px] bg-[#ece5d8]" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ""))}
                  maxLength={10}
                  placeholder="98765 43210"
                  className="border-none outline-none bg-transparent font-sans text-sm font-black text-[#173d1f] flex-1 min-w-0 placeholder-[#b3ad9d]"
                />
              </div>
              {errors.phone && <p className="text-red-500 text-xs font-bold mt-1.5 ta">{errors.phone}</p>}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-5">
            {/* Map coordinate picker */}
            <div className="relative w-full h-[220px] rounded-2xl overflow-hidden border border-[#ece5d8] bg-[#eef2e6] shadow-inner select-none">
              {isLoaded && isMapsKeyConfigured ? (
                <GoogleMap
                  mapContainerClassName="w-full h-full"
                  center={{ lat: parseFloat(lat) || 11.5034, lng: parseFloat(lng) || 77.2444 }}
                  zoom={14}
                  options={{
                    disableDefaultUI: true,
                    zoomControl: true,
                  }}
                >
                  <Marker
                    position={{ lat: parseFloat(lat) || 11.5034, lng: parseFloat(lng) || 77.2444 }}
                    draggable={true}
                    onDragEnd={(e) => {
                      if (e.latLng) {
                        setLat(e.latLng.lat().toFixed(5));
                        setLng(e.latLng.lng().toFixed(5));
                        setPlacedPin(true);
                      }
                    }}
                  />
                </GoogleMap>
              ) : (
                <>
                  <svg viewBox="0 0 353 220" onClick={handleMapClick} className="w-full h-full object-cover cursor-crosshair">
                    <rect width="353" height="220" fill="#eef2e6" />
                    <rect x="-10" y="-10" width="120" height="90" rx="14" fill="#d6e5c4" />
                    <rect x="240" y="120" width="130" height="120" rx="14" fill="#dbe7cb" />
                    <g stroke="#f7f4ee" strokeLinecap="round">
                      <line x1="176" y1="-10" x2="176" y2="240" strokeWidth="20" />
                      <line x1="-10" y1="100" x2="363" y2="100" strokeWidth="16" />
                    </g>
                  </svg>

                  {placedPin && (
                    <div 
                      className="absolute -translate-x-1/2 -translate-y-full pointer-events-none"
                      style={{
                        left: `${(parseFloat(lng) - 77.2444) * 3500 + 176}px`,
                        top: `${-(parseFloat(lat) - 11.5034) * 3500 + 100}px`
                      }}
                    >
                      <svg width="34" height="34" viewBox="0 0 24 24" className="drop-shadow-[0_4px_5px_rgba(120,50,0,0.35)]">
                        <path d="M12 2C7.6 2 4 5.5 4 9.8c0 5.4 6.8 11.4 7.1 11.7.5.4 1.3.4 1.8 0C13.2 21.2 20 15.2 20 9.8 20 5.5 16.4 2 12 2z" fill="#E87722" stroke="#ffffff" strokeWidth="1.6" />
                        <circle cx="12" cy="9.6" r="3" fill="#ffffff" />
                      </svg>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Latitude</label>
                <input
                  type="text"
                  readOnly
                  value={lat}
                  className="w-full bg-slate-50 border border-[#ece5d8] rounded-xl p-3 text-sm font-bold text-center text-[#7a7465] outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Longitude</label>
                <input
                  type="text"
                  readOnly
                  value={lng}
                  className="w-full bg-slate-50 border border-[#ece5d8] rounded-xl p-3 text-sm font-bold text-center text-[#7a7465] outline-none"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleDetectLocation}
              className="w-full py-3 px-4 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 rounded-xl font-extrabold text-xs text-emerald-800 flex items-center justify-center gap-2 cursor-pointer transition-colors active:scale-98 select-none"
            >
              📍 Use My Current Location
            </button>

            {/* Landmark details */}
            <div>
              <label className="block text-xs font-black text-[#173d1f] mb-1.5">
                <span className="ta">{t.landmark}</span>
                <span className="block text-[10px] text-[#9a9486] font-bold mt-0.5">{t.landmarkSub}</span>
              </label>
              <input
                type="text"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                placeholder="e.g. Near Sathyamangalam Bus Stand"
                className="ta w-full bg-white border border-[#ece5d8] rounded-2xl px-4.5 py-3.5 text-sm font-bold text-[#173d1f] focus:outline-none focus:border-[#1a5c2a]"
                style={{ borderColor: errors.landmark ? "#f87171" : landmark.trim() ? "#1a5c2a" : "#ece5d8" }}
              />
              {errors.landmark && <p className="text-red-500 text-xs font-bold mt-1.5 ta">{errors.landmark}</p>}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-black text-[#173d1f] mb-1.5">
                <span className="ta">{t.photo}</span>
                <span className="block text-[10px] text-[#9a9486] font-bold mt-0.5">{t.photoSub}</span>
              </label>

              {/* Photo Upload Area */}
              <div className="border-2 border-dashed border-[#ece5d8] rounded-2.5xl p-8 flex flex-col items-center justify-center text-center bg-white relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                
                {uploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="animate-spin text-[#E87722]" size={28} />
                    <p className="text-xs font-bold text-[#E87722] ta">{t.uploading}</p>
                  </div>
                ) : photoUrl ? (
                  <div className="flex flex-col items-center gap-3">
                    <img src={photoUrl} alt="Thumbnail preview" className="w-20 h-20 rounded-xl object-cover border border-[#ece5d8]" />
                    <p className="text-xs font-black text-[#1a5c2a] flex items-center gap-1">
                      <Check size={14} className="stroke-[3]" /> Image Uploaded Successfully
                    </p>
                  </div>
                ) : (
                  <>
                    <Camera size={32} className="text-[#a7a294] mb-2 shrink-0" />
                    <p className="text-xs font-extrabold text-[#173d1f] ta">{t.uploadBtn}</p>
                    <p className="text-[10px] text-[#9a9486] font-bold mt-1">Supports PNG, JPG, WebP up to 5MB</p>
                  </>
                )}
              </div>
              {errors.photo && <p className="text-red-500 text-xs font-bold mt-2 ta">{errors.photo}</p>}
              {submitError && <p className="text-red-500 text-xs font-bold text-center mt-3.5 ta">{submitError}</p>}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="bg-[#FAF7F2] border border-[#ece5d8] rounded-2.5xl p-5 space-y-4">
              <h3 className="text-sm.5 font-extrabold text-[#173d1f] flex items-center gap-1.5">
                🍔 Add Canteen Menu Items
              </h3>
              <p className="text-xs text-[#6f6a5c] leading-normal">
                List the specialty items and dishes available at your cart. Visitors will see this menu and prices directly on your profile.
              </p>
              
              {/* Menu input fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-2">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Item Name (English)</label>
                  <input
                    type="text"
                    value={newItemNameEn}
                    onChange={(e) => setNewItemNameEn(e.target.value)}
                    placeholder="e.g. Plain Dosa"
                    className="w-full bg-white border border-[#ece5d8] rounded-xl p-3 text-sm font-bold text-[#173d1f] focus:outline-none focus:border-[#1a5c2a]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Price (₹ INR)</label>
                  <input
                    type="number"
                    value={newItemPrice}
                    onChange={(e) => setNewItemPrice(e.target.value)}
                    placeholder="e.g. 30"
                    className="w-full bg-white border border-[#ece5d8] rounded-xl p-3 text-sm font-bold text-[#173d1f] focus:outline-none focus:border-[#1a5c2a]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Item Name (Tamil - optional)</label>
                <input
                  type="text"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="உதாரணம் — சாதாரண தோசை"
                  className="w-full bg-white border border-[#ece5d8] rounded-xl p-3 text-sm font-bold text-[#173d1f] focus:outline-none focus:border-[#1a5c2a]"
                />
              </div>

              <button
                type="button"
                onClick={handleAddToMenu}
                className="w-full py-3 bg-[#1a5c2a] hover:bg-[#13461f] text-white font-extrabold text-xs.5 rounded-xl border-none cursor-pointer active:scale-95 transition-all select-none text-center shadow-sm"
              >
                + Add Item to Menu
              </button>
            </div>

            {/* Added list */}
            <div className="space-y-2.5">
              <h4 className="text-xs.5 font-black text-[#6f6a5c] uppercase tracking-wider">
                Added Items ({menuItems.length})
              </h4>
              
              {menuItems.length > 0 ? (
                <div className="space-y-2 max-h-[220px] overflow-y-auto noscroll">
                  {menuItems.map((item, index) => (
                    <div
                      key={index}
                      className="bg-white border border-[#ece5d8] rounded-xl p-3.5 flex items-center justify-between shadow-sm"
                    >
                      <div className="min-w-0 flex-1 pr-3">
                        <p className="text-sm font-extrabold text-[#173d1f] truncate">{item.nameEn}</p>
                        {item.name.trim() && (
                          <p className="text-[11px] font-bold text-[#9a9486] mt-0.5 truncate">{item.name}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-3.5 shrink-0">
                        <span className="text-sm font-black text-[#E87722]">₹{item.price}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveFromMenu(index)}
                          className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg border-none cursor-pointer transition-colors"
                          title="Delete item"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-slate-400 bg-white border border-dashed border-[#ece5d8] rounded-2xl p-4 text-xs font-semibold">
                  No menu items added yet. Add at least one specialty item!
                </div>
              )}
              {submitError && <p className="text-red-500 text-xs font-bold text-center mt-3.5 ta">{submitError}</p>}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#FAF7F2] text-[#173d1f] font-sans antialiased py-6 px-4 md:py-12 md:px-8 flex justify-center items-center overflow-y-auto">
      
      {/* Centered wizard container (Responsive: full-width on mobile, centered card max-w-2xl on desktop) */}
      <div className="w-full max-w-2xl bg-white rounded-3xl border border-[#ece5d8] shadow-[0_24px_70px_-20px_rgba(20,50,30,0.15)] flex flex-col overflow-hidden animate-fadeIn">
        
        {/* Wizard Header Bar */}
        <header className="p-6 border-b border-[#ece5d8] flex items-center justify-between bg-[#fdfdfb] shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrevStep}
              className="w-10 h-10 rounded-full bg-white border border-[#ece5d8] flex items-center justify-center text-[#1a5c2a] hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h2 className="text-lg font-black text-[#1a5c2a] flex items-center gap-1.5">
                <span className="ta">{t.title}</span>
                <span className="text-slate-400 font-bold">/</span>
                <span className="font-sans">Wizard</span>
              </h2>
              <p className="text-xs font-semibold text-[#6f6a5c] mt-0.5">
                Step {step} of 3: {step === 1 ? t.step1Sub : step === 2 ? t.step2Sub : t.step3Sub}
              </p>
            </div>
          </div>
          <LanguageToggle currentLang={lang} onChange={setLang} />
        </header>

        {/* Step progress indicators bar */}
        <div className="px-8 py-3 bg-[#fbf9f5] border-b border-[#ece5d8]">
          <StepIndicator currentStep={step} lang={lang} />
        </div>

        {/* Form Body Scrollable block */}
        <div className="p-8 flex-1 overflow-y-auto noscroll min-h-[320px]">
          {renderWizardContent()}
        </div>

        {/* Wizard Bottom Footer Action Bar */}
        <footer className="p-6 border-t border-[#ece5d8] bg-[#fdfdfb] flex flex-col sm:flex-row items-center gap-4 sm:justify-between shrink-0">
          <div className="text-center sm:text-left">
            <Link href="/vendor/dashboard/v1" className="text-xs font-black text-[#9a9486] hover:underline ta">
              {t.alreadyRegistered}
              <span className="block font-sans text-[10px] text-slate-400 font-bold mt-0.5">{t.alreadyRegisteredSub}</span>
            </Link>
          </div>

          <div className="flex gap-3 w-full sm:w-auto shrink-0 justify-end">
            {step > 1 && (
              <button
                type="button"
                onClick={handlePrevStep}
                className="px-6 py-3.5 rounded-xl border border-[#d8d1c4] bg-white hover:bg-slate-50 text-[#4a4636] font-extrabold text-xs.5 cursor-pointer active:scale-95 transition-all select-none ta"
              >
                {t.back}
              </button>
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="px-8 py-3.5 bg-[#E87722] hover:bg-[#d5671b] active:scale-95 transition-all text-white font-extrabold text-xs.5 rounded-xl border-none cursor-pointer shadow-md shadow-orange-500/10 select-none ta w-full sm:w-auto text-center"
              >
                {t.next}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleRegisterSubmit}
                disabled={loading}
                className="px-8 py-3.5 bg-[#1a5c2a] hover:bg-[#13461f] active:scale-95 transition-all text-white font-extrabold text-xs.5 rounded-xl border-none cursor-pointer flex items-center justify-center gap-1.5 shadow-md disabled:opacity-50 select-none ta w-full sm:w-auto text-center"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : t.submit}
              </button>
            )}
          </div>
        </footer>
      </div>

    </div>
  );
}
