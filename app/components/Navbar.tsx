"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-100 z-50">
      <div className="w-full max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2.5">
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <defs>
              <linearGradient id="logoGradNav" x1="0" y1="0" x2="36" y2="36">
                <stop offset="0%" stopColor="#0d9488" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>
            <path d="M4 20c2-6 6-12 14-16 2 4 6 8 14 10-4 6-10 10-14 14C14 26 8 24 4 20z" fill="url(#logoGradNav)" opacity="0.18" />
            <path d="M4 20c2-6 6-12 14-16 2 4 6 8 14 10-4 6-10 10-14 14C14 26 8 24 4 20z" stroke="url(#logoGradNav)" strokeWidth="1.5" fill="none" />
            <path d="M18 11v14" stroke="#0d9488" strokeWidth="2.2" strokeLinecap="round" />
            <path d="M11 18h14" stroke="#0d9488" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
          <span className="text-slate-900 font-bold text-lg tracking-tight">AetherMed</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="/"
            className={`text-sm font-medium transition-colors ${
              pathname === "/" ? "text-teal-600 hover:text-teal-700" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Home
          </Link>
          <Link
            href="/locations"
            className={`text-sm font-medium transition-colors ${
              pathname === "/locations" ? "text-teal-600 hover:text-teal-700" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Locations
          </Link>
          <Link
            href="/admin"
            className={`text-sm font-medium transition-colors ${
              pathname === "/admin" ? "text-teal-600 hover:text-teal-700" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Admin
          </Link>
        </nav>
        <Link
          href="/#booking"
          className="px-5 py-2.5 bg-teal-600 text-white text-sm font-semibold rounded-full hover:bg-teal-700 transition-colors shadow-sm"
        >
          Book Now
        </Link>
      </div>
    </header>
  );
}
