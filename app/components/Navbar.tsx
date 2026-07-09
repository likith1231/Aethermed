"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";

export default function Navbar() {
  const pathname = usePathname();
  const { userRole, logout } = useAuth();
  const { language, setLanguage } = useLanguage();
  const [mounted, setMounted] = useState(false);

  const isDoctorRoute = pathname?.startsWith('/doctor');
  const isAdminRoute = pathname?.startsWith('/admin');
  const isPublicRoute = !isDoctorRoute && !isAdminRoute;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Session Expiry on Exit logic:
    // If we're on a public route, but the auth context thinks we're logged in as a doctor or admin,
    // it means the user navigated away from the portal. Clear the session!
    if (mounted && isPublicRoute && userRole !== 'public') {
      console.log("[Navbar] Portal exit detected. Clearing session.");
      logout();
      signOut({ redirect: false }).catch(err => console.error("SignOut error", err));
    }
  }, [mounted, isPublicRoute, userRole, logout]);

  const handleSignOut = () => {
    logout();
    signOut({ redirect: false }).then(() => {
       window.location.href = "/";
    });
  };

  return (
    <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-100 z-50">
      <div className="w-full max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
        <Link href={userRole === 'doctor' ? '/doctor' : userRole === 'admin' ? '/admin' : '/home'} className="flex items-center gap-2.5">
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
          <span className="text-slate-900 font-bold text-lg tracking-tight">
            AetherMed
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          {mounted && isPublicRoute && (
            <>
              <Link
                href="/home"
                className={`text-sm font-medium transition-colors ${
                  pathname === "/home" ? "text-teal-600 hover:text-teal-700" : "text-slate-500 hover:text-slate-800"
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
            </>
          )}
          {mounted && isAdminRoute && (
            <span className="text-sm font-bold text-teal-700">
              Master Console
            </span>
          )}
          {mounted && isDoctorRoute && (
            <span className="text-sm font-bold text-teal-700">
              Practitioner Console
            </span>
          )}
        </nav>
        <div className="flex items-center gap-4">
          {mounted && isPublicRoute && (
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as "en" | "kn" | "hi")}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
            >
              <option value="en">English</option>
              <option value="kn">ಕನ್ನಡ (Kannada)</option>
              <option value="hi">हिंदी (Hindi)</option>
            </select>
          )}
          {mounted && userRole !== "public" ? (
            <button
              onClick={handleSignOut}
              className="px-5 py-2.5 bg-red-50 text-red-600 text-sm font-semibold rounded-full hover:bg-red-100 hover:text-red-700 transition-colors shadow-sm"
            >
              Sign Out
            </button>
          ) : mounted && isPublicRoute ? (
            <Link
              href="/#booking"
              className="px-5 py-2.5 bg-teal-600 text-white text-sm font-semibold rounded-full hover:bg-teal-700 transition-colors shadow-sm"
            >
              Book Now
            </Link>
          ) : null}
        </div>
      </div>
    </header>
  );
}
