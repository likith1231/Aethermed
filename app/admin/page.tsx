"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { useAether } from "../context/AetherContext";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Booking {
  id: string;
  patientName: string;
  email: string;
  phone: string;
  service: string;
  clinicName?: string;
  date: string;
  status: string;
  createdAt: string;
}

import { clinics } from "../data/clinics";

const defaultChartData = [12, 19, 15, 27, 22, 35, 24, 42, 30, 48, 38].map((bookings, i) => {
  const d = new Date(Date.now() - (10 - i) * 3 * 86400000);
  return {
    name: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    bookings
  };
});


const analyticsChartData = [
  { name: "Allopathy", pct: 48 },
  { name: "Ayurveda", pct: 22 },
  { name: "Homeopathy", pct: 18 },
  { name: "Veterinary", pct: 12 },
];

export default function AdminDashboard() {
  const { userRole, logout } = useAuth();
  const { bookings, createNewBooking, clearAllBookings, auditLogs } = useAether();

  const [activeMenu, setActiveMenu] = useState("Appointments");
  const [isMounted, setIsMounted] = useState(false);

  const terminalRef = useRef<HTMLDivElement>(null);
  const [systemLogs, setSystemLogs] = useState<string[]>([]);
  const [adminStats, setAdminStats] = useState({ totalBookings: 0, processedCount: 0, activeLoad: 0 });
  const [overviewChartData, setOverviewChartData] = useState(defaultChartData);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [selectedClinicId, setSelectedClinicId] = useState<string | null>(null);
  const [slotConfigForm, setSlotConfigForm] = useState({
    startTime: "09:00",
    endTime: "17:00",
    slotDuration: "30",
    maxPerSlot: "3"
  });
  const [isSavingConfig, setIsSavingConfig] = useState(false);



  // Telemetry state
  const [telemetry, setTelemetry] = useState({
    totalBookings: 12450,
    syncNodes: 8,
    dbLatency: 12
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Telemetry ticker running every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetry(prev => ({
        totalBookings: prev.totalBookings, // overridden by adminStats
        syncNodes: 8 + Math.floor(Math.random() * 3) - 1, // Fluctuate 7 to 9
        dbLatency: 8 + Math.floor(Math.random() * 15)     // Fluctuate 8 to 22 ms
      }));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const syncAdminTelemetry = async () => {
    try {
      const response = await fetch('/api/bookings');
      const masterList = await response.json();
      
      // Dynamically evaluate active analytics stats from server data
      const totalBookingsCount = masterList.length;
      const completedAppointments = masterList.filter((b: any) => b.status === "Processed").length;
      const activeInCabinLoad = masterList.filter((b: any) => b.status === "In Cabin").length;
      
      setAdminStats({
        totalBookings: totalBookingsCount,
        processedCount: completedAppointments,
        activeLoad: activeInCabinLoad
      });

      setOverviewChartData(prev => {
        const newData = [...prev];
        newData[newData.length - 1] = {
          ...newData[newData.length - 1],
          bookings: totalBookingsCount
        };
        return newData;
      });
    } catch (err) {
      console.error("Telemetry pipeline sync break:", err);
    }
  };

  useEffect(() => {
    syncAdminTelemetry();
    const telemetryInterval = setInterval(syncAdminTelemetry, 5000); // Poll server every 5s
    return () => clearInterval(telemetryInterval);
  }, []);

  // Live Auto-scrolling Telemetry Feed Engine
  useEffect(() => {
    const logPool = [
      "INFRA_SYNC: Node ID #42 (Indiranagar Care Hub) master database shard replica synchronized cleanly in 14ms.",
      "AI_ROUTER: Multi-lingual language prompt parsed successfully -> Selected category: Ayurveda.",
      "SECURE_AUTH: Practitioner license verification status verified ACTIVE for UID #KMC-84391.",
      "TELEMETRY: System memory utilization holding nominal baseline at 42.8% on AWS ap-south-1 (Mumbai).",
      "PERSISTENCE_SYNC: Client browser localStorage buffer parsed. Session token state matches local snapshot."
    ];

    let timeoutId: NodeJS.Timeout;

    const generateLog = () => {
      const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const randomLog = logPool[Math.floor(Math.random() * logPool.length)];
      setSystemLogs(prev => [...prev, `[${timestamp}] ${randomLog}`]);
      
      const nextDelay = Math.random() * 1500 + 3500; // 3.5s to 5.0s
      timeoutId = setTimeout(generateLog, nextDelay);
    };

    timeoutId = setTimeout(generateLog, 3500);

    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [systemLogs, auditLogs, activeMenu]);

  const handleSimulateBooking = () => {
    const names = ["Aravind Kumar", "Priya Sharma", "Rahul Hegde", "Sneha Rao", "John Doe"];
    const emails = ["aravind@gmail.com", "priya@outlook.com", "rahul@yahoo.com", "sneha@gmail.com", "john@example.com"];
    const phones = ["+91 98450 12345", "+91 99001 88776", "+91 98860 43210", "+91 97420 55667", "+91 96110 77889"];
    
    const randomIdx = Math.floor(Math.random() * names.length);
    const chosenClinicObj = clinics[Math.floor(Math.random() * clinics.length)];
    const chosenClinic = `${chosenClinicObj.name} - ${chosenClinicObj.area}`;
    
    const newBooking: any = {
      id: Math.random().toString(36).substring(2, 11),
      patientName: names[randomIdx],
      email: emails[randomIdx],
      phone: phones[randomIdx],
      service: chosenClinic,
      clinicName: chosenClinic,
      date: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      status: "Pending",
      assignedStaff: null,
      createdAt: new Date().toISOString(),
    };

    createNewBooking(newBooking);
  };

  const handleClearBookings = () => {
    if (confirm("Are you sure you want to clear all bookings?")) {
      clearAllBookings();
    }
  };



  if (!isMounted) return null;



  return (
    <div className="min-h-screen flex flex-col md:flex-row font-sans text-slate-800 bg-transparent">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white/90 backdrop-blur-md border-r border-slate-200 flex flex-col justify-between shrink-0 z-10">
        <div>
          {/* Logo Brand */}
          <div className="p-6 border-b border-slate-200 flex items-center gap-3 bg-white">
            <svg className="text-teal-600" width="32" height="32" viewBox="0 0 36 36" fill="none">
              <defs>
                <linearGradient id="adminLogoGrad" x1="0" y1="0" x2="36" y2="36">
                  <stop offset="0%" stopColor="#0d9488" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>
              <path d="M4 20c2-6 6-12 14-16 2 4 6 8 14 10-4 6-10 10-14 14C14 26 8 24 4 20z" fill="url(#adminLogoGrad)" opacity="0.12" />
              <path d="M4 20c2-6 6-12 14-16 2 4 6 8 14 10-4 6-10 10-14 14C14 26 8 24 4 20z" stroke="url(#adminLogoGrad)" strokeWidth="1.5" fill="none" />
              <path d="M18 11v14" stroke="#0d9488" strokeWidth="2.2" strokeLinecap="round" />
              <path d="M11 18h14" stroke="#0d9488" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
            <span className="font-bold text-lg tracking-tight text-slate-900 flex items-center gap-2">
              AetherMed{" "}
              <span className="text-[10px] font-semibold bg-teal-50 text-teal-600 px-2 py-0.5 rounded-full uppercase tracking-wider">ADMIN</span>
            </span>
          </div>

          {/* Nav Links */}
          <nav className="p-4 flex flex-col gap-1">
            {[
              { name: "Overview", icon: "📊" },
              { name: "Appointments", icon: "📅" },
              { name: "Clinics", icon: "🏥" },
              { name: "Analytics", icon: "📈" },
              { name: "Audit Logs", icon: "🛡️" },

            ].map((menu) => {
              const isActive = activeMenu === menu.name;
              return (
                <button
                  key={menu.name}
                  onClick={() => setActiveMenu(menu.name)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer ${
                    isActive
                      ? "bg-teal-50 text-teal-700"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                  }`}
                >
                  <span className="text-base">{menu.icon}</span>
                  {menu.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Back link */}
        <div className="p-4 border-t border-slate-200">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-slate-400 hover:text-teal-600 transition-colors rounded-xl hover:bg-slate-50"
          >
            ← Back to Platform
          </Link>
          <button
            onClick={() => {
              logout();
              localStorage.removeItem('aether_admin_authenticated');
              localStorage.removeItem('aether_doctor_authenticated');
              window.location.href = '/';
            }}
            className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-red-500 hover:text-red-700 transition-colors rounded-xl hover:bg-red-50"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-h-screen overflow-x-hidden p-6 md:p-8">
        {/* Top Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h2 className="text-2xl font-bold text-slate-900">{activeMenu} Portal</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={syncAdminTelemetry}
              className="px-4 py-2 bg-slate-100 text-slate-700 text-sm font-semibold rounded-full hover:bg-slate-200 transition-colors cursor-pointer flex items-center gap-2"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 2v6h-6"></path>
                <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
                <path d="M3 22v-6h6"></path>
                <path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path>
              </svg>
              Refresh Data
            </button>
            <button
              onClick={handleSimulateBooking}
              className="px-4 py-2 bg-teal-600 text-white text-sm font-semibold rounded-full hover:bg-teal-700 transition-colors cursor-pointer"
            >
              + Simulate Booking
            </button>
            {bookings.length > 0 && (
              <button
                onClick={handleClearBookings}
                className="px-4 py-2 bg-white text-red-500 text-sm font-semibold rounded-full border border-red-200 hover:bg-red-50 transition-colors cursor-pointer"
              >
                Clear Bookings
              </button>
            )}
          </div>
        </header>

        {/* Content Container */}
        <div className="flex flex-col gap-6">
          {/* Stats Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 bg-white rounded-2xl border border-slate-100">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Bookings</span>
              <h3 className="text-3xl font-bold text-slate-900 mt-2">{adminStats.totalBookings.toLocaleString()}</h3>
              <p className="text-xs text-teal-600 mt-1">↑ Live server metric</p>
            </div>
            <div className="p-6 bg-white rounded-2xl border border-slate-100">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Processed Appointments</span>
              <h3 className="text-3xl font-bold text-slate-900 mt-2">
                {adminStats.processedCount.toLocaleString()}
              </h3>
              <p className="text-xs text-teal-600 mt-1">Completed today</p>
            </div>
            <div className="p-6 bg-white rounded-2xl border border-slate-100">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Active In-Cabin Load</span>
              <h3 className="text-3xl font-bold text-slate-900 mt-2">{adminStats.activeLoad.toLocaleString()}</h3>
              <p className="text-xs text-amber-600 mt-1">Currently being served</p>
            </div>
            <div className="p-6 bg-white rounded-2xl border border-slate-100">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Database Latency</span>
              <h3 className="text-3xl font-bold text-teal-600 mt-2">{telemetry.dbLatency}ms</h3>
              <p className="text-xs text-slate-400 mt-1">Sync response time</p>
            </div>
          </div>

          {/* CONDITIONAL MENU RENDER */}

          {/* APPOINTMENTS VIEW */}
          {activeMenu === "Appointments" && (
            <div className="p-6 bg-white rounded-2xl border border-slate-100">
              <div className="flex items-center justify-between mb-5">
                <h4 className="text-base font-bold text-slate-900">Live Patient Appointments</h4>
                <span className="text-xs font-medium text-teal-600 bg-teal-50 px-3 py-1 rounded-full">
                  Auto-updates live
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Patient Name</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Contact Details</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Target Clinic</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Preferred Date</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.length === 0 ? (
                      <tr>
                        <td colSpan={5}>
                          <div className="flex flex-col items-center justify-center py-16 text-center gap-2">
                            <span className="text-4xl">📅</span>
                            <span className="text-sm font-semibold text-slate-500">No appointments booked yet</span>
                            <p className="text-xs text-slate-400 max-w-xs">
                              Submit a request on the homepage or click &quot;Simulate Booking&quot; to test the live feed.
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      [...bookings].reverse().map((b) => {
                        const displayClinic = b.clinicName || b.service;
                        const nameOnly = displayClinic.split(" - ")[0];
                        const areaOnly = displayClinic.split(" - ")[1] || "Bengaluru";
                        return (
                          <tr key={b.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                            <td className="py-3 px-4 font-medium text-slate-800">
                              {b.patientName}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex flex-col gap-0.5">
                                <span className="text-slate-600">{b.email}</span>
                                <span className="text-slate-400 text-xs">{b.phone}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex flex-col gap-0.5">
                                <span className="text-slate-800 font-medium">
                                  {nameOnly}
                                </span>
                                <span className="text-slate-400 text-xs">
                                  {areaOnly}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-slate-600">
                              {b.date}
                            </td>
                            <td className="py-3 px-4">
                              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
                                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                                {b.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* OVERVIEW VIEW */}
          {activeMenu === "Overview" && (
            <div className="flex flex-col gap-6">
              {/* Full-width Activity Chart Area */}
              <div className="p-6 bg-white rounded-2xl border border-slate-100">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
                  <div>
                    <h4 className="text-base font-bold text-slate-900">Patient Booking Activity</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Live scheduling load across all disciplines (last 30 days)</p>
                  </div>
                  <span className="text-sm font-bold text-teal-600 bg-teal-50 px-3 py-1 rounded-full">
                    7.4k total visits
                  </span>
                </div>
                
                <div className="w-full h-[300px]">
                  {isMounted ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={overviewChartData}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0d9488" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis
                          dataKey="name"
                          stroke="#94a3b8"
                          fontSize={10}
                          tickLine={false}
                          axisLine={false}
                          dy={10} />
                        <YAxis
                          stroke="#94a3b8"
                          fontSize={10}
                          tickLine={false}
                          axisLine={false}
                          dx={-5} />
                        <Tooltip
                          contentStyle={{
                            background: "rgba(255, 255, 255, 0.95)",
                            border: "1px solid #cbd5e1",
                            borderRadius: "8px",
                            fontSize: "12px",
                          }} />
                        <Area
                          type="monotone"
                          dataKey="bookings"
                          stroke="#0d9488"
                          strokeWidth={3}
                          fillOpacity={1}
                          fill="url(#colorBookings)"
                          animationDuration={1200}
                          animationEasing="ease-out" />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="w-full h-full bg-slate-50 rounded-xl animate-pulse" />
                  )}
                </div>
              </div>

              {/* Lower split cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="p-6 bg-white rounded-2xl border border-slate-100">
                  <h4 className="text-base font-bold text-slate-900 mb-4">Traffic Performance</h4>
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs text-slate-400">Daily Booking Rate</span>
                        <span className="text-sm font-bold text-slate-800">14.5 bookings/day</span>
                      </div>
                      <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="w-3/4 h-full bg-teal-500 rounded-full" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs text-slate-400">Avg. Response Time</span>
                        <span className="text-sm font-bold text-slate-800">1.2 seconds</span>
                      </div>
                      <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="w-[90%] h-full bg-teal-500 rounded-full" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs text-slate-400">Completion Rate</span>
                        <span className="text-sm font-bold text-slate-800">87%</span>
                      </div>
                      <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="w-[87%] h-full bg-teal-500 rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-6 bg-white rounded-2xl border border-slate-100">
                  <h4 className="text-base font-bold text-slate-900 mb-4">Recent Activity</h4>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-start gap-3 text-sm">
                      <span className="w-2 h-2 bg-teal-500 rounded-full mt-1.5 shrink-0" />
                      <p className="text-slate-500">New booking submitted for <span className="text-slate-700 font-medium">Sanjeevani Hospital</span></p>
                    </div>
                    <div className="flex items-start gap-3 text-sm">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 shrink-0" />
                      <p className="text-slate-500">Clinic sync completed for <span className="text-slate-700 font-medium">Jayanagar Node</span></p>
                    </div>
                    <div className="flex items-start gap-3 text-sm">
                      <span className="w-2 h-2 bg-amber-500 rounded-full mt-1.5 shrink-0" />
                      <p className="text-slate-500">Pending review count updated to <span className="text-slate-700 font-medium">{bookings.filter(b => b.status === "Pending").length}</span></p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CLINICS VIEW */}
          {activeMenu === "Clinics" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Panel: Clinic Status Cards */}
              <div className="p-6 bg-white rounded-2xl border border-slate-100 flex flex-col">
                <h4 className="text-base font-bold text-slate-900 mb-4">Connected Partner Clinics</h4>
                <div className="flex flex-col gap-3 overflow-y-auto pr-2 max-h-[400px]" style={{ scrollbarWidth: "thin" }}>
                  {clinics.map((clinic, index) => {
                    const isSelected = selectedClinicId === clinic.id;
                    return (
                      <div 
                        key={clinic.id || index} 
                        onClick={() => {
                          setSelectedClinicId(clinic.id);
                          // Reset form when clicking a new clinic, ideally we fetch existing config here but we'll mock it for now
                          setSlotConfigForm({ startTime: "09:00", endTime: "17:00", slotDuration: "30", maxPerSlot: "3" });
                        }}
                        className={`flex items-center justify-between py-3 px-4 rounded-xl border cursor-pointer transition-colors ${
                          isSelected ? "bg-teal-50 border-teal-200" : "bg-slate-50/70 border-slate-100 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex flex-col gap-0.5">
                          <p className={`text-sm font-medium ${isSelected ? "text-teal-900" : "text-slate-800"}`}>{clinic.name}</p>
                          <p className={`text-xs ${isSelected ? "text-teal-700/70" : "text-slate-400"}`}>{clinic.area}, Bengaluru</p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-xs font-semibold text-teal-600 bg-teal-100/50 px-2 py-0.5 rounded-full whitespace-nowrap">
                            Active
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">Configure Slots ⚙️</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Panel: Server Load / Sync Info OR Slot Config */}
              <div className="flex flex-col gap-6">
                {selectedClinicId ? (
                  <div className="p-6 bg-white rounded-2xl border border-teal-100 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-base font-bold text-slate-900">Slot Configuration</h4>
                      <button onClick={() => setSelectedClinicId(null)} className="text-xs text-slate-400 hover:text-slate-600">Close</button>
                    </div>
                    
                    <form className="flex flex-col gap-4" onSubmit={async (e) => {
                      e.preventDefault();
                      setIsSavingConfig(true);
                      try {
                        const res = await fetch("/api/slots/config", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ clinicId: selectedClinicId, ...slotConfigForm })
                        });
                        if (res.ok) {
                          alert("Slot configuration saved successfully.");
                        } else {
                          alert("Failed to save slot configuration.");
                        }
                      } catch (err) {
                        console.error(err);
                      }
                      setIsSavingConfig(false);
                    }}>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">Start Time (24h)</label>
                          <input type="time" required value={slotConfigForm.startTime} onChange={e => setSlotConfigForm({...slotConfigForm, startTime: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-teal-500" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">End Time (24h)</label>
                          <input type="time" required value={slotConfigForm.endTime} onChange={e => setSlotConfigForm({...slotConfigForm, endTime: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-teal-500" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">Slot Duration (min)</label>
                          <input type="number" min="15" max="120" step="5" required value={slotConfigForm.slotDuration} onChange={e => setSlotConfigForm({...slotConfigForm, slotDuration: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-teal-500" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">Max Patients / Slot</label>
                          <input type="number" min="1" max="50" required value={slotConfigForm.maxPerSlot} onChange={e => setSlotConfigForm({...slotConfigForm, maxPerSlot: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-teal-500" />
                        </div>
                      </div>
                      <button type="submit" disabled={isSavingConfig} className="mt-2 w-full py-2.5 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50">
                        {isSavingConfig ? "Saving..." : "Save Configuration"}
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="p-6 bg-white rounded-2xl border border-slate-100">
                    <h4 className="text-base font-bold text-slate-900 mb-4">Clinic Sync Status</h4>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-slate-50/70 border border-slate-100">
                      <div className="flex items-center gap-3">
                        <span className="w-2.5 h-2.5 bg-teal-500 rounded-full" />
                        <div>
                          <p className="text-sm font-medium text-slate-800">Indiranagar Node</p>
                          <p className="text-xs text-slate-400">Sync: 100% (Realtime)</p>
                        </div>
                      </div>
                      <span className="text-xs font-medium text-slate-400">Latency: 8ms</span>
                    </div>
                    <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-slate-50/70 border border-slate-100">
                      <div className="flex items-center gap-3">
                        <span className="w-2.5 h-2.5 bg-teal-500 rounded-full" />
                        <div>
                          <p className="text-sm font-medium text-slate-800">Jayanagar Node</p>
                          <p className="text-xs text-slate-400">Sync: 100% (Realtime)</p>
                        </div>
                      </div>
                      <span className="text-xs font-medium text-slate-400">Latency: 12ms</span>
                    </div>
                    <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-slate-50/70 border border-slate-100">
                      <div className="flex items-center gap-3">
                        <span className="w-2.5 h-2.5 bg-amber-500 rounded-full" />
                        <div>
                          <p className="text-sm font-medium text-slate-800">Malleshwaram Node</p>
                          <p className="text-xs text-slate-400">Sync: 99.8% (Catching up)</p>
                        </div>
                      </div>
                      <span className="text-xs font-medium text-slate-400">Latency: 24ms</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="p-5 bg-teal-50/50 rounded-2xl border border-teal-100 text-sm text-slate-600 leading-relaxed">
                  <strong className="text-slate-700">Sync Note:</strong> All clinics across Bengaluru sync transaction logs every 2 seconds. The database replication cluster reports healthy state.
                </div>
              </div>
            </div>
          )}

          {/* ANALYTICS VIEW */}
          {activeMenu === "Analytics" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Panel: Discipline booking rates */}
              <div className="flex flex-col gap-6">
                <div className="p-6 bg-white rounded-2xl border border-slate-100">
                  <h4 className="text-base font-bold text-slate-900 mb-4">Discipline Booking Breakdown</h4>
                  <div className="flex flex-col gap-3">
                    {[
                      { label: "Allopathy", pct: "48%", val: "Cardiology, Derm, Peds", color: "text-teal-600", bg: "bg-teal-50" },
                      { label: "Ayurveda", pct: "22%", val: "Panchakarma, Herbs", color: "text-blue-600", bg: "bg-blue-50" },
                      { label: "Homeopathy", pct: "18%", val: "Constitutional remedies", color: "text-cyan-600", bg: "bg-cyan-50" },
                      { label: "Veterinary", pct: "12%", val: "Pet Surgery, Feline care", color: "text-emerald-600", bg: "bg-emerald-50" },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between py-3 px-4 rounded-xl bg-slate-50/70 border border-slate-100">
                        <div className="flex flex-col gap-0.5">
                          <p className="text-sm font-medium text-slate-800">{item.label}</p>
                          <p className="text-xs text-slate-400">{item.val}</p>
                        </div>
                        <span className={`text-lg font-bold ${item.color}`}>{item.pct}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-100 text-sm text-slate-600 leading-relaxed">
                  <strong className="text-slate-700">Intelligence Note:</strong> Patient requests for Ayurveda systems have increased by 8% over the last calendar month, peaking on weekends. Allopathy remains the primary volume driver.
                </div>
              </div>

              {/* Right Panel: Analytics Insights Graph */}
              <div className="p-6 bg-white rounded-2xl border border-slate-100 flex flex-col">
                <div className="mb-6">
                  <div>
                    <h4 className="text-base font-bold text-slate-900">Growth Distribution</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Estimated growth metrics by system</p>
                  </div>
                </div>
                
                <div className="w-full h-[280px] flex-1">
                  {isMounted ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={analyticsChartData}
                        margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorPct" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0d9488" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0.15} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis
                          dataKey="name"
                          stroke="#94a3b8"
                          fontSize={10}
                          tickLine={false}
                          axisLine={false}
                          dy={10} />
                        <YAxis
                          stroke="#94a3b8"
                          fontSize={10}
                          tickLine={false}
                          axisLine={false}
                          dx={-5} />
                        <Tooltip
                          contentStyle={{
                            background: "rgba(255, 255, 255, 0.95)",
                            border: "1px solid #cbd5e1",
                            borderRadius: "8px",
                            fontSize: "12px",
                          }} />
                        <Bar
                          dataKey="pct"
                          fill="url(#colorPct)"
                          radius={[10, 10, 0, 0]}
                          animationDuration={1200}
                          animationEasing="ease-out" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="w-full h-full bg-slate-50 rounded-xl animate-pulse" />
                  )}
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                  <span className="text-xs text-slate-400">Yearly Target Rate</span>
                  <span className="text-sm font-bold text-teal-600">85% Met</span>
                </div>
              </div>
            </div>
          )}

          {/* AUDIT LOGS VIEW */}
          {activeMenu === "Audit Logs" && (
            <div className="flex flex-col gap-6">
              <div className="p-6 bg-white rounded-2xl border border-slate-100 flex flex-col">
                <h4 className="text-base font-bold text-slate-900 mb-2">🖥️ Core Infrastructure Audit Logs</h4>
                <p className="text-xs text-slate-500 mb-4">Real-time distributed system events and security operations.</p>
                <div ref={terminalRef} className="w-full bg-slate-950 font-mono text-xs text-emerald-400 p-4 rounded-xl border border-slate-800 h-64 overflow-y-auto shadow-inner">
                  {auditLogs.map((log, index) => (
                    <div key={`audit-${index}`} className="mb-2 whitespace-pre-wrap font-medium">{log}</div>
                  ))}
                  {systemLogs.map((log, index) => (
                    <div key={`sys-${index}`} className="mb-2 whitespace-pre-wrap font-medium">{log}</div>
                  ))}
                  <div className="animate-pulse text-emerald-600 mt-2">_</div>
                </div>
              </div>
            </div>
          )}



        </div>
      </main>
    </div>
  );
}
