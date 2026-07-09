"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface Booking {
  id: string;
  patientName: string;
  email: string;
  phone: string;
  service: string;
  clinicName?: string;
  date: string;
  status: "Pending" | "Confirmed" | "Rescheduled" | "Cancelled" | "In Cabin" | "Processed";
  assignedStaff: string | null;
  isTelemedicine?: boolean;
  telemedicineLink?: string;
  patientId?: string;
  createdAt: string;
}

export interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  clinicName: string;
  date: string;
  appointmentTimeSlot: string;
  isTelemedicine: boolean;
}

interface AetherContextProps {
  bookings: Booking[];
  setBookings: (bookings: Booking[]) => void;
  createNewBooking: (booking: Booking) => void;
  updateBookingStatus: (id: string, status: "Pending" | "Confirmed" | "Rescheduled" | "Cancelled" | "In Cabin" | "Processed") => void;
  assignBookingStaff: (id: string, staffName: string) => void;
  clearAllBookings: () => void;
  
  bookingFormData: FormData;
  updateBookingFormData: (data: Partial<FormData>) => void;
  
  clinicQueues: { [clinicName: string]: { serving: number; nextUserToken: number; userAssignedToken?: number } };
  incrementToken: (clinicName: string) => void;
  assignUserToken: (clinicName: string) => number;
  
  lastCalledTokenUpdate: number;
  triggerPatientNotification: () => void;
  
  auditLogs: string[];
  addAuditLog: (log: string) => void;
  toastMessage: { message: string; type: 'success' | 'info' | 'error' } | null;
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}

const getDynamicDate = (offsetDays: number = 0) => {
  const d = new Date(Date.now() + offsetDays * 86400000);
  return d.toISOString().split('T')[0];
};

const initialBookings: Booking[] = [
  { id: "BKG-001", patientName: "Ananya Iyer", email: "ananya.iyer@email.com", phone: "+91 9876543210", service: "Token #2", clinicName: "MedPlus Healthcare Centre - Yeshwanthpur", date: `${getDynamicDate(0)} 08:45 AM`, status: "In Cabin", assignedStaff: "Dr. Ashwin Rao", createdAt: new Date().toISOString() },
  { id: "BKG-002", patientName: "Vikram Malhotra", email: "vikram.m@email.com", phone: "+91 9876543211", service: "Token #14", clinicName: "MedPlus Healthcare Centre - Yeshwanthpur", date: `${getDynamicDate(0)} 10:15 AM`, status: "Pending", assignedStaff: "Nurse Lakshmi", createdAt: new Date().toISOString() },
  { id: "BKG-003", patientName: "Rahul Hegde", email: "hegde.rahul@email.com", phone: "+91 9876543212", service: "Token #34", clinicName: "MedPlus Healthcare Centre - Yeshwanthpur", date: `${getDynamicDate(0)} 01:30 PM`, status: "Pending", assignedStaff: null, createdAt: new Date().toISOString() }
];

const initialFormData: FormData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  clinicName: "",
  date: "",
  appointmentTimeSlot: "",
  isTelemedicine: false
};

const AetherContext = createContext<AetherContextProps | undefined>(undefined);

export function AetherProvider({ children }: { children: ReactNode }) {
  const [bookings, setBookings] = useState<Booking[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('aether_user_bookings');
      return saved ? JSON.parse(saved) : initialBookings;
    }
    return initialBookings;
  });
  const [bookingFormData, setBookingFormData] = useState<FormData>(initialFormData);
  const [clinicQueues, setClinicQueues] = useState<{ [clinicName: string]: { serving: number; nextUserToken: number; userAssignedToken?: number } }>({});
  const [lastCalledTokenUpdate, setLastCalledTokenUpdate] = useState<number>(0);
  const [auditLogs, setAuditLogs] = useState<string[]>([
    `[${new Date().toLocaleTimeString()}] SUCCESS: Node ID #87 (Indiranagar Care Hub) database replication sync latency: 8ms.`,
    `[${new Date().toLocaleTimeString()}] SECURE AUTH: Practitioner license status verified active for KMC-58321.`
  ]);
  const [toastMessage, setToastMessage] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    setToastMessage({ message, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('aether_user_bookings', JSON.stringify(bookings));
    }
  }, [bookings]);

  useEffect(() => {
    fetch('/api/bookings')
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data)) {
          setBookings(data);
        }
      })
      .catch(err => console.error("Failed to fetch backend bookings", err));
  }, []);

  const incrementToken = (clinicName: string) => {
    setClinicQueues(prev => {
      const q = prev[clinicName] || { serving: 4, nextUserToken: 5 };
      return { ...prev, [clinicName]: { ...q, serving: q.serving + 1 } };
    });
  };

  const assignUserToken = (clinicName: string) => {
    let assigned = 0;
    setClinicQueues(prev => {
      const q = prev[clinicName] || { serving: 4, nextUserToken: 5 };
      assigned = q.nextUserToken;
      return { ...prev, [clinicName]: { ...q, nextUserToken: q.nextUserToken + 1, userAssignedToken: assigned } };
    });
    return assigned;
  };

  const triggerPatientNotification = () => {
    setLastCalledTokenUpdate(Date.now());
  };

  const addAuditLog = (log: string) => {
    setAuditLogs(prev => [log, ...prev]);
  };

  const createNewBooking = (booking: Booking) => {
    setBookings((prev) => [...prev, booking]);
  };

  const updateBookingStatus = (id: string, status: "Pending" | "Confirmed" | "Rescheduled" | "Cancelled" | "In Cabin" | "Processed") => {
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
  };

  const assignBookingStaff = (id: string, staffName: string) => {
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, assignedStaff: staffName } : b)));
  };

  const clearAllBookings = () => {
    setBookings([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('aether_user_bookings');
      localStorage.removeItem('aether_latest_metrics');
    }
  };

  const updateBookingFormData = (data: Partial<FormData>) => {
    setBookingFormData((prev) => ({ ...prev, ...data }));
  };

  return (
    <AetherContext.Provider
      value={{
        bookings,
        setBookings,
        createNewBooking,
        updateBookingStatus,
        assignBookingStaff,
        clearAllBookings,
        bookingFormData,
        updateBookingFormData,
        clinicQueues,
        incrementToken,
        assignUserToken,
        lastCalledTokenUpdate,
        triggerPatientNotification,
        auditLogs,
        addAuditLog,
        toastMessage,
        showToast
      }}
    >
      {children}
    </AetherContext.Provider>
  );
}

export function useAether() {
  const context = useContext(AetherContext);
  if (context === undefined) {
    throw new Error("useAether must be used within an AetherProvider");
  }
  return context;
}
