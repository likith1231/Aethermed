"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import { useAether, Booking } from "../context/AetherContext";
import clinicsData from "../../clinics_data.json";
import { useSession, signOut } from "next-auth/react";

interface StaffMember {
  id: string;
  name: string;
  role: "Nurse" | "Intern" | "Technician";
  specialization: string;
}

export default function DoctorPortal() {
  const { data: session, status } = useSession();
  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("Dashboard");

  
  // Login State
  const [license, setLicense] = useState("");
  const [email, setEmail] = useState("");
  const [pin, setPin] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);

  // Data State
  const { bookings, updateBookingStatus, assignBookingStaff, addAuditLog, setBookings, showToast } = useAether();
  const [staffList, setStaffList] = useState<StaffMember[]>([
    { id: "S-1", name: "Nurse Lakshmi", role: "Nurse", specialization: "General Ward" },
    { id: "S-2", name: "Dr. Ashwin Rao (Intern)", role: "Intern", specialization: "Pediatrics" },
    { id: "S-3", name: "Nurse Priyanka", role: "Nurse", specialization: "Triage" },
    { id: "S-4", name: "Dr. Kavitha Hegde (Intern)", role: "Intern", specialization: "Surgery" },
  ]);

  // New Staff Form State
  const [newStaffName, setNewStaffName] = useState("");
  const [newStaffRole, setNewStaffRole] = useState<"Nurse" | "Intern" | "Technician">("Nurse");
  const [newStaffSpec, setNewStaffSpec] = useState("");

  // Process Visit Modal State
  const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);
  const [activeProcessBooking, setActiveProcessBooking] = useState<Booking | null>(null);
  const [isFinalizing, setIsFinalizing] = useState(false);

  // Billing State
  const [consultFee, setConsultFee] = useState<number>(500);
  const [diagFee, setDiagFee] = useState<number>(0);
  const [pharmacyFee, setPharmacyFee] = useState<number>(0);

  // Prescription State
  const [prescriptionRows, setPrescriptionRows] = useState<any[]>([{}]);
  const [diagnosis, setDiagnosis] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [patientHistory, setPatientHistory] = useState<any[]>([]);

  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });

  // Leave Form State
  const [leaveDate, setLeaveDate] = useState("");
  const [leaveStartTime, setLeaveStartTime] = useState("");
  const [leaveEndTime, setLeaveEndTime] = useState("");
  const [leaveReason, setLeaveReason] = useState("");
  const [leaveLoading, setLeaveLoading] = useState(false);

  const generatedStaffMetrics = useMemo(() => {
    const dailyThroughput = Math.floor(Math.random() * (54 - 38 + 1)) + 38;
    const internsActive = Math.floor(Math.random() * (4 - 1 + 1)) + 1;
    const nurseShifts = Math.floor(Math.random() * (5 - 2 + 1)) + 2;
    return { dailyThroughput, internsActive, nurseShifts };
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      window.location.replace("/doctor/auth");
    } else if (status === "authenticated") {
      setIsMounted(true);
    }
  }, [status]);

  const addStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName || !newStaffSpec) return;
    const newStaff: StaffMember = {
      id: `S-${Math.random().toString(36).substr(2, 5)}`,
      name: newStaffName,
      role: newStaffRole,
      specialization: newStaffSpec,
    };
    setStaffList([...staffList, newStaff]);
    setNewStaffName("");
    setNewStaffSpec("");
  };

  const updateStatus = (id: string, newStatus: any) => {
    updateBookingOnServer(id, { status: newStatus }).then((res) => {
      if (newStatus === "In Cabin" && res && res.booking) {
        showToast(`Patient ${res.booking.patientName} has been called to the cabin.`, 'info');
      }
    });
  };

  const assignStaff = (id: string, staffName: string) => {
    updateBookingOnServer(id, { assignedStaff: staffName });
  };

  const openProcessModal = (b: Booking) => {
    setActiveProcessBooking(b);
    setConsultFee(500);
    setDiagFee(0);
    setPharmacyFee(0);
    setPrescriptionRows([{}]);
    setDiagnosis("");
    setNotes("");
    setNotes("");
    setPatientHistory([]);
    setIsProcessModalOpen(true);

    fetch(`/api/health-records?patientId=${b.patientId}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setPatientHistory(data);
      })
      .catch(console.error);
  };

  const addPrescriptionRow = () => {
    setPrescriptionRows([...prescriptionRows, {}]);
  };

  if (!isMounted || status !== "authenticated") return null;

  // Find My Clinic Data
  const sessionClinicId = (session?.user as any)?.clinicId;
  const myClinic = clinicsData.find(c => c.id === sessionClinicId) || clinicsData[0];
  
  const refreshRoster = async () => {
    try {
      const response = await fetch(`/api/bookings?clinicName=${encodeURIComponent(myClinic.name)}&t=${Date.now()}`);
      const freshBookings = await response.json();
      if (freshBookings && Array.isArray(freshBookings)) {
        setBookings(freshBookings);
      }
    } catch (err) {
      console.error("Refresh failed", err);
    }
  };
  
  const activeFilteredBookings = bookings.filter(b => {
    if (b.clinicName !== myClinic.name) return false;
    // Some older mock records might use timeInput, new records use date
    const dateStr = b.date || (b as any).timeInput || "";
    return dateStr.startsWith(selectedDate) || dateStr.includes(selectedDate);
  });
  const totalQueueCount = activeFilteredBookings.length;
  const pendingCount = activeFilteredBookings.filter(b => b.status === "Pending" || b.status?.toLowerCase() === "pending").length;

  const { dailyThroughput, internsActive, nurseShifts } = generatedStaffMetrics;

  const updateBookingOnServer = async (id: string, updatedFields: { status?: string; assignedStaff?: string | null; diagnosis?: string; prescription?: string; notes?: string; doctorId?: string }) => {
    try {
      // Optimistically update the UI to instantly reflect the processed state
      setBookings(bookings.map((b: any) => b.id === id ? { ...b, ...updatedFields } : b));
      
      const response = await fetch('/api/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updatedFields })
      });
      const data = await response.json();
      if (data.success) {
        // Re-fetch the updated master roster from the server to refresh the UI view reactively
        const freshRoster = await fetch(`/api/bookings?clinicName=${encodeURIComponent(myClinic.name)}`);
        const updatedList = await freshRoster.json();
        setBookings(updatedList);
      }
      return data;
    } catch (err) {
      console.error("Failed to persist status change to API server:", err);
      return null;
    }
  };

  const subTotal = consultFee + diagFee + pharmacyFee;
  const tax = subTotal * 0.05; // 5% CGST+SGST
  const grandTotal = subTotal + tax;

  const handlePrintReceipt = () => {
    if (!activeProcessBooking) return;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>AetherMed Network — Official Receipt</title>
            <style>
              body { font-family: sans-serif; padding: 40px; color: #333; }
              .header { border-bottom: 2px solid #0f766e; padding-bottom: 12px; margin-bottom: 20px; }
              .meta-grid { display: flex; justify-content: space-between; margin-bottom: 30px; font-size: 14px; }
              table { border-collapse: collapse; width: 100%; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
              th { background-color: #f3f4f6; }
              .total-block { text-align: right; margin-top: 30px; font-weight: bold; font-size: 18px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h2>AETHERMED CLINICAL NETWORK</h2>
              <p>Hub Node: ${myClinic.name}</p>
            </div>
            <div class="meta-grid">
              <div><strong>Patient Roster ID:</strong> ${activeProcessBooking.patientName}</div>
              <div><strong>Date Window:</strong> ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
            </div>
            <h3>PRESCRIPTION PROFILE MAPPING</h3>
            <p>${myClinic.category} Active Care Plan</p>
            
            <table>
              <thead>
                <tr><th>Billing Line Item Description</th><th>Amount (₹)</th></tr>
              </thead>
              <tbody>
                <tr><td>General Physician Consultation Fee</td><td>${consultFee.toFixed(2)}</td></tr>
                ${diagFee > 0 ? `<tr><td>Diagnostics & Labs</td><td>${diagFee.toFixed(2)}</td></tr>` : ''}
                ${pharmacyFee > 0 ? `<tr><td>Pharmacy Dispensation</td><td>${pharmacyFee.toFixed(2)}</td></tr>` : ''}
                <tr><td>CGST + SGST Healthcare Cess (5%)</td><td>${tax.toFixed(2)}</td></tr>
              </tbody>
            </table>
            <div class="total-block">Grand Invoice Total: ₹${grandTotal.toFixed(2)}</div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
      
      updateBookingOnServer(activeProcessBooking.id, { status: "Processed" });
      setIsProcessModalOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent flex flex-col justify-between pb-12 relative z-10">
      <Navbar />
      <div className="h-20 shrink-0" />

      {/* Verification Banner */}
      <div className="w-full bg-teal-600 text-white py-3 px-6 text-center font-medium shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-center gap-2">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          ✓ Verified Medical Practitioner Status Active for {myClinic.name}
        </div>
      </div>

      <main className="w-full flex-grow px-6 lg:px-8 pt-8 pb-12 flex flex-col items-center">
        
        <div className="w-full max-w-6xl mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Doctor Dashboard
            </h1>
            <p className="text-slate-500 mt-2 mb-4">Manage appointments and clinical operations for your specific facility.</p>
            <div className="flex gap-2">
              {[
                { label: "Yesterday", date: new Date(Date.now() - 86400000) },
                { label: "Today", date: new Date() },
                { label: "Tomorrow", date: new Date(Date.now() + 86400000) }
              ].map(d => {
                const dateStr = `${d.date.getFullYear()}-${String(d.date.getMonth() + 1).padStart(2, '0')}-${String(d.date.getDate()).padStart(2, '0')}`;
                return (
                <div key={d.label} onClick={() => setSelectedDate(dateStr)} className={`px-4 py-2 rounded-lg text-sm font-semibold border cursor-pointer transition-colors ${
                  selectedDate === dateStr ? "bg-red-50 text-red-600 border-red-200 shadow-sm" : "bg-white text-slate-500 border-slate-200"
                }`}>
                  {d.date.toLocaleDateString('en-US', { month: 'short', day: '2-digit' })}
                </div>
              )})}
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-3">
            <button
              onClick={() => {
                const nextPatient = activeFilteredBookings.find(b => b.status === "Pending");
                if (nextPatient) {
                  updateStatus(nextPatient.id, "In Cabin");
                }
              }}
              className="bg-emerald-100 text-emerald-800 border border-emerald-200 px-4 py-2 font-bold rounded-lg shadow-sm hover:bg-emerald-200 transition-colors self-end w-fit flex items-center gap-2"
            >
              🔔 Call Next Patient
            </button>
            <div className="flex bg-slate-100 p-1 rounded-xl shadow-inner">
            {["Dashboard", "My Clinic Profile", "Clinic Management"].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                  activeTab === tab ? "bg-white text-teal-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {tab}
              </button>
            ))}
              <button
                onClick={() => {
                  localStorage.removeItem('aether_doctor_authenticated');
                  localStorage.removeItem('aether_admin_authenticated');
                  signOut({ callbackUrl: '/' });
                }}
                className="px-4 py-2 text-sm font-semibold rounded-lg text-red-500 hover:text-red-700 transition-colors ml-2"
              >
              Sign Out
            </button>
          </div>
        </div>
        </div>

        {activeTab === "Dashboard" && (
          <>
            {/* Multi-Tenant Summary Matrix Cards */}
            <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Today's Queue</span>
                <div className="flex items-end gap-3">
                  <span className="text-3xl font-bold text-slate-900">{bookings.length}</span>
                  <span className="text-xs font-medium text-amber-600 mb-1 bg-amber-50 px-2 py-0.5 rounded-full">{pendingCount} Pending</span>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Daily Throughput</span>
                <div className="flex items-end gap-3">
                  <span className="text-3xl font-bold text-slate-900">{dailyThroughput}</span>
                  <span className="text-xs font-medium text-teal-600 mb-1 bg-teal-50 px-2 py-0.5 rounded-full">Optimal</span>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Interns Active</span>
                <div className="flex items-end gap-3">
                  <span className="text-3xl font-bold text-slate-900">{internsActive}</span>
                  <span className="text-xs font-medium text-blue-600 mb-1 bg-blue-50 px-2 py-0.5 rounded-full">On floor</span>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Nurse Shifts</span>
                <div className="flex items-end gap-3">
                  <span className="text-3xl font-bold text-slate-900">{nurseShifts}</span>
                  <span className="text-xs font-medium text-purple-600 mb-1 bg-purple-50 px-2 py-0.5 rounded-full">Assigned</span>
                </div>
              </div>
            </div>

            {/* Active Booking Control Table with Delegation */}
            <div className="w-full max-w-6xl bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <h2 className="text-lg font-bold text-slate-800">Active Bookings</h2>
                <button onClick={refreshRoster} className="text-sm font-semibold text-teal-600 hover:text-teal-700 hover:bg-teal-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer">
                  🔄 Refresh Roster
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500">
                      <th className="p-4 font-semibold whitespace-nowrap">Patient</th>
                      <th className="p-4 font-semibold whitespace-nowrap">Service</th>
                      <th className="p-4 font-semibold whitespace-nowrap">Time</th>
                      <th className="p-4 font-semibold whitespace-nowrap">Status</th>
                      <th className="p-4 font-semibold whitespace-nowrap">Assigned Personnel</th>
                      <th className="p-4 font-semibold text-right whitespace-nowrap">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {activeFilteredBookings.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 font-medium text-slate-900 whitespace-nowrap">{b.patientName}</td>
                        <td className="p-4 text-slate-600 whitespace-nowrap">
                          {b.service}
                          {b.isTelemedicine && (
                            <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full border border-blue-200">Telemedicine</span>
                          )}
                        </td>
                        <td className="p-4 font-medium text-slate-700 whitespace-nowrap">{b.date}</td>
                        <td className="p-4 whitespace-nowrap">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            b.status === "Confirmed" ? "bg-teal-100 text-teal-700" :
                            b.status === "In Cabin" ? "bg-indigo-100 text-indigo-700" :
                            b.status === "Pending" ? "bg-amber-100 text-amber-700" :
                            b.status === "Rescheduled" ? "bg-blue-100 text-blue-700" :
                            "bg-red-100 text-red-700"
                          }`}>
                            {b.status}
                          </span>
                        </td>
                        <td className="p-4 whitespace-nowrap">
                          {b.assignedStaff ? (
                            <span className="px-3 py-1 bg-purple-50 text-purple-700 text-xs font-semibold rounded-full flex items-center w-fit gap-2">
                              {b.assignedStaff}
                              <button onClick={() => assignStaff(b.id, "")} className="text-purple-400 hover:text-purple-900 font-bold">×</button>
                            </span>
                          ) : (
                            <div className="flex items-center gap-2">
                              <select 
                                className="px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                onChange={(e) => assignStaff(b.id, e.target.value)}
                                defaultValue=""
                              >
                                <option value="" disabled>Delegate to...</option>
                                {staffList.map(s => <option key={s.id} value={s.name}>{s.name} ({s.role})</option>)}
                              </select>
                            </div>
                          )}
                        </td>
                        <td className="p-4 text-right flex justify-end gap-2 whitespace-nowrap">
                          {b.status === "Pending" || b.status === "In Cabin" ? (
                            <>
                              {b.isTelemedicine && b.telemedicineLink && (
                                <a href={b.telemedicineLink} target="_blank" rel="noreferrer" className="px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded hover:bg-blue-700 transition-colors inline-flex items-center gap-1">
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
                                  Join Call
                                </a>
                              )}
                              <button onClick={() => openProcessModal(b)} className="px-3 py-1.5 bg-teal-600 text-white text-xs font-semibold rounded hover:bg-teal-700 transition-colors">Process Visit</button>
                              <button onClick={() => updateStatus(b.id, "Rescheduled")} className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded hover:bg-slate-50 transition-colors">Reschedule</button>
                            </>
                          ) : (
                            <button disabled className="px-3 py-1.5 bg-slate-100 text-slate-400 text-xs font-semibold rounded cursor-not-allowed">Processed</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {activeTab === "My Clinic Profile" && (
          <div className="w-full max-w-4xl bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Facility Metadata</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Clinic Name</label>
                <div className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium">{myClinic.name}</div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Neighborhood Area</label>
                <div className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium">{myClinic.area}</div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Full Address</label>
                <div className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium">{myClinic.address}</div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Contact Desk</label>
                <div className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium">{myClinic.phone}</div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Operating Hours</label>
                <div className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium">{myClinic.operatingHours}</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "Clinic Management" && (
          <>
          <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex flex-col h-fit">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Add Staff Member</h2>
              <form onSubmit={addStaff} className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Full Name</label>
                  <input required value={newStaffName} onChange={e=>setNewStaffName(e.target.value)} type="text" placeholder="e.g. Joy" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Role</label>
                  <select value={newStaffRole} onChange={e=>setNewStaffRole(e.target.value as any)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-teal-500 outline-none">
                    <option value="Nurse">Nurse</option>
                    <option value="Intern">Medical Intern</option>
                    <option value="Technician">Technician</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Specialization</label>
                  <input required value={newStaffSpec} onChange={e=>setNewStaffSpec(e.target.value)} type="text" placeholder="e.g. Triage, Pediatrics" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none" />
                </div>
                <button type="submit" className="w-full py-2.5 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 transition-colors mt-2">
                  Add to Roster
                </button>
              </form>
            </div>
            
            <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden h-fit">
              <div className="px-6 py-5 border-b border-slate-100 bg-slate-50">
                <h2 className="text-lg font-bold text-slate-900">Staff & Intern Roster</h2>
                <p className="text-sm text-slate-500 mt-1">Manage active personnel assigned to this clinic.</p>
              </div>
              <div className="p-0 overflow-x-auto">
                <table className="w-full text-left min-w-[500px]">
                  <thead>
                    <tr className="border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500 bg-white">
                      <th className="p-4 font-semibold">Name</th>
                      <th className="p-4 font-semibold">Role</th>
                      <th className="p-4 font-semibold">Specialty</th>
                      <th className="p-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {staffList.map(s => (
                      <tr key={s.id} className="hover:bg-slate-50">
                        <td className="p-4 font-medium text-slate-900">{s.name}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                            s.role === "Nurse" ? "bg-purple-50 text-purple-700" :
                            s.role === "Intern" ? "bg-blue-50 text-blue-700" :
                            "bg-orange-50 text-orange-700"
                          }`}>{s.role}</span>
                        </td>
                        <td className="p-4 text-sm text-slate-600">{s.specialization}</td>
                        <td className="p-4 text-right">
                          <button className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded hover:bg-slate-200 transition-colors whitespace-nowrap">
                            Page {s.role}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
          <div className="w-full max-w-6xl mt-8 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden h-fit mb-8 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Doctor Leave / Unavailability</h2>
            <p className="text-sm text-slate-500 mb-6">Mark yourself as unavailable for a specific date and time frame. Existing bookings in this window will be affected, and affected patients will receive a notification.</p>
            <form onSubmit={async (e) => {
              e.preventDefault();
              setLeaveLoading(true);
              try {
                const res = await fetch('/api/doctor/leave', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    doctorId: (session?.user as any)?.id,
                    clinicName: myClinic.name,
                    date: leaveDate,
                    startTime: leaveStartTime || null,
                    endTime: leaveEndTime || null,
                    reason: leaveReason
                  })
                });
                if (res.ok) {
                  alert('Leave marked successfully and notifications dispatched to affected patients.');
                  setLeaveDate(''); setLeaveStartTime(''); setLeaveEndTime(''); setLeaveReason('');
                } else {
                  alert('Failed to mark leave. Please try again.');
                }
              } catch (e) {
                console.error(e);
              }
              setLeaveLoading(false);
            }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Date</label>
                <input required value={leaveDate} onChange={e=>setLeaveDate(e.target.value)} type="date" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Reason (Optional)</label>
                <input value={leaveReason} onChange={e=>setLeaveReason(e.target.value)} type="text" placeholder="e.g. Personal emergency" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Start Time (HH:mm - Optional, leave blank for full day)</label>
                <input value={leaveStartTime} onChange={e=>setLeaveStartTime(e.target.value)} type="time" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">End Time (HH:mm - Optional)</label>
                <input value={leaveEndTime} onChange={e=>setLeaveEndTime(e.target.value)} type="time" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none" />
              </div>
              <div className="md:col-span-2">
                <button type="submit" disabled={leaveLoading} className="px-6 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors mt-2 disabled:bg-red-400">
                  {leaveLoading ? "Processing..." : "Mark as Unavailable & Notify Patients"}
                </button>
              </div>
            </form>
          </div>
          </>
        )}

      </main>

      {isProcessModalOpen && activeProcessBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto flex flex-col">
            {/* Header Section */}
            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center sticky top-0 z-10">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Process Visit: {activeProcessBooking.patientName}</h3>
                <p className="text-sm text-slate-500 mt-1">Booking ID: {activeProcessBooking.id} | Hub: {myClinic.name}</p>
              </div>
              <button onClick={() => setIsProcessModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold text-2xl leading-none">&times;</button>
            </div>

            {/* Body */}
            <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Prescription Pad */}
              <div className="lg:col-span-2 flex flex-col gap-4">
                
                {/* Patient History Section */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200">
                  <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide border-b border-slate-200 pb-2 mb-4">Past Patient History</h4>
                  {patientHistory.length === 0 ? (
                    <p className="text-sm text-slate-500 italic">No past health records found for this patient.</p>
                  ) : (
                    <div className="flex flex-col gap-3 max-h-48 overflow-y-auto pr-2">
                      {patientHistory.map((record: any) => (
                        <div key={record.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-sm">
                          <div className="flex justify-between mb-1">
                            <span className="font-bold text-slate-700">{new Date(record.createdAt).toLocaleDateString()} - Dr. {record.doctor?.name || "Unknown"}</span>
                            <span className="text-slate-500">{record.booking?.clinic?.name || "Unknown Clinic"}</span>
                          </div>
                          <p><strong className="text-slate-600">Diagnosis:</strong> {record.diagnosis || "N/A"}</p>
                          <p><strong className="text-slate-600">Notes:</strong> {record.notes || "N/A"}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide mt-2">Prescription Pad ({myClinic.category})</h4>
                
                {prescriptionRows.map((row, idx) => (
                  <div key={idx} className="flex flex-wrap gap-3 items-end border border-slate-100 p-4 rounded-xl bg-slate-50">
                    {(myClinic.category === "allopathy" || myClinic.category === "veterinary") && (
                      <>
                        <div className="flex-1 min-w-[200px]">
                          <label className="block text-xs font-semibold text-slate-600 mb-1">Medicine Name</label>
                          <input type="text" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white" />
                        </div>
                        <div className="w-24">
                          <label className="block text-xs font-semibold text-slate-600 mb-1">Dosage (mg)</label>
                          <input type="text" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white" />
                        </div>
                        <div className="w-32">
                          <label className="block text-xs font-semibold text-slate-600 mb-1">Frequency</label>
                          <input type="text" placeholder="1-0-1" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white" />
                        </div>
                        <div className="w-24">
                          <label className="block text-xs font-semibold text-slate-600 mb-1">Duration (Days)</label>
                          <input type="text" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white" />
                        </div>
                      </>
                    )}
                    
                    {myClinic.category === "ayurveda" && (
                      <>
                        <div className="flex-1 min-w-[200px]">
                          <label className="block text-xs font-semibold text-slate-600 mb-1">Classical Churna / Kashayam Name</label>
                          <input type="text" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white" />
                        </div>
                        <div className="flex-1 min-w-[150px]">
                          <label className="block text-xs font-semibold text-slate-600 mb-1">Anupana (Vehicle)</label>
                          <input type="text" placeholder="Honey/Warm Water" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white" />
                        </div>
                        <div className="w-full mt-2">
                          <label className="block text-xs font-semibold text-slate-600 mb-1">Panchakarma Therapy Instructions</label>
                          <input type="text" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white" />
                        </div>
                      </>
                    )}

                    {myClinic.category === "homeopathy" && (
                      <>
                        <div className="flex-1 min-w-[200px]">
                          <label className="block text-xs font-semibold text-slate-600 mb-1">Remedy Name</label>
                          <input type="text" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white" />
                        </div>
                        <div className="w-32">
                          <label className="block text-xs font-semibold text-slate-600 mb-1">Potency</label>
                          <input type="text" placeholder="30C, 200C" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white" />
                        </div>
                        <div className="flex-1 min-w-[150px]">
                          <label className="block text-xs font-semibold text-slate-600 mb-1">Pills/Drops Frequency</label>
                          <input type="text" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white" />
                        </div>
                      </>
                    )}
                  </div>
                ))}

                <button onClick={addPrescriptionRow} type="button" className="text-teal-600 font-semibold text-sm hover:text-teal-700 w-fit">+ Add Medication Row</button>
              </div>

              {/* Diagnosis and Notes */}
              <div className="flex flex-col gap-4 bg-slate-50 p-6 rounded-2xl border border-slate-200">
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide border-b border-slate-200 pb-2">Clinical Findings</h4>
                
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Primary Diagnosis</label>
                  <input type="text" value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} placeholder="e.g. Acute Viral Pharyngitis" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Doctor's Notes (Confidential)</label>
                  <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Patient presents with..." rows={4} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white resize-none"></textarea>
                </div>
              </div>

              {/* Billing Invoice */}
              <div className="flex flex-col gap-4 bg-slate-50 p-6 rounded-2xl border border-slate-200 h-fit">
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide border-b border-slate-200 pb-2">Billing Slip</h4>
                
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Consultation Fee (₹)</label>
                  <input type="number" value={consultFee} onChange={e => setConsultFee(Number(e.target.value) || 0)} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Diagnostic / Treatment Charges (₹)</label>
                  <input type="number" value={diagFee} onChange={e => setDiagFee(Number(e.target.value) || 0)} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Pharmacy / Medicine Subtotal (₹)</label>
                  <input type="number" value={pharmacyFee} onChange={e => setPharmacyFee(Number(e.target.value) || 0)} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white" />
                </div>

                <div className="mt-4 pt-4 border-t border-slate-200 flex flex-col gap-2 text-sm text-slate-600 font-medium">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>₹{subTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>CGST + SGST (5%):</span>
                    <span>₹{tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-slate-900 mt-2">
                    <span>Grand Total Invoice Amount:</span>
                    <span className="text-teal-700">₹{grandTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t border-slate-100 flex flex-col sm:flex-row justify-end gap-3 bg-white rounded-b-3xl sticky bottom-0">
              <button 
                onClick={handlePrintReceipt} 
                className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
              >
                Download Digital Invoice Receipt (PDF)
              </button>
              <button 
                onClick={() => {
                  setIsFinalizing(true);
                  setTimeout(async () => {
                    setIsFinalizing(false);
                    
                    // Save the health record
                    try {
                      await fetch('/api/health-records', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          patientId: activeProcessBooking.patientId,
                          bookingId: activeProcessBooking.id,
                          diagnosis,
                          prescription: JSON.stringify(prescriptionRows),
                          notes
                        })
                      });
                    } catch (e) {
                      console.error("Failed to save health record", e);
                    }

                    updateBookingOnServer(activeProcessBooking.id, { 
                      status: "Processed",
                      diagnosis,
                      notes,
                      prescription: JSON.stringify(prescriptionRows),
                      doctorId: "doc-1"
                    });
                    setIsProcessModalOpen(false);
                  }, 1500);
                }} 
                className="px-5 py-2.5 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 transition-colors shadow-sm flex items-center justify-center gap-2"
                disabled={isFinalizing}
              >
                {isFinalizing ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Finalizing...
                  </>
                ) : (
                  "Finalize & Issue to Patient Portal"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
