"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLanguage } from "./context/LanguageContext";
import Footer from "./components/Footer";

/* ─────────────────────────────────────────────
   AetherMed Landing Page
   Modern SaaS-style light theme with:
   - Inline navbar with CTA hierarchy
   - Gradient-accented hero
   - "How It Works" 3-step strip
   - Feature highlight grid
   - Stats/trust bar
   - Existing Footer
   ───────────────────────────────────────────── */

export default function EntryGateway() {
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-transparent flex flex-col relative overflow-hidden">

      {/* ═══════════════════════════════════════
          NAVBAR — Landing-specific
          ═══════════════════════════════════════ */}
      <header className="w-full bg-white/80 backdrop-blur-lg border-b border-slate-100 sticky top-0 z-50">
        <div className="w-full max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <svg width="32" height="32" viewBox="0 0 36 36" fill="none">
              <defs>
                <linearGradient id="logoGradLanding" x1="0" y1="0" x2="36" y2="36">
                  <stop offset="0%" stopColor="#0d9488" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>
              <path d="M4 20c2-6 6-12 14-16 2 4 6 8 14 10-4 6-10 10-14 14C14 26 8 24 4 20z" fill="url(#logoGradLanding)" opacity="0.18" />
              <path d="M4 20c2-6 6-12 14-16 2 4 6 8 14 10-4 6-10 10-14 14C14 26 8 24 4 20z" stroke="url(#logoGradLanding)" strokeWidth="1.5" fill="none" />
              <path d="M18 11v14" stroke="#0d9488" strokeWidth="2.2" strokeLinecap="round" />
              <path d="M11 18h14" stroke="#0d9488" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
            <span className="text-slate-900 font-bold text-lg tracking-tight">AetherMed</span>
          </Link>

          {/* Nav Links — Desktop */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">How It Works</a>
            <a href="#clinics" className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">For Clinics</a>
          </nav>

          {/* CTA Hierarchy: Primary → Secondary → Tertiary */}
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="hidden sm:inline-flex text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
            >
              {t("adminPortal")}
            </Link>
            <Link
              href="/doctor"
              className="hidden sm:inline-flex px-4 py-2 text-sm font-semibold text-teal-700 border border-teal-200 rounded-full hover:bg-teal-50 transition-colors"
            >
              {t("practitionerPortal")}
            </Link>
            <Link
              href="/home"
              className="px-5 py-2 bg-teal-600 text-white text-sm font-semibold rounded-full hover:bg-teal-700 transition-colors shadow-sm shadow-teal-600/20"
            >
              {t("enterPatient")}
            </Link>
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════
          HERO SECTION
          ═══════════════════════════════════════ */}
      <section className="relative w-full pt-20 pb-24 md:pt-32 md:pb-36 overflow-hidden">
        {/* Subtle gradient wash behind hero */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-gradient-to-b from-teal-50/80 via-transparent to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-gradient-to-tl from-blue-50/60 to-transparent rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 flex flex-col items-center justify-center">
          {/* Main Copy Block */}
          <div className="w-full max-w-2xl mx-auto text-center md:text-left">
            {/* Pill badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-medium text-teal-700 bg-teal-50 rounded-full border border-teal-100 mb-6">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-teal-500" />
              </span>
              {t("heroBadge")}
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
              <span className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-700 bg-clip-text text-transparent">
                {t("heroTitle")}
              </span>
            </h1>

            <p className="mt-6 text-lg text-slate-500 leading-relaxed max-w-xl mx-auto md:mx-0">
              {t("heroSubtitle")}
            </p>

            {/* Hero CTAs */}
            <div className="flex flex-col sm:flex-row items-center gap-4 mt-10 justify-center md:justify-start">
              <Link
                href="/home"
                className="w-full sm:w-auto px-8 py-3.5 bg-teal-600 text-white text-sm font-semibold rounded-full hover:bg-teal-700 transition-all shadow-lg shadow-teal-600/20 text-center"
              >
                Get Started — It&rsquo;s Free
              </Link>
              <Link
                href="/doctor"
                className="w-full sm:w-auto px-8 py-3.5 text-sm font-semibold text-slate-700 border border-slate-200 rounded-full hover:bg-slate-50 transition-all text-center"
              >
                For Practitioners →
              </Link>
            </div>
          </div>

          {/* Right side is intentionally empty as requested */}
        </div>
      </section>

      {/* ═══════════════════════════════════════
          STATS / TRUST STRIP
          ═══════════════════════════════════════ */}
      <section className="w-full bg-slate-50/80 backdrop-blur-sm border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { value: "100+", label: "Clinics Onboarded" },
            { value: "10,000+", label: "Patients Served" },
            { value: "99.9%", label: "Platform Uptime" },
            { value: "3", label: "Languages Supported" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-teal-600 to-emerald-500 bg-clip-text text-transparent">{stat.value}</p>
              <p className="text-sm text-slate-500 mt-1 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════
          HOW IT WORKS — 3-Step Strip
          ═══════════════════════════════════════ */}
      <section id="how-it-works" className="w-full py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-teal-600">Simple Process</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mt-3">How AetherMed Works</h2>
            <p className="text-slate-500 mt-3 max-w-xl mx-auto">Three steps to skip the waiting room. Book online, get your live token, and we&rsquo;ll notify you when it&rsquo;s your turn.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: "01",
                title: "Book Your Slot",
                desc: "Select your clinic, choose your preferred time window, and submit your appointment in seconds.",
                icon: (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                ),
              },
              {
                step: "02",
                title: "Get Your Token",
                desc: "Receive a live queue token instantly. Track your position in real-time from your phone — no need to sit and wait.",
                icon: (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>
                ),
              },
              {
                step: "03",
                title: "Get Notified",
                desc: "When the doctor is ready for you, we send an instant alert. Walk in right on time — zero idle waiting.",
                icon: (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
                ),
              },
            ].map((item) => (
              <div key={item.step} className="relative bg-white rounded-2xl border border-slate-100 p-7 text-center shadow-sm hover:shadow-md hover:border-teal-100 transition-all duration-300 group">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-teal-600 text-white text-xs font-bold flex items-center justify-center shadow-md shadow-teal-600/30">
                  {item.step}
                </div>
                <div className="w-12 h-12 mx-auto mt-4 mb-4 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:bg-teal-100 transition-colors">
                  {item.icon}
                </div>
                <h3 className="text-base font-bold text-slate-800 mb-2">{item.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          FEATURE HIGHLIGHT GRID
          ═══════════════════════════════════════ */}
      <section id="features" className="w-full py-20 md:py-28 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-teal-600">Platform Capabilities</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mt-3">Everything You Need, Built In</h2>
            <p className="text-slate-500 mt-3 max-w-xl mx-auto">One platform for patients, practitioners, and administrators — designed to eliminate healthcare friction.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                title: "Smart Queue System",
                desc: "Dynamic token allocation with real-time queue position tracking. No more guessing when it's your turn.",
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" ry="1" /></svg>
                ),
                color: "teal",
              },
              {
                title: "Live Tracking",
                desc: "Automated background polling syncs your queue position every 5 seconds with the clinic's real-time server state.",
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
                ),
                color: "blue",
              },
              {
                title: "Multi-Language",
                desc: "Full interface support for English, Kannada, and Hindi — making healthcare accessible to every community.",
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
                ),
                color: "violet",
              },
              {
                title: "Practitioner Dashboard",
                desc: "Clinicians manage their roster, update patient statuses in real-time, and delegate tasks to staff — all from one view.",
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>
                ),
                color: "emerald",
              },
              {
                title: "Admin Analytics",
                desc: "Platform-wide telemetry dashboards with booking trends, revenue projections, and compliance audit logs.",
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>
                ),
                color: "amber",
              },
              {
                title: "Secure & Private",
                desc: "End-to-end encrypted data handling with role-based access control. Your health data stays yours.",
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                ),
                color: "rose",
              },
            ].map((feature) => {
              const colorMap: Record<string, { bg: string; text: string; hoverBg: string }> = {
                teal:    { bg: "bg-teal-50",    text: "text-teal-600",    hoverBg: "group-hover:bg-teal-100" },
                blue:    { bg: "bg-blue-50",     text: "text-blue-600",    hoverBg: "group-hover:bg-blue-100" },
                violet:  { bg: "bg-violet-50",   text: "text-violet-600",  hoverBg: "group-hover:bg-violet-100" },
                emerald: { bg: "bg-emerald-50",  text: "text-emerald-600", hoverBg: "group-hover:bg-emerald-100" },
                amber:   { bg: "bg-amber-50",    text: "text-amber-600",   hoverBg: "group-hover:bg-amber-100" },
                rose:    { bg: "bg-rose-50",     text: "text-rose-600",    hoverBg: "group-hover:bg-rose-100" },
              };
              const c = colorMap[feature.color];
              return (
                <div key={feature.title} className="bg-white rounded-2xl border border-slate-100 p-6 hover:shadow-md hover:border-slate-200 transition-all duration-300 group">
                  <div className={`w-11 h-11 rounded-xl ${c.bg} ${c.text} ${c.hoverBg} flex items-center justify-center mb-4 transition-colors`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-base font-bold text-slate-800 mb-1.5">{feature.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          FOR CLINICS CTA
          ═══════════════════════════════════════ */}
      <section id="clinics" className="w-full py-20 md:py-28">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-teal-600">For Healthcare Providers</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mt-3">Manage Your Practice, Effortlessly</h2>
          <p className="text-slate-500 mt-4 max-w-2xl mx-auto leading-relaxed">
            Join our growing network of clinics across Bengaluru. AetherMed gives your practice a modern digital front desk — patient queue management, staff delegation, and analytics, all in one dashboard.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
            <Link
              href="/doctor"
              className="px-8 py-3.5 bg-slate-900 text-white text-sm font-semibold rounded-full hover:bg-slate-800 transition-colors shadow-md"
            >
              Open Practitioner Portal
            </Link>
            <Link
              href="/locations"
              className="px-8 py-3.5 text-sm font-semibold text-slate-600 border border-slate-200 rounded-full hover:bg-slate-50 transition-colors"
            >
              Browse Our Network →
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          FOOTER — Kept as-is
          ═══════════════════════════════════════ */}
      <Footer />
    </div>
  );
}
