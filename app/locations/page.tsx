"use client";

import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

interface Clinic {
  id: string;
  name: string;
  system: string;
  area: string;
  address: string;
  hours: string;
  phone: string;
  mapSrc: string;
  destinationQuery: string;
}

const clinics: Clinic[] = [
  {
    id: "sanjeevani",
    name: "Sanjeevani Multispecialty Hospital",
    system: "Allopathy",
    area: "Indiranagar",
    address: "100 Feet Road, Near Metro Station, Indiranagar, Bengaluru, KA 560038",
    hours: "Mon–Sat: 8:00 AM – 8:00 PM | Sun: Closed",
    phone: "+91 80 4967 8001",
    mapSrc: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.003668817349!2d77.6408226!3d12.9783935!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae16abc1a1538f%3A0x5a31b4028ef7806f!2s100%20Feet%20Rd%2C%20Bengaluru%2C%20Karnataka!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin",
    destinationQuery: "Sanjeevani Hospital Indiranagar Bengaluru",
  },
  {
    id: "apex",
    name: "Apex Cardiac & General Care",
    system: "Allopathy",
    area: "Jayanagar",
    address: "4th T Block, Near Shopping Complex, Jayanagar, Bengaluru, KA 560041",
    hours: "Mon–Sat: 9:00 AM – 7:30 PM | Sun: 10 AM – 2 PM (Emergency)",
    phone: "+91 80 4967 8002",
    mapSrc: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.544837583489!2d77.5838002!3d12.9250395!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae1508db8c0dc9%3A0x4460ff69b2d86161!2sJayanagar%204th%20Block%2C%20Bengaluru%2C%20Karnataka!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin",
    destinationQuery: "Apex Cardiac Jayanagar Bengaluru",
  },
  {
    id: "prakriti",
    name: "Prakriti Ayurveda & Wellness",
    system: "Ayurveda",
    area: "Malleshwaram",
    address: "Margosa Road, Near 15th Cross, Malleshwaram, Bengaluru, KA 560003",
    hours: "Mon–Sat: 7:30 AM – 8:30 PM | Sun: 8:00 AM – 1:00 PM",
    phone: "+91 80 4967 8003",
    mapSrc: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3887.6259021021487!2d77.5700201!3d12.9972395!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae17d74b971a81%3A0xe54d2de89cc944e8!2sMargosa%20Rd%2C%20Malleshwaram%2C%20Bengaluru%2C%20Karnataka!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin",
    destinationQuery: "Prakriti Ayurveda Malleshwaram Bengaluru",
  },
  {
    id: "happypaws",
    name: "Happy Paws Veterinary Clinic",
    system: "Veterinary",
    area: "Whitefield",
    address: "ITPL Main Road, Mahadevapura, Whitefield, Bengaluru, KA 560048",
    hours: "Mon–Sat: 8:30 AM – 9:00 PM | Sun: 9 AM – 1 PM",
    phone: "+91 80 4967 8004",
    mapSrc: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3887.541295982848!2d77.748011!3d12.969899!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae1204d16d1233%3A0x6333bf8f1f7cd71!2sITPL%20Main%20Rd%2C%20Bengaluru%2C%20Karnataka!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin",
    destinationQuery: "ITPL Main Road Whitefield Bengaluru",
  },
  {
    id: "smilecare",
    name: "SmileCare Dental",
    system: "Homeopathy",
    area: "Koramangala",
    address: "80 Feet Road, 4th Block, Koramangala, Bengaluru, KA 560034",
    hours: "Mon–Sat: 9:30 AM – 8:00 PM | Sun: Closed",
    phone: "+91 80 4967 8005",
    mapSrc: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.30922883307!2d77.6252001!3d12.9342001!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae1443659fbdb9%3A0x95cf28c005fcd3b8!2s4th%20Block%20Koramangala%2C%20Bengaluru%2C%20Karnataka!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin",
    destinationQuery: "SmileCare Dental Koramangala Bengaluru",
  },
  {
    id: "cura",
    name: "Cura Homeopathy Clinic",
    system: "Homeopathy",
    area: "HSR Layout",
    address: "27th Main Road, Sector 1, HSR Layout, Bengaluru, KA 560102",
    hours: "Mon–Sat: 10:00 AM – 7:30 PM | Sun: 10 AM – 1 PM",
    phone: "+91 80 4967 8006",
    mapSrc: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.8969441!2d77.644101!3d12.911002!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae1496a7efbb4d%3A0xe54d2de89cc944e8!2s27th%20Main%20Rd%2C%20HSR%20Layout%2C%20Bengaluru%2C%20Karnataka!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin",
    destinationQuery: "Cura Homeopathy HSR Layout Bengaluru",
  },
  {
    id: "rajajinagar",
    name: "Bengaluru Eye Hospital",
    system: "Allopathy",
    area: "Rajajinagar",
    address: "Dr. Rajkumar Road, 2nd Block, Rajajinagar, Bengaluru, KA 560010",
    hours: "Mon–Sat: 8:30 AM – 8:30 PM | Sun: Closed",
    phone: "+91 80 4967 8007",
    mapSrc: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3887.8969442!2d77.556401!3d12.988002!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae17ed6ba8e5a7%3A0xe54d2de89cc944e8!2sDr%20Rajkumar%20Rd%2C%20Bengaluru%2C%20Karnataka!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin",
    destinationQuery: "Bengaluru Eye Hospital Rajajinagar",
  },
  {
    id: "ovum",
    name: "Ovum Woman & Child Care",
    system: "Ayurveda",
    area: "Banashankari",
    address: "Outer Ring Road, 3rd Stage, Banashankari, Bengaluru, KA 560085",
    hours: "24/7 (Emergency) | OPD: Mon-Sat 9 AM - 8 PM",
    phone: "+91 80 4967 8008",
    mapSrc: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3889.0969443!2d77.536801!3d12.905002!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae15df6ba8e5a7%3A0xe54d2de89cc944e8!2sOuter%20Ring%20Rd%2C%20Bengaluru%2C%20Karnataka!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin",
    destinationQuery: "Ovum Woman Banashankari Bengaluru",
  },
];

