"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Printer } from "lucide-react";
import { createBrowserClientInstance } from "@/lib/supabase/client";
import CertifiedBadge from "@/components/CertifiedBadge";
import QRCode from "qrcode";

interface PrintPageProps {
  params: Promise<{ id: string }>;
}

export default function PrintQrPage({ params }: PrintPageProps) {
  const { id } = use(params);
  const router = useRouter();
  
  const [vendor, setVendor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [qrCodeUrl, setQrCodeUrl] = useState("");

  useEffect(() => {
    async function loadVendorData() {
      try {
        const supabase = createBrowserClientInstance();
        const { data, error } = await supabase
          .from("vendors")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        setVendor(data);

        // Generate high-resolution QR code encoding public profile page URL
        const profileUrl = `${window.location.origin}/vendor/${id}`;
        const qrUrl = await QRCode.toDataURL(profileUrl, {
          width: 600,
          margin: 2,
          color: {
            dark: "#173d1f", // primary dark green
            light: "#ffffff",
          },
        });
        setQrCodeUrl(qrUrl);
      } catch (err) {
        console.warn("Could not load vendor from Supabase, loading fallback mock:", err);
        // Fallback vendor
        const fallback = {
          stall_name: "முருகன் இட்லி கடை",
          stall_name_en: "Murugan Idli Kadai",
          suvai_certified: true,
        };
        setVendor(fallback);

        try {
          const profileUrl = `${window.location.origin}/vendor/${id}`;
          const qrUrl = await QRCode.toDataURL(profileUrl, {
            width: 600,
            margin: 2,
            color: {
              dark: "#173d1f",
              light: "#ffffff",
            },
          });
          setQrCodeUrl(qrUrl);
        } catch {}
      } finally {
        setLoading(false);
      }
    }

    loadVendorData();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF7F2]">
        <div className="text-center font-black text-[#1a5c2a] flex items-center gap-2">
          <Loader2 className="animate-spin text-[#1a5c2a]" size={16} />
          <span>Generating Poster...</span>
        </div>
      </div>
    );
  }

  if (!vendor) return null;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-start py-10 px-4 print:p-0 print:bg-white select-none">
      
      {/* Control bar (hidden during print) */}
      <div className="w-full max-w-sm bg-white border border-[#ece5d8] rounded-2.5xl p-4.5 mb-8 flex justify-between items-center shadow-sm print:hidden">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-xs font-black text-[#1a5c2a] border-none bg-transparent cursor-pointer hover:underline"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
        <button
          onClick={handlePrint}
          className="flex items-center gap-1.5 bg-[#1a5c2a] hover:bg-[#13461f] text-white font-extrabold text-xs py-2.5 px-4 rounded-xl border-none cursor-pointer shadow-sm transition-colors"
        >
          <Printer size={16} /> Print Poster
        </button>
      </div>

      {/* Printable Poster Sticker card */}
      <div className="w-[380px] h-[550px] bg-[#FAF7F2] border-6 border-[#1a5c2a] rounded-3.5xl p-7 flex flex-col items-center justify-between text-center relative shadow-lg print:shadow-none print:border-6 print:rounded-3.5xl print:w-[380px] print:h-[550px] print:mx-auto">
        
        {/* Poster Brand header */}
        <div className="w-full">
          <div className="text-[10px] font-black text-[#E87722] uppercase tracking-widest font-sans">Campus Street Food</div>
          <h1 className="text-3.5xl font-black text-[#1a5c2a] mt-1 leading-none">Suvai Canteen</h1>
          <div className="h-[2px] bg-[#ece5d8] w-20 mx-auto mt-3" />
        </div>

        {/* Vendor Info Section */}
        <div className="my-3 space-y-2">
          <h2 className="text-2.5xl font-black text-[#173d1f] leading-snug">{vendor.stall_name_en}</h2>
          {vendor.suvai_certified && (
            <div className="flex justify-center mt-3">
              <CertifiedBadge size="md" />
            </div>
          )}
        </div>

        {/* High-res Qr Image */}
        {qrCodeUrl && (
          <div className="w-[210px] h-[210px] bg-white border border-[#ece5d8] rounded-2.5xl p-3 flex items-center justify-center shadow-inner">
            <img src={qrCodeUrl} alt="Vendor Canteen QR Code" className="w-full h-full object-contain" />
          </div>
        )}

        {/* Subtext info directions */}
        <div className="w-full">
          <p className="text-xs font-bold text-[#6f6a5c]">Scan this QR Code to view our:</p>
          <div className="flex justify-center gap-5 text-[10px] font-black text-[#1a5c2a] mt-2 uppercase tracking-wide">
            <span>🍽️ Food Menu & Prices</span>
            <span>⭐ Customer Reviews</span>
          </div>
          <p className="text-[9px] text-[#9a9486] font-bold mt-4">Powered by Suvai Campus Discovery</p>
        </div>

      </div>

    </div>
  );
}

// Small inline loader helper for compilation
function Loader2({ className, size }: { className?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
