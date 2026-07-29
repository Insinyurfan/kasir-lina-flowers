"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Pencil,
  Trash2,
  Wallet,
  X,
} from "lucide-react";
import { getSavedUserSession } from "@/lib/userSession";
import { toast } from "@/lib/toast";
import { compressProductImage } from "@/lib/compressProductImage";
import {
  INFO_KATEGORI,
  KATEGORI_PENGELUARAN,
  KATEGORI_PRIVE,
  METODE_PENGELUARAN,
  type KategoriPengeluaran,
  type MetodePengeluaran,
} from "@/lib/pengeluaran";
import { rentangBulanWIB, tanggalWIBString } from "@/lib/waktu";

type Pengeluaran = {
  id: number;
  tanggal: string;
  nominal: number;
  kategori: KategoriPengeluaran;
  catatan: string | null;
  metode: string;
  fotoUrl: string | null;
  pencatatNama: string | null;
};

const rupiah = (nilai: number) => `Rp ${Math.round(nilai || 0).toLocaleString("id-ID")}`;

// Tampilkan angka sambil diketik: "250000" → "250.000".
const formatRibuan = (nilai: string) => {
  const angka = nilai.replace(/\D/g, "");
  return angka ? Number(angka).toLocaleString("id-ID") : "";
};

const tanggalPanjang = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  });

