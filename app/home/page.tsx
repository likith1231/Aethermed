"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useLanguage } from "../context/LanguageContext";
import { useAether } from "../context/AetherContext";
import { todayInClinicTimezone } from "../lib/timezone";

/* ── Specialty categories dynamic mock data ── */
type Specialty = {
  name: string;
  description: string;
  icon: React.ReactNode;
};

const healthcareSystems: Record<string, Specialty[]> = {
  Allopathy: [
    {
      name: "Cardiology",
      description: "Comprehensive heart health assessments, advanced ECG analysis, and specialist consultations.",
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      ),
    },
    {
      name: "Dermatology",
      description: "Clinical skin evaluations, targeted acne treatments, and preventative mole screenings.",
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M8 12s1.5 2 4 2 4-2 4-2" />
          <line x1="9" y1="9" x2="9.01" y2="9" />
          <line x1="15" y1="9" x2="15.01" y2="9" />
        </svg>
      ),
    },
    {
      name: "Pediatrics",
      description: "Gentle and specialized primary care for infants, children, and growing adolescents.",
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4.5 16.5c-1.5 1.25-2.5 3.25-2.5 5.5h20c0-2.25-1-4.25-2.5-5.5" />
          <circle cx="12" cy="9" r="6" />
        </svg>
      ),
    },
    {
      name: "Orthopedics",
      description: "Surgical and non-surgical bone, joint, and musculoskeletal sports medicine therapies.",
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      ),
    },
  ],
  Ayurveda: [
    {
      name: "Panchakarma",
      description: "Traditional 5-fold detoxification, metabolic correction, and deep purification therapies.",
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
      ),
    },
    {
      name: "Herbal Medicine",
      description: "Customized formulations utilizing organic botanical extracts for dosha balance.",
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
        </svg>
      ),
    },
    {
      name: "Yoga Therapy",
      description: "Mind-body integration exercises incorporating restorative asanas and breath control.",
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="5" r="3" />
          <path d="M6 22V17L12 11L18 17V22" />
        </svg>
      ),
    },
    {
      name: "Dosha Balancing",
      description: "Comprehensive lifestyle and nutritional planning structured around your biological constitution.",
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      ),
    },
  ],
  Homeopathy: [
    {
      name: "Constitutional Care",
      description: "Highly diluted, natural remedies customized to your holistic physical and emotional profile.",
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v8M8 12h8" />
        </svg>
      ),
    },
    {
      name: "Chronic Pathology",
      description: "Supportive therapies targeting long-term respiratory, skin, and metabolic illnesses.",
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4.5 16.5c-1.5 1.25-2.5 3.25-2.5 5.5h20c0-2.25-1-4.25-2.5-5.5" />
          <circle cx="12" cy="9" r="6" />
        </svg>
      ),
    },
    {
      name: "Pediatric Homeopathy",
      description: "Extremely gentle, side-effect-free wellness planning tailored specifically for children.",
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
        </svg>
      ),
    },
    {
      name: "Acute Remedies",
      description: "Rapid relief solutions for seasonal allergies, cold flares, and physical exhaustion.",
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M8 12h8" />
        </svg>
      ),
    },
  ],
  Veterinary: [
    {
      name: "Pet Surgery",
      description: "Sterile, state-of-the-art operation theater setups offering soft-tissue and orthopedic pet surgeries.",
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" fill="currentColor" opacity="0.15" />
          <path d="M14.5 17.5L3 6" />
          <path d="M10 21l-3-3" />
          <path d="M18 13l3-3" />
          <path d="M19 5a3 3 0 1 0-4-4" />
        </svg>
      ),
    },
    {
      name: "Canine Wellness",
      description: "Routine checkups, tailored immunization plans, and specialized senior dog nutrition strategies.",
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" fill="currentColor" opacity="0.15" />
          <path d="M12 8v8M8 12h8" />
        </svg>
      ),
    },
    {
      name: "Feline Care",
      description: "Calm, cat-friendly consultation environments specializing in renal health and weight management.",
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" fill="currentColor" opacity="0.15" />
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5" />
        </svg>
      ),
    },
    {
      name: "Exotic Animals",
      description: "Dedicated diagnostics, wellness visits, and specialized housing counsel for exotic pets.",
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" fill="currentColor" opacity="0.15" />
          <path d="M12 3v18" />
          <path d="M3 12h18" />
          <path d="M12 3a9 9 0 0 1 0 18" />
          <path d="M12 3a9 9 0 0 0 0 18" />
        </svg>
      ),
    },
  ],
};

