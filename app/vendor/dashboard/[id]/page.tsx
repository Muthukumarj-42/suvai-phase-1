"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { Eye, ArrowUpRight, Share2, Star, Shield, MapPin, Loader2, ArrowRight, Home, Settings, User } from "lucide-react";
import { createBrowserClientInstance } from "@/lib/supabase/client";
import CertifiedBadge from "@/components/CertifiedBadge";
import BottomNav from "@/components/BottomNav";
import QRCode from "qrcode";

const FALLBACK_DASHBOARD = {
  id: "v1",
  stall_name: "முருகன் இட்லி கடை",
  stall_name_en: "Murugan Idli Kadai",
  food_type: "idli_dosa" as const,
  phone: "9876543210",
  lat: 11.0183,
  lng: 76.9558,
  rating: 4.8,
  review_count: 312,
  suvai_certified: true,
  established_year: 1994,
  is_open: true,
  views_count: 47,
  favourites_count: 28,
  reviews: [
    { reviewer_name: "Karthik R", comment: "Best idli in Coimbatore. Very clean and hygienic stall.", created_at: "2 days ago" },
    { reviewer_name: "Priya M", comment: "Sambar is amazing. Long queue every morning but totally worth it.", created_at: "1 week ago" }
  ]
};

export default function VendorDashboardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  
  const [activeTab, setActiveTab] = useState("home");
  const [vendor, setVendor] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [shareCopied, setShareCopied] = useState(false);

  useEffect(() => {
    async function loadDashboardData() {
      setLoading(true);
      try {
        const supabase = createBrowserClientInstance();

        // 1. Fetch vendor row
        const { data: vendorData, error: vendorErr } = await supabase
          .from("vendors")
          .select("*")
          .eq("id", id)
          .single();

        if (vendorErr) throw vendorErr;

        // 2. Fetch recent reviews
        const { data: reviewData } = await supabase
          .from("reviews")
          .select("*")
          .eq("vendor_id", id)
          .order("created_at", { ascending: false })
          .limit(3);

        setVendor(vendorData);
        setReviews(reviewData || []);
      } catch (err) {
        console.warn("Could not load dashboard from Supabase, loading fallback mock:", err);
        setVendor(FALLBACK_DASHBOARD);
        setReviews(FALLBACK_DASHBOARD.reviews);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [id]);

  const handleShareProfile = () => {
    if (typeof window === "undefined" || !vendor) return;
    const shareUrl = `${window.location.origin}/vendor/${id}`;
    navigator.clipboard.writeText(shareUrl);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2000);
  };

  const handleDownloadQR = async () => {
    try {
      const profileUrl = `${window.location.origin}/vendor/${id}`;
      const qrDataUrl = await QRCode.toDataURL(profileUrl, {
        width: 500,
        margin: 1,
        color: {
          dark: "#173d1f",
          light: "#ffffff",
        },
      });

      const downloadLink = document.createElement("a");
      downloadLink.href = qrDataUrl;
      downloadLink.download = `${vendor.stall_name_en.toLowerCase().replace(/\s+/g, "_")}_qr.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } catch (err) {
      console.error("Could not generate QR code for download:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-radial from-[#f3efe7] to-[#ded7cb]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 text-[#1a5c2a] animate-spin" />
          <span className="text-sm font-bold text-[#173d1f]">Loading Dashboard...</span>
        </div>
      </div>
    );
  }

  if (!vendor) return null;

  const statsConfig = [
    {
      label: "இன்று பார்வைகள்",
      labelEn: "Today's Views",
      value: vendor.views_count || 47,
      icon: <Eye size={20} className="text-[#E87722]" />
    },
    {
      label: "இந்த வாரம்",
      labelEn: "This Week",
      value: (vendor.views_count || 47) * 7 + 12,
      icon: <ArrowUpRight size={20} className="text-[#1a5c2a]" />
    },
    {
      label: "விமர்சனங்கள்",
      labelEn: "Reviews Count",
      value: vendor.review_count || 0,
      icon: <Star size={20} className="fill-[#E87722] text-[#E87722]" />
    }
  ];

  const desktopTabs = [
    { id: "home", label: "Home / முகப்பு", Icon: Home },
    { id: "profile", label: "Stall Profile / என் Profile", Icon: User },
    { id: "reviews", label: "Reviews / விமர்சனங்கள்", Icon: Star },
    { id: "settings", label: "Settings / அமைப்புகள்", Icon: Settings }
  ];

  return (
    <div className="w-full min-h-screen bg-radial from-[#f3efe7] to-[#ded7cb] text-[#173d1f] font-sans antialiased py-6 px-4 md:py-12 md:px-8 flex justify-center items-start overflow-y-auto">
      
      {/* ========================================================= */}
      {/* ===== 1. MOBILE VIEW (md:hidden - centered device shell) ===== */}
      {/* ========================================================= */}
      <div className="md:hidden w-[393px] h-[830px] rounded-[44px] bg-[#0f2417] p-[11px] shadow-[0_40px_90px_-30px_rgba(20,50,30,0.55)] border border-white/5 overflow-hidden flex flex-col relative select-none">
        <div className="relative w-full h-full rounded-[34px] bg-[#FAF7F2] overflow-hidden flex flex-col">
          
          <div className="h-5 flex items-center justify-between text-[11px] font-extrabold text-[#1a5c2a] px-5 pt-2 select-none shrink-0">
            <span>9:41</span>
            <span className="tracking-widest">••• ▪ ⬤</span>
          </div>

          <header className="flex items-center justify-between px-5 py-3 shrink-0">
            <h1 className="text-lg font-black text-[#1a5c2a]">
              Suvai <span className="ta font-bold text-xs">சுவை</span>
            </h1>
            {vendor.suvai_certified && (
              <div className="flex items-center gap-1 bg-[#1a5c2a] px-3 py-1 rounded-full">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="#ffffff"><path d="M12 2l7 3v6c0 5-3 8.5-7 10-4-1.5-7-5-7-10V5z" /></svg>
                <span className="text-[9px] font-black text-white uppercase tracking-wider">Certified</span>
              </div>
            )}
          </header>

          <div className="noscroll flex-1 overflow-y-auto px-5 py-2 pb-[110px]">
            <div className="flex items-center gap-3 bg-gradient-to-tr from-[#1a5c2a] to-[#276d38] rounded-2.5xl p-4 text-white shadow-md shadow-[#1a5c2a]/10">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">🚀</div>
              <div className="min-w-0">
                <h2 className="ta text-sm font-extrabold leading-tight">உங்கள் கடை இப்போது Live!</h2>
                <p className="text-xs mt-0.5 opacity-90">Your Stall is Now Live!</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-4">
              {statsConfig.map((stat, idx) => (
                <div key={idx} className="bg-white border border-[#f0ebe0] rounded-xl py-3 px-1 text-center shadow-sm">
                  <div className="flex justify-center mb-1">{stat.icon}</div>
                  <p className="text-lg font-black">{stat.value}</p>
                  <p className="ta text-[9px] font-bold text-[#6f6a5c] mt-0.5 leading-tight">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-2.5 mt-4">
              <button className="flex items-center justify-center gap-1.5 w-full bg-[#E87722] hover:bg-[#d5671b] text-white font-extrabold text-xs py-3.5 px-4 rounded-xl cursor-pointer">
                <MapPin size={14} />
                <span>Update Location</span>
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={handleShareProfile} className="flex items-center justify-center gap-1.5 bg-white border border-[#1a5c2a] text-[#1a5c2a] font-extrabold text-xs py-3.5 px-3 rounded-xl cursor-pointer">
                  <Share2 size={14} />
                  <span>{shareCopied ? "Copied!" : "Share Link"}</span>
                </button>
                <button onClick={handleDownloadQR} className="flex items-center justify-center gap-1.5 bg-[#1a5c2a] text-white font-extrabold text-xs py-3.5 px-3 rounded-xl cursor-pointer">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  <span>Download QR</span>
                </button>
              </div>
              <Link href={`/vendor/dashboard/${id}/print`} className="flex items-center justify-center gap-1.5 w-full bg-slate-100 hover:bg-slate-200 border border-[#d8d1c4] text-[#4a4636] font-extrabold text-xs py-3.5 px-4 rounded-xl cursor-pointer text-center">
                <span>Print QR Poster</span>
              </Link>
            </div>

            {/* Profile preview card */}
            <div className="mt-5">
              <h3 className="text-xs.5 font-extrabold flex justify-between items-baseline">
                <span>Stall Profile Preview</span>
                <span className="ta font-bold text-[10px] text-[#6f6a5c]">எனது Profile</span>
              </h3>
              
              <Link href={`/vendor/${id}`} className="flex items-center gap-3 bg-white border border-[#f0ebe0] rounded-xl p-2.5 mt-2.5 shadow-sm group">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-tr from-[#E87722] to-[#c85f12] flex items-center justify-center text-white">🏪</div>
                <div className="flex-1 min-w-0">
                  <h4 className="ta text-xs font-black text-[#173d1f] group-hover:text-[#1a5c2a] transition-colors truncate">{vendor.stall_name}</h4>
                  <p className="text-[10px] font-bold text-[#6f6a5c] mt-0.5 truncate">{vendor.stall_name_en}</p>
                </div>
                <ArrowRight size={14} className="text-[#1a5c2a]" />
              </Link>
            </div>
          </div>

          <BottomNav mode="vendor" activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
      </div>

      {/* ======================================================== */}
      {/* ===== 2. DESKTOP WIDESCREEN VIEW (>= 768px BREAKPOINT) ===== */}
      {/* ======================================================== */}
      <div className="hidden md:flex max-w-5xl w-full bg-[#FAF7F2] rounded-3xl border border-[#ece5d8] shadow-[0_24px_70px_-20px_rgba(20,50,30,0.15)] overflow-hidden">
        
        {/* LEFT COLUMN: Sidebar Navigation */}
        <aside className="w-[280px] h-[650px] flex flex-col bg-white border-r border-[#ece5d8] shrink-0">
          {/* Header Title */}
          <div className="p-6 border-b border-[#ece5d8]">
            <h2 className="text-xl font-black text-[#1a5c2a] flex items-center gap-1.5">
              Suvai Portal <span className="ta font-bold text-xs text-slate-400">கடை</span>
            </h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Vendor Panel</p>
          </div>

          {/* Navigation items list */}
          <div className="p-4 space-y-1 flex-1">
            {desktopTabs.map((tab) => {
              const active = activeTab === tab.id;
              const TabIcon = tab.Icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl font-extrabold text-xs.5 border-none text-left cursor-pointer transition-all duration-150 ${
                    active
                      ? "bg-[#1a5c2a]/10 text-[#1a5c2a] shadow-sm shadow-[#1a5c2a]/5"
                      : "bg-transparent text-[#6f6a5c] hover:bg-slate-50 hover:text-[#173d1f]"
                  }`}
                >
                  <TabIcon size={16} className={active ? "fill-[#1a5c2a]/5" : ""} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Bottom logout / Back link */}
          <div className="p-4 border-t border-[#ece5d8]">
            <Link
              href="/"
              className="flex items-center justify-center gap-1.5 w-full bg-slate-50 hover:bg-slate-100 text-[#4a4636] font-bold text-xs py-2.5 rounded-lg border border-[#d8d1c4]"
            >
              Back to Discover View
            </Link>
          </div>
        </aside>

        {/* RIGHT COLUMN: Analytical Panel Content */}
        <main className="flex-1 h-[650px] flex flex-col bg-[#FAF7F2]">
          {/* Header info */}
          <header className="p-6 border-b border-[#ece5d8] bg-white flex items-center justify-between shrink-0">
            <div>
              <h2 className="ta text-lg font-black text-[#173d1f]">
                {vendor.stall_name}
              </h2>
              <p className="text-xs font-bold text-[#6f6a5c] mt-0.5">{vendor.stall_name_en}</p>
            </div>
            {vendor.suvai_certified && <CertifiedBadge size="sm" />}
          </header>

          {/* Main Dashboard body */}
          <div className="noscroll flex-1 overflow-y-auto p-8 space-y-6">
            
            {/* Welcome banner */}
            <div className="flex items-center gap-4 bg-gradient-to-r from-[#1a5c2a] to-[#276d38] rounded-2.5xl p-5 text-white shadow-md">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-xl shrink-0">🚀</div>
              <div>
                <h3 className="ta text-sm.5 font-extrabold leading-snug">
                  உங்களுக்கு வாழ்த்துகள்! உங்கள் கடை தற்போது நேரலையில் உள்ளது.
                </h3>
                <p className="text-xs font-bold opacity-90 mt-0.5">
                  Congratulations! Your canteen stall is now live in Sathyamangalam.
                </p>
              </div>
            </div>

            {/* Stats analytics Row */}
            <div className="grid grid-cols-3 gap-4">
              {statsConfig.map((stat, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-[#ece5d8] rounded-2xl p-4.5 text-center shadow-sm flex items-center gap-4 justify-start"
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">{stat.icon}</div>
                  <div className="text-left">
                    <span className="block text-2xl font-black text-[#173d1f] tracking-tight">{stat.value}</span>
                    <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wide mt-0.5">{stat.labelEn}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Left/Right Grid details */}
            <div className="grid grid-cols-2 gap-6">
              
              {/* Profile Preview Panel */}
              <div className="bg-white border border-[#ece5d8] rounded-2.5xl p-6 shadow-[0_4px_12px_rgba(0,0,0,0.01)] flex flex-col justify-between">
                <div>
                  <h4 className="text-xs.5 font-black text-[#6f6a5c] uppercase tracking-wider mb-3">Live Profile Card</h4>
                  
                  {/* Mock profile preview display card */}
                  <div className="flex items-center gap-3.5 bg-[#FAF7F2] border border-[#f0ebe0] rounded-2xl p-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-tr from-[#E87722] to-[#c85f12] flex items-center justify-center text-white shrink-0 text-lg">🏪</div>
                    <div className="flex-1 min-w-0">
                      <h4 className="ta text-sm.5 font-black text-[#173d1f] truncate">{vendor.stall_name}</h4>
                      <p className="text-xs font-bold text-[#6f6a5c] mt-0.5 truncate">{vendor.stall_name_en}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="flex items-center gap-0.5 text-xs font-extrabold text-[#173d1f]">
                          <Star size={11} className="fill-[#E87722] stroke-[#E87722]" />
                          {vendor.rating ? vendor.rating.toFixed(1) : "New"}
                        </span>
                        <span className="text-[9px] font-black text-white bg-[#1a5c2a] px-2 py-0.5 rounded-md uppercase">
                          {vendor.food_type.replace("_", "/")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-6">
                  <button className="flex items-center justify-center gap-2 py-3 bg-[#E87722] hover:bg-[#d5671b] active:scale-95 transition-all text-white font-extrabold text-xs.5 rounded-xl border-none cursor-pointer shadow-md shadow-orange-500/10">
                    <MapPin size={14} /> Update Location
                  </button>
                  <button
                    onClick={handleShareProfile}
                    className="flex items-center justify-center gap-2 py-3 bg-white hover:bg-slate-50 border border-[#d8d1c4] text-[#4a4636] font-extrabold text-xs.5 rounded-xl cursor-pointer"
                  >
                    <Share2 size={14} /> {shareCopied ? "Link Copied!" : "Share Profile"}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <button
                    onClick={handleDownloadQR}
                    className="flex items-center justify-center gap-2 py-3 bg-[#1a5c2a] hover:bg-[#13461f] text-white font-extrabold text-xs.5 rounded-xl border-none cursor-pointer shadow-sm"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    <span>Download QR</span>
                  </button>
                  <Link
                    href={`/vendor/dashboard/${id}/print`}
                    className="flex items-center justify-center gap-2 py-3 bg-slate-100 hover:bg-slate-200 border border-[#d8d1c4] text-[#4a4636] font-extrabold text-xs.5 rounded-xl text-center cursor-pointer"
                  >
                    <span>Print QR Poster</span>
                  </Link>
                </div>
              </div>

              {/* Customer reviews panel */}
              <div className="bg-white border border-[#ece5d8] rounded-2.5xl p-6 shadow-[0_4px_12px_rgba(0,0,0,0.01)] space-y-4">
                <h4 className="text-xs.5 font-black text-[#6f6a5c] uppercase tracking-wider">Recent Feedback</h4>
                
                <div className="flex flex-col gap-3">
                  {reviews.length > 0 ? (
                    reviews.map((rev, idx) => {
                      const formatDate = (dateStr: any) => {
                        if (!dateStr) return "Recently";
                        if (typeof dateStr === "string" && !dateStr.includes("T") && isNaN(Date.parse(dateStr))) {
                          return dateStr;
                        }
                        try {
                          const d = new Date(dateStr);
                          return isNaN(d.getTime()) ? "Recently" : d.toLocaleDateString();
                        } catch {
                          return "Recently";
                        }
                      };
                      return (
                        <div key={idx} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-extrabold text-[#173d1f]">{rev.reviewer_name || "Anonymous"}</span>
                            <span className="text-[10px] text-[#a7a294]">{formatDate(rev.created_at)}</span>
                          </div>
                          <p className="text-xs text-[#4a4636] mt-2 italic">"{rev.comment || ""}"</p>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8 text-xs.5 text-[#9a9486] border border-dashed border-[#ece5d8] rounded-xl bg-slate-50">
                      No customer reviews yet.
                    </div>
                  )}
                </div>
              </div>

            </div>

          </div>
        </main>
      </div>

    </div>
  );
}
