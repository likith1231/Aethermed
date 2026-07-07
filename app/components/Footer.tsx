"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full bg-slate-900 text-slate-300">
      {/* Main Footer Content */}
      <div className="w-full max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Column */}
          <div className="flex flex-col gap-4">
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
            <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
              AetherMed is a global healthcare systems network, streamlining care access by connecting patients to verified practitioners across multiple disciplines and systems of medicine.
            </p>
          </div>

          {/* For Patients */}
          <div className="flex flex-col gap-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">For Patients</h4>
            <nav className="flex flex-col gap-2.5">
              <Link href="/locations" className="text-sm text-slate-400 hover:text-teal-400 transition-colors">Find Doctors</Link>
              <Link href="/#booking" className="text-sm text-slate-400 hover:text-teal-400 transition-colors">Book a Visit</Link>
              <Link href="/admin" className="text-sm text-slate-400 hover:text-teal-400 transition-colors">Patient Portal</Link>
              <Link href="/#specialties" className="text-sm text-slate-400 hover:text-teal-400 transition-colors">Help Center</Link>
            </nav>
          </div>

          {/* For Providers */}
          <div className="flex flex-col gap-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">For Providers</h4>
            <nav className="flex flex-col gap-2.5">
              <Link href="/#specialties" className="text-sm text-slate-400 hover:text-teal-400 transition-colors">Join Network</Link>
              <Link href="/admin" className="text-sm text-slate-400 hover:text-teal-400 transition-colors">Provider Portal</Link>
              <Link href="/#specialties" className="text-sm text-slate-400 hover:text-teal-400 transition-colors">Marketing Solutions</Link>
              <Link href="/#specialties" className="text-sm text-slate-400 hover:text-teal-400 transition-colors">Practice Management</Link>
            </nav>
          </div>

          {/* Contact Us */}
          <div className="flex flex-col gap-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">Contact Us</h4>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2.5 text-sm text-slate-400">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-teal-500 shrink-0">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.84.36 1.65.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c1.16.34 1.97.57 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                +1 (555) AETHER-MED
              </div>
              <div className="flex items-center gap-2.5 text-sm text-slate-400">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-teal-500 shrink-0">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                support@aethermed.com
              </div>
              <div className="flex items-start gap-2.5 text-sm text-slate-400">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-teal-500 shrink-0 mt-0.5">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span>100 Medical Center Dr.<br />Suite 500, Austin, TX</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="w-full border-t border-slate-800">
        <div className="w-full max-w-7xl mx-auto px-6 py-5 flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="text-xs text-slate-500">© 2026 AetherMed Network. All rights reserved.</span>

          {/* Social Icons */}
          <div className="flex items-center gap-4">
            {/* Twitter/X */}
            <a href="#" className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-teal-600 hover:text-white transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            {/* Instagram */}
            <a href="#" className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-teal-600 hover:text-white transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </a>
          </div>

          {/* Policy Links */}
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <a href="#" className="hover:text-slate-300 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-300 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
