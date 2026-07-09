"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full bg-slate-900 text-slate-300 mt-auto z-50">
      <div className="w-full max-w-7xl mx-auto px-6 py-12 flex flex-col items-center gap-4">
        
        {/* Brand Icon & Text */}
        <Link href="/" className="flex items-center gap-2.5">
          <svg width="32" height="32" viewBox="0 0 36 36" fill="none">
            <defs>
              <linearGradient id="logoGradFooter" x1="0" y1="0" x2="36" y2="36">
                <stop offset="0%" stopColor="#0d9488" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>
            <path d="M4 20c2-6 6-12 14-16 2 4 6 8 14 10-4 6-10 10-14 14C14 26 8 24 4 20z" fill="url(#logoGradFooter)" opacity="0.3" />
            <path d="M4 20c2-6 6-12 14-16 2 4 6 8 14 10-4 6-10 10-14 14C14 26 8 24 4 20z" stroke="url(#logoGradFooter)" strokeWidth="1.5" fill="none" />
            <path d="M18 11v14" stroke="#0d9488" strokeWidth="2.2" strokeLinecap="round" />
            <path d="M11 18h14" stroke="#0d9488" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
          <span className="text-white font-bold text-lg tracking-tight">AetherMed</span>
        </Link>
        
        {/* Copyright */}
        <span className="text-sm text-slate-400">Copyright © 2026 AetherMed Network. All rights reserved.</span>

        {/* Social Icons */}
        <div className="flex items-center gap-6 mt-2">
          {/* Facebook */}
          <a href="#" className="text-slate-400 hover:text-white transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
            </svg>
          </a>
          {/* Instagram */}
          <a href="#" className="text-slate-400 hover:text-white transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
            </svg>
          </a>
          {/* LinkedIn */}
          <a href="#" className="text-slate-400 hover:text-white transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
              <rect x="2" y="9" width="4" height="12" />
              <circle cx="4" cy="4" r="2" />
            </svg>
          </a>
          {/* Twitter/X */}
          <a href="#" className="text-slate-400 hover:text-white transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
          {/* Github */}
          <a href="#" className="text-slate-400 hover:text-white transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
}
