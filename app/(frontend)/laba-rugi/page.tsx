"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Scale, TrendingDown, TrendingUp } from "lucide-react";
import { getSavedUserSession } from "@/lib/userSession";
import { toast } from "@/lib/toast";
import { INFO_KATEGORI, type KategoriPengeluaran } from "@/lib/pengeluaran";
import { rentangBulanWIB, tanggalWIBString } from "@/lib/waktu";

type RingkasanPeriode = {
  label: string;
  omzet: number;
  jumlahTransaksi: number;
  biayaUsaha: number;
  perKategori: { kategori: KategoriPengeluaran; nominal: number; porsi: number }[];
  labaUsaha: number;
  rugi: boolean;
  kasMasuk: number;
  kasKeluar: number;
  posisiKas: number;
  prive: number;
  kenaikanPiutang: number;
  jembatanSeimbang: boolean;
};

type DataLabaRugi = {
  periode: RingkasanPeriode;
  pembanding: RingkasanPeriode;
  selisihLaba: number;
};

type ModePeriode = "bulan-ini" | "bulan-lalu" | "bebas";

const rupiah = (nilai: number) => {
  const bulat = Math.round(nilai || 0);
  const tanda = bulat < 0 ? "−" : "";
  return `${tanda}Rp ${Math.abs(bulat).toLocaleString("id-ID")}`;
};