export default function LocationsPage() {
  const [selectedClinicId, setSelectedClinicId] = useState("sanjeevani");
  const [geoStatus, setGeoStatus] = useState<"idle" | "acquiring" | "error">("idle");

  const currentClinic =
    clinics.find((c) => c.id === selectedClinicId) || clinics[0];

  const handleGetRoute = () => {
    setGeoStatus("acquiring");
    if (!navigator.geolocation) {
      setGeoStatus("error");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const url = `https://www.google.com/maps/dir/?api=1&origin=${latitude},${longitude}&destination=${encodeURIComponent(currentClinic.destinationQuery)}`;
        window.open(url, "_blank");
        setGeoStatus("idle");
      },
      () => {
        setGeoStatus("error");
      }
    );
  };

  return (
    <div className="min-h-screen bg-transparent">
      {/* Navbar */}
      <Navbar />

      {/* Spacer for fixed navbar */}
      <div className="h-20" />

      {/* Main Body Wrapper - Centered layout */}
      <main className="w-full px-6 lg:px-8 pt-8 pb-12 flex flex-col items-center">

        {/* Page Header */}
        <div className="w-full max-w-2xl text-center mb-6 mx-auto flex flex-col items-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-teal-600 mb-2">
            Our Bengaluru Network
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-3">
            Partner Clinics in Bengaluru
          </h1>
          <p className="text-slate-500 text-base leading-relaxed max-w-[620px] mx-auto">
            Discover top-tier independent medical centers. Select a clinic to view operational hours, address, and live routing.
          </p>
        </div>

        {/* Single row location/area selector pills */}
        <div className="w-full max-w-6xl flex flex-wrap justify-center items-center gap-3 sm:gap-4 text-center pb-6 mx-auto">
          {clinics.map((c) => {
            const isSelected = selectedClinicId === c.id;
            return (
              <button
                key={c.id}
                onClick={() => {
                  setSelectedClinicId(c.id);
                  setGeoStatus("idle");
                }}
                className={`px-6 py-2.5 rounded-full text-sm font-semibold tracking-wide transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? "bg-teal-600 text-white shadow-md border border-teal-600"
                    : "bg-white text-slate-500 border border-slate-200 hover:text-slate-800 hover:bg-slate-50"
                }`}
              >
                {c.area}
              </button>
            );
          })}
        </div>

        {/* Main Content Info Card & Embed Map */}
        <div className="w-full max-w-6xl mx-auto px-0 grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12 items-start">

          {/* Left Info Card */}
          <div className="w-full bg-white rounded-3xl border border-slate-100 p-8 flex flex-col shadow-sm">
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-teal-600">
                {currentClinic.area.toUpperCase()} CARE HUB
              </span>
              <h2 className="text-2xl font-bold text-slate-900">
                {currentClinic.name}
              </h2>

              <div className="flex flex-col gap-5 mt-5">
                {/* Address */}
                <div className="flex items-start gap-3">
                  <svg className="text-teal-500 mt-0.5 shrink-0" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <div>
                    <strong className="text-sm font-semibold text-slate-700">Address</strong>
                    <p className="text-sm text-slate-500 mt-0.5">{currentClinic.address}</p>
                  </div>
                </div>
                {/* Hours */}
                <div className="flex items-start gap-3">
                  <svg className="text-teal-500 mt-0.5 shrink-0" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <div>
                    <strong className="text-sm font-semibold text-slate-700">Operating Hours</strong>
                    <p className="text-sm text-slate-500 mt-0.5">{currentClinic.hours}</p>
                  </div>
                </div>
                {/* Phone */}
                <div className="flex items-start gap-3">
                  <svg className="text-teal-500 mt-0.5 shrink-0" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.84.36 1.65.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c1.16.34 1.97.57 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  <div>
                    <strong className="text-sm font-semibold text-slate-700">Phone</strong>
                    <p className="text-sm text-slate-500 mt-0.5">{currentClinic.phone}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Get Directions Routing */}
            <div className="mt-8">
              {geoStatus === "idle" && (
                <button
                  onClick={handleGetRoute}
                  className="w-full py-3.5 bg-teal-600 text-white text-sm font-semibold rounded-full hover:bg-teal-700 transition-colors cursor-pointer"
                >
                  Get Route &amp; Directions
                </button>
              )}
              {geoStatus === "acquiring" && (
                <div className="flex items-center justify-center gap-2 text-sm text-teal-600 py-3">
                  <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  Acquiring location in Bengaluru...
                </div>
              )}
              {geoStatus === "error" && (
                <div className="text-sm text-red-500 text-center py-3">
                  Location permission denied.{" "}
                  <button
                    onClick={handleGetRoute}
                    className="text-teal-600 font-semibold underline hover:text-teal-700 cursor-pointer"
                  >
                    Retry
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Map Embed */}
          <div className="w-full h-[460px] rounded-3xl overflow-hidden border border-slate-100 shadow-sm">
            <iframe
              title={`Map of ${currentClinic.name}`}
              src={currentClinic.mapSrc}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </main>

      {/* ── Footer ── */}
      <Footer />
    </div>
  );
}