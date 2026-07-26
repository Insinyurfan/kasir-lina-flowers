"use client";

// HALAMAN PINTASAN UNDUH NOTA
// Tujuannya satu: mengunduh nota secepat mungkin untuk orang tua / yang
// buru-buru. Alur lama butuh 5 langkah (Riwayat Penjualan -> Cetak -> pilih
// Nota -> scroll ke bawah -> Download). Di sini cukup: cari -> tekan PDF/JPG.
//
// Halaman ini TIDAK mengubah apa pun di halaman Riwayat Penjualan dan tidak
// menulis data apa pun — hanya membaca transaksi lalu membuat berkas di
// perangkat. Dokumen dibuat oleh fungsi yang sama persis dengan halaman cetak
// (lib/notaDocument.ts), jadi hasilnya identik.

import { useCallback, useEffect, useMemo, useState } from "react";
import { FileDown, FileText, ImageIcon, Loader2, Search, X, Calendar, User } from "lucide-react";
import { getSavedUserSession } from "@/lib/userSession";
import {
  type NotaStoreInfo,
  type NotaTransaction,
  downloadNotaAsJpg,
  downloadNotaAsPdf,
  formatTransactionCode,
} from "@/lib/notaDocument";

const formatTanggal = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  });
};

export default function UnduhNotaPage() {
  const [transaksi, setTransaksi] = useState<NotaTransaction[]>([]);
  const [storeInfo, setStoreInfo] = useState<NotaStoreInfo>({
    brand: "Lina Flowers",
    address: "",
    footer: "",
    logo: "",
    receiptLogo: "",
  });
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  // Menandai baris mana yang sedang dibuatkan berkas, mis. "12-pdf".
  const [busy, setBusy] = useState<string | null>(null);
  const [pesan, setPesan] = useState<string | null>(null);

  useEffect(() => {
    const saved = getSavedUserSession<{ role?: string }>();
    if (!saved || saved.role === "Tamu") {
      window.location.replace("/produk");
      return;
    }

    Promise.all([
      fetch("/api/transaksi?sort=desc", { cache: "no-store" }).then((r) => r.json()),
      fetch("/api/pengaturan", { cache: "no-store" }).then((r) => r.json()),
    ])
      .then(([trx, setting]) => {
        setTransaksi(Array.isArray(trx) ? trx : []);
        if (setting) {
          setStoreInfo({
            brand: setting.brand || "Lina Flowers",
            address: setting.address || "",
            footer: setting.footer || "",
            logo: setting.logo || "",
            receiptLogo: setting.receiptLogo || "",
          });
        }
      })
      .catch(() => setPesan("Gagal memuat data transaksi."))
      .finally(() => setIsLoading(false));
  }, []);

  // Cari berdasarkan nama pembeli ATAU nomor transaksi — orang tua biasanya
  // ingat nama pelanggan, bukan nomor nota.
  const hasil = useMemo(() => {
    const kw = search.trim().toLowerCase();
    if (!kw) return transaksi;
    return transaksi.filter((t) => {
      const kode = formatTransactionCode(t.trxNumber ?? t.id).toLowerCase();
      const nama = (t.nama_pembeli || "").toLowerCase();
      return nama.includes(kw) || kode.includes(kw) || String(t.trxNumber ?? t.id).includes(kw);
    });
  }, [transaksi, search]);

  const unduh = useCallback(
    async (t: NotaTransaction, format: "pdf" | "jpg") => {
      const tanda = `${t.id}-${format}`;
      setBusy(tanda);
      setPesan(null);
      try {
        if (format === "pdf") await downloadNotaAsPdf(storeInfo, t, "nota");
        else await downloadNotaAsJpg(storeInfo, t, "nota");
        setPesan(`Nota ${formatTransactionCode(t.trxNumber ?? t.id)} berhasil diunduh sebagai ${format.toUpperCase()}.`);
      } catch {
        setPesan("Gagal membuat nota. Coba lagi.");
      } finally {
        setBusy(null);
      }
    },
    [storeInfo]
  );

  return (
    <div className="lina-page-stack max-w-4xl mx-auto">
      {/* JUDUL */}
      <div className="lina-panel rounded-3xl border border-pink-100 bg-white p-5 shadow-sm mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-pink-100 text-pink-600 flex items-center justify-center flex-shrink-0">
            <FileDown size={26} />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-black text-rose-950 leading-tight">Unduh Nota</h1>
            <p className="text-sm text-slate-500">Cari pesanan, lalu tekan PDF atau JPG. Selesai.</p>
          </div>
        </div>
      </div>

      {/* PENCARIAN */}
      <div className="relative mb-4">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Ketik nama pembeli atau nomor nota..."
          className="lina-soft-field w-full pl-12 pr-11 py-4 bg-white border border-pink-100 rounded-2xl outline-none focus:border-pink-400 text-base shadow-sm"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            aria-label="Hapus pencarian"
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full text-slate-400 hover:text-pink-600 hover:bg-pink-50"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {pesan && (
        <div className="mb-4 rounded-2xl border border-pink-200 bg-pink-50 px-4 py-3 text-sm font-bold text-pink-700">
          {pesan}
        </div>
      )}

      {/* DAFTAR PESANAN */}
      {isLoading ? (
        <div className="flex items-center justify-center gap-3 py-16 text-pink-500 font-bold">
          <Loader2 size={22} className="animate-spin" /> Memuat pesanan...
        </div>
      ) : hasil.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <FileText size={48} className="mx-auto mb-3 text-pink-200" />
          <p className="font-bold">
            {search ? "Pesanan tidak ditemukan." : "Belum ada pesanan."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {hasil.map((t) => {
            const kode = formatTransactionCode(t.trxNumber ?? t.id);
            const sedangPdf = busy === `${t.id}-pdf`;
            const sedangJpg = busy === `${t.id}-jpg`;
            return (
              <div
                key={t.id}
                className="lina-panel rounded-2xl border border-pink-100 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0">
                    <p className="font-black text-rose-950 text-lg leading-tight truncate">
                      {t.nama_pembeli || "Tanpa nama"}
                    </p>
                    {/* Tanggal dipertebal & digelapkan — ini info yang paling
                        dicari saat mencari nota, harus terbaca sekilas di HP. */}
                    <p className="text-[15px] font-bold text-slate-700 flex items-center gap-1.5 mt-1.5">
                      <Calendar size={15} className="flex-shrink-0 text-pink-500" />
                      {formatTanggal(t.tanggal)}
                    </p>
                    <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <User size={14} className="flex-shrink-0" />
                      Kasir: {t.nama_kasir || "-"}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="inline-block rounded-lg bg-pink-50 border border-pink-200 px-2.5 py-1 text-xs font-black text-pink-700">
                      {kode}
                    </span>
                    <p className="mt-1.5 font-black text-rose-950">
                      Rp {Number(t.total_harga || 0).toLocaleString("id-ID")}
                    </p>
                  </div>
                </div>

                {/* Dua tombol besar — sengaja lebar & jelas agar mudah ditekan. */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => unduh(t, "pdf")}
                    disabled={busy !== null}
                    className="flex items-center justify-center gap-2 rounded-xl bg-pink-600 py-3.5 text-base font-black text-white shadow-md shadow-pink-200 transition-colors hover:bg-pink-700 disabled:opacity-50"
                  >
                    {sedangPdf ? <Loader2 size={19} className="animate-spin" /> : <FileText size={19} />}
                    Dokumen PDF
                  </button>
                  <button
                    type="button"
                    onClick={() => unduh(t, "jpg")}
                    disabled={busy !== null}
                    className="flex items-center justify-center gap-2 rounded-xl bg-white border-2 border-pink-300 py-3.5 text-base font-black text-pink-600 transition-colors hover:bg-pink-50 disabled:opacity-50"
                  >
                    {sedangJpg ? <Loader2 size={19} className="animate-spin" /> : <ImageIcon size={19} />}
                    Gambar JPG
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
