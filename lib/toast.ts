// Notifikasi ringan (toast) yang bisa dipanggil dari halaman mana pun.
//
// Sengaja TIDAK memakai React Context supaya tiap halaman cukup
// `import { toast } from "@/lib/toast"` lalu memanggil toast.success(...)
// tanpa perlu membungkus komponen atau meneruskan props. Yang menampilkan
// adalah <ToastHost /> yang dipasang sekali di app/layout.tsx.
//
// Dipakai untuk menggantikan alert() bawaan browser: alert menghentikan
// seluruh halaman sampai ditekan OK, dan tidak bisa dipakai untuk pesan
// "berhasil" karena terlalu mengganggu.

export type ToastType = "success" | "error" | "info";

export type ToastItem = {
  id: number;
  type: ToastType;
  message: string;
};

type Listener = (item: ToastItem) => void;

const listeners = new Set<Listener>();
let counter = 0;

const emit = (type: ToastType, message: unknown) => {
  const text = String(message ?? "").trim();
  if (!text) return;
  counter += 1;
  const item: ToastItem = { id: counter, type, message: text };
  listeners.forEach((listener) => listener(item));
};

export const toast = {
  success: (message: unknown) => emit("success", message),
  error: (message: unknown) => emit("error", message),
  info: (message: unknown) => emit("info", message),
};

// Dipakai ToastHost untuk mendengarkan toast baru. Mengembalikan fungsi
// pembatalan langganan agar aman dipakai di dalam useEffect.
export const subscribeToast = (listener: Listener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
