"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { signIn, useSession, signOut } from "next-auth/react";

export default function PatientDashboard() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated" && (session?.user as any)?.role === "patient";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  
  const [activeTab, setActiveTab] = useState("My Bookings");
  const [isMounted, setIsMounted] = useState(false);
  const [bookings, setBookings] = useState<any[]>([]);
  const [healthRecords, setHealthRecords] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNotification, setShowNotification] = useState(false);
  const [calledClinicName, setCalledClinicName] = useState("");
  const [calledCabin, setCalledCabin] = useState("Cabin 3"); // Default mock cabin

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      const fetchData = async () => {
        try {
          const res = await fetch("/api/patient/dashboard");
          if (res.ok) {
            const data = await res.json();
            
            // Check for new "In Cabin" status compared to existing state
            const newBookings = data.bookings || [];
            if (bookings.length > 0) {
              const newlyCalled = newBookings.find((nb: any) => 
                nb.status === "In Cabin" && 
                !bookings.find((b: any) => b.id === nb.id && b.status === "In Cabin")
              );
              if (newlyCalled) {
                setCalledClinicName(newlyCalled.clinic?.name || newlyCalled.clinicName);
                setShowNotification(true);
              }
            }
            
            setBookings(newBookings);
            setHealthRecords(data.healthRecords || []);
          }
        } catch (err) {
          console.error("Failed to fetch patient data", err);
        } finally {
          setIsLoading(false);
        }
      };
      
      // Initial fetch
      fetchData();
      
      // 5-second background poll
      const pollInterval = setInterval(fetchData, 5000);
      return () => clearInterval(pollInterval);
    }
  }, [isAuthenticated, bookings]);

  useEffect(() => {
    if (showNotification) {
      const autoDismissTimer = setTimeout(() => {
        setShowNotification(false);
      }, 5000);
      return () => clearTimeout(autoDismissTimer);
    }
  }, [showNotification]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    
    if (result?.error) {
      setLoginError("❌ Invalid Email or Password.");
    } else {
      setLoginError("");
    }
  };

  if (!isMounted) return null;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-transparent flex flex-col relative z-10">
        <Link href="/" className="absolute top-6 left-6 z-50 flex items-center justify-center w-10 h-10 rounded-full bg-white/50 backdrop-blur-md border border-slate-200 text-slate-700 hover:bg-white/80 transition-all shadow-sm cursor-pointer">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </Link>
        <div className="flex-grow flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/50">
            <div className="flex flex-col items-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center mb-6 shadow-lg shadow-teal-500/20">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight text-center">Patient Portal</h2>
              <p className="text-sm text-slate-500 mt-2 text-center">Sign in to view your bookings and health records.</p>
            </div>

            <form onSubmit={handleLogin} className="flex flex-col gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="patient@aethermed.com"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 bg-white/50 transition-all placeholder:text-slate-400"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 bg-white/50 transition-all placeholder:text-slate-400"
                  required
                />
              </div>
              
              {loginError && (
                <div className="p-3 bg-red-50 text-red-600 text-sm font-medium rounded-lg text-center border border-red-100">
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                className="w-full mt-2 py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                Sign In
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent relative z-10 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white/70 backdrop-blur-xl border-r border-slate-200/60 p-6 flex flex-col fixed h-full left-0 top-0">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center shadow-sm">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900">AetherMed</span>
        </div>

        <nav className="flex flex-col gap-2 flex-grow">
          {["My Bookings", "Health Records"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab
                  ? "bg-teal-50 text-teal-700 shadow-[inset_0_1px_1px_rgba(255,255,255,1),0_1px_2px_rgba(0,0,0,0.02)] border border-teal-100/50"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent"
              }`}
            >
              {tab === "My Bookings" ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              )}
              {tab}
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-200/60">
          <div className="flex items-center gap-3 px-4 py-3 bg-white border border-slate-200 rounded-xl mb-4 shadow-sm">
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-sm">
              {(session?.user as any)?.name?.charAt(0) || "P"}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-bold text-slate-900 truncate">{(session?.user as any)?.name}</span>
              <span className="text-xs text-slate-500 truncate">Patient</span>
            </div>
          </div>
          <button
            onClick={() => {
              signOut({ redirect: false }).then(() => {
                window.location.href = '/';
              });
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors border border-transparent hover:border-red-100"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            Sign Out
          </button>
        </div>
      </div>

      {/* ── WhatsApp Notification Simulation ── */}
      {showNotification && (
        <div className="fixed top-6 right-6 z-[60] bg-[#25D366] text-white p-4 rounded-2xl shadow-2xl flex items-start gap-3 max-w-sm animate-bounce cursor-pointer" onClick={() => setShowNotification(false)}>
          <div className="bg-white/20 p-2 rounded-full mt-1">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-sm">💬 AetherMed Update</h4>
            <p className="text-xs mt-1 leading-relaxed">The doctor at {calledClinicName} is ready to see you now. Please head to {calledCabin}.</p>
            <div className="text-[10px] text-white/70 mt-2 font-medium uppercase tracking-wide flex justify-between items-center">
              <span>Just Now</span>
              <span>Tap to dismiss</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 ml-64 p-10 min-h-screen">
        <header className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{activeTab}</h1>
            <p className="text-slate-500 mt-1">Manage your health information and appointments.</p>
          </div>
          <Link href="/" className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-xl transition-all shadow-sm hover:shadow flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Book New Appointment
          </Link>
        </header>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400">
            <svg className="animate-spin h-8 w-8 mb-4 text-teal-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p>Loading your data...</p>
          </div>
        ) : (
          <div className="w-full max-w-5xl">
            {activeTab === "My Bookings" && (
              <div className="grid gap-4">
                {bookings.length === 0 ? (
                  <div className="bg-white/60 backdrop-blur-sm border border-slate-200 border-dashed rounded-2xl p-12 text-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">No bookings yet</h3>
                    <p className="text-slate-500 mt-1 max-w-sm mx-auto">You haven't scheduled any appointments. When you do, they will appear here.</p>
                  </div>
                ) : (
                  bookings.map((booking: any) => (
                    <div key={booking.id} className="bg-white/80 backdrop-blur-md border border-slate-200/60 rounded-2xl p-6 shadow-[0_2px_10px_rgb(0,0,0,0.02)] flex items-start justify-between hover:border-teal-200 transition-colors">
                      <div className="flex gap-5">
                        <div className="w-14 h-14 rounded-xl bg-teal-50 border border-teal-100 flex flex-col items-center justify-center text-teal-700 shrink-0">
                          <span className="text-xs font-bold uppercase">{new Date(booking.date).toLocaleDateString('en-US', { month: 'short' })}</span>
                          <span className="text-xl font-black leading-none mt-0.5">{new Date(booking.date).getDate()}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-lg font-bold text-slate-900">{booking.clinic?.name || booking.clinicName}</h3>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide uppercase ${
                              booking.status === "Pending" ? "bg-amber-100 text-amber-700" :
                              booking.status === "Processed" ? "bg-emerald-100 text-emerald-700" :
                              "bg-blue-100 text-blue-700"
                            }`}>
                              {booking.status}
                            </span>
                          </div>
                          <p className="text-slate-600 text-sm flex items-center gap-4 mt-2">
                            <span className="flex items-center gap-1.5"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg> {booking.timeInput}</span>
                            <span className="flex items-center gap-1.5"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg> {booking.service}</span>
                            {booking.isTelemedicine && (
                              <span className="flex items-center gap-1.5 text-blue-600 font-medium">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
                                Telemedicine
                              </span>
                            )}
                          </p>
                          {booking.isTelemedicine && booking.telemedicineLink && booking.status !== "Processed" && (
                            <div className="mt-3">
                              <a href={booking.telemedicineLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
                                Join Virtual Consultation
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Booking ID</p>
                        <p className="text-sm text-slate-700 font-mono bg-slate-50 px-2 py-1 rounded border border-slate-100 inline-block">{booking.id}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === "Health Records" && (
              <div className="grid gap-4">
                {healthRecords.length === 0 ? (
                  <div className="bg-white/60 backdrop-blur-sm border border-slate-200 border-dashed rounded-2xl p-12 text-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">No health records found</h3>
                    <p className="text-slate-500 mt-1 max-w-sm mx-auto">Health records will appear here once a doctor concludes your consultation.</p>
                  </div>
                ) : (
                  healthRecords.map((record: any) => (
                    <div key={record.id} className="bg-white/80 backdrop-blur-md border border-slate-200/60 rounded-2xl p-6 shadow-[0_2px_10px_rgb(0,0,0,0.02)] transition-colors relative overflow-hidden group">
                      <div className="absolute top-0 left-0 w-1 h-full bg-teal-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            Consultation Record
                            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{new Date(record.createdAt).toLocaleDateString()}</span>
                          </h3>
                          <p className="text-sm text-teal-700 font-medium mt-1 flex items-center gap-1.5">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                            {record.doctor?.name || "Consulting Doctor"}
                          </p>
                        </div>
                        <button className="text-teal-600 hover:text-teal-800 text-sm font-bold flex items-center gap-1 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg transition-colors">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                          Download PDF
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-6 mt-6 bg-slate-50/50 rounded-xl p-4 border border-slate-100">
                        <div>
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Diagnosis</p>
                          <p className="text-slate-800 text-sm">{record.diagnosis || "No diagnosis provided."}</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Prescription</p>
                          <div className="text-slate-800 text-sm whitespace-pre-wrap">
                            {record.prescription ? (
                              <ul className="list-disc pl-4 space-y-1">
                                {(() => {
                                  try {
                                    const parsed = JSON.parse(record.prescription);
                                    if (Array.isArray(parsed) && parsed.length > 0) {
                                      // Render depending on what keys exist (handle different clinic categories dynamically)
                                      return parsed.map((item: any, idx: number) => (
                                        <li key={idx}>
                                          {Object.values(item).filter(v => typeof v === 'string' && v.trim() !== '').join(' - ')}
                                        </li>
                                      ));
                                    }
                                    return <li>No valid prescription data.</li>;
                                  } catch(e) {
                                    return <li>{record.prescription}</li>;
                                  }
                                })()}
                              </ul>
                            ) : (
                              "No prescription provided."
                            )}
                          </div>
                        </div>
                        {record.notes && (
                          <div className="col-span-2 mt-2 pt-4 border-t border-slate-200/60">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Doctor's Notes</p>
                            <p className="text-slate-700 text-sm italic">{record.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
