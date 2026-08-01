"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Share2, Bookmark, Star, MapPin, Clock, Send, Loader2 } from "lucide-react";
import { createBrowserClientInstance } from "@/lib/supabase/client";
import CertifiedBadge from "@/components/CertifiedBadge";
import LanguageToggle from "@/components/LanguageToggle";
import CategoryChip from "@/components/CategoryChip";

interface ProfileClientProps {
  vendor: any;
  items: any[];
  reviews: any[];
}

const translations = {
  ta: {
    back: "திரும்பவும்",
    openNow: "திறந்துள்ளது",
    closed: "மூடப்பட்டுள்ளது",
    est: "நிறுவப்பட்டது",
    reviews: "விமர்சனங்கள்",
    specialty: "சிறப்பு உணவுகள்",
    locationTitle: "முகவரி / இடம்",
    timingsTitle: "நேரங்கள்",
    morning: "காலை",
    evening: "மாலை",
    writeReview: "விமர்சனம் எழுதவும்",
    reviewerName: "உங்கள் பெயர்",
    comment: "உங்கள் கருத்து",
    submitting: "சமர்ப்பிக்கிறது...",
    submit: "சமர்ப்பிக்கவும்",
    share: "WhatsApp-ல் பகிரவும்",
    noReviews: "விமர்சனங்கள் எதுவும் இல்லை",
    newRating: "புதியது",
    idli_dosa: "இட்லி/தோசை",
    kothu: "கொத்து",
    parotta: "பரோட்டா",
    pani_puri: "பானி பூரி",
    juice: "ஜூஸ்",
    others: "மற்றவை"
  },
  en: {
    back: "Back",
    openNow: "Open Now",
    closed: "Closed",
    est: "Est.",
    reviews: "reviews",
    specialty: "Specialty",
    locationTitle: "Location",
    timingsTitle: "Timings",
    morning: "Morning",
    evening: "Evening",
    writeReview: "Write a Review",
    reviewerName: "Your Name",
    comment: "Feedback comments...",
    submitting: "Submitting...",
    submit: "Submit Review",
    share: "Share on WhatsApp",
    noReviews: "No reviews yet.",
    newRating: "New",
    idli_dosa: "Idli/Dosa",
    kothu: "Kothu",
    parotta: "Parotta",
    pani_puri: "Pani Puri",
    juice: "Juice",
    others: "Others"
  }
};

