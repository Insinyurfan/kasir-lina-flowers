import { History, ReceiptText } from "lucide-react";

// Ikon gabungan untuk "Riwayat Penjualan": nota dengan lencana jam kecil di
// pojok. Dipindahkan dari `app/layout.tsx` supaya bisa dirujuk oleh definisi
// menu di `lib/menuNavigasi.ts` — sekarang ikon menu hidup satu tempat dengan
// menunya, bukan di dalam berkas tata letak.
export default function ReceiptHistoryIcon({ size = 24 }: { size?: number }) {
  return (
    <span className="relative block" style={{ width: size, height: size }}>
      <ReceiptText size={size} />
      <span className="absolute -right-1 -bottom-1 rounded-full bg-current text-pink-600">
        <History size={Math.round(size * 0.54)} className="text-white" />
      </span>
    </span>
  );
}
