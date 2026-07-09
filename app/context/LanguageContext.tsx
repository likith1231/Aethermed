"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

type Language = "en" | "kn" | "hi";

interface LanguageContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // page.tsx
    heroBadge: "Experience Unified Healthcare",
    heroTitle: "Smart Medical Systems, Unified.",
    heroSubtitle: "Coordinate your care effortlessly. AetherMed connects patients, practitioners, and administrators through one secure, intelligent clinical platform.",
    enterPatient: "Enter as Patient",
    practitionerPortal: "Practitioner Portal",
    adminPortal: "Platform Administrator",
    // home/page.tsx
    smartScheduling: "Smart Medical Scheduling",
    bookingTitle: "Find and Book Top Doctors ",
    bookingTitleHighlight: "Instantly",
    bookingSubtitle: "Welcome to the AetherMed Booking Network. Discover verified clinics, schedule instant consults, and access top-tier medical care across Bengaluru.",
    bookAppointmentBtn: "Book an Appointment",
    browseServicesBtn: "Browse Services",
    scheduleVisit: "Schedule Your Visit",
    firstName: "First Name",
    lastName: "Last Name",
    emailAddress: "Email Address",
    phoneNumber: "Phone Number",
    selectClinic: "Select a Clinic",
    confirmBooking: "Confirm Booking",
    processing: "Processing...",
    exploreServices: "Explore Healthcare Services",
    exploreDesc: "Explore certified options across various specialized systems of medicine.",
    viewClinics: "View Clinics →",
    readyToGetStarted: "Ready to get started?",
    readyDesc: "Browse our network of partner clinics across Bengaluru and book your appointment today.",
    exploreLocations: "Explore Locations →",
    // locations/page.tsx
    networkBadge: "Our Bengaluru Network",
    clinicsTitle: "Partner Clinics in Bengaluru",
    clinicsDesc: "Discover top-tier independent medical centers. Select a clinic to view operational hours, address, and live routing.",
    searchPlaceholder: "Search neighborhood or clinic...",
    sortDistance: "Sort by Distance (Nearest First)",
    sortPopularity: "Sort by Popularity (Highest Rated First)",
    sortRating: "Sort by Rating (Top Rated First)",
    findNearMe: "Find Near Me",
    clinicsFound: "Clinics Found",
    address: "Address",
    operatingHours: "Operating Hours",
    phone: "Phone",
    readReviews: "Read Patient Reviews",
    hideReviews: "Hide Patient Reviews",
    getRoute: "Get Route & Directions"
  },
  kn: {
    // page.tsx
    heroBadge: "ಏಕೀಕೃತ ಆರೋಗ್ಯ ಸೇವೆಯನ್ನು ಅನುಭವಿಸಿ",
    heroTitle: "ಸ್ಮಾರ್ಟ್ ವೈದ್ಯಕೀಯ ವ್ಯವಸ್ಥೆಗಳು, ಏಕೀಕೃತ.",
    heroSubtitle: "ನಿಮ್ಮ ಕಾಳಜಿಯನ್ನು ಸಲೀಸಾಗಿ ಸಂಯೋಜಿಸಿ. ಏಥರ್‌ಮೆಡ್ ರೋಗಿಗಳನ್ನು, ವೈದ್ಯರನ್ನು ಮತ್ತು ಆಡಳಿತಗಾರರನ್ನು ಒಂದು ಸುರಕ್ಷಿತ, ಬುದ್ಧಿವಂತ ಕ್ಲಿನಿಕಲ್ ವೇದಿಕೆಯ ಮೂಲಕ ಸಂಪರ್ಕಿಸುತ್ತದೆ.",
    enterPatient: "ರೋಗಿಯಾಗಿ ಪ್ರವೇಶಿಸಿ",
    practitionerPortal: "ವೈದ್ಯರ ಪೋರ್ಟಲ್",
    adminPortal: "ಪ್ಲಾಟ್‌ಫಾರ್ಮ್ ನಿರ್ವಾಹಕರು",
    // home/page.tsx
    smartScheduling: "ಸ್ಮಾರ್ಟ್ ವೈದ್ಯಕೀಯ ವೇಳಾಪಟ್ಟಿ",
    bookingTitle: "ಅತ್ಯುತ್ತಮ ವೈದ್ಯರನ್ನು ಹುಡುಕಿ ಮತ್ತು ಕಾಯ್ದಿರಿಸಿ ",
    bookingTitleHighlight: "ತಕ್ಷಣ",
    bookingSubtitle: "ಏಥರ್‌ಮೆಡ್ ಬುಕಿಂಗ್ ನೆಟ್‌ವರ್ಕ್‌ಗೆ ಸುಸ್ವಾಗತ. ಪರಿಶೀಲಿಸಿದ ಕ್ಲಿನಿಕ್‌ಗಳನ್ನು ಅನ್ವೇಷಿಸಿ, ತ್ವರಿತ ಸಮಾಲೋಚನೆಗಳನ್ನು ನಿಗದಿಪಡಿಸಿ ಮತ್ತು ಬೆಂಗಳೂರಿನಾದ್ಯಂತ ಉನ್ನತ-ಶ್ರೇಣಿಯ ವೈದ್ಯಕೀಯ ಆರೈಕೆಯನ್ನು ಪ್ರವೇಶಿಸಿ.",
    bookAppointmentBtn: "ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ಕಾಯ್ದಿರಿಸಿ",
    browseServicesBtn: "ಸೇವೆಗಳನ್ನು ಬ್ರೌಸ್ ಮಾಡಿ",
    scheduleVisit: "ನಿಮ್ಮ ಭೇಟಿಯನ್ನು ನಿಗದಿಪಡಿಸಿ",
    firstName: "ಮೊದಲ ಹೆಸರು",
    lastName: "ಕೊನೆಯ ಹೆಸರು",
    emailAddress: "ಇಮೇಲ್ ವಿಳಾಸ",
    phoneNumber: "ಫೋನ್ ಸಂಖ್ಯೆ",
    selectClinic: "ಕ್ಲಿನಿಕ್ ಆಯ್ಕೆಮಾಡಿ",
    confirmBooking: "ಬುಕಿಂಗ್ ಖಚಿತಪಡಿಸಿ",
    processing: "ಪ್ರಕ್ರಿಯೆಗೊಳಿಸಲಾಗುತ್ತಿದೆ...",
    exploreServices: "ಆರೋಗ್ಯ ಸೇವೆಗಳನ್ನು ಅನ್ವೇಷಿಸಿ",
    exploreDesc: "ವೈದ್ಯಕೀಯದ ವಿವಿಧ ವಿಶೇಷ ವ್ಯವಸ್ಥೆಗಳಲ್ಲಿ ಪ್ರಮಾಣೀಕೃತ ಆಯ್ಕೆಗಳನ್ನು ಅನ್ವೇಷಿಸಿ.",
    viewClinics: "ಕ್ಲಿನಿಕ್‌ಗಳನ್ನು ವೀಕ್ಷಿಸಿ →",
    readyToGetStarted: "ಪ್ರಾರಂಭಿಸಲು ಸಿದ್ಧರಿದ್ದೀರಾ?",
    readyDesc: "ಬೆಂಗಳೂರಿನಾದ್ಯಂತ ನಮ್ಮ ಪಾಲುದಾರ ಕ್ಲಿನಿಕ್‌ಗಳ ನೆಟ್‌ವರ್ಕ್ ಅನ್ನು ಬ್ರೌಸ್ ಮಾಡಿ ಮತ್ತು ಇಂದೇ ನಿಮ್ಮ ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ಅನ್ನು ಕಾಯ್ದಿರಿಸಿ.",
    exploreLocations: "ಸ್ಥಳಗಳನ್ನು ಅನ್ವೇಷಿಸಿ →",
    // locations/page.tsx
    networkBadge: "ನಮ್ಮ ಬೆಂಗಳೂರು ನೆಟ್ವರ್ಕ್",
    clinicsTitle: "ಬೆಂಗಳೂರಿನಲ್ಲಿ ಪಾಲುದಾರ ಕ್ಲಿನಿಕ್ಗಳು",
    clinicsDesc: "ಉನ್ನತ ಮಟ್ಟದ ಸ್ವತಂತ್ರ ವೈದ್ಯಕೀಯ ಕೇಂದ್ರಗಳನ್ನು ಅನ್ವೇಷಿಸಿ. ಕಾರ್ಯಾಚರಣೆಯ ಸಮಯ, ವಿಳಾಸ ಮತ್ತು ಲೈವ್ ರೂಟಿಂಗ್ ವೀಕ್ಷಿಸಲು ಕ್ಲಿನಿಕ್ ಆಯ್ಕೆಮಾಡಿ.",
    searchPlaceholder: "ನೆರೆಹೊರೆ ಅಥವಾ ಕ್ಲಿನಿಕ್ ಅನ್ನು ಹುಡುಕಿ...",
    sortDistance: "ದೂರದ ಪ್ರಕಾರ ವಿಂಗಡಿಸಿ (ಹತ್ತಿರದ ಮೊದಲು)",
    sortPopularity: "ಜನಪ್ರಿಯತೆಯ ಪ್ರಕಾರ ವಿಂಗಡಿಸಿ (ಹೆಚ್ಚು ರೇಟ್ ಮಾಡಿದ ಮೊದಲು)",
    sortRating: "ರೇಟಿಂಗ್ ಪ್ರಕಾರ ವಿಂಗಡಿಸಿ (ಉನ್ನತ ರೇಟಿಂಗ್ ಮೊದಲು)",
    findNearMe: "ನನ್ನ ಹತ್ತಿರ ಹುಡುಕಿ",
    clinicsFound: "ಕ್ಲಿನಿಕ್ಗಳು ಕಂಡುಬಂದಿವೆ",
    address: "ವಿಳಾಸ",
    operatingHours: "ಕಾರ್ಯಾಚರಣೆಯ ಸಮಯ",
    phone: "ಫೋನ್",
    readReviews: "ರೋಗಿಗಳ ವಿಮರ್ಶೆಗಳನ್ನು ಓದಿ",
    hideReviews: "ರೋಗಿಗಳ ವಿಮರ್ಶೆಗಳನ್ನು ಮರೆಮಾಡಿ",
    getRoute: "ಮಾರ್ಗ ಮತ್ತು ನಿರ್ದೇಶನಗಳನ್ನು ಪಡೆಯಿರಿ"
  },
  hi: {
    // page.tsx
    heroBadge: "एकीकृत स्वास्थ्य सेवा का अनुभव करें",
    heroTitle: "स्मार्ट चिकित्सा प्रणाली, एकीकृत।",
    heroSubtitle: "आसानी से अपनी देखभाल का समन्वय करें। एथरमेड मरीजों, चिकित्सकों और प्रशासकों को एक सुरक्षित, बुद्धिमान क्लिनिकल प्लेटफॉर्म के माध्यम से जोड़ता है।",
    enterPatient: "रोगी के रूप में दर्ज करें",
    practitionerPortal: "चिकित्सक पोर्टल",
    adminPortal: "प्लेटफॉर्म प्रशासक",
    // home/page.tsx
    smartScheduling: "स्मार्ट चिकित्सा शेड्यूलिंग",
    bookingTitle: "शीर्ष डॉक्टरों को खोजें और बुक करें ",
    bookingTitleHighlight: "तुरंत",
    bookingSubtitle: "एथरमेड बुकिंग नेटवर्क में आपका स्वागत है। सत्यापित क्लीनिकों की खोज करें, तत्काल परामर्श शेड्यूल करें, और पूरे बेंगलुरु में शीर्ष स्तरीय चिकित्सा देखभाल तक पहुंचें।",
    bookAppointmentBtn: "अपॉइंटमेंट बुक करें",
    browseServicesBtn: "सेवाएं ब्राउज़ करें",
    scheduleVisit: "अपनी यात्रा का कार्यक्रम बनाएं",
    firstName: "पहला नाम",
    lastName: "अंतिम नाम",
    emailAddress: "ईमेल पता",
    phoneNumber: "फ़ोन नंबर",
    selectClinic: "एक क्लिनिक चुनें",
    confirmBooking: "बुकिंग की पुष्टि करें",
    processing: "प्रसंस्करण...",
    exploreServices: "स्वास्थ्य सेवाओं का अन्वेषण करें",
    exploreDesc: "चिकित्सा की विभिन्न विशेष प्रणालियों में प्रमाणित विकल्पों का अन्वेषण करें।",
    viewClinics: "क्लीनिक देखें →",
    readyToGetStarted: "आरंभ करने के लिए तैयार हैं?",
    readyDesc: "पूरे बेंगलुरु में हमारे सहयोगी क्लीनिकों के नेटवर्क को ब्राउज़ करें और आज ही अपना अपॉइंटमेंट बुक करें।",
    exploreLocations: "स्थानों का अन्वेषण करें →",
    // locations/page.tsx
    networkBadge: "हमारा बेंगलुरु नेटवर्क",
    clinicsTitle: "बेंगलुरु में पार्टनर क्लीनिक",
    clinicsDesc: "शीर्ष स्तरीय स्वतंत्र चिकित्सा केंद्रों की खोज करें। परिचालन घंटे, पता और लाइव रूटिंग देखने के लिए एक क्लिनिक चुनें।",
    searchPlaceholder: "आस-पड़ोस या क्लिनिक खोजें...",
    sortDistance: "दूरी के आधार पर क्रमित करें (सबसे नज़दीक पहले)",
    sortPopularity: "लोकप्रियता के आधार पर क्रमित करें (सर्वोच्च रेटेड पहले)",
    sortRating: "रेटिंग के आधार पर क्रमित करें (टॉप रेटेड पहले)",
    findNearMe: "मेरे पास खोजें",
    clinicsFound: "क्लीनिक मिले",
    address: "पता",
    operatingHours: "परिचालन घंटे",
    phone: "फ़ोन",
    readReviews: "मरीजों की समीक्षाएं पढ़ें",
    hideReviews: "मरीजों की समीक्षाएं छिपाएं",
    getRoute: "मार्ग और दिशा-निर्देश प्राप्त करें"
  }
};

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");

  const t = (key: string): string => {
    return (translations[language] as Record<string, string>)[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
