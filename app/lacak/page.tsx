"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Flower2, PackageSearch, Check, Clock, XCircle } from "lucide-react";

type TrackedItem = {
  id: number;
  productName: string;
  variantName: string | null;
  quantity: number;
};

type StatusHistory = {
  id: number;
  status: string;
  description: string | null;
  createdAt: string;
};

type TrackedOrder = {
  code: string;
  customerName: string;
  status: string;
  rejectionReason: string | null;
  createdAt: string;
  transaction: { id: number; trxNumber: number | null; status_pengiriman: string } | null;
  statusHistory: StatusHistory[];
  items: TrackedItem[];
};

const formatWaktu = (value: string) =>
  new Date(value).toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const statusStyle = (status: string) => {
  if (status === "Ditolak") return "bg-rose-100 text-rose-700";
  if (status === "Menunggu") return "bg-amber-100 text-amber-700";
  return "bg-green-100 text-green-700";
};

export default function LacakPage() {
  const [trx, setTrx] = useState("");
  const [phone, setPhone] = useState("");
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTrx = trx.trim().toUpperCase();
    const cleanPhone = phone.replace(/[^\d+]/g, "");

    if (!cleanTrx) {
      setError("Nomor transaksi wajib diisi.");
      return;
    }
    // Nomor HP bukan sekadar pelengkap: nomor TRX berurutan, jadi tanpa kunci
    // kedua pesanan orang lain bisa dibuka hanya dengan menaikkan angkanya.
    if (cleanPhone.length < 8) {
      setError("Nomor HP belum valid.");
      return;
    }

    setIsLoading(true);
    setError("");
    setOrder(null);
    try {
      const res = await fetch(
        `/api/request-pesanan?trx=${encodeURIComponent(cleanTrx)}&phone=${encodeURIComponent(cleanPhone)}`,
        { cache: "no-store" }
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Pesanan tidak ditemukan.");
        return;
      }
      setOrder(data);
    } catch {
      setError("Tidak bisa terhubung. Periksa koneksi internetmu.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-pink-50 flex flex-col">
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-pink-100 shadow-sm shadow-pink-100">
        <div className="mx-auto w-full max-w-2xl px-4 py-3 flex items-center gap-3">
          <Link
            href="/"
            aria-label="Kembali ke katalog"
            className="p-2 -ml-2 rounded-xl text-slate-500 hover:bg-pink-50 hover:text-pink-600 transition-colors"
          >
            <ArrowLeft size={19} />
          </Link>
          <div className="min-w-0">
            <h1 className="font-black text-rose-950 leading-tight text-base">Lacak Pesanan</h1>
            <p className="text-[11px] text-pink-500 font-semibold">Masukkan nomor transaksi dan nomor HP-mu</p>
          </div>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-2xl px-4 py-6">
        <form onSubmit={handleSearch} className="rounded-2xl border border-pink-100 bg-white p-5 shadow-sm">
          <label className="block">
            <span className="text-xs font-black text-slate-600">Nomor Transaksi</span>
            <input
              type="text"
              value={trx}
              onChange={(e) => setTrx(e.target.value)}
              placeholder="TRX-0207"
              className="mt-1.5 w-full rounded-xl border border-pink-100 px-4 py-3 text-sm outline-none transition-colors focus:border-pink-400"
            />
            <span className="mt-1.5 block text-[11px] text-slate-400 font-medium">
              Nomor transaksi terbit setelah pesananmu diterima. Belum punya? Cek dulu lewat{" "}
              <Link href="/orderan" className="font-bold text-pink-600 hover:underline">
                kode orderan
              </Link>
              .
            </span>
          </label>
          <label className="mt-4 block">
            <span className="text-xs font-black text-slate-600">Nomor HP</span>
            <input
              type="tel"
              inputMode="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="08xxxxxxxxxx"
              className="mt-1.5 w-full rounded-xl border border-pink-100 px-4 py-3 text-sm outline-none transition-colors focus:border-pink-400"
            />
            <span className="mt-1.5 block text-[11px] text-slate-400 font-medium">
              Harus sama dengan nomor yang kamu pakai saat memesan.
            </span>
          </label>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-pink-600 py-3.5 text-sm font-black text-white transition-colors hover:bg-pink-700 disabled:bg-slate-300"
          >
            <PackageSearch size={17} />
            {isLoading ? "Mencari..." : "Lacak Pesanan"}
          </button>

          {error && (
            <p className="mt-4 rounded-xl border border-rose-100 bg-rose-50 px-3 py-2.5 text-xs font-bold text-rose-600">
              {error}
            </p>
          )}
        </form>

        {order && (
          <div className="mt-5 space-y-4">
            <div className="rounded-2xl border border-pink-100 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] font-black uppercase tracking-wide text-pink-500">Kode Pesanan</p>
                  <p className="mt-0.5 text-base font-black text-rose-950 break-all">{order.code}</p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    Atas nama {order.customerName} · {formatWaktu(order.createdAt)}
                  </p>
                </div>
                <span className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-black ${statusStyle(order.status)}`}>
                  {order.status}
                </span>
              </div>

              {order.status === "Ditolak" && order.rejectionReason && (
                <p className="mt-3 rounded-xl border border-rose-100 bg-rose-50 px-3 py-2.5 text-xs font-semibold text-rose-700">
                  Alasan: {order.rejectionReason}
                </p>
              )}

              {order.transaction && (
                <p className="mt-3 rounded-xl border border-green-100 bg-green-50 px-3 py-2.5 text-xs font-semibold text-green-700">
                  Pesananmu sudah diterima dengan nomor transaksi TRX-
                  {String(order.transaction.trxNumber ?? order.transaction.id).padStart(4, "0")}.
                </p>
              )}
            </div>

            <div className="rounded-2xl border border-pink-100 bg-white p-5 shadow-sm">
              <p className="text-[11px] font-black uppercase tracking-wide text-pink-500">Produk Dipesan</p>
              <ul className="mt-3 space-y-2">
                {order.items.map((item) => (
                  <li key={item.id} className="flex justify-between gap-3 text-sm">
                    <span className="min-w-0 font-semibold text-slate-700">
                      {item.productName}
                      {item.variantName && (
                        <span className="ml-1.5 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-black text-amber-700">
                          {item.variantName}
                        </span>
                      )}
                    </span>
                    <span className="shrink-0 font-black text-slate-500">×{item.quantity}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-[11px] font-medium text-slate-400">
                Rincian harga dikirim pemilik lewat WhatsApp, bukan di halaman ini.
              </p>
            </div>

            <div className="rounded-2xl border border-pink-100 bg-white p-5 shadow-sm">
              <p className="text-[11px] font-black uppercase tracking-wide text-pink-500">Riwayat Status</p>
              <ol className="mt-3 space-y-4">
                {order.statusHistory.map((history, index) => {
                  const isLast = index === order.statusHistory.length - 1;
                  const isRejected = history.status === "Ditolak";
                  return (
                    <li key={`${history.id}-${history.createdAt}`} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <span
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                            isRejected ? "bg-rose-100 text-rose-600" : isLast ? "bg-pink-600 text-white" : "bg-green-100 text-green-600"
                          }`}
                        >
                          {isRejected ? <XCircle size={15} /> : isLast ? <Clock size={15} /> : <Check size={15} />}
                        </span>
                        {!isLast && <span className="mt-1 w-px flex-1 bg-pink-100" />}
                      </div>
                      <div className="min-w-0 pb-1">
                        <p className="text-sm font-black text-slate-800">{history.status}</p>
                        {history.description && (
                          <p className="mt-0.5 text-xs font-medium text-slate-500">{history.description}</p>
                        )}
                        <p className="mt-0.5 text-[11px] font-semibold text-slate-400">{formatWaktu(history.createdAt)}</p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        )}

        {!order && !error && (
          <div className="mt-8 text-center text-slate-400">
            <Flower2 size={44} className="mx-auto mb-3 text-pink-200" />
            <p className="text-sm font-semibold">
              Halaman ini melacak pesanan yang sudah diterima pemilik.
            </p>
            <p className="mt-1 text-xs">
              Baru mengirim orderan dan belum dapat nomor transaksi? Buka{" "}
              <Link href="/orderan" className="font-bold text-pink-600 hover:underline">
                kode orderanmu
              </Link>{" "}
              untuk melihat statusnya.
            </p>
          </div>
        )}
      </main>

      <footer className="border-t border-pink-100 bg-white py-5 text-center">
        <Link href="/" className="text-xs font-bold text-pink-600 hover:underline">
          Kembali ke katalog produk
        </Link>
      </footer>
    </div>
  );
}
