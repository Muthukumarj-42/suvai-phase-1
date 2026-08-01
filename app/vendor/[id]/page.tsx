import React from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ProfileClient from "./ProfileClient";

interface VendorPageProps {
  params: Promise<{ id: string }>;
}

export default async function VendorProfilePage({ params }: VendorPageProps) {
  const { id } = await params;
  
  let vendor: any = null;
  let items: any[] = [];
  let reviews: any[] = [];

  try {
    const supabase = await createClient();

    // 1. Fetch vendor details
    const { data: vendorData } = await supabase
      .from("vendors")
      .select("*")
      .eq("id", id)
      .single();

    if (vendorData) {
      vendor = vendorData;

      // 2. Fetch specialty items
      const { data: itemData } = await supabase
        .from("specialty_items")
        .select("*")
        .eq("vendor_id", id);
      
      items = itemData || [];

      // 3. Fetch reviews
      const { data: reviewData } = await supabase
        .from("reviews")
        .select("*")
        .eq("vendor_id", id)
        .order("created_at", { ascending: false });

      reviews = reviewData || [];

      // 4. Fire-and-forget view count increment on Supabase
      supabase
        .from("vendors")
        .update({ views_count: (vendor.views_count || 0) + 1 })
        .eq("id", id)
        .then(() => {});
    }
  } catch (err) {
    console.warn("Could not fetch vendor server-side, using fallback check:", err);
  }

  // Not-Found state
  if (!vendor) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAF7F2] p-6 text-center">
        <span className="text-4xl mb-2">🏪</span>
        <h2 className="text-2xl font-black text-[#1a5c2a] mb-2">Vendor Not Found</h2>
        <p className="text-xs.5 text-[#6f6a5c] mb-6">
          The street food stall you are looking for does not exist or has been removed.
        </p>
        <Link
          href="/"
          className="px-6 py-3 bg-[#E87722] hover:bg-[#d5671b] text-white font-extrabold text-xs.5 rounded-xl transition-colors shadow-md"
        >
          Return to Discover
        </Link>
      </div>
    );
  }

  return <ProfileClient vendor={vendor} items={items} reviews={reviews} />;
}