export default function LabaRugiPage() {
  const [user, setUser] = useState<{ role?: string } | null>(null);
  const [siapMemeriksa, setSiapMemeriksa] = useState(false);
  const [data, setData] = useState<DataLabaRugi | null>(null);
  const [memuat, setMemuat] = useState(true);
  const [mode, setMode] = useState<ModePeriode>("bulan-ini");

  const bulanIni = useMemo(() => rentangBulanWIB(new Date()), []);
  const [mulai, setMulai] = useState(() => tanggalWIBString(bulanIni.mulai));
  const [selesai, setSelesai] = useState(() => tanggalWIBString(bulanIni.selesai));

  // Sesi dibaca lewat timeout — mengikuti pola halaman lain di repo ini supaya
  // tidak ada setState sinkron di dalam effect.
  useEffect(() => {
    const idTimeout = window.setTimeout(() => {
      setUser(getSavedUserSession<{ role?: string }>());
      setSiapMemeriksa(true);
    }, 0);
    return () => window.clearTimeout(idTimeout);
  }, []);

  // Ubah pilihan cepat menjadi rentang tanggal konkret. Dijalankan lewat timeout
  // agar tidak ada setState sinkron di dalam effect.
  useEffect(() => {
    if (mode === "bebas") return;
    const idTimeout = window.setTimeout(() => {
      const acuan = new Date();
      if (mode === "bulan-lalu") acuan.setMonth(acuan.getMonth() - 1);
      const rentang = rentangBulanWIB(acuan);
      setMulai(tanggalWIBString(rentang.mulai));
      setSelesai(tanggalWIBString(rentang.selesai));
    }, 0);
    return () => window.clearTimeout(idTimeout);
  }, [mode]);

  const muat = useCallback(async () => {
    try {
      const params = new URLSearchParams({ mulai, selesai });
      const res = await fetch(`/api/laba-rugi?${params}`, { cache: "no-store" });
      if (!res.ok) {
        const galat = await res.json().catch(() => ({}));
        throw new Error(galat.error || "Gagal memuat laporan laba rugi.");
      }
      setData(await res.json());
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal memuat laporan.");
    } finally {
      setMemuat(false);
    }
  }, [mulai, selesai]);

  useEffect(() => {
    if (user?.role !== "Owner") return;
    const idTimeout = window.setTimeout(() => void muat(), 0);
    return () => window.clearTimeout(idTimeout);
  }, [muat, user?.role]);

  if (siapMemeriksa && user?.role !== "Owner") {
    return (
      <div className="p-8 text-center">
        <Scale className="mx-auto mb-3 text-slate-300" size={40} />
        <p className="text-sm font-medium text-slate-600">
          Laporan laba rugi hanya dapat dibuka oleh Owner.
        </p>
      </div>
    );
  }

  const p = data?.periode;

  return (
    <div className="mx-auto w-full max-w-4xl px-3 pb-24 pt-3 desktop:px-6 desktop:pt-6">
      <header className="mb-4">
        <h1 className="flex items-center gap-2 text-xl font-bold text-slate-800 desktop:text-2xl">
          <Scale className="text-violet-500" size={24} /> Laba Rugi
        </h1>
        <p className="mt-1 text-xs text-slate-500 desktop:text-sm">
          Dua angka yang harus dibaca bersamaan: <b>untung berapa</b> dan <b>uangnya ke mana</b>.
        </p>
      </header>

      {/* ---------- Pemilih periode ---------- */}
      <section className="rounded-2xl border border-slate-200 bg-white p-3">
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["bulan-ini", "Bulan ini"],
              ["bulan-lalu", "Bulan lalu"],
              ["bebas", "Pilih tanggal"],
            ] as [ModePeriode, string][]
          ).map(([nilai, teks]) => (
            <button
              key={nilai}
              onClick={() => setMode(nilai)}
              className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${
                mode === nilai
                  ? "bg-violet-500 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {teks}
            </button>
          ))}
        </div>

        {mode === "bebas" && (
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500">Dari</label>
              <input
                type="date"
                value={mulai}
                onChange={(e) => setMulai(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-400"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500">Sampai</label>
              <input
                type="date"
                value={selesai}
                onChange={(e) => setSelesai(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-400"
              />
            </div>
          </div>
        )}
      </section>

      {memuat && <p className="py-12 text-center text-sm text-slate-400">Menghitung…</p>}

      {!memuat && p && data && (
        <>
          {/* ---------- Dua angka berdampingan ---------- */}
          <section className="mt-4 grid grid-cols-1 gap-3 desktop:grid-cols-2">
            <div
              className={`rounded-2xl border-2 p-4 ${
                p.rugi ? "border-rose-200 bg-rose-50" : "border-emerald-200 bg-emerald-50"
              }`}
            >
              <div className="flex items-center gap-2">
                {p.rugi ? (
                  <TrendingDown size={16} className="text-rose-500" />
                ) : (
                  <TrendingUp size={16} className="text-emerald-600" />
                )}
                <p className="text-xs font-bold text-slate-600">
                  Laba usaha {p.rugi && <span className="text-rose-600">(RUGI)</span>}
                </p>
              </div>
              <p
                className={`mt-1 text-3xl font-bold ${p.rugi ? "text-rose-600" : "text-emerald-700"}`}
              >
                {rupiah(p.labaUsaha)}
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
                Omzet {rupiah(p.omzet)} dikurangi biaya usaha {rupiah(p.biayaUsaha)}. Ambilan
                pribadi tidak dihitung di sini.
              </p>
            </div>

            <div
              className={`rounded-2xl border-2 p-4 ${
                p.posisiKas < 0 ? "border-amber-300 bg-amber-50" : "border-sky-200 bg-sky-50"
              }`}
            >
              <div className="flex items-center gap-2">
                {p.posisiKas < 0 ? (
                  <ArrowDown size={16} className="text-amber-600" />
                ) : (
                  <ArrowUp size={16} className="text-sky-600" />
                )}
                <p className="text-xs font-bold text-slate-600">Uang riil (kas)</p>
              </div>
              <p
                className={`mt-1 text-3xl font-bold ${
                  p.posisiKas < 0 ? "text-amber-700" : "text-sky-700"
                }`}
              >
                {rupiah(p.posisiKas)}
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
                Uang masuk {rupiah(p.kasMasuk)} dikurangi semua yang keluar {rupiah(p.kasKeluar)},
                termasuk ambilan pribadi.
              </p>
            </div>
          </section>

          {/* ---------- Penjelasan selisih ---------- */}
          <section className="mt-3 rounded-2xl border border-slate-200 bg-white p-4">
            <h2 className="text-sm font-bold text-slate-700">Kenapa dua angkanya berbeda?</h2>
            <p className="mt-2 text-xs leading-relaxed text-slate-600">
              {p.labaUsaha !== p.posisiKas ? (
                <>
                  Laba usaha <b>{rupiah(p.labaUsaha)}</b>, tapi uang yang benar-benar bertambah cuma{" "}
                  <b>{rupiah(p.posisiKas)}</b>. Selisihnya{" "}
                  <b>{rupiah(p.labaUsaha - p.posisiKas)}</b>, dan itu ada di dua tempat:
                </>
              ) : (
                <>Laba usaha dan uang riil kebetulan sama persis di periode ini.</>
              )}
            </p>

            <div className="mt-3 space-y-2">
              <div className="flex items-start gap-3 rounded-xl bg-amber-50 p-3">
                <span className="text-base">📄</span>
                <div className="flex-1">
                  <p className="text-xs font-bold text-amber-800">
                    {p.kenaikanPiutang >= 0 ? "Masih di tangan toko" : "Tertagih dari nota lama"}{" "}
                    — {rupiah(Math.abs(p.kenaikanPiutang))}
                  </p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-amber-700">
                    {p.kenaikanPiutang >= 0
                      ? "Barang sudah dikirim dan sudah dihitung sebagai omzet, tapi uangnya belum masuk. Ini bukan uang yang bisa dipakai."
                      : "Periode ini justru menerima pembayaran atas nota-nota lama, jadi uang masuknya lebih besar daripada omzet periode ini."}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-3">
                <span className="text-base">👛</span>
                <div className="flex-1">
                  <p className="text-xs font-bold text-slate-700">
                    Ambilan pribadi — {rupiah(p.prive)}
                  </p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-slate-600">
                    {p.prive > 0
                      ? "Uang usaha yang dipakai untuk keperluan pribadi. Bukan kerugian, tapi memang mengurangi uang yang tersisa di usaha."
                      : "Belum ada ambilan pribadi tercatat di periode ini. Kalau sebenarnya ada tapi belum dicatat, selisih laba dan kas akan terlihat tanpa penjelasan."}
                  </p>
                </div>
              </div>
            </div>

            <p className="mt-3 border-t border-slate-100 pt-2 text-[10px] text-slate-400">
              {rupiah(p.labaUsaha)} − {rupiah(p.kenaikanPiutang)} − {rupiah(p.prive)} ={" "}
              {rupiah(p.posisiKas)}
              {p.jembatanSeimbang ? " ✓" : " — angka tidak berimbang, laporkan sebagai bug"}
            </p>
          </section>

          {/* ---------- Rincian biaya ---------- */}
          <section className="mt-3 rounded-2xl border border-slate-200 bg-white p-4">
            <h2 className="text-sm font-bold text-slate-700">Biaya usaha ke mana saja</h2>
            {p.biayaUsaha === 0 ? (
              <p className="mt-3 rounded-xl bg-amber-50 p-3 text-xs leading-relaxed text-amber-700">
                Belum ada biaya tercatat di periode ini. Selama belanja bahan, bensin, dan upah belum
                dicatat, angka laba di atas <b>terlalu bagus untuk jadi kenyataan</b>.
              </p>
            ) : (
              <div className="mt-3 space-y-2">
                {p.perKategori
                  .filter((baris) => baris.nominal > 0)
                  .map((baris) => (
                    <div key={baris.kategori}>
                      <div className="flex items-baseline justify-between text-xs">
                        <span className="font-semibold text-slate-700">
                          {INFO_KATEGORI[baris.kategori]?.emoji} {baris.kategori}
                        </span>
                        <span className="font-bold text-slate-700">
                          {rupiah(baris.nominal)}{" "}
                          <span className="font-normal text-slate-400">({baris.porsi}%)</span>
                        </span>
                      </div>
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-rose-400"
                          style={{ width: `${baris.porsi}%` }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </section>

          {/* ---------- Pembanding ---------- */}
          <section className="mt-3 rounded-2xl border border-slate-200 bg-white p-4">
            <h2 className="text-sm font-bold text-slate-700">
              Dibanding periode sebelumnya ({data.pembanding.label})
            </h2>
            <div className="mt-3 grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-[10px] text-slate-500">Laba sekarang</p>
                <p className="text-sm font-bold text-slate-800">{rupiah(p.labaUsaha)}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500">Laba sebelumnya</p>
                <p className="text-sm font-bold text-slate-500">
                  {rupiah(data.pembanding.labaUsaha)}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500">Selisih</p>
                <p
                  className={`text-sm font-bold ${
                    data.selisihLaba >= 0 ? "text-emerald-600" : "text-rose-600"
                  }`}
                >
                  {data.selisihLaba >= 0 ? "+" : ""}
                  {rupiah(data.selisihLaba)}
                </p>
              </div>
            </div>
          </section>

          {/* ---------- Angka mentah ---------- */}
          <section className="mt-3 rounded-2xl border border-slate-200 bg-white p-4">
            <h2 className="mb-3 text-sm font-bold text-slate-700">Angka lengkap</h2>
            <dl className="space-y-1.5 text-xs">
              {[
                ["Omzet (semua nota periode ini)", p.omzet],
                [`Jumlah nota`, p.jumlahTransaksi],
                ["Biaya usaha", -p.biayaUsaha],
                ["Laba usaha", p.labaUsaha],
                ["Uang masuk (pembayaran diterima)", p.kasMasuk],
                ["Uang keluar (semua pengeluaran)", -p.kasKeluar],
                ["Ambilan pribadi", -p.prive],
                ["Posisi kas", p.posisiKas],
              ].map(([label, nilai], index) => (
                <div key={index} className="flex justify-between border-b border-slate-50 pb-1.5">
                  <dt className="text-slate-500">{label}</dt>
                  <dd className="font-semibold text-slate-700">
                    {label === "Jumlah nota" ? nilai : rupiah(Number(nilai))}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        </>
      )}
    </div>
  );
}
