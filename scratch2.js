const fs = require('fs');

const clinicsData = JSON.parse(fs.readFileSync('clinics_data.json', 'utf-8'));

const tsxContent = `"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

interface Clinic {
  id: string;
  name: string;
  category: string;
  area: string;
  address: string;
  operatingHours: string;
  phone: string;
  rating: number;
  reviewCount: number;
  reviews: string[];
  lat: number;
  lng: number;
  mapUrl: string;
  destinationQuery: string;
}

const clinics: Clinic[] = ${JSON.stringify(clinicsData, null, 2)};

const USER_LAT = 12.9716;
const USER_LNG = 77.5946;

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function LocationsPageContent() {
  const searchParams = useSearchParams();
  const typeParam = searchParams.get("type")?.toLowerCase();

  const [activeCategory, setActiveCategory] = useState<string>("allopathy");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("distance");
  const [userLoc, setUserLoc] = useState({ lat: USER_LAT, lng: USER_LNG });
  const [showReviews, setShowReviews] = useState(false);
  const [geoStatus, setGeoStatus] = useState<"idle" | "acquiring" | "error">("idle");

  useEffect(() => {
    if (typeParam && ["allopathy", "ayurveda", "homeopathy", "veterinary"].includes(typeParam)) {
      setActiveCategory(typeParam);
    }
  }, [typeParam]);

  const handleFindNearMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setSortOption("distance");
        },
        () => {
          alert("Could not get your location. Using default Central Bengaluru location.");
        }
      );
    }
  };

  const processedClinics = useMemo(() => {
    let result = clinics.filter((c) => c.category.toLowerCase() === activeCategory);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.area.toLowerCase().includes(q) ||
          c.address.toLowerCase().includes(q)
      );
    }

    const withDistance = result.map((c) => ({
      ...c,
      distance: getDistance(userLoc.lat, userLoc.lng, c.lat, c.lng),
    }));

    if (sortOption === "distance") {
      withDistance.sort((a, b) => a.distance - b.distance);
    } else if (sortOption === "rating") {
      withDistance.sort((a, b) => b.rating - a.rating);
    } else if (sortOption === "popularity") {
      withDistance.sort((a, b) => b.reviewCount - a.reviewCount);
    }

    return withDistance;
  }, [activeCategory, searchQuery, sortOption, userLoc]);

  const [selectedClinicId, setSelectedClinicId] = useState("");

  useEffect(() => {
    if (processedClinics.length > 0) {
      if (!processedClinics.find((c) => c.id === selectedClinicId)) {
        setSelectedClinicId(processedClinics[0].id);
        setShowReviews(false);
      }
    }
  }, [processedClinics, selectedClinicId]);

  const currentClinic =
    processedClinics.find((c) => c.id === selectedClinicId) || processedClinics[0];

  const handleGetRoute = () => {
    setGeoStatus("acquiring");
    if (!navigator.geolocation) {
      setGeoStatus("error");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const url = \`https://www.google.com/maps/dir/?api=1&origin=\${latitude},\${longitude}&destination=\${encodeURIComponent(currentClinic.destinationQuery)}\`;
        window.open(url, "_blank");
        setGeoStatus("idle");
      },
      () => {
        setGeoStatus("error");
      }
    );
  };

  const categories = [
    { id: "allopathy", label: "Allopathy" },
    { id: "ayurveda", label: "Ayurveda" },
    { id: "homeopathy", label: "Homeopathy" },
    { id: "veterinary", label: "Veterinary" }
  ];

  return (
    <div className="min-h-screen bg-transparent flex flex-col">
      <Navbar />
      <div className="h-20 shrink-0" />

      <main className="w-full flex-grow px-6 lg:px-8 pt-8 pb-12 flex flex-col items-center">
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

        {/* Category Tabs */}
        <div className="w-full max-w-6xl flex flex-wrap justify-center items-center gap-3 sm:gap-4 text-center pb-6 mx-auto">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={\`px-6 py-2.5 rounded-full text-sm font-semibold tracking-wide transition-all duration-200 cursor-pointer \${
                activeCategory === cat.id
                  ? "bg-teal-600 text-white shadow-md border border-teal-600"
                  : "bg-white text-slate-500 border border-slate-200 hover:text-slate-800 hover:bg-slate-50"
              }\`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search & Sort Filter Control Panel */}
        <div className="w-full max-w-6xl mx-auto mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Search neighborhood or clinic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm text-slate-700 bg-white shadow-sm"
          />
          
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm text-slate-700 bg-white shadow-sm cursor-pointer"
          >
            <option value="distance">Sort by Distance (Nearest First)</option>
            <option value="popularity">Sort by Popularity (Highest Rated First)</option>
            <option value="rating">Sort by Rating (Top Rated First)</option>
          </select>

          <button
            onClick={handleFindNearMe}
            className="w-full px-4 py-2.5 rounded-xl border border-teal-600 text-teal-600 font-semibold hover:bg-teal-50 transition-colors text-sm shadow-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="3 11 22 2 13 21 11 13 3 11"/>
            </svg>
            Find Near Me
          </button>
        </div>

        {/* Workspace Grid */}
        <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Sidebar Clinic Selection List */}
          <div className="lg:col-span-1 w-full bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden h-[600px] flex flex-col">
            <div className="p-4 border-b border-slate-100 bg-slate-50 shrink-0">
              <h3 className="text-sm font-bold text-slate-800">
                {processedClinics.length} Clinics Found
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {processedClinics.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {processedClinics.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        setSelectedClinicId(c.id);
                        setShowReviews(false);
                      }}
                      className={\`text-left w-full p-4 rounded-2xl transition-all cursor-pointer border \${
                        selectedClinicId === c.id
                          ? "bg-teal-50 border-teal-200 shadow-sm"
                          : "bg-white border-transparent hover:bg-slate-50 hover:border-slate-200"
                      }\`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-semibold text-slate-900 text-sm line-clamp-1 pr-2">{c.name}</h4>
                        <span className="text-xs font-bold text-teal-700 bg-teal-100 px-2 py-0.5 rounded shrink-0">
                          {c.rating} ★
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mb-2">{c.area}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] text-slate-400 font-medium">
                          ({c.reviewCount} reviews)
                        </span>
                        <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                          {c.distance.toFixed(1)} km
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-500 text-sm">
                  No clinics match your search criteria.
                </div>
              )}
            </div>
          </div>

          {/* Main Detail Card & Map */}
          <div className="lg:col-span-2 w-full flex flex-col gap-6">
            {currentClinic ? (
              <>
                <div className="w-full bg-white rounded-3xl border border-slate-100 p-8 flex flex-col shadow-sm">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wider text-teal-600">
                        {currentClinic.area.toUpperCase()} CARE HUB
                      </span>
                      <span className="text-sm font-bold text-slate-800 bg-slate-100 px-3 py-1 rounded-full">
                        {currentClinic.distance.toFixed(1)} km away
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">
                      {currentClinic.name}
                    </h2>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-bold text-teal-600">{currentClinic.rating} ★</span>
                      <span className="text-sm text-slate-500">({currentClinic.reviewCount} verified reviews)</span>
                    </div>

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
                          <p className="text-sm text-slate-500 mt-0.5">{currentClinic.operatingHours}</p>
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
                  
                  {/* Hidden Reviews Accordion */}
                  <div className="mt-6 border-t border-slate-100 pt-4">
                    <button
                      onClick={() => setShowReviews(!showReviews)}
                      className="text-sm font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      {showReviews ? 'Hide' : 'Read'} Patient Reviews ({currentClinic.reviewCount})
                      <svg
                        className={\`transition-transform duration-200 \${showReviews ? 'rotate-180' : ''}\`}
                        width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </button>
                    
                    {showReviews && (
                      <div className="mt-4 flex flex-col gap-3 animate-in slide-in-from-top-2 fade-in duration-200">
                        {currentClinic.reviews.map((review, idx) => (
                          <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <div className="flex gap-1 mb-1">
                              {[...Array(5)].map((_, i) => (
                                <svg key={i} className="w-3 h-3 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                            <p className="text-sm text-slate-600 italic">"{review}"</p>
                          </div>
                        ))}
                      </div>
                    )}
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
                        Acquiring location...
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
                    title={\`Map of \${currentClinic.name}\`}
                    src={currentClinic.mapUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-white rounded-3xl border border-slate-100 p-8 shadow-sm text-slate-500">
                Please select a clinic from the list to view details.
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function LocationsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading clinics...</div>}>
      <LocationsPageContent />
    </Suspense>
  );
}
`;

fs.writeFileSync('app/locations/page.tsx', tsxContent);
