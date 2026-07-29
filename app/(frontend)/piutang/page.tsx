"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Check,
  ChevronDown,
  ChevronRight,
  Copy,
  HandCoins,
  Loader2,
  Trash2,
  X,
} from "lucide-react";
import { getSavedUserSession } from "@/lib/userSession";
import { toast } from "@/lib/toast";
import {
  KELOMPOK_UMUR,
  LABEL_KELOMPOK_UMUR,
  METODE_PEMBAYARAN,
  WARNA_KELOMPOK_UMUR,
  susunTeksPenagihan,
  type KelompokUmur,
  type MetodePembayaran,
} from "@/lib/piutang";
import { tanggalWIBString } from "@/lib/waktu";

type PiutangTransaksiJson = {
  id: number;
  trxNumber: number | null;
  tanggal: string;
  totalHarga: number;
  totalDibayar: number;
  sisaTagihan: number;
  umurHari: number;
  kelompokUmur: KelompokUmur;
};

type KelompokPelanggan = {
  kunci: string;
  namaPelanggan: string;
  totalSisa: number;
  umurTertua: number;
  kelompokUmurTertua: KelompokUmur;
  transaksi: PiutangTransaksiJson[];
};

type DataPiutang = {
  totalPiutang: number;
  jumlahPelanggan: number;
  ringkasanUmur: Record<KelompokUmur, { jumlahTransaksi: number; nominal: number }>;
  pelanggan: KelompokPelanggan[];
  namaToko: string;
  penyaringan: { semua: boolean; hariKebelakang: number | null };
};

type Pembayaran = {
  id: number;
  tanggal: string;
  nominal: number;
  metode: string;
  catatan: string | null;
  pencatatNama: string | null;
};

const rupiah = (nilai: number) => `Rp ${Math.round(nilai || 0).toLocaleString("id-ID")}`;
const formatRibuan = (nilai: string) => {
  const angka = nilai.replace(/\D/g, "");
  return angka ? Number(angka).toLocaleString("id-ID") : "";
};
const tanggalPendek = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  });

