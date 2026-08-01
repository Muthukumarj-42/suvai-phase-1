import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const vendorId = searchParams.get("vendorId");

  if (!vendorId) {
    return NextResponse.json(
      { error: "vendorId query parameter is required" },
      { status: 400 }
    );
  }

  try {
    // Generate a QR code that encodes the vendor URL/details
    // In production, this would point to: https://suvai.vercel.app/vendor/[vendorId]
    const vendorUrl = `${request.nextUrl.origin}/vendor/${vendorId}`;
    
    // Generate QR code as Data URL (Base64 PNG)
    const qrCodeDataUrl = await QRCode.toDataURL(vendorUrl, {
      width: 512,
      margin: 2,
      color: {
        dark: "#1e293b", // Deep slate for readability
        light: "#ffffff", // Pure white background
      },
    });

    return NextResponse.json({
      vendorId,
      vendorUrl,
      qrDataUrl: qrCodeDataUrl,
    });
  } catch (error: any) {
    console.error("QR Code generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate QR code", details: error.message },
      { status: 500 }
    );
  }
}
