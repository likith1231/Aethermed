import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientScene from "./components/ClientScene";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
 });

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AetherMed — Find & Book Top Doctors",
  description: "Browse thousands of verified specialists and book appointments instantly on the AetherMed Booking Network.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${geistMono.variable}`}
    >
      <body className="min-h-screen bg-slate-50/50 text-slate-900 antialiased">
        {/* 3D Background Scene – fixed behind all content */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <ClientScene />
        </div>

        {/* Content layer above the 3D scene */}
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  );
}