export default function PengeluaranPage() {
  const [user, setUser] = useState<{ role?: string } | null>(null);
  const [memuat, setMemuat] = useState(true);
  const [menyimpan, setMenyimpan] = useState(false);
  const [daftar, setDaftar] = useState<Pengeluaran[]>([]);
  const [total, setTotal] = useState(0);
  const [perKategori, setPerKategori] = useState<Record<string, number>>({});

  // Bulan yang sedang dilihat; 0 = bulan ini, -1 = bulan lalu, dst.
  const [geserBulan, setGeserBulan] = useState(0);

  // Formulir
  const [idDiubah, setIdDiubah] = useState<number | null>(null);
  const [nominal, setNominal] = useState("");
  const [kategori, setKategori] = useState<KategoriPengeluaran | null>(null);
  const [metode, setMetode] = useState<MetodePengeluaran>("Tunai");
  const [catatan, setCatatan] = useState("");
  const [tanggal, setTanggal] = useState(() => tanggalWIBString(new Date()));
  const [fotoUrl, setFotoUrl] = useState<string | null>(null);
  const [mengunggahFoto, setMengunggahFoto] = useState(false);
  const inputFotoRef = useRef<HTMLInputElement>(null);

  const [fotoDibuka, setFotoDibuka] = useState<string | null>(null);

  const rentang = useMemo(() => {
    const acuan = new Date();
    acuan.setMonth(acuan.getMonth() + geserBulan);
    return rentangBulanWIB(acuan);
  }, [geserBulan]);

  const labelBulan = useMemo(
    () =>
      rentang.mulai.toLocaleDateString("id-ID", {
        month: "long",
        year: "numeric",
        timeZone: "Asia/Jakarta",
      }),
    [rentang]
  );

  // Sesi dibaca dari localStorage lewat timeout — mengikuti pola halaman lain
  // di repo ini supaya tidak ada setState sinkron di dalam effect.
  useEffect(() => {
    const idTimeout = window.setTimeout(() => {
      setUser(getSavedUserSession<{ role?: string }>());
    }, 0);
    return () => window.clearTimeout(idTimeout);
  }, []);

  const muat = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        mulai: tanggalWIBString(rentang.mulai),
        selesai: tanggalWIBString(rentang.selesai),
      });
      const res = await fetch(`/api/pengeluaran?${params}`, { cache: "no-store" });
      if (!res.ok) {
        const galat = await res.json().catch(() => ({}));
        throw new Error(galat.error || "Gagal memuat pengeluaran.");
      }
      const data = await res.json();
      setDaftar(data.pengeluaran || []);
      setTotal(data.total || 0);
      setPerKategori(data.perKategori || {});
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal memuat pengeluaran.");
    } finally {
      setMemuat(false);
    }
  }, [rentang]);

  useEffect(() => {
    const idTimeout = window.setTimeout(() => void muat(), 0);
    return () => window.clearTimeout(idTimeout);
  }, [muat]);

  const kosongkanForm = () => {
    setIdDiubah(null);
    setNominal("");
    setKategori(null);
    setMetode("Tunai");
    setCatatan("");
    setTanggal(tanggalWIBString(new Date()));
    setFotoUrl(null);
    if (inputFotoRef.current) inputFotoRef.current.value = "";
  };

  // Foto struk tidak pernah memblokir penyimpanan: bila unggah gagal, pengguna
  // tetap bisa menyimpan pengeluarannya tanpa lampiran.
  const pilihFoto = async (berkas: File | undefined) => {
    if (!berkas) return;
    setMengunggahFoto(true);
    try {
      const dikompres = await compressProductImage(berkas);
      const formData = new FormData();
      formData.append("file", dikompres);
      if (kategori) formData.append("kategori", kategori);

      const res = await fetch("/api/upload/struk", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengunggah foto struk.");

      setFotoUrl(data.url);
      toast.success("Foto struk terlampir.");
    } catch (error) {
      toast.error(
        `${error instanceof Error ? error.message : "Gagal mengunggah foto."} Pengeluaran tetap bisa disimpan tanpa foto.`
      );
    } finally {
      setMengunggahFoto(false);
    }
  };

  const simpan = async () => {
    const angka = Number(nominal.replace(/\D/g, ""));
    if (!angka) return toast.error("Nominal belum diisi.");
    if (!kategori) return toast.error("Pilih dulu kategorinya.");

    setMenyimpan(true);
    try {
      const isi = { nominal: angka, kategori, metode, catatan, tanggal, fotoUrl };
      const res = await fetch(
        idDiubah ? `/api/pengeluaran/${idDiubah}` : "/api/pengeluaran",
        {
          method: idDiubah ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(isi),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan pengeluaran.");

      toast.success(
        idDiubah
          ? `Pengeluaran diperbarui: ${rupiah(angka)}`
          : `Tercatat: ${kategori} ${rupiah(angka)}`
      );
      kosongkanForm();
      await muat();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menyimpan pengeluaran.");
    } finally {
      setMenyimpan(false);
    }
  };

  const mulaiUbah = (item: Pengeluaran) => {
    setIdDiubah(item.id);
    setNominal(item.nominal.toLocaleString("id-ID"));
    setKategori(item.kategori);
    setMetode((METODE_PENGELUARAN as readonly string[]).includes(item.metode)
      ? (item.metode as MetodePengeluaran)
      : "Tunai");
    setCatatan(item.catatan || "");
    setTanggal(tanggalWIBString(new Date(item.tanggal)));
    setFotoUrl(item.fotoUrl);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const hapus = async (item: Pengeluaran) => {
    if (!confirm(`Hapus pengeluaran ${item.kategori} ${rupiah(item.nominal)}?`)) return;
    try {
      const res = await fetch(`/api/pengeluaran/${item.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menghapus pengeluaran.");
      toast.success("Pengeluaran dihapus.");
      if (idDiubah === item.id) kosongkanForm();
      await muat();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menghapus pengeluaran.");
    }
  };

  // Kelompokkan per hari (kalender WIB) supaya mudah dicocokkan dengan ingatan.
  const perHari = useMemo(() => {
    const peta = new Map<string, Pengeluaran[]>();
    for (const item of daftar) {
      const kunci = tanggalWIBString(new Date(item.tanggal));
      peta.set(kunci, [...(peta.get(kunci) || []), item]);
    }
    return Array.from(peta.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [daftar]);

  const totalPrive = perKategori[KATEGORI_PRIVE] || 0;
  const totalBiayaUsaha = total - totalPrive;

  if (user && user.role !== "Owner" && user.role !== "Admin") {
    return (
      <div className="p-6 text-center text-slate-500">
        Halaman ini hanya untuk Owner dan Admin.
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-3 pb-24 pt-3 desktop:px-6 desktop:pt-6">
      <header className="mb-4">
        <h1 className="flex items-center gap-2 text-xl font-bold text-slate-800 desktop:text-2xl">
          <Wallet className="text-rose-500" size={24} /> Pengeluaran
        </h1>
        <p className="mt-1 text-xs text-slate-500 desktop:text-sm">
          Catat belanja bahan, bensin, dan upah selagi masih di jalan — jangan menunggu sampai lupa.
        </p>
      </header>

      {/* ---------- Formulir: dirancang muat satu layar HP ---------- */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        {idDiubah && (
          <div className="mb-3 flex items-center justify-between rounded-xl bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">
            Sedang mengubah pengeluaran
            <button onClick={kosongkanForm} className="rounded-lg p-1 hover:bg-amber-100">
              <X size={14} />
            </button>
          </div>
        )}

        <label className="block text-xs font-semibold text-slate-500">Nominal</label>
        <div className="mt-1 flex items-baseline gap-2 border-b-2 border-slate-200 pb-2 focus-within:border-rose-400">
          <span className="text-lg font-bold text-slate-400">Rp</span>
          <input
            value={nominal}
            onChange={(e) => setNominal(formatRibuan(e.target.value))}
            inputMode="numeric"
            placeholder="0"
            className="w-full bg-transparent text-3xl font-bold text-slate-800 outline-none placeholder:text-slate-300"
          />
        </div>

        <label className="mt-4 block text-xs font-semibold text-slate-500">Kategori</label>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {KATEGORI_PENGELUARAN.map((nama) => {
            const aktif = kategori === nama;
            return (
              <button
                key={nama}
                type="button"
                onClick={() => setKategori(nama)}
                className={`flex items-center gap-2 rounded-xl border px-3 py-3 text-left text-xs font-semibold transition ${
                  aktif
                    ? `${INFO_KATEGORI[nama].warna} ring-2 ring-offset-1 ring-rose-300`
                    : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <span className="text-base">{INFO_KATEGORI[nama].emoji}</span>
                <span className="leading-tight">{nama}</span>
              </button>
            );
          })}
        </div>

        {kategori && (
          <p className="mt-2 text-[11px] leading-relaxed text-slate-500">
            {INFO_KATEGORI[kategori].keterangan}
          </p>
        )}

        {/* Penjelasan prive: tanpa ini orang enggan mengisinya karena mengira
            angkanya akan dihitung sebagai kerugian usaha. */}
        {kategori === KATEGORI_PRIVE && (
          <p className="mt-2 rounded-xl bg-slate-50 px-3 py-2 text-[11px] leading-relaxed text-slate-600">
            Ini <b>bukan biaya usaha</b> dan <b>tidak mengurangi laba</b>. Ambilan pribadi adalah
            bagian keuntungan yang dipakai sendiri — dicatat supaya kelihatan berapa banyak uang
            usaha yang keluar untuk keperluan di luar usaha.
          </p>
        )}

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-500">Bayar pakai</label>
            <select
              value={metode}
              onChange={(e) => setMetode(e.target.value as MetodePengeluaran)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-rose-400"
            >
              {METODE_PENGELUARAN.map((nama) => (
                <option key={nama} value={nama}>
                  {nama}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500">Tanggal</label>
            <input
              type="date"
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-rose-400"
            />
          </div>
        </div>

        <input
          value={catatan}
          onChange={(e) => setCatatan(e.target.value)}
          placeholder="Catatan (opsional) — mis. Pasar Asemka, pita & pompom"
          className="mt-3 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-rose-400"
        />

        <div className="mt-3 flex items-center gap-2">
          <input
            ref={inputFotoRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => pilihFoto(e.target.files?.[0])}
          />
          <button
            type="button"
            onClick={() => inputFotoRef.current?.click()}
            disabled={mengunggahFoto}
            className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-60"
          >
            {mengunggahFoto ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
            {fotoUrl ? "Ganti foto struk" : "Foto struk (opsional)"}
          </button>
          {fotoUrl && (
            <>
              <button type="button" onClick={() => setFotoDibuka(fotoUrl)}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={fotoUrl}
                  alt="Struk"
                  className="h-10 w-10 rounded-lg border border-slate-200 object-cover"
                />
              </button>
              <button
                type="button"
                onClick={() => setFotoUrl(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
                aria-label="Lepas foto struk"
              >
                <X size={14} />
              </button>
            </>
          )}
        </div>

        <button
          onClick={simpan}
          disabled={menyimpan}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-rose-500 py-3 text-sm font-bold text-white transition hover:bg-rose-600 disabled:opacity-60"
        >
          {menyimpan ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
          {idDiubah ? "Simpan Perubahan" : "Catat Pengeluaran"}
        </button>
      </section>

      {/* ---------- Ringkasan bulan ---------- */}
      <section className="mt-5">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setGeserBulan((n) => n - 1)}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
            aria-label="Bulan sebelumnya"
          >
            <ChevronLeft size={18} />
          </button>
          <h2 className="text-sm font-bold text-slate-700">{labelBulan}</h2>
          <button
            onClick={() => setGeserBulan((n) => Math.min(0, n + 1))}
            disabled={geserBulan >= 0}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 disabled:opacity-30"
            aria-label="Bulan berikutnya"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="mt-2 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-3">
            <p className="text-[11px] font-medium text-slate-500">Biaya usaha</p>
            <p className="text-lg font-bold text-slate-800">{rupiah(totalBiayaUsaha)}</p>
            <p className="mt-0.5 text-[10px] text-slate-400">Mengurangi laba</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-3">
            <p className="text-[11px] font-medium text-slate-500">Ambilan pribadi</p>
            <p className="text-lg font-bold text-slate-800">{rupiah(totalPrive)}</p>
            <p className="mt-0.5 text-[10px] text-slate-400">Tidak mengurangi laba</p>
          </div>
        </div>
      </section>

      {/* ---------- Daftar per hari ---------- */}
      <section className="mt-5 space-y-4">
        {memuat && <p className="py-8 text-center text-sm text-slate-400">Memuat…</p>}

        {!memuat && perHari.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 py-10 text-center">
            <p className="text-sm font-medium text-slate-500">Belum ada pengeluaran bulan ini.</p>
            <p className="mt-1 text-xs text-slate-400">
              Setiap belanja yang tidak dicatat membuat angka laba terlihat lebih besar dari
              kenyataan.
            </p>
          </div>
        )}

        {perHari.map(([kunciHari, item]) => {
          const subtotal = item.reduce((jumlah, baris) => jumlah + baris.nominal, 0);
          return (
            <div key={kunciHari}>
              <div className="mb-2 flex items-baseline justify-between">
                <h3 className="text-xs font-bold text-slate-600">
                  {tanggalPanjang(item[0].tanggal)}
                </h3>
                <span className="text-xs font-bold text-slate-500">{rupiah(subtotal)}</span>
              </div>
              <div className="space-y-2">
                {item.map((baris) => (
                  <div
                    key={baris.id}
                    className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3"
                  >
                    <span className="text-lg">{INFO_KATEGORI[baris.kategori]?.emoji ?? "🧾"}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-700">
                        {baris.kategori}
                      </p>
                      {baris.catatan && (
                        <p className="truncate text-xs text-slate-500">{baris.catatan}</p>
                      )}
                      <p className="text-[10px] text-slate-400">
                        {baris.metode}
                        {baris.pencatatNama ? ` · ${baris.pencatatNama}` : ""}
                      </p>
                    </div>
                    {baris.fotoUrl && (
                      <button onClick={() => setFotoDibuka(baris.fotoUrl)}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={baris.fotoUrl}
                          alt="Struk"
                          className="h-10 w-10 rounded-lg border border-slate-200 object-cover"
                        />
                      </button>
                    )}
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-800">{rupiah(baris.nominal)}</p>
                      <div className="mt-1 flex justify-end gap-1">
                        <button
                          onClick={() => mulaiUbah(baris)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-sky-600"
                          aria-label="Ubah"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => hapus(baris)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                          aria-label="Hapus"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </section>

      {fotoDibuka && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setFotoDibuka(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={fotoDibuka} alt="Foto struk" className="max-h-full max-w-full rounded-xl" />
        </div>
      )}
    </div>
  );
}
