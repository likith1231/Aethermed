"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

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

const clinicList = [
  "Sanjeevani Multispecialty Hospital - Indiranagar",
  "Apex Cardiac & General Care - Jayanagar",
  "Prakriti Ayurveda & Wellness - Malleshwaram",
  "Happy Paws Veterinary Clinic - Whitefield",
  "SmileCare Dental - Koramangala",
  "Cura Homeopathy Clinic - HSR Layout",
  "Bengaluru Eye Hospital - Rajajinagar",
  "Ovum Woman & Child Care - Banashankari",
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>("Allopathy");
  const [formStatus, setFormStatus] = useState<"idle" | "processing" | "success">("idle");
  const [showToast, setShowToast] = useState<boolean>(false);

  // Form field states
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [clinicName, setClinicName] = useState("");
  const [date, setDate] = useState("");

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus("processing");

    const newBooking = {
      id: Math.random().toString(36).substring(2, 11),
      patientName: `${firstName.trim()} ${lastName.trim()}`,
      email: email.trim(),
      phone: phone.trim(),
      service: clinicName,
      clinicName: clinicName,
      date: date,
      status: "Pending",
      createdAt: new Date().toISOString(),
    };

    setTimeout(() => {
      try {
        const stored = localStorage.getItem("aethermed_bookings");
        const list = stored ? JSON.parse(stored) : [];
        list.push(newBooking);
        localStorage.setItem("aethermed_bookings", JSON.stringify(list));
      } catch (err) {
        console.error("Error saving booking to localStorage:", err);
      }

      setFormStatus("success");
      setShowToast(true);

      // Reset fields
      setFirstName("");
      setLastName("");
      setEmail("");
      setPhone("");
      setClinicName("");
      setDate("");

      // Dismiss Toast after 4 seconds
      setTimeout(() => {
        setShowToast(false);
      }, 4000);
    }, 2000);
  };

  const activeSpecialtiesList = healthcareSystems[activeTab] || [];

  return (
    <div className="min-h-screen relative">
      {/* Content layer */}
      <div className="relative z-10">
        {/* ── Toast Notification ── */}
        {showToast && (
          <div className="fixed top-6 right-6 z-[60] bg-teal-600 text-white px-6 py-3 rounded-xl shadow-lg text-sm font-medium animate-pulse">
            ✓ Appointment booked successfully!
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
                Smart Medical Scheduling
              </span>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
                Find and Book Top Doctors{" "}
                <span className="text-teal-600">Instantly</span>
              </h1>
              <p className="text-slate-500 text-base md:text-lg leading-relaxed max-w-lg">
                Welcome to the AetherMed Booking Network. Discover verified clinics, schedule instant consults, and access top-tier medical care across Bengaluru.
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
                  Book an Appointment
                </button>
                <button
                  onClick={() => {
                    document.getElementById("specialties")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="text-sm font-medium text-slate-500 hover:text-teal-600 transition-colors cursor-pointer"
                >
                  Browse Services
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
                    onClick={() => setFormStatus("idle")}
                    className="mt-4 px-5 py-2 bg-teal-600 text-white text-sm font-semibold rounded-full hover:bg-teal-700 transition-colors cursor-pointer"
                  >
                    Book Another
                  </button>
                </div>
              ) : (
                <form onSubmit={handleBookingSubmit} className="flex flex-col gap-5">
                  <h3 className="text-lg font-bold text-slate-900 mb-1">Schedule Your Visit</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="First Name"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all bg-slate-50/50"
                    />
                    <input
                      type="text"
                      placeholder="Last Name"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all bg-slate-50/50"
                    />
                  </div>
                  <input
                    type="email"
                    placeholder="Email Address"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all bg-slate-50/50"
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all bg-slate-50/50"
                  />
                  <select
                    required
                    value={clinicName}
                    onChange={(e) => setClinicName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all bg-slate-50/50 cursor-pointer"
                  >
                    <option value="">Select a Clinic</option>
                    {clinicList.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all bg-slate-50/50"
                  />
                  <button
                    type="submit"
                    disabled={formStatus === "processing"}
                    className="w-full py-3.5 bg-teal-600 text-white text-sm font-semibold rounded-full hover:bg-teal-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {formStatus === "processing" ? "Processing..." : "Confirm Booking"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>

        {/* ── Symmetrical Healthcare Systems Section ── */}
        <section id="specialties" className="w-full py-20">
          <div className="w-full max-w-3xl mx-auto text-center flex flex-col items-center justify-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 mb-3">
              Explore Healthcare Services
            </h2>
            <p className="text-slate-500 text-base leading-relaxed max-w-xl">
              Explore certified options across various specialized systems of medicine.
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
                  href="/locations"
                  className="mt-5 text-sm font-semibold text-teal-600 hover:text-teal-700 transition-colors"
                >
                  View Clinics →
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* ── Centered Clinics CTA ── */}
        <section className="w-full py-20">
          <div className="w-full max-w-3xl mx-auto text-center flex flex-col items-center gap-6 px-6">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Ready to get started?
            </h2>
            <p className="text-slate-500 text-base leading-relaxed max-w-lg">
              Browse our network of partner clinics across Bengaluru and book your appointment today.
            </p>
            <Link
              href="/locations"
              className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white text-sm font-semibold rounded-full hover:bg-teal-700 transition-colors shadow-sm"
            >
              Explore Locations →
            </Link>
          </div>
        </section>

        {/* ── Footer ── */}
        <Footer />
      </div>
    </div>
  );
}