import { clinics } from "../data/clinics";

export default function Home() {
  const { t } = useLanguage();
  const { bookingFormData, updateBookingFormData, createNewBooking, clinicQueues, assignUserToken, addAuditLog, bookings, showToast } = useAether();
  const [activeTab, setActiveTab] = useState<string>("Allopathy");
  const [formStatus, setFormStatus] = useState<"idle" | "processing" | "success">("idle");
  const [showNotification, setShowNotification] = useState<boolean>(false);
  
  const [availableSlots, setAvailableSlots] = useState<{time: string, available: number, total: number, isFull: boolean, reason?: string}[]>([]);
  const [isFetchingSlots, setIsFetchingSlots] = useState(false);

  useEffect(() => {
    if (bookingFormData.clinicName && bookingFormData.date) {
      setIsFetchingSlots(true);
      fetch(`/api/slots?clinicId=${encodeURIComponent(bookingFormData.clinicName)}&date=${bookingFormData.date}`)
        .then(res => res.json())
        .then(data => {
          if (data.slots) setAvailableSlots(data.slots);
          else setAvailableSlots([]);
        })
        .catch(console.error)
        .finally(() => setIsFetchingSlots(false));
    }
  }, [bookingFormData.clinicName, bookingFormData.date]);

  const [isMounted, setIsMounted] = useState(false);
  
  const [showTokenCard, setShowTokenCard] = useState<boolean>(false);
  const [latestBookingMetrics, setLatestBookingMetrics] = useState<{ id: string; clinicName: string; date: string; currentServing: number; userToken: number; waitTime: number } | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!showTokenCard || !latestBookingMetrics) return;

    const autoSyncQueue = async () => {
      try {
        // Query the server API directly to get the live state for this specific clinic and date
        const response = await fetch(`/api/bookings?clinicName=${encodeURIComponent(latestBookingMetrics.clinicName)}&date=${latestBookingMetrics.date}&t=${Date.now()}`);
        const clinicDataList = await response.json();
        
        const myBooking = clinicDataList.find((b: any) => b.id === latestBookingMetrics.id);
        
        if (myBooking && (myBooking.status === "In Cabin" || myBooking.status === "Processed")) {
          setShowNotification(true);
          setLatestBookingMetrics(prev => prev ? { ...prev, waitTime: 0, currentServing: prev.userToken } : null);
          setShowTokenCard(false);
        } else {
          // Find actual patient in cabin
          const activeCabinPatient = clinicDataList.find((b: any) => b.status === "In Cabin");
          const currentServingToken = activeCabinPatient ? activeCabinPatient.userToken : 1;
          
          setLatestBookingMetrics(prev => {
            if (!prev) return null;
            if (currentServingToken >= prev.userToken) {
              setTimeout(() => {
                setShowNotification(true);
                setShowTokenCard(false);
              }, 0);
            }

            const pendingPatientsAhead = clinicDataList.filter((b: any) => 
              (b.status === "Pending" || b.status === "In Cabin") && b.userToken < prev.userToken
            ).length;

            return {
              ...prev,
              currentServing: currentServingToken,
              waitTime: Math.max(0, pendingPatientsAhead * 15)
            };
          });
        }
      } catch (err) {
        console.error("Automated background queue poll sync interrupted:", err);
      }
    };

    // Spin up a passive interval listener looping every 5 seconds
    const pollInterval = setInterval(autoSyncQueue, 5000);
    return () => clearInterval(pollInterval);
  }, [showTokenCard, latestBookingMetrics?.clinicName]);

  useEffect(() => {
    if (showNotification) {
      const autoDismissTimer = setTimeout(() => {
        setShowNotification(false);
      }, 5000); // Strict 5-second visibility window
      return () => clearTimeout(autoDismissTimer);
    }
  }, [showNotification]);

  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const handleSyncStatus = async () => {
    if (!latestBookingMetrics || isSyncing) return;
    setIsSyncing(true);
    try {
      // Artificial delay so the spinner is visible to the user on localhost
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const response = await fetch(`/api/bookings?clinicName=${encodeURIComponent(latestBookingMetrics.clinicName)}&date=${latestBookingMetrics.date}&t=${Date.now()}`);
      const clinicDataList = await response.json();
      
      const myBooking = clinicDataList.find((b: any) => b.id === latestBookingMetrics.id);
      
      if (myBooking && (myBooking.status === "In Cabin" || myBooking.status === "Processed")) {
        setShowNotification(true);
        setLatestBookingMetrics(prev => prev ? { ...prev, waitTime: 0, currentServing: prev.userToken } : null);
        setShowTokenCard(false);
      } else {
        const activeCabinPatient = clinicDataList.find((b: any) => b.status === "In Cabin");
        const currentServingToken = activeCabinPatient ? activeCabinPatient.userToken : 1;
        
        setLatestBookingMetrics(prev => {
          if (!prev) return null;
          if (currentServingToken >= prev.userToken) {
            setTimeout(() => {
              setShowNotification(true);
              setShowTokenCard(false);
            }, 0);
          }
          return { 
            ...prev, 
            currentServing: currentServingToken,
            waitTime: Math.max(0, (prev.userToken - currentServingToken) * 15)
          };
        });
      }
    } catch (err) {
      console.error("Manual sync failed", err);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus("processing");

    const phone = bookingFormData.phone.trim();
    if (!/^[6-9]\d{9}$/.test(phone)) {
      showToast("Invalid phone number. Must be a 10-digit Indian number starting with 6, 7, 8, or 9.", "error");
      setFormStatus("idle");
      return;
    }

    setTimeout(() => {
      const newBooking: any = {
        patientName: `${bookingFormData.firstName.trim()} ${bookingFormData.lastName.trim()}`,
        email: bookingFormData.email.trim(),
        phone: bookingFormData.phone.trim(),
        service: "General Consultation",
        clinicName: bookingFormData.clinicName,
        timeInput: `${bookingFormData.date} ${bookingFormData.appointmentTimeSlot || "09:00 AM"}`,
        date: bookingFormData.date,
        isTelemedicine: bookingFormData.isTelemedicine,
      };

      fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBooking)
      })
      .then(res => res.json())
      .then(async data => {
        if (data.success && data.booking) {
          createNewBooking(data.booking);
          addAuditLog(`[${new Date().toLocaleTimeString()}] TELEMETRY: New booking processed globally via API. Active database row structures updated smoothly for ${data.booking.patientName}.`);
          
          const response = await fetch(`/api/bookings?clinicName=${encodeURIComponent(bookingFormData.clinicName)}&date=${bookingFormData.date}&t=${Date.now()}`);
          const clinicDataList = await response.json();
          const activeCabinPatient = clinicDataList.find((b: any) => b.status === "In Cabin");
          const currentServing = activeCabinPatient ? activeCabinPatient.userToken : 1;
          const userToken = data.booking.userToken;
          
          const pendingPatientsAhead = clinicDataList.filter((b: any) => 
            (b.status === "Pending" || b.status === "In Cabin") && b.userToken < userToken
          ).length;

          const calculatedWait = Math.max(0, pendingPatientsAhead * 15);

          setLatestBookingMetrics({ 
            id: data.booking.id,
            clinicName: bookingFormData.clinicName,
            date: bookingFormData.date, 
            currentServing: currentServing, 
            userToken: userToken, 
            waitTime: calculatedWait 
          });
          setShowTokenCard(true); // ONLY activate here!
          setShowNotification(false); // Ensure notification is hidden initially
          showToast(`Booking confirmed for ${data.booking.patientName}! We will notify you when the doctor is ready.`, 'success');
        }
      })
      .catch(err => {
        console.error("Backend POST failed", err);
        const fallback = { ...newBooking, id: Math.random().toString(36).substring(2, 11), status: "Pending", assignedStaff: null, createdAt: new Date().toISOString() };
        createNewBooking(fallback);
        setLatestBookingMetrics({ 
          id: fallback.id,
          clinicName: bookingFormData.clinicName, 
          date: bookingFormData.date,
          currentServing: 1, 
          userToken: 1, 
          waitTime: 15 
        });
        setShowTokenCard(true);
        setShowNotification(false);
      })
      .finally(() => {
        setFormStatus("success");
      });
    }, 2000);
  };

  const activeSpecialtiesList = healthcareSystems[activeTab] || [];

  if (!isMounted) return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-teal-600 font-bold">Loading AetherMed...</div>;

  return (
    <div className="min-h-screen relative">
      {/* Content layer */}
      <div className="relative z-10">
        <Link href="/" className="absolute top-6 left-6 z-[60] flex items-center justify-center w-10 h-10 rounded-full bg-white/10 dark:bg-slate-800/40 backdrop-blur-md border border-white/10 dark:border-slate-700/50 text-slate-700 dark:text-slate-300 hover:bg-white/20 dark:hover:bg-slate-800/70 transition-all shadow-sm cursor-pointer">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </Link>



        {/* ── WhatsApp Notification Simulation ── */}
        {showNotification && (
          <div className="fixed top-24 right-6 z-[60] bg-[#25D366] text-white p-4 rounded-2xl shadow-2xl flex items-start gap-3 max-w-sm animate-bounce cursor-pointer" onClick={() => setShowNotification(false)}>
            <div className="bg-white/20 p-2 rounded-full mt-1">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-sm">💬 AetherMed Update</h4>
              <p className="text-xs mt-1 leading-relaxed">Dr. Rao is ready to see you now. Please head to Cabin 3.</p>
              <div className="text-[10px] text-white/70 mt-2 font-medium uppercase tracking-wide flex justify-between items-center">
                <span>Just Now</span>
                <span>Tap to dismiss</span>
              </div>
            </div>
          </div>
        )}

        {/* ── Navbar ── */}
        <Navbar />

        {/* ── Spacer for fixed navbar ── */}
        <div className="h-20" />

        {/* ── Symmetrical Hero Section ── */}
        <section id="booking" className="w-full max-w-7xl mx-auto px-6 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* ── Left Content column ── */}
            <div className="flex flex-col gap-6">
              <span className="text-xs font-semibold uppercase tracking-wider text-teal-600 bg-teal-50 px-3 py-1 rounded-full w-fit">
                {t("smartScheduling")}
              </span>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
                {t("bookingTitle")}
                <span className="text-teal-600">{t("bookingTitleHighlight")}</span>
              </h1>
              <p className="text-slate-500 text-base md:text-lg leading-relaxed max-w-lg">
                {t("bookingSubtitle")}
              </p>
              <div className="flex items-center gap-4 mt-2">
                <button
                  onClick={() => {
                    document.getElementById("booking-form")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white text-sm font-semibold rounded-full hover:bg-teal-700 transition-colors shadow-sm cursor-pointer"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  {t("bookAppointmentBtn")}
                </button>
                <button
                  onClick={() => {
                    document.getElementById("specialties")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="text-sm font-medium text-slate-500 hover:text-teal-600 transition-colors cursor-pointer"
                >
                  {t("browseServicesBtn")}
                </button>
              </div>
            </div>

            {/* ── Booking Form ── */}
            <div
              id="booking-form"
              className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm"
            >
              {formStatus === "success" ? (
                <div className="flex flex-col items-center justify-center py-12 text-center gap-4">
                  <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center text-3xl">✓</div>
                  <h3 className="text-xl font-bold text-slate-900">Booking Confirmed!</h3>
                  <p className="text-slate-500 text-sm">Your appointment has been submitted. You&apos;ll receive a confirmation shortly.</p>
                  <button
                    onClick={() => {
                      localStorage.removeItem('aether_latest_metrics');
                      setLatestBookingMetrics(null);
                      setShowTokenCard(false);
                      setFormStatus("idle");
                      updateBookingFormData({
                        firstName: "",
                        lastName: "",
                        email: "",
                        phone: "",
                        clinicName: "",
                        date: ""
                      });
                    }}
                    className="mt-4 px-5 py-2 bg-teal-600 text-white text-sm font-semibold rounded-full hover:bg-teal-700 transition-colors cursor-pointer"
                  >
                    Book Another
                  </button>
                </div>
              ) : (
                <form onSubmit={handleBookingSubmit} className="flex flex-col gap-5">
                  <h3 className="text-lg font-bold text-slate-900 mb-1">{t("scheduleVisit")}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      id="patient-name"
                      type="text"
                      placeholder={t("firstName")}
                      required
                      value={bookingFormData.firstName}
                      onChange={(e) => updateBookingFormData({ firstName: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all bg-slate-50/50"
                    />
                    <input
                      type="text"
                      placeholder={t("lastName")}
                      required
                      value={bookingFormData.lastName}
                      onChange={(e) => updateBookingFormData({ lastName: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all bg-slate-50/50"
                    />
                  </div>
                  <input
                    type="email"
                    placeholder={t("emailAddress")}
                    required
                    value={bookingFormData.email}
                    onChange={(e) => updateBookingFormData({ email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all bg-slate-50/50"
                  />
                  <input
                    type="tel"
                    placeholder={t("phoneNumber")}
                    required
                    pattern="[6-9][0-9]{9}"
                    title="Must be a valid Indian phone number starting with 6, 7, 8, or 9 and exactly 10 digits long."
                    maxLength={10}
                    value={bookingFormData.phone}
                    onChange={(e) => updateBookingFormData({ phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all bg-slate-50/50"
                  />
                  <select
                    id="clinic-selection"
                    required
                    value={bookingFormData.clinicName}
                    onChange={(e) => updateBookingFormData({ clinicName: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all bg-slate-50/50 cursor-pointer"
                  >
                    <option value="">{t("selectClinic")}</option>
                    {clinics.map((clinic) => (
                      <option key={clinic.id} value={clinic.name}>
                        {clinic.name} ({clinic.category} — {clinic.area})
                      </option>
                    ))}
                  </select>
                  <input
                    id="appointment-time"
                    type="date"
                    required
                    min={todayInClinicTimezone()}
                    value={bookingFormData.date}
                    onChange={(e) => updateBookingFormData({ date: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all bg-slate-50/50"
                  />
                  <div className="mt-4">
                    <label className="block text-xs font-medium text-slate-700 mb-2">Select Preferred Appointment Window</label>
                    {!bookingFormData.clinicName || !bookingFormData.date ? (
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-sm text-slate-500">
                        Please select a clinic and date first.
                      </div>
                    ) : isFetchingSlots ? (
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-sm text-slate-500 flex justify-center items-center gap-2">
                        <span className="animate-spin">🔄</span> Fetching slots...
                      </div>
                    ) : availableSlots.length === 0 ? (
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-sm text-slate-500">
                        No slots available for this date.
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                        {availableSlots.map((slot) => {
                          const isSelected = bookingFormData.appointmentTimeSlot === slot.time;
                          return (
                            <button
                              key={slot.time}
                              type="button"
                              disabled={slot.isFull}
                              onClick={() => updateBookingFormData({ appointmentTimeSlot: slot.time })}
                              className={`p-2 rounded-lg text-xs font-semibold border transition-all ${
                                slot.isFull 
                                  ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-50"
                                  : isSelected
                                    ? "bg-teal-600 border-teal-600 text-white shadow-md transform scale-[1.02]"
                                    : "bg-white border-slate-200 text-slate-700 hover:border-teal-400 hover:text-teal-600"
                              }`}
                            >
                              <div className="flex flex-col items-center">
                                <span>{slot.time}</span>
                                <span className={`text-[9px] mt-0.5 ${isSelected ? 'text-teal-100' : slot.isFull ? 'text-slate-400' : 'text-slate-400'}`}>
                                  {slot.isFull ? (slot.reason || 'Full') : `${slot.available} left`}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  
                  {/* Telemedicine Toggle */}
                  <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={bookingFormData.isTelemedicine}
                        onChange={(e) => updateBookingFormData({ isTelemedicine: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                    </label>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">Telemedicine Consultation</p>
                      <p className="text-xs text-slate-500">I want to consult with the doctor online.</p>
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={formStatus === "processing"}
                    className="w-full py-3.5 bg-teal-600 text-white text-sm font-semibold rounded-full hover:bg-teal-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {formStatus === "processing" ? t("processing") : t("confirmBooking")}
                  </button>
                </form>
              )}

              {/* ── Live Clinic Token Queue ── */}
              {showTokenCard && latestBookingMetrics && (
                <div className="mt-6 border-t border-slate-100 pt-6">
                  <div className="bg-slate-900 rounded-2xl p-5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                  </div>
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-3">
                    <h4 className="text-emerald-400 font-bold text-sm uppercase tracking-widest flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      Live Clinic Queue — {latestBookingMetrics.clinicName}
                    </h4>
                    <div className="text-xs text-emerald-100/70 font-medium tracking-wide">
                      {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                    <button
                      onClick={handleSyncStatus}
                      disabled={isSyncing}
                      className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-teal-400 border border-teal-500/50 rounded-full hover:bg-teal-900/30 transition-colors disabled:opacity-50 cursor-pointer flex-shrink-0 whitespace-nowrap"
                    >
                      <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span></span>
                      <span className={isSyncing ? "animate-spin inline-block" : ""}>🔄</span> 
                      {isSyncing ? "Syncing..." : "Sync Status"}
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                      <p className="text-slate-400 text-xs font-semibold mb-1">Current Token Serving</p>
                      <p className="text-3xl font-bold text-white">{latestBookingMetrics.currentServing}</p>
                    </div>
                    <div className="bg-teal-900/30 rounded-xl p-4 border border-teal-800">
                      <p className="text-teal-200 text-xs font-semibold mb-1">Your Token Number</p>
                      <p className="text-3xl font-bold text-teal-400">{latestBookingMetrics.userToken}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-300 text-sm font-medium">Estimated Wait Time</span>
                    <span className="text-emerald-400 font-bold">
                      {latestBookingMetrics.waitTime} mins remaining
                    </span>
                  </div>
                </div>
              </div>
              )}
            </div>
          </div>
        </section>

        {/* ── Symmetrical Healthcare Systems Section ── */}
        <section id="specialties" className="w-full py-20">
          <div className="w-full max-w-3xl mx-auto text-center flex flex-col items-center justify-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 mb-3">
              {t("exploreServices")}
            </h2>
            <p className="text-slate-500 text-base leading-relaxed max-w-xl">
              {t("exploreDesc")}
            </p>

            {/* Pill Tabs centered */}
            <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
              {Object.keys(healthcareSystems).map((tab) => {
                const isActive = activeTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 cursor-pointer ${
                      isActive
                        ? "bg-teal-600 text-white shadow-sm"
                        : "bg-white text-slate-500 border border-slate-200 hover:text-slate-800 hover:bg-slate-50"
                    }`}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Specialties Centered Grid */}
          <div className="w-full max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {activeSpecialtiesList.map((s) => (
              <div
                key={s.name}
                className="bg-white rounded-2xl border border-slate-100 p-6 flex flex-col items-start hover:shadow-md hover:border-slate-200 transition-all duration-200"
              >
                <div className="flex flex-col gap-3 flex-1">
                  <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600">
                    {s.icon}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-1">
                    {s.name}
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    {s.description}
                  </p>
                </div>
                <Link
                  href={`/locations?type=${activeTab.toLowerCase()}`}
                  className="mt-5 text-sm font-semibold text-teal-600 hover:text-teal-700 transition-colors"
                >
                  {t("viewClinics")}
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* ── Centered Clinics CTA ── */}
        <section className="w-full py-20">
          <div className="w-full max-w-3xl mx-auto text-center flex flex-col items-center gap-6 px-6">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
              {t("readyToGetStarted")}
            </h2>
            <p className="text-slate-500 text-base leading-relaxed max-w-lg">
              {t("readyDesc")}
            </p>
            <Link
              href="/locations"
              className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white text-sm font-semibold rounded-full hover:bg-teal-700 transition-colors shadow-sm"
            >
              {t("exploreLocations")}
            </Link>
          </div>
        </section>

        {/* ── Footer ── */}
        <Footer />
      </div>
    </div>
  );
}
