"use client";

// Penampil notifikasi (toast) global. Dipasang sekali di app/layout.tsx,
// lalu halaman mana pun tinggal memanggil toast.success/error/info
// dari "@/lib/toast".

import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";
import { subscribeToast, type ToastItem } from "@/lib/toast";

// Pesan gagal ditahan lebih lama supaya sempat dibaca — biasanya berisi
// alasan kenapa gagal.
const DURASI: Record<ToastItem["type"], number> = {
  success: 3500,
  info: 4000,
  error: 6000,
};

const GAYA: Record<ToastItem["type"], { wrap: string; icon: React.ReactNode }> = {
  success: {
    wrap: "border-emerald-200 bg-emerald-50 text-emerald-800",
    icon: <CheckCircle2 size={20} className="text-emerald-600 flex-shrink-0" />,
  },
  error: {
    wrap: "border-rose-200 bg-rose-50 text-rose-800",
    icon: <XCircle size={20} className="text-rose-500 flex-shrink-0" />,
  },
  info: {
    wrap: "border-pink-200 bg-pink-50 text-pink-800",
    icon: <Info size={20} className="text-pink-500 flex-shrink-0" />,
  },
};

export default function ToastHost() {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => {
    const timers: number[] = [];
    const unsubscribe = subscribeToast((item) => {
      // Batasi 4 toast sekaligus supaya layar HP tidak tertutup penuh.
      setItems((current) => [...current.slice(-3), item]);
      const timer = window.setTimeout(() => {
        setItems((current) => current.filter((t) => t.id !== item.id));
      }, DURASI[item.type]);
      timers.push(timer);
    });
    return () => {
      unsubscribe();
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  const tutup = (id: number) => setItems((current) => current.filter((t) => t.id !== id));

  if (items.length === 0) return null;

  return (
    <div
      className="fixed top-3 left-1/2 -translate-x-1/2 desktop:left-auto desktop:right-5 desktop:translate-x-0 z-[120] flex w-[calc(100vw-1.5rem)] max-w-sm flex-col gap-2"
      role="status"
      aria-live="polite"
    >
      {items.map((item) => {
        const gaya = GAYA[item.type];
        return (
          <div
            key={item.id}
            className={`flex items-start gap-2.5 rounded-2xl border px-3.5 py-3 shadow-lg backdrop-blur-sm toast-masuk ${gaya.wrap}`}
          >
            {gaya.icon}
            <p className="flex-1 text-sm font-bold leading-snug break-words">{item.message}</p>
            <button
              type="button"
              onClick={() => tutup(item.id)}
              aria-label="Tutup notifikasi"
              className="flex-shrink-0 rounded-full p-0.5 opacity-60 transition-opacity hover:opacity-100"
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
