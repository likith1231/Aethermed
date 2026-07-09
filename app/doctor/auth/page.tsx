"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function DoctorAuthPage() {
  const [license, setLicense] = useState("");
  const [email, setEmail] = useState("");
  const [pin, setPin] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
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
        password: pin,
        role: "doctor"
      });

      if (res?.error) {
        setLoginError("Access Denied: Unauthorized Personnel.");
      } else if (res?.ok) {
        localStorage.setItem("aether_doctor_authenticated", "true");
        window.location.href = "/doctor";
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
            <svg className="text-blue-600 mb-4" width="48" height="48" viewBox="0 0 36 36" fill="none">
              <defs>
                <linearGradient id="docLogoGrad" x1="0" y1="0" x2="36" y2="36">
                  <stop offset="0%" stopColor="#2563eb" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>
              <path d="M18 6v24m-12-12h24" stroke="url(#docLogoGrad)" strokeWidth="4" strokeLinecap="round" />
            </svg>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight text-center">AetherMed Practitioners Console</h2>
            <p className="text-sm text-slate-500 mt-2 text-center">Secure verified medical access.</p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Medical License No. (MCI/KMC)</label>
              <input
                type="text"
                value={license}
                onChange={(e) => setLicense(e.target.value)}
                placeholder="MCI-1234"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Registered Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="doctor@aethermed.com"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Secure Access PIN</label>
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="••••"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-white"
                required
              />
            </div>
            
            {loginError && (
              <div className="p-3 bg-red-50 text-red-600 text-sm font-medium rounded-lg text-center border border-red-100">
                {loginError}
              </div>
            )}

            <div className="flex flex-col gap-3 mt-2">
              <button disabled={isSubmitting} type="submit" className="w-full py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50">
                {isSubmitting ? "Authenticating..." : "Sign In as Practitioner"}
              </button>
              <button type="button" onClick={() => setIsVerificationModalOpen(true)} className="w-full py-3.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors shadow-sm">
                Request Clinic Verification
              </button>
            </div>
          </form>
        </div>
      </div>

      {isVerificationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col">
            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">Clinic Verification</h3>
              <button onClick={() => setIsVerificationModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold text-xl">&times;</button>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <p className="text-sm text-slate-500 mb-2">Submit your facility details and license document for network approval.</p>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-2">Clinic Name</label>
                <input type="text" placeholder="e.g. City Care Clinic" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-white" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-2">License Document</label>
                <input type="file" className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 border border-slate-200 rounded-xl bg-white cursor-pointer" />
              </div>
              <div className="flex flex-col gap-2 mt-4">
                <button onClick={() => setIsVerificationModalOpen(false)} className="w-full py-3 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 transition-colors">
                  Submit Verification Request
                </button>
                <button onClick={() => setIsVerificationModalOpen(false)} className="w-full py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
