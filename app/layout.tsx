import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import AmbientBackground from "./components/AmbientBackground";
import { Providers } from "./providers";
import AIEngineBot from "./components/AIEngineBot";
import ToastNotification from "./components/ToastNotification";

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
      <body className="min-h-screen bg-slate-50/50 text-slate-900 antialiased flex flex-col">
        {/* Ambient bubble background – fixed behind all content */}
        <AmbientBackground />

        {/* Content layer above the background */}
        <div className="relative z-10 flex flex-col flex-grow min-h-screen">
          <Providers>
            {children}
            <AIEngineBot />
            <ToastNotification />
          </Providers>
        </div>
      </body>
    </html>
  );
}