export default function PiutangPage() {
  const [user, setUser] = useState<{ role?: string } | null>(null);
  const [data, setData] = useState<DataPiutang | null>(null);
  const [memuat, setMemuat] = useState(true);
  const [tampilkanSemua, setTampilkanSemua] = useState(false);
  const [dibuka, setDibuka] = useState<Set<string>>(new Set());

  // Mode pembersihan awal: pilih banyak nota lalu tandai lunas sekaligus.
  const [modePembersihan, setModePembersihan] = useState(false);
  const [terpilih, setTerpilih] = useState<Set<number>>(new Set());
  const [memproses, setMemproses] = useState(false);

  // Modal pembayaran
  const [modal, setModal] = useState<PiutangTransaksiJson | null>(null);
  const [riwayat, setRiwayat] = useState<Pembayaran[]>([]);
  const [nominalBayar, setNominalBayar] = useState("");
  const [metodeBayar, setMetodeBayar] = useState<MetodePembayaran>("Tunai");
  const [tanggalBayar, setTanggalBayar] = useState(() => tanggalWIBString(new Date()));
  const [catatanBayar, setCatatanBayar] = useState("");
  const [menyimpan, setMenyimpan] = useState(false);

  // Sesi dibaca lewat timeout — mengikuti pola halaman lain di repo ini supaya
  // tidak ada setState sinkron di dalam effect.
  useEffect(() => {
    const idTimeout = window.setTimeout(() => {
      setUser(getSavedUserSession<{ role?: string }>());
    }, 0);
    return () => window.clearTimeout(idTimeout);
  }, []);

  const muat = useCallback(async () => {
    try {
      const res = await fetch(`/api/piutang${tampilkanSemua ? "?semua=1" : ""}`, {
        cache: "no-store",
      });
      if (!res.ok) {
        const galat = await res.json().catch(() => ({}));
        throw new Error(galat.error || "Gagal memuat piutang.");
      }
      setData(await res.json());
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal memuat piutang.");
    } finally {
      setMemuat(false);
    }
  }, [tampilkanSemua]);

  useEffect(() => {
    const idTimeout = window.setTimeout(() => void muat(), 0);
    return () => window.clearTimeout(idTimeout);
  }, [muat]);

  const bolehMenulis = user?.role === "Owner" || user?.role === "Admin";

  const bukaModal = async (trx: PiutangTransaksiJson) => {
    setModal(trx);
    setNominalBayar(trx.sisaTagihan.toLocaleString("id-ID"));
    setMetodeBayar("Tunai");
    setTanggalBayar(tanggalWIBString(new Date()));
    setCatatanBayar("");
    setRiwayat([]);
    try {
      const res = await fetch(`/api/pembayaran?transactionId=${trx.id}`, { cache: "no-store" });
      if (res.ok) {
        const isi = await res.json();
        setRiwayat(isi.pembayaran || []);
      }
    } catch {
      // Riwayat gagal dimuat bukan alasan untuk menghalangi pencatatan pembayaran.
    }
  };

  const catatPembayaran = async () => {
    if (!modal) return;
    const angka = Number(nominalBayar.replace(/\D/g, ""));
    if (!angka) return toast.error("Nominal pembayaran belum diisi.");

    setMenyimpan(true);
    try {
      const res = await fetch("/api/pembayaran", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transactionId: modal.id,
          nominal: angka,
          metode: metodeBayar,
          tanggal: tanggalBayar,
          catatan: catatanBayar,
        }),
      });
      const hasil = await res.json();
      if (!res.ok) throw new Error(hasil.error || "Gagal mencatat pembayaran.");

      toast.success(
        hasil.sisaTagihan === 0
          ? `Lunas! Pembayaran ${rupiah(angka)} tercatat.`
          : `Pembayaran ${rupiah(angka)} tercatat. Sisa ${rupiah(hasil.sisaTagihan)}.`
      );
      setModal(null);
      await muat();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal mencatat pembayaran.");
    } finally {
      setMenyimpan(false);
    }
  };

  const hapusPembayaran = async (id: number) => {
    if (!confirm("Hapus pembayaran ini? Tagihan akan kembali terbuka.")) return;
    try {
      const res = await fetch(`/api/pembayaran/${id}`, { method: "DELETE" });
      const hasil = await res.json();
      if (!res.ok) throw new Error(hasil.error || "Gagal menghapus pembayaran.");
      toast.success("Pembayaran dibatalkan.");
      setModal(null);
      await muat();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menghapus pembayaran.");
    }
  };

  const salinTagihan = async (kelompok: KelompokPelanggan) => {
    const teks = susunTeksPenagihan(
      kelompok.namaPelanggan,
      kelompok.transaksi.map((trx) => ({ ...trx, tanggal: new Date(trx.tanggal) })),
      data?.namaToko || "Lina Flowers"
    );
    try {
      await navigator.clipboard.writeText(teks);
      toast.success(`Teks tagihan ${kelompok.namaPelanggan} sudah disalin.`);
    } catch {
      toast.error("Peramban menolak akses papan klip. Salin manual dari layar.");
    }
  };

  const tandaiLunasMassal = async () => {
    if (terpilih.size === 0) return toast.error("Belum ada nota yang dipilih.");
    if (
      !confirm(
        `Tandai ${terpilih.size} nota sebagai lunas? Dipakai untuk membersihkan piutang lama yang sebenarnya sudah dibayar.`
      )
    )
      return;

    setMemproses(true);
    try {
      const res = await fetch("/api/piutang/lunas-massal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactionIds: Array.from(terpilih) }),
      });
      const hasil = await res.json();
      if (!res.ok) throw new Error(hasil.error || "Gagal menandai lunas.");

      toast.success(`${hasil.dilunasi} nota ditandai lunas (${rupiah(hasil.totalNominal)}).`);
      setTerpilih(new Set());
      setModePembersihan(false);
      await muat();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menandai lunas.");
    } finally {
      setMemproses(false);
    }
  };

  const togglePilih = (id: number) => {
    setTerpilih((sebelum) => {
      const baru = new Set(sebelum);
      if (baru.has(id)) baru.delete(id);
      else baru.add(id);
      return baru;
    });
  };

  const toggleBuka = (kunci: string) => {
    setDibuka((sebelum) => {
      const baru = new Set(sebelum);
      if (baru.has(kunci)) baru.delete(kunci);
      else baru.add(kunci);
      return baru;
    });
  };

  const adaLewatTigaPuluh = useMemo(
    () => (data?.ringkasanUmur[">30"]?.jumlahTransaksi ?? 0) > 0,
    [data]
  );

  return (
    <div className="mx-auto w-full max-w-4xl px-3 pb-24 pt-3 desktop:px-6 desktop:pt-6">
      <header className="mb-4">
        <h1 className="flex items-center gap-2 text-xl font-bold text-slate-800 desktop:text-2xl">
          <HandCoins className="text-amber-500" size={24} /> Piutang
        </h1>
        <p className="mt-1 text-xs text-slate-500 desktop:text-sm">
          Nota yang barangnya sudah dikirim tapi uangnya belum masuk. Yang paling lama menunggak ada
          di atas.
        </p>
      </header>

      {/* ---------- Ringkasan ---------- */}
      <section className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-[11px] font-medium text-slate-500">Total piutang berjalan</p>
          <p className="text-2xl font-bold text-slate-800">{rupiah(data?.totalPiutang ?? 0)}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-[11px] font-medium text-slate-500">Dari berapa pelanggan</p>
          <p className="text-2xl font-bold text-slate-800">{data?.jumlahPelanggan ?? 0}</p>
        </div>
      </section>

      {adaLewatTigaPuluh && (
        <div className="mt-3 flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-3">
          <AlertTriangle size={16} className="mt-0.5 shrink-0 text-rose-500" />
          <p className="text-xs leading-relaxed text-rose-700">
            Ada <b>{data?.ringkasanUmur[">30"].jumlahTransaksi} nota</b> yang sudah lewat 30 hari
            senilai <b>{rupiah(data?.ringkasanUmur[">30"].nominal ?? 0)}</b>. Semakin lama menunggak,
            semakin kecil peluang tertagih.
          </p>
        </div>
      )}

      {/* Sebaran umur */}
      <section className="mt-3 grid grid-cols-4 gap-2">
        {KELOMPOK_UMUR.map((kelompok) => (
          <div
            key={kelompok}
            className={`rounded-xl border p-2 text-center ${WARNA_KELOMPOK_UMUR[kelompok]}`}
          >
            <p className="text-[10px] font-semibold leading-tight">
              {LABEL_KELOMPOK_UMUR[kelompok]}
            </p>
            <p className="mt-0.5 text-sm font-bold">
              {rupiah(data?.ringkasanUmur[kelompok]?.nominal ?? 0)}
            </p>
          </div>
        ))}
      </section>

      {/* ---------- Kendali ---------- */}
      <section className="mt-4 flex flex-wrap items-center gap-2">
        <button
          onClick={() => setTampilkanSemua((n) => !n)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
        >
          {tampilkanSemua ? "Tampilkan 90 hari terakhir" : "Tampilkan seluruh riwayat"}
        </button>

        {bolehMenulis && (
          <button
            onClick={() => {
              setModePembersihan((n) => !n);
              setTerpilih(new Set());
            }}
            className={`rounded-xl border px-3 py-2 text-xs font-semibold transition ${
              modePembersihan
                ? "border-sky-300 bg-sky-50 text-sky-700"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {modePembersihan ? "Batal pembersihan" : "Mode pembersihan"}
          </button>
        )}

        {modePembersihan && terpilih.size > 0 && (
          <button
            onClick={tandaiLunasMassal}
            disabled={memproses}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-600 disabled:opacity-60"
          >
            {memproses ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
            Tandai {terpilih.size} nota lunas
          </button>
        )}
      </section>

      {modePembersihan && (
        <p className="mt-2 rounded-xl bg-sky-50 px-3 py-2 text-[11px] leading-relaxed text-sky-800">
          Mode pembersihan untuk merapikan piutang lama yang sebenarnya sudah dibayar tetapi
          statusnya tidak pernah diperbarui. Pembayarannya dicatat bertanggal nota asli, jadi laporan
          kas bulan ini tidak ikut melonjak.
        </p>
      )}

      {/* ---------- Daftar per pelanggan ---------- */}
      <section className="mt-4 space-y-3">
        {memuat && <p className="py-10 text-center text-sm text-slate-400">Memuat…</p>}

        {!memuat && (data?.pelanggan.length ?? 0) === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 py-12 text-center">
            <p className="text-sm font-medium text-slate-600">Tidak ada piutang. 🎉</p>
            <p className="mt-1 text-xs text-slate-400">
              Semua nota{tampilkanSemua ? "" : " dalam 90 hari terakhir"} sudah dibayar.
            </p>
          </div>
        )}

        {data?.pelanggan.map((kelompok) => {
          const terbuka = dibuka.has(kelompok.kunci);
          return (
            <div
              key={kelompok.kunci}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
            >
              <div className="flex items-center gap-3 p-4">
                <button
                  onClick={() => toggleBuka(kelompok.kunci)}
                  className="flex min-w-0 flex-1 items-center gap-3 text-left"
                >
                  {terbuka ? (
                    <ChevronDown size={16} className="shrink-0 text-slate-400" />
                  ) : (
                    <ChevronRight size={16} className="shrink-0 text-slate-400" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-slate-800">
                      {kelompok.namaPelanggan}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {kelompok.transaksi.length} nota · tertua {kelompok.umurTertua} hari
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-bold text-slate-800">
                      {rupiah(kelompok.totalSisa)}
                    </p>
                    <span
                      className={`mt-0.5 inline-block rounded-md border px-1.5 py-0.5 text-[9px] font-bold ${WARNA_KELOMPOK_UMUR[kelompok.kelompokUmurTertua]}`}
                    >
                      {LABEL_KELOMPOK_UMUR[kelompok.kelompokUmurTertua]}
                    </span>
                  </div>
                </button>
                <button
                  onClick={() => salinTagihan(kelompok)}
                  className="shrink-0 rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-emerald-600"
                  title="Salin teks tagihan untuk WhatsApp"
                  aria-label="Salin teks tagihan"
                >
                  <Copy size={16} />
                </button>
              </div>

              {terbuka && (
                <div className="border-t border-slate-100 bg-slate-50/60 p-3">
                  <div className="space-y-2">
                    {kelompok.transaksi.map((trx) => (
                      <div
                        key={trx.id}
                        className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3"
                      >
                        {modePembersihan && (
                          <input
                            type="checkbox"
                            checked={terpilih.has(trx.id)}
                            onChange={() => togglePilih(trx.id)}
                            className="h-4 w-4 shrink-0 accent-emerald-500"
                          />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-700">
                            {trx.trxNumber ? `Nota #${trx.trxNumber}` : `Nota ID ${trx.id}`}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {tanggalPendek(trx.tanggal)} · {trx.umurHari} hari
                          </p>
                          {trx.totalDibayar > 0 && (
                            <p className="text-[10px] text-emerald-600">
                              sudah dibayar {rupiah(trx.totalDibayar)} dari{" "}
                              {rupiah(trx.totalHarga)}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-slate-800">
                            {rupiah(trx.sisaTagihan)}
                          </p>
                          {bolehMenulis && !modePembersihan && (
                            <button
                              onClick={() => bukaModal(trx)}
                              className="mt-1 rounded-lg bg-emerald-500 px-2.5 py-1 text-[10px] font-bold text-white hover:bg-emerald-600"
                            >
                              Catat Bayar
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </section>

      {/* ---------- Modal catat pembayaran ---------- */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 desktop:items-center desktop:p-4">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-5 desktop:rounded-2xl">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-800">Catat Pembayaran</h2>
                <p className="text-xs text-slate-500">
                  {modal.trxNumber ? `Nota #${modal.trxNumber}` : `Nota ID ${modal.id}`} ·{" "}
                  {tanggalPendek(modal.tanggal)}
                </p>
              </div>
              <button
                onClick={() => setModal(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
                aria-label="Tutup"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mb-4 grid grid-cols-3 gap-2 rounded-xl bg-slate-50 p-3 text-center">
              <div>
                <p className="text-[10px] text-slate-500">Total nota</p>
                <p className="text-xs font-bold text-slate-700">{rupiah(modal.totalHarga)}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500">Sudah dibayar</p>
                <p className="text-xs font-bold text-emerald-600">{rupiah(modal.totalDibayar)}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500">Sisa</p>
                <p className="text-xs font-bold text-rose-600">{rupiah(modal.sisaTagihan)}</p>
              </div>
            </div>

            <label className="block text-xs font-semibold text-slate-500">Nominal dibayar</label>
            <div className="mt-1 flex items-baseline gap-2 border-b-2 border-slate-200 pb-2 focus-within:border-emerald-400">
              <span className="text-base font-bold text-slate-400">Rp</span>
              <input
                value={nominalBayar}
                onChange={(e) => setNominalBayar(formatRibuan(e.target.value))}
                inputMode="numeric"
                className="w-full bg-transparent text-2xl font-bold text-slate-800 outline-none"
              />
            </div>
            <div className="mt-2 flex gap-2">
              <button
                onClick={() => setNominalBayar(modal.sisaTagihan.toLocaleString("id-ID"))}
                className="rounded-lg border border-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-50"
              >
                Lunasi semua
              </button>
              <button
                onClick={() =>
                  setNominalBayar(Math.round(modal.sisaTagihan / 2).toLocaleString("id-ID"))
                }
                className="rounded-lg border border-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-50"
              >
                Setengah
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500">Lewat</label>
                <select
                  value={metodeBayar}
                  onChange={(e) => setMetodeBayar(e.target.value as MetodePembayaran)}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-400"
                >
                  {METODE_PEMBAYARAN.map((nama) => (
                    <option key={nama} value={nama}>
                      {nama}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500">Tanggal terima</label>
                <input
                  type="date"
                  value={tanggalBayar}
                  onChange={(e) => setTanggalBayar(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-400"
                />
              </div>
            </div>

            <input
              value={catatanBayar}
              onChange={(e) => setCatatanBayar(e.target.value)}
              placeholder="Catatan (opsional)"
              className="mt-3 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-400"
            />

            <button
              onClick={catatPembayaran}
              disabled={menyimpan}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-sm font-bold text-white hover:bg-emerald-600 disabled:opacity-60"
            >
              {menyimpan ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
              Simpan Pembayaran
            </button>

            {riwayat.length > 0 && (
              <div className="mt-5 border-t border-slate-100 pt-4">
                <h3 className="mb-2 text-xs font-bold text-slate-600">Riwayat pembayaran</h3>
                <div className="space-y-2">
                  {riwayat.map((bayar) => (
                    <div
                      key={bayar.id}
                      className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-slate-700">
                          {rupiah(bayar.nominal)}{" "}
                          <span className="font-normal text-slate-500">· {bayar.metode}</span>
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {tanggalPendek(bayar.tanggal)}
                          {bayar.pencatatNama ? ` · ${bayar.pencatatNama}` : ""}
                          {bayar.catatan ? ` · ${bayar.catatan}` : ""}
                        </p>
                      </div>
                      <button
                        onClick={() => hapusPembayaran(bayar.id)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                        aria-label="Hapus pembayaran"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
