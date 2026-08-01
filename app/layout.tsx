import type { Metadata, Viewport } from "next";
import { Manrope, Noto_Sans_Tamil } from "next/font/google";
import "./globals.css";
import PWARegister from "./pwa-register";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const notoTa = Noto_Sans_Tamil({
  variable: "--font-noto-ta",
  subsets: ["tamil"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Suvai - Local Food Discovery",
  description: "Discover local street food stalls, cart vendors, and canteens in Sathyamangalam.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Suvai",
  },
};

export const viewport: Viewport = {
  themeColor: "#FF512F",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${notoTa.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <PWARegister />
        {children}
      </body>
    </html>
  );
}
