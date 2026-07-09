"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "../context/LanguageContext";
import { useAether } from "../context/AetherContext";
import { clinics } from "../data/clinics";
import { todayInClinicTimezone, tomorrowInClinicTimezone } from "../lib/timezone";

type Message = {
  id: string;
  role: "user" | "ai";
  text: string;
  options?: { label: string; value: string }[];
};

type BookingState = 
  | 'idle' 
  | 'collecting_service' 
  | 'collecting_specialty'
  | 'collecting_location' 
  | 'collecting_clinic_selection'
  | 'collecting_consult_type' 
  | 'collecting_date'
  | 'collecting_time' 
  | 'collecting_name' 
  | 'collecting_phone' 
  | 'collecting_email' 
  | 'confirming';

export default function AIEngineBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: "msg-0", role: "ai", text: "Hello! I am your AetherMed assistant. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  
  const [bookingState, setBookingState] = useState<BookingState>('idle');
  
  // Persistent session state for this conversation
  const [tempBookingData, setTempBookingData] = useState<{
    service: string;
    specialty: string;
    location: string;
    clinicName: string;
    consultType: string;
    date: string;
    time: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    matchingClinics: any[];
  }>({
    service: "",
    specialty: "",
    location: "",
    clinicName: "",
    consultType: "",
    date: "",
    time: "",
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    matchingClinics: []
  });
  
  const router = useRouter();
  const { language } = useLanguage();
  const { createNewBooking } = useAether();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const addMessage = (role: "user" | "ai", text: string, options?: { label: string; value: string }[]) => {
    setMessages(prev => [...prev, { id: Date.now().toString() + Math.random(), role, text, options }]);
  };

  const checkAndAskContactInfo = (currentData: any) => {
    if (!currentData.firstName) {
      setBookingState('collecting_name');
      addMessage("ai", "To finalize your booking, could you please provide your full name?");
    } else if (!currentData.phone) {
      setBookingState('collecting_phone');
      addMessage("ai", `Thanks ${currentData.firstName}. Could you please provide your phone number?`);
    } else if (!currentData.email) {
      setBookingState('collecting_email');
      addMessage("ai", "Great! Lastly, what is your email address?");
    } else {
      // We have all contact info, proceed to confirm
      setBookingState('confirming');
      addMessage("ai", `Please confirm your booking details:
- **Service**: ${currentData.service}
- **Clinic**: ${currentData.clinicName}
- **Type**: ${currentData.consultType}
- **Time**: ${currentData.date} at ${currentData.time}
- **Patient**: ${currentData.firstName} ${currentData.lastName}
- **Contact**: ${currentData.phone}, ${currentData.email}

Reply with 'Yes' to confirm or 'Cancel' to stop.`);
    }
  };

  const processInput = async (userText: string) => {
    addMessage("user", userText);
    setIsTyping(true);

    const lowerInput = userText.toLowerCase();

    // Global Cancel
    if (bookingState !== 'idle' && (lowerInput === 'cancel' || lowerInput === 'stop')) {
      setBookingState('idle');
      // Reset only booking specific fields, keep contact info!
      setTempBookingData(prev => ({
        ...prev,
        service: "", specialty: "", location: "", clinicName: "", consultType: "", date: "", time: "", matchingClinics: []
      }));
      setTimeout(() => {
        addMessage("ai", "Booking process cancelled. How else can I help you?");
        setIsTyping(false);
      }, 500);
      return;
    }

    setTimeout(async () => {
      if (bookingState === 'collecting_service') {
        const service = userText;
        setTempBookingData(prev => ({ ...prev, service }));
        setBookingState('collecting_specialty');
        
        let specialtyOptions = [];
        if (service === "Allopathy") specialtyOptions = ["Cardiology", "Dermatology", "Pediatrics", "Orthopedics"];
        else if (service === "Ayurveda") specialtyOptions = ["Panchakarma", "Herbal Medicine", "Yoga Therapy", "Dosha Balancing"];
        else if (service === "Homeopathy") specialtyOptions = ["Constitutional Care", "Chronic Pathology", "Pediatric Homeopathy", "Acute Remedies"];
        else specialtyOptions = ["Pet Surgery", "Canine Wellness", "Feline Care", "Exotic Animals"];
        
        addMessage("ai", `Great! You selected ${service}. What specialty do you need?`, 
          specialtyOptions.map(opt => ({ label: opt, value: opt }))
        );
        setIsTyping(false);
        return;
      }

      if (bookingState === 'collecting_specialty') {
        const specialty = userText;
        setTempBookingData(prev => ({ ...prev, specialty }));
        setBookingState('collecting_location');
        
        // Extract unique areas based on the service selected
        const systemClinics = clinics.filter(c => c.category.toLowerCase() === tempBookingData.service.toLowerCase());
        const uniqueAreas = Array.from(new Set(systemClinics.map(c => c.area))).slice(0, 6);
        
        addMessage("ai", `Got it. Which area or location are you looking for?`,
          uniqueAreas.map(area => ({ label: area, value: area }))
        );
        setIsTyping(false);
        return;
      }

      if (bookingState === 'collecting_location') {
        const location = userText;
        // Basic match against clinics DB, filtered by service
        const systemClinics = clinics.filter(c => c.category.toLowerCase() === tempBookingData.service.toLowerCase());
        let matched = systemClinics.filter(c => 
          c.area.toLowerCase().includes(location.toLowerCase()) || 
          location.toLowerCase().includes(c.area.toLowerCase())
        );

        if (matched.length > 0) {
          setTempBookingData(prev => ({ ...prev, location, matchingClinics: matched }));
          
          if (matched.length === 1) {
            setTempBookingData(prev => ({ ...prev, location, clinicName: matched[0].name }));
            setBookingState('collecting_consult_type');
            addMessage("ai", `I found ${matched[0].name} in ${matched[0].area}. Will this be an in-person visit or a video consultation?`, [
              { label: "In-Person Visit", value: "In-Person Visit" },
              { label: "Video Consultation", value: "Video Consultation" }
            ]);
          } else {
            setBookingState('collecting_clinic_selection');
            addMessage("ai", `I found multiple options near you. Please select a clinic:`, 
              matched.map((m, i) => ({ label: m.name, value: m.name }))
            );
          }
        } else {
          // Find fallback
          const fallback = systemClinics.slice(0, 3);
          setBookingState('collecting_clinic_selection');
          setTempBookingData(prev => ({ ...prev, location, matchingClinics: fallback }));
          
          addMessage("ai", `We don't have clinics exactly in ${location} for ${tempBookingData.service}, but here are some options. Please select one:`,
            fallback.map(m => ({ label: m.name, value: m.name }))
          );
        }
        setIsTyping(false);
        return;
      }

      if (bookingState === 'collecting_clinic_selection') {
        const matched = tempBookingData.matchingClinics;
        const selected = matched.find(m => m.name.toLowerCase() === lowerInput || lowerInput.includes(m.name.toLowerCase()));
        
        if (selected) {
          setTempBookingData(prev => ({ ...prev, clinicName: selected.name }));
          setBookingState('collecting_consult_type');
          addMessage("ai", `You selected ${selected.name}. Do you prefer an in-person visit or a video/telemedicine consultation?`, [
            { label: "In-Person Visit", value: "In-Person Visit" },
            { label: "Video Consultation", value: "Video Consultation" }
          ]);
        } else {
          addMessage("ai", "Please select a clinic from the options provided.", matched.map(m => ({ label: m.name, value: m.name })));
        }
        setIsTyping(false);
        return;
      }

      if (bookingState === 'collecting_consult_type') {
        const isVideo = lowerInput.includes("video") || lowerInput.includes("tele");
        const consultType = isVideo ? "Video Consultation" : "In-Person Visit";
        setTempBookingData(prev => ({ ...prev, consultType }));
        setBookingState('collecting_date');
        
        const todayStr = todayInClinicTimezone();
        const tomorrowStr = tomorrowInClinicTimezone();
        
        addMessage("ai", `Got it, ${consultType}. What date would you prefer?`, [
          { label: "Today", value: todayStr },
          { label: "Tomorrow", value: tomorrowStr }
        ]);
        setIsTyping(false);
        return;
      }

      if (bookingState === 'collecting_date') {
        let dateStr = userText;
        if (lowerInput === "today") dateStr = todayInClinicTimezone();
        else if (lowerInput === "tomorrow") {
          dateStr = tomorrowInClinicTimezone();
        }
        
        // Basic validation of date string YYYY-MM-DD
        if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
          // Fallback to NLP if user types "next monday" etc, but keep it simple for now
          addMessage("ai", "Please select a date or provide it in YYYY-MM-DD format.");
          setIsTyping(false);
          return;
        }

        setTempBookingData(prev => ({ ...prev, date: dateStr }));
        addMessage("ai", `Checking available slots for ${dateStr}...`);
        
        try {
          const res = await fetch(`/api/slots?clinicId=${encodeURIComponent(tempBookingData.clinicName)}&date=${dateStr}`);
          const data = await res.json();
          
          const availableSlots = data.slots?.filter((s: any) => !s.isFull) || [];
          
          if (availableSlots.length === 0) {
            addMessage("ai", `I'm sorry, there are no available slots on ${dateStr}. Please choose another date.`, [
              { label: "Today", value: todayInClinicTimezone() },
              { label: "Tomorrow", value: tomorrowInClinicTimezone() }
            ]);
            // STAY in collecting_date
            setIsTyping(false);
            return;
          } else {
            setBookingState('collecting_time');
            addMessage("ai", `Here are the available slots for ${dateStr}. Please select one:`, 
              availableSlots.map((s: any) => ({ label: s.time, value: s.time }))
            );
          }
        } catch (e) {
          addMessage("ai", "Sorry, I had trouble checking availability. Please try again.");
        }
        setIsTyping(false);
        return;
      }

      if (bookingState === 'collecting_time') {
        const targetTime = userText;
        // In a real app we might validate this against the API again
        const updatedData = { ...tempBookingData, time: targetTime };
        setTempBookingData(updatedData);
        checkAndAskContactInfo(updatedData);
        setIsTyping(false);
        return;
      }

      if (bookingState === 'collecting_name') {
        const parts = userText.split(' ');
        const firstName = parts[0];
        const lastName = parts.slice(1).join(' ') || '';
        const updatedData = { ...tempBookingData, firstName, lastName };
        setTempBookingData(updatedData);
        checkAndAskContactInfo(updatedData);
        setIsTyping(false);
        return;
      }

      if (bookingState === 'collecting_phone') {
        const phoneClean = userText.replace(/\D/g, '');
        if (phoneClean.length >= 10) {
          const updatedData = { ...tempBookingData, phone: userText };
          setTempBookingData(updatedData);
          checkAndAskContactInfo(updatedData);
        } else {
          addMessage("ai", "That doesn't look like a valid phone number. Please provide a 10-digit number.");
        }
        setIsTyping(false);
        return;
      }

      if (bookingState === 'collecting_email') {
        if (userText.includes('@')) {
          const updatedData = { ...tempBookingData, email: userText };
          setTempBookingData(updatedData);
          checkAndAskContactInfo(updatedData);
        } else {
          addMessage("ai", "Please provide a valid email address containing an '@' symbol.");
        }
        setIsTyping(false);
        return;
      }

      if (bookingState === 'confirming') {
        if (lowerInput === 'yes' || lowerInput === 'y' || lowerInput === 'confirm') {
          addMessage("ai", "Processing your booking...");
          try {
            const bookingPayload = {
              patientName: `${tempBookingData.firstName} ${tempBookingData.lastName}`.trim(),
              email: tempBookingData.email,
              phone: tempBookingData.phone,
              clinicName: tempBookingData.clinicName,
              timeInput: `${tempBookingData.date} ${tempBookingData.time}`,
              date: tempBookingData.date,
              isTelemedicine: tempBookingData.consultType === "Video Consultation",
            };
            
            const bookRes = await fetch('/api/bookings', {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify(bookingPayload)
            });
            
            const bookData = await bookRes.json();
            if (bookData.success) {
               createNewBooking(bookData.booking);
               addMessage("ai", `🎉 Your booking is confirmed! Your token number is ${bookData.booking.userToken}. We'll see you at ${tempBookingData.clinicName} on ${tempBookingData.date} at ${tempBookingData.time}.`);
            } else {
               addMessage("ai", "There was an error confirming your booking. Please try again later.");
            }
          } catch (err) {
            addMessage("ai", "There was a network error confirming your booking.");
          }
          
          setBookingState('idle');
          // We DO NOT wipe name, phone, email from state, so next time it's remembered!
          setTempBookingData(prev => ({
            ...prev,
            service: "", location: "", clinicName: "", consultType: "", date: "", time: "", matchingClinics: []
          }));
        } else {
          addMessage("ai", "Booking cancelled. How else can I help you?");
          setBookingState('idle');
          setTempBookingData(prev => ({
            ...prev,
            service: "", location: "", clinicName: "", consultType: "", date: "", time: "", matchingClinics: []
          }));
        }
        setIsTyping(false);
        return;
      }

      // ----------------------------------------------------
      // IDLE STATE (Detecting Intents)
      // ----------------------------------------------------
      const bookKeywords = ["book", "appointment", "schedule", "consult"];
      const isBook = bookKeywords.some((k) => lowerInput.includes(k));

      if (isBook) {
        setBookingState('collecting_service');
        addMessage("ai", "I can help you book an appointment! What kind of care are you looking for?", [
          { label: "Allopathy", value: "Allopathy" },
          { label: "Ayurveda", value: "Ayurveda" },
          { label: "Homeopathy", value: "Homeopathy" },
          { label: "Veterinary", value: "Veterinary" }
        ]);
        setIsTyping(false);
        return;
      }

      // Default fallback
      addMessage("ai", "I am listening. Please let me know if you would like to book an appointment or describe your symptoms.");
      setIsTyping(false);

    }, 1000);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
      {isOpen && (
        <div className="w-80 md:w-96 h-[500px] bg-slate-900/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/15 flex flex-col overflow-hidden text-white mb-4 animate-in fade-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="p-4 border-b border-white/10 bg-slate-800/50 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-400">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-sm">Aether AI Engine</h3>
                <p className="text-[10px] text-teal-400">Online | Booking & Routing</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
            {messages.map((m) => (
              <div key={m.id} className={`flex flex-col gap-2 ${m.role === "user" ? "items-end" : "items-start"}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${
                  m.role === "user" 
                    ? "bg-teal-600 text-white rounded-br-none" 
                    : "bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-none"
                }`}>
                  {m.text}
                </div>
                {m.options && m.options.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {m.options.map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => processInput(opt.value)}
                        disabled={isTyping || bookingState === 'idle'} // Optional: disable if state moved on
                        className="px-3 py-1.5 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 rounded-lg text-xs text-white transition-colors"
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-bl-none px-4 py-3 flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 border-t border-white/10 bg-slate-900 shrink-0">
            <form 
              onSubmit={(e) => { e.preventDefault(); if (input.trim()) { const t = input.trim(); setInput(""); processInput(t); } }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={bookingState !== 'idle' ? "Enter details or say 'cancel'..." : "Type 'book an appointment'..."}
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="w-10 h-10 rounded-xl bg-teal-600 hover:bg-teal-500 flex items-center justify-center text-white disabled:opacity-50 transition-colors shrink-0 cursor-pointer"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* FAB Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-gradient-to-br from-teal-400 to-teal-700 shadow-xl shadow-teal-900/30 border border-teal-300/30 flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-all cursor-pointer z-50"
      >
        {isOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            <path d="M9 10h.01" />
            <path d="M15 10h.01" />
            <path d="M12 10h.01" />
          </svg>
        )}
      </button>
    </div>
  );
}