export default function ProfileClient({ vendor, items, reviews: initialReviews }: ProfileClientProps) {
  const router = useRouter();
  const [lang, setLang] = useState<"ta" | "en">("en");
  const [saved, setSaved] = useState(false);
  const [reviewsList, setReviewsList] = useState<any[]>(initialReviews);

  // Review Form state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewerName, setReviewerName] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const t = translations[lang];

  const handleWhatsAppShare = () => {
    const stallName = lang === "ta" ? vendor.stall_name : vendor.stall_name_en;
    const shareText = `Check out "${stallName}" on Suvai! Find delicious local food near campus: ${window.location.href}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, "_blank");
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName.trim() || !reviewComment.trim()) return;

    setSubmittingReview(true);
    try {
      const supabase = createBrowserClientInstance();
      const newReview = {
        vendor_id: vendor.id,
        reviewer_name: reviewerName,
        comment: reviewComment,
      };

      const { data, error } = await supabase
        .from("reviews")
        .insert(newReview)
        .select()
        .single();

      if (error) throw error;

      setReviewsList((prev) => [data, ...prev]);
      setReviewerName("");
      setReviewComment("");
      setShowReviewForm(false);
    } catch (err) {
      console.warn("Could not insert review, mimicking local append:", err);
      const mockInsert = {
        id: Math.random().toString(),
        reviewer_name: reviewerName,
        comment: reviewComment,
        created_at: new Date().toISOString()
      };
      setReviewsList((prev) => [mockInsert, ...prev]);
      setReviewerName("");
      setReviewComment("");
      setShowReviewForm(false);
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#FAF7F2] text-[#173d1f] font-sans antialiased pb-24 lg:pb-16 flex justify-center items-start">
      
      {/* Outer Container (Responsive: full-width on mobile, max-w-6xl split layout on desktop) */}
      <div className="w-full max-w-6xl mx-auto px-0 lg:px-6 flex flex-col">
        
        {/* 1. Curved Hero Illustration Banner */}
        <div className="relative w-full h-[260px] md:h-[300px] lg:h-[340px] select-none shrink-0 bg-gradient-to-tr from-amber-100 to-orange-50/50 lg:rounded-3.5xl overflow-hidden lg:shadow-md lg:mt-6">
          <svg viewBox="0 0 393 260" className="w-full h-full object-cover" preserveAspectRatio="none">
            <defs>
              <radialGradient id="bgGlow" cx="50%" cy="35%" r="75%">
                <stop offset="0%" stopColor="#fff4de" />
                <stop offset="100%" stopColor="#e8cf8f" />
              </radialGradient>
              <radialGradient id="steelHero" cx="35%" cy="28%" r="75%">
                <stop offset="0%" stopColor="#f6f4ee" />
                <stop offset="100%" stopColor="#d2d3cd" />
              </radialGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#bgGlow)" />
            <path d="M0 210 C 60 180, 100 220, 170 195 C 250 165, 320 210, 393 180 L 393 260 L 0 260 Z" fill="#3f7a3a" />
            <path d="M0 220 C 70 195, 120 228, 190 205 C 260 180, 330 218, 393 192 L 393 260 L 0 260 Z" fill="#2f6b3a" />
            
            <ellipse cx="196" cy="175" rx="130" ry="46" fill="url(#steelHero)" stroke="#b7b8b2" strokeWidth="1" />
            <ellipse cx="196" cy="170" rx="100" ry="34" fill="#e7e5dd" />
            
            <circle cx="155" cy="162" r="24" fill="#fdfcf7" stroke="#e3e0d2" strokeWidth="1" />
            <circle cx="205" cy="155" r="26" fill="#fffef9" stroke="#e3e0d2" strokeWidth="1" />
            <circle cx="270" cy="165" r="18" fill="#c0453a" />
          </svg>
          <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/45 pointer-events-none" />

          {/* Floating Actions on Hero Header */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
            <button
              onClick={() => router.back()}
              className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-[3px] border-none flex items-center justify-center text-white cursor-pointer active:scale-90"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex gap-2">
              <button
                onClick={handleWhatsAppShare}
                className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-[3px] border-none flex items-center justify-center text-white cursor-pointer"
              >
                <Share2 size={18} />
              </button>
              <button
                onClick={() => setSaved((prev) => !prev)}
                className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-[3px] border-none flex items-center justify-center text-white cursor-pointer"
              >
                <Bookmark size={18} className={saved ? "fill-[#E87722] text-[#E87722]" : ""} />
              </button>
            </div>
          </div>

          {vendor.suvai_certified && (
            <div className="absolute left-4 bottom-4 z-10">
              <CertifiedBadge size="md" />
            </div>
          )}
        </div>

        {/* 2. Responsive Content Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mt-6 px-4 sm:px-6 lg:px-0">
          
          {/* Main Left Section: 2/3 width on desktop */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Vendor Profile Header Card */}
            <div className="bg-white border border-[#ece5d8] rounded-3xl p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="ta text-2.5xl font-black text-[#173d1f] leading-snug">
                    {lang === "ta" ? vendor.stall_name : vendor.stall_name_en}
                  </h2>
                  {lang === "ta" && (
                    <p className="text-[14.5px] font-bold text-[#6f6a5c] mt-0.5">
                      {vendor.stall_name_en}
                    </p>
                  )}
                </div>
                <LanguageToggle currentLang={lang} onChange={setLang} />
              </div>

              {/* Rating metrics row */}
              <div className="flex items-center gap-2.5 mt-3 flex-wrap">
                <span className="flex items-center gap-0.5 text-sm font-extrabold text-[#173d1f]">
                  <Star size={15} className="fill-[#E87722] stroke-[#E87722]" />
                  {vendor.rating ? vendor.rating.toFixed(1) : t.newRating}
                </span>
                <span className="text-xs font-semibold text-[#9a9486] ta">
                  · {vendor.review_count} {t.reviews}
                </span>
                <span className="flex items-center gap-1.5 text-xs font-extrabold text-[#2f7d4a] ta">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#2f7d4a] ring-4 ring-[#dcecdc]" />
                  {t.openNow}
                </span>
              </div>

              {/* Tags row */}
              <div className="flex gap-2 mt-5 flex-wrap items-center">
                <div className="pointer-events-none scale-90 origin-left">
                  <CategoryChip
                    label={t[vendor.food_type as keyof typeof t] || t.others}
                    active={true}
                    onClick={() => {}}
                  />
                </div>
                <span className="text-xs font-extrabold text-white bg-[#E87722] px-3.5 py-1.5 rounded-full uppercase tracking-wider">
                  0.3 km
                </span>
                <span className="text-xs font-extrabold text-[#1a5c2a] bg-white border-1.5 border-[#1a5c2a] px-3 py-1 rounded-full shrink-0 ta">
                  {t.est} {vendor.established_year || "1994"}
                </span>
              </div>
            </div>

            {/* Menu Specialty list card */}
            <div className="bg-white border border-[#ece5d8] rounded-3xl p-6 shadow-sm">
              <h3 className="text-base font-extrabold text-[#173d1f] mb-4">
                <span className="ta">{t.specialty}</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-white border border-[#f0ebe0] rounded-xl p-3 shadow-sm hover:border-[#1a5c2a] transition-all">
                    <div className="w-9 h-9 rounded-lg bg-[#fdf0e5] flex items-center justify-center shrink-0 text-orange-500 font-bold text-sm">🍽️</div>
                    <div className="min-w-0">
                      <p className="text-xs font-extrabold text-[#173d1f] leading-snug truncate">
                        {lang === "ta" ? item.name : item.name_en}
                      </p>
                      <p className="text-xs font-black text-[#E87722] mt-0.5">₹{item.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer Reviews card */}
            <div className="bg-white border border-[#ece5d8] rounded-3xl p-6 shadow-sm pb-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-extrabold text-[#173d1f] ta">{t.reviews}</h3>
                <button
                  onClick={() => setShowReviewForm((prev) => !prev)}
                  className="text-xs font-extrabold text-[#E87722] hover:underline cursor-pointer border-none bg-transparent"
                >
                  {t.writeReview}
                </button>
              </div>

              {showReviewForm && (
                <form onSubmit={handleSubmitReview} className="bg-white border border-[#ece5d8] rounded-2.5xl p-5 mb-5 space-y-3.5 shadow-sm">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 ta">{t.reviewerName}</label>
                    <input
                      type="text"
                      required
                      value={reviewerName}
                      onChange={(e) => setReviewerName(e.target.value)}
                      placeholder="Karthik"
                      className="w-full bg-[#FAF7F2] border border-[#ece5d8] rounded-xl p-2.5 text-xs font-bold focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 ta">{t.comment}</label>
                    <textarea
                      required
                      rows={3}
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="..."
                      className="w-full bg-[#FAF7F2] border border-[#ece5d8] rounded-xl p-2.5 text-xs font-bold focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="w-full bg-[#E87722] hover:bg-[#d5671b] text-white font-extrabold text-xs py-3 rounded-xl border-none cursor-pointer flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
                  >
                    {submittingReview ? <Loader2 size={12} className="animate-spin" /> : <span className="ta">{t.submit}</span>}
                  </button>
                </form>
              )}

              <div className="space-y-3.5">
                {reviewsList.length > 0 ? (
                  reviewsList.map((rev) => (
                    <div key={rev.id} className="bg-[#FAF7F2]/50 border border-[#f0ebe0] rounded-2.5xl p-4 shadow-[0_4px_12px_rgba(0,0,0,0.01)] hover:bg-white transition-all">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#1a5c2a] text-white text-[11px] font-black flex items-center justify-center">
                            {rev.reviewer_name.slice(0, 2).toUpperCase()}
                          </div>
                          <span className="text-xs font-extrabold text-[#173d1f]">{rev.reviewer_name}</span>
                        </div>
                        <span className="text-[10px] text-[#a7a294] font-semibold">
                          {typeof rev.created_at === "string" && !rev.created_at.includes("T") 
                            ? rev.created_at 
                            : new Date(rev.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-[#4a4636] leading-relaxed mt-2.5 pl-2.5 border-l-2 border-slate-100">{rev.comment}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-xs font-bold text-[#9a9486] bg-white border border-dashed border-[#ece5d8] rounded-2xl p-4">
                    {t.noReviews}
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Sidebar Section: 1/3 width on desktop */}
          <div className="space-y-6 lg:sticky lg:top-4">
            
            {/* Timing Card */}
            <div className="bg-white border border-[#ece5d8] rounded-3xl p-6 shadow-sm">
              <h3 className="text-base font-extrabold text-[#173d1f] ta">{t.timingsTitle}</h3>
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="bg-[#FAF7F2] border border-[#f0ebe0] rounded-xl p-3 text-center shadow-sm">
                  <span className="block text-[9px] font-black text-slate-400 uppercase ta">{t.morning}</span>
                  <span className="block text-xs font-black text-[#173d1f] mt-1 leading-none">6:00 AM - 11:00 AM</span>
                </div>
                <div className="bg-[#FAF7F2] border border-[#f0ebe0] rounded-xl p-3 text-center shadow-sm">
                  <span className="block text-[9px] font-black text-slate-400 uppercase ta">{t.evening}</span>
                  <span className="block text-xs font-black text-[#173d1f] mt-1 leading-none">5:00 PM - 9:30 PM</span>
                </div>
              </div>
            </div>

            {/* Location preview map Card */}
            <div className="bg-white border border-[#ece5d8] rounded-3xl p-6 shadow-sm">
              <h3 className="text-base font-extrabold text-[#173d1f] ta">{t.locationTitle}</h3>
              
              <div className="relative w-full h-[120px] rounded-2xl overflow-hidden mt-3 bg-[#eef2e6] border border-[#ece5d8]">
                <svg viewBox="0 0 353 120" className="w-full h-full object-cover">
                  <rect width="353" height="120" fill="#eef2e6"/>
                  <rect x="-10" y="-10" width="120" height="90" rx="14" fill="#d6e5c4"/>
                  <rect x="240" y="60" width="130" height="90" rx="14" fill="#dbe7cb"/>
                  <g stroke="#f7f4ee" strokeLinecap="round">
                    <line x1="176" y1="-10" x2="176" y2="140" strokeWidth="20"/>
                    <line x1="-10" y1="80" x2="363" y2="80" strokeWidth="16"/>
                  </g>
                </svg>
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full">
                  <svg width="30" height="30" viewBox="0 0 24 24">
                    <path d="M12 2C7.6 2 4 5.5 4 9.8c0 5.4 6.8 11.4 7.1 11.7.5.4 1.3.4 1.8 0C13.2 21.2 20 15.2 20 9.8 20 5.5 16.4 2 12 2z" fill="#E87722" stroke="#fff" strokeWidth="1.6"/>
                  </svg>
                </div>
              </div>
              
              <div className="flex items-center justify-between gap-3 mt-3.5 select-none">
                <p className="text-xs font-semibold text-[#6f6a5c] flex items-center gap-1.5 flex-1 min-w-0">
                  <MapPin size={13} className="text-[#E87722] shrink-0" />
                  <span className="truncate">Near Sathyamangalam Bus Stand, Tamil Nadu</span>
                </p>
                <button
                  onClick={() => {
                    const url = `https://www.google.com/maps/dir/?api=1&destination=${vendor.lat || 11.5034},${vendor.lng || 77.2444}`;
                    window.open(url, "_blank");
                  }}
                  className="flex items-center gap-1.5 bg-[#1a5c2a] hover:bg-[#13461f] text-white text-[10px] font-black uppercase tracking-wider py-2 px-3.5 rounded-xl border-none cursor-pointer shadow-sm active:scale-95 transition-all shrink-0"
                >
                  Directions
                </button>
              </div>
            </div>

            {/* Actions Card */}
            <div className="bg-white border border-[#ece5d8] rounded-3xl p-6 shadow-sm">
              <button
                onClick={handleWhatsAppShare}
                className="flex items-center justify-center gap-2 w-full bg-[#1a5c2a] hover:bg-[#13461f] text-white font-extrabold text-xs.5 py-4 px-4 rounded-xl border-none cursor-pointer shadow-md active:scale-95 transition-all"
              >
                <Share2 size={16} />
                <span className="ta">{t.share}</span>
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* Floating mobile footer (only visible on mobile layout size) */}
      <div className="fixed left-0 right-0 bottom-0 bg-[#FAF7F2] border-t border-[#ece5d8] p-4 flex flex-col gap-2 shadow-[0_-8px_24px_-16px_rgba(30,40,20,0.4)] lg:hidden z-20">
        <button
          onClick={handleWhatsAppShare}
          className="flex items-center justify-center gap-2 w-full bg-[#1a5c2a] hover:bg-[#13461f] text-white font-extrabold text-xs.5 py-4 px-4 rounded-xl border-none cursor-pointer shadow-md"
        >
          <Share2 size={16} />
          <span className="ta">{t.share}</span>
        </button>
      </div>

    </div>
  );
}
