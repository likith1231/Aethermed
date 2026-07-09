"use client";

import { useAether } from "../context/AetherContext";

export default function ToastNotification() {
  const { toastMessage } = useAether();

  if (!toastMessage) return null;

  const bgColors = {
    success: "bg-teal-500",
    error: "bg-rose-500",
    info: "bg-slate-800",
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div
        className={`px-6 py-4 rounded-xl shadow-lg shadow-black/10 text-white font-medium flex items-center gap-3 ${
          bgColors[toastMessage.type]
        }`}
      >
        {toastMessage.type === "success" && <span>✓</span>}
        {toastMessage.type === "error" && <span>✕</span>}
        {toastMessage.type === "info" && <span>ℹ</span>}
        <p className="text-sm">{toastMessage.message}</p>
      </div>
    </div>
  );
}
