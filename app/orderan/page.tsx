"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Flower2, Search, Pencil, PackageSearch, Copy, Check } from "lucide-react";

type SavedItem = {
  id: number;
  productId: number;
  variantId: number;
  productName: string;
  variantName: string | null;
  quantity: number;
  // null selama pemilik belum menetapkan harga untuk pembeli ini.
  unitPrice: number | null;
  subtotal: number | null;
};

type SavedOrder = {
  code: string;
  status: string;
  rejectionReason: string | null;
  createdAt: string;
  bisaDiubah: boolean;
  trxNumber: number | null;
  totalPrice: number | null;
  items: SavedItem[];
};

// Dibaca lagi oleh katalog untuk tahu bahwa keranjang yang dimuat adalah
// orderan tersimpan, bukan keranjang baru — lihat app/(frontend)/page.tsx.
const CART_STORAGE_KEY = "lina_katalog_keranjang";
const EDIT_CODE_KEY = "lina_katalog_kode_orderan";

const formatRupiah = (value: number) => `Rp ${value.toLocaleString("id-ID")}`;

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

export default function OrderanPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [order, setOrder] = useState<SavedOrder | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [tersalin, setTersalin] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      setError("Kode orderan wajib diisi.");
      return;
    }

    setIsLoading(true);
    setError("");
    setOrder(null);
    try {
      const res = await fetch(`/api/request-pesanan?orderan=${encodeURIComponent(cleanCode)}`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Kode orderan tidak ditemukan.");
        return;
      }
      setOrder(data);
    } catch {
      setError("Tidak bisa terhubung. Periksa koneksi internetmu.");
    } finally {
      setIsLoading(false);
    }
  };

  // Muat isi orderan ke keranjang katalog, lalu tandai kodenya supaya katalog
  // tahu harus MEMPERBARUI orderan itu — bukan membuat orderan baru dengan kode
  // berbeda. Tanpa penanda ini, tiap penyuntingan akan melahirkan kode baru dan
  // pembeli kehilangan jejak yang mana yang berlaku.
  const handleEdit = () => {
    if (!order) return;
    const keranjang = order.items.map((item) => ({
      productId: item.productId,
      variantId: item.variantId,
      productName: item.productName,
      variantName: item.variantName,
      gambar: null,
      quantity: item.quantity,
    }));
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(keranjang));
      window.localStorage.setItem(EDIT_CODE_KEY, order.code);
    } catch {
      setError("Peramban menolak menyimpan keranjang. Coba matikan mode penyamaran.");
      return;
    }
    router.push("/");
  };

  const handleSalin = async () => {
    if (!order) return;
    try {
      await navigator.clipboard.writeText(order.code);
      setTersalin(true);
      window.setTimeout(() => setTersalin(false), 1800);
    } catch {
      // Peramban tanpa izin papan klip: kodenya toh sudah tampil di layar.
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
            <h1 className="font-black text-rose-950 leading-tight text-base">Buka Kode Orderan</h1>
            <p className="text-[11px] text-pink-500 font-semibold">Lihat & ubah orderan yang sudah kamu simpan</p>
          </div>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-2xl px-4 py-6">
        <form onSubmit={handleSearch} className="rounded-2xl border border-pink-100 bg-white p-5 shadow-sm">
          <label className="block">
            <span className="text-xs font-black text-slate-600">Kode Orderan</span>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="K7QMD4XP"
              maxLength={16}
              className="mt-1.5 w-full rounded-xl border border-pink-100 px-4 py-3 text-sm font-bold uppercase outline-none transition-colors focus:border-pink-400"
            />
            <span className="mt-1.5 block text-[11px] text-slate-400 font-medium">
              Kode ini kamu terima setelah menyimpan orderan dari katalog.
            </span>
          </label>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-pink-600 py-3.5 text-sm font-black text-white transition-colors hover:bg-pink-700 disabled:bg-slate-300"
          >
            <Search size={17} />
            {isLoading ? "Mencari..." : "Buka Orderan"}
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
                  <p className="text-[11px] font-black uppercase tracking-wide text-pink-500">Kode Orderan</p>
                  <button
                    type="button"
                    onClick={handleSalin}
                    className="mt-0.5 flex items-center gap-2 text-base font-black text-rose-950 hover:text-pink-600 transition-colors"
                    title="Salin kode"
                  >
                    <span className="break-all">{order.code}</span>
                    {tersalin ? <Check size={15} className="text-green-600" /> : <Copy size={15} className="text-slate-400" />}
                  </button>
                  <p className="mt-1 text-xs font-semibold text-slate-500">Disimpan {formatWaktu(order.createdAt)}</p>
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

              {order.trxNumber !== null && (
                <div className="mt-3 rounded-xl border border-green-100 bg-green-50 px-3 py-3">
                  <p className="text-xs font-semibold text-green-700">
                    Orderanmu sudah diterima dengan nomor transaksi{" "}
                    <span className="font-black">TRX-{String(order.trxNumber).padStart(4, "0")}</span>.
                  </p>
                  <Link
                    href="/lacak"
                    className="mt-2 inline-flex items-center gap-1.5 text-xs font-black text-green-700 hover:underline"
                  >
                    <PackageSearch size={14} /> Lacak pengirimannya
                  </Link>
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-pink-100 bg-white p-5 shadow-sm">
              <p className="text-[11px] font-black uppercase tracking-wide text-pink-500">Produk Dipilih</p>
              <ul className="mt-3 divide-y divide-pink-50">
                {order.items.map((item) => (
                  <li key={item.id} className="flex items-start justify-between gap-3 py-2.5">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-800">{item.productName}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        {item.variantName && (
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-black text-amber-700">
                            {item.variantName}
                          </span>
                        )}
                        <span className="text-xs font-black text-slate-500">×{item.quantity}</span>
                      </div>
                    </div>
                    {item.subtotal !== null && (
                      <div className="shrink-0 text-right">
                        <p className="text-sm font-black text-slate-700">{formatRupiah(item.subtotal)}</p>
                        {item.unitPrice !== null && (
                          <p className="text-[11px] font-semibold text-slate-400">@{formatRupiah(item.unitPrice)}</p>
                        )}
                      </div>
                    )}
                  </li>
                ))}
              </ul>

              {order.totalPrice !== null ? (
                <div className="mt-3 flex items-center justify-between border-t border-pink-100 pt-3">
                  <span className="text-xs font-black uppercase tracking-wide text-slate-400">Total</span>
                  <span className="text-lg font-black text-rose-950">{formatRupiah(order.totalPrice)}</span>
                </div>
              ) : (
                <p className="mt-3 rounded-xl bg-amber-50 border border-amber-100 px-3 py-2.5 text-[11px] font-semibold text-amber-700">
                  Total belum muncul karena pemilik belum menetapkan harganya. Rinciannya dikirim lewat WhatsApp, dan
                  akan tampil di sini setelah orderanmu diterima.
                </p>
              )}
            </div>

            {order.bisaDiubah ? (
              <button
                type="button"
                onClick={handleEdit}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-pink-600 py-3.5 text-sm font-black text-white transition-colors hover:bg-pink-700"
              >
                <Pencil size={17} /> Ubah Orderan Ini
              </button>
            ) : (
              <p className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-center text-xs font-semibold text-slate-500">
                Orderan yang sudah diproses tidak bisa diubah lagi. Hubungi pemilik lewat WhatsApp bila perlu
                penyesuaian.
              </p>
            )}
          </div>
        )}

        {!order && !error && (
          <div className="mt-8 text-center text-slate-400">
            <Flower2 size={44} className="mx-auto mb-3 text-pink-200" />
            <p className="text-sm font-semibold">Masukkan kode orderanmu untuk melihat kembali pilihanmu.</p>
            <p className="mt-1 text-xs">Selama pemilik belum memprosesnya, isinya masih bisa kamu ubah.</p>
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
