"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function AdminAuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLoginError("");

    try {
      const { signIn } = await import("next-auth/react");
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
        role: "admin"
      });

      if (res?.error) {
        setLoginError("Access Denied: Unauthorized Personnel.");
      } else if (res?.ok) {
        localStorage.setItem("aether_admin_authenticated", "true");
        window.location.href = "/admin";
      }
    } catch (error) {
      console.error(error);
      setLoginError("An error occurred connecting to the server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative">
      <Link href="/" className="absolute top-6 left-6 z-50 flex items-center justify-center w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-all shadow-sm cursor-pointer">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
      </Link>
      
      <div className="flex-grow flex items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
          <div className="flex flex-col items-center mb-8">
            <svg className="text-teal-600 mb-4" width="48" height="48" viewBox="0 0 36 36" fill="none">
              <defs>
                <linearGradient id="adminLogoGradLogin" x1="0" y1="0" x2="36" y2="36">
                  <stop offset="0%" stopColor="#0d9488" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>
              <path d="M4 20c2-6 6-12 14-16 2 4 6 8 14 10-4 6-10 10-14 14C14 26 8 24 4 20z" fill="url(#adminLogoGradLogin)" opacity="0.12" />
              <path d="M4 20c2-6 6-12 14-16 2 4 6 8 14 10-4 6-10 10-14 14C14 26 8 24 4 20z" stroke="url(#adminLogoGradLogin)" strokeWidth="1.5" fill="none" />
              <path d="M18 11v14" stroke="#0d9488" strokeWidth="2.2" strokeLinecap="round" />
              <path d="M11 18h14" stroke="#0d9488" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">AetherMed Secured Console</h2>
            <p className="text-sm text-slate-500 mt-2 text-center">Authorized personnel only.</p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Admin Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@aethermed.com"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/50 bg-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Secret Passcode</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/50 bg-white"
                required
              />
            </div>
            
            {loginError && (
              <div className="p-3 bg-red-50 text-red-600 text-sm font-medium rounded-lg text-center border border-red-100">
                {loginError}
              </div>
            )}

            <button disabled={isSubmitting} type="submit" className="w-full py-3.5 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 transition-colors shadow-sm mt-2 disabled:opacity-50">
              {isSubmitting ? "Authenticating..." : "Initialize Admin Session"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
