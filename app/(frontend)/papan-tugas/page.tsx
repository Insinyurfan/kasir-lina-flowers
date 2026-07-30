"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Check,
  ClipboardList,
  Loader2,
  PackageCheck,
  UserPlus,
  X,
} from "lucide-react";
import { getSavedUserSession } from "@/lib/userSession";
import { toast } from "@/lib/toast";
import { HARI_TENGGAT_BAWAAN } from "@/lib/pengrajin";
import { tanggalWIBString } from "@/lib/waktu";

type BarisBelumDitugaskan = {
  transactionItemId: number;
  namaProduk: string;
  variantName: string | null;
  label: string | null;
  satuan: string;
  jumlahDipesan: number;
  sisa: number;
  transaksi: {
    id: number;
    trxNumber: number | null;
    tanggal: string;
    nama_pembeli: string | null;
    status_pengiriman: string;
  };
};

type BarisTugas = {
  penugasanId: number;
  pengrajinId: number;
  namaPengrajin: string;
  namaProduk: string;
  variantName: string | null;
  satuan: string;
  jumlahDitugaskan: number;
  sudahDisetor: number;
  sisa: number;
  tenggat: string;
  terlambat: boolean;
  hariKeTenggat: number;
  transaksi: { id: number; trxNumber: number | null; nama_pembeli: string | null };
  packed: boolean;
};

type DataPapan = {
  belumDitugaskan: BarisBelumDitugaskan[];
  pekerjaanPerPengrajin: {
    pengrajinId: number;
    nama: string;
    kelompok: string | null;
    tugas: BarisTugas[];
    adaTerlambat: boolean;
  }[];
  bebanKerja: {
    pengrajinId: number;
    nama: string;
    kelompok: string | null;
    jumlahTugas: number;
    sisaUnit: number;
    adaTerlambat: boolean;
    masihKosong: boolean;
  }[];
  ringkasan: {
    barisBelumDibagi: number;
    tugasAktif: number;
    tugasTerlambat: number;
    pengrajinKosong: number;
  };
};

type PengrajinPilihan = { id: number; nama: string; aktif: boolean };

const tanggalPendek = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    timeZone: "Asia/Jakarta",
  });

// Format nomor nota disamakan dengan halaman Status Pesanan supaya kode yang
// sama terbaca sama di dua halaman.
const formatTrxCode = (id: number) => `TRX-${String(id).padStart(4, "0")}`;

const namaNota = (t: { trxNumber: number | null; id: number }) =>
  formatTrxCode(t.trxNumber ?? t.id);

export default function PapanTugasPage() {
  const [user, setUser] = useState<{ role?: string } | null>(null);
  const [data, setData] = useState<DataPapan | null>(null);
  const [memuat, setMemuat] = useState(true);
  const [pengrajin, setPengrajin] = useState<PengrajinPilihan[]>([]);
  const [tampilan, setTampilan] = useState<"pengrajin" | "toko">("pengrajin");

  // Modal tetapkan penugasan
  const [tugaskan, setTugaskan] = useState<BarisBelumDitugaskan | null>(null);
  const [pilihPengrajin, setPilihPengrajin] = useState("");
  const [jumlahTugas, setJumlahTugas] = useState("");
  const [tenggat, setTenggat] = useState("");

  // Modal setoran
  const [setor, setSetor] = useState<BarisTugas | null>(null);
  const [jumlahSetor, setJumlahSetor] = useState("");
  const [tanggalSetor, setTanggalSetor] = useState(() => tanggalWIBString(new Date()));

  const [menyimpan, setMenyimpan] = useState(false);

  useEffect(() => {
    const idTimeout = window.setTimeout(() => {
      setUser(getSavedUserSession<{ role?: string }>());
    }, 0);
    return () => window.clearTimeout(idTimeout);
  }, []);

  const muat = useCallback(async () => {
    try {
      const [resPapan, resPengrajin] = await Promise.all([
        fetch("/api/papan-tugas", { cache: "no-store" }),
        fetch("/api/pengrajin", { cache: "no-store" }),
      ]);

      if (!resPapan.ok) {
        const galat = await resPapan.json().catch(() => ({}));
        throw new Error(galat.error || "Gagal memuat papan tugas.");
      }
      setData(await resPapan.json());

      if (resPengrajin.ok) {
        const isi = await resPengrajin.json();
        setPengrajin(
          (isi.pengrajin || []).filter((p: PengrajinPilihan) => p.aktif)
        );
      }
      setMemuat(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal memuat papan tugas.");
      setMemuat(false);
    }
  }, []);

  useEffect(() => {
    const idTimeout = window.setTimeout(() => void muat(), 0);
    return () => window.clearTimeout(idTimeout);
  }, [muat]);

  const bolehMenulis = user?.role === "Owner" || user?.role === "Admin";

  const bukaTugaskan = (baris: BarisBelumDitugaskan) => {
    setTugaskan(baris);
    setPilihPengrajin("");
    setJumlahTugas(String(baris.sisa));
    const bawaan = new Date();
    bawaan.setDate(bawaan.getDate() + HARI_TENGGAT_BAWAAN);
    setTenggat(tanggalWIBString(bawaan));
  };

  const simpanPenugasan = async () => {
    if (!tugaskan) return;
    if (!pilihPengrajin) return toast.error("Pilih dulu pengrajinnya.");
    const jumlah = Number(jumlahTugas);
    if (!jumlah || jumlah <= 0) return toast.error("Jumlah belum diisi.");

    setMenyimpan(true);
    try {
      const res = await fetch("/api/penugasan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transactionItemId: tugaskan.transactionItemId,
          pengrajinId: Number(pilihPengrajin),
          jumlahDitugaskan: jumlah,
          tenggat,
        }),
      });
      const hasil = await res.json();
      if (!res.ok) throw new Error(hasil.error || "Gagal menetapkan penugasan.");

      const nama = pengrajin.find((p) => p.id === Number(pilihPengrajin))?.nama ?? "pengrajin";
      toast.success(`${jumlah} ${tugaskan.satuan} ${tugaskan.namaProduk} → ${nama}.`);
      setTugaskan(null);
      await muat();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menetapkan penugasan.");
    } finally {
      setMenyimpan(false);
    }
  };

  const simpanSetoran = async () => {
    if (!setor) return;
    const jumlah = Number(jumlahSetor);
    if (!jumlah || jumlah <= 0) return toast.error("Jumlah setoran belum diisi.");

    setMenyimpan(true);
    try {
      const res = await fetch("/api/setoran", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          penugasanId: setor.penugasanId,
          jumlah,
          tanggal: tanggalSetor,
        }),
      });
      const hasil = await res.json();
      if (!res.ok) throw new Error(hasil.error || "Gagal mencatat setoran.");

      const catatanTarif = hasil.pakaiTarifCadangan
        ? " (memakai tarif cadangan)"
        : "";
      toast.success(
        hasil.sisaPenugasan === 0
          ? `Tuntas! Setoran ${setor.namaPengrajin} tercatat${catatanTarif}.`
          : `Setoran tercatat. Sisa ${hasil.sisaPenugasan} ${setor.satuan}${catatanTarif}.`
      );
      setSetor(null);
      await muat();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal mencatat setoran.");
    } finally {
      setMenyimpan(false);
    }
  };

  // Ubah penugasan langsung dari papan — pagi hari sering perlu memindahkan
  // pekerjaan ke orang lain atau menggeser tenggat tanpa membuka halaman lain.
  const ubahPenugasan = async (
    tugas: BarisTugas,
    isi: { pengrajinId?: number; tenggat?: string }
  ) => {
    try {
      const res = await fetch(`/api/penugasan/${tugas.penugasanId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isi),
      });
      const hasil = await res.json();
      if (!res.ok) throw new Error(hasil.error || "Gagal mengubah penugasan.");

      toast.success(
        isi.pengrajinId
          ? `Dipindah ke ${pengrajin.find((p) => p.id === isi.pengrajinId)?.nama ?? "pengrajin lain"}.`
          : "Tenggat diperbarui."
      );
      await muat();
    } catch (error) {
      // Server menolak pemindahan bila sudah ada setoran — pesannya sudah
      // menjelaskan alasannya, teruskan apa adanya.
      toast.error(error instanceof Error ? error.message : "Gagal mengubah penugasan.");
    }
  };

  const batalkanPenugasan = async (tugas: BarisTugas) => {
    if (
      !confirm(
        `Batalkan penugasan ${tugas.jumlahDitugaskan} ${tugas.satuan} ${tugas.namaProduk} untuk ${tugas.namaPengrajin}?`
      )
    )
      return;

    try {
      const res = await fetch(`/api/penugasan/${tugas.penugasanId}`, { method: "DELETE" });
      const hasil = await res.json();
      if (!res.ok) throw new Error(hasil.error || "Gagal membatalkan penugasan.");
      toast.success("Penugasan dibatalkan.");
      await muat();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal membatalkan penugasan.");
    }
  };

  // Kelompokkan "belum ditugaskan" PER NOTA. Sebelumnya daftarnya rata, sehingga
  // 25 baris dari satu nota mengulang "KEKE · nota #115 · 28 Jul" dua puluh lima
  // kali — mata harus membaca ulang keterangan yang sama terus-menerus.
  const belumDitugaskanPerNota = useMemo(() => {
    const peta = new Map<
      number,
      {
        transaksi: BarisBelumDitugaskan["transaksi"];
        baris: BarisBelumDitugaskan[];
        totalUnit: number;
      }
    >();

    for (const baris of data?.belumDitugaskan ?? []) {
      const isi = peta.get(baris.transaksi.id) ?? {
        transaksi: baris.transaksi,
        baris: [],
        totalUnit: 0,
      };
      isi.baris.push(baris);
      isi.totalUnit += baris.sisa;
      peta.set(baris.transaksi.id, isi);
    }

    // Nota terlama di atas — itu yang paling dekat hari kirimnya.
    return Array.from(peta.values()).sort(
      (a, b) => new Date(a.transaksi.tanggal).getTime() - new Date(b.transaksi.tanggal).getTime()
    );
  }, [data]);

  // Tampilan kedua: kelompokkan tugas aktif per toko, bukan per pengrajin.
  const perToko = () => {
    const peta = new Map<string, { nama: string; tugas: BarisTugas[] }>();
    for (const grup of data?.pekerjaanPerPengrajin ?? []) {
      for (const tugas of grup.tugas) {
        const nama = tugas.transaksi.nama_pembeli || "Tanpa Nama";
        const isi = peta.get(nama) ?? { nama, tugas: [] };
        isi.tugas.push(tugas);
        peta.set(nama, isi);
      }
    }
    return Array.from(peta.values()).sort((a, b) => a.nama.localeCompare(b.nama));
  };

  return (
    <div className="lina-page-stack space-y-6">
      <header className="lina-panel rounded-2xl border p-6">
        <h1 className="flex items-center gap-2 text-2xl font-black text-slate-800">
          <ClipboardList className="text-pink-500" /> Papan Tugas
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Siapa mengerjakan apa hari ini, dan pekerjaan mana yang belum dipegang siapa pun.
        </p>
      </header>

      {/* ---------- Ringkasan ---------- */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="lina-panel rounded-2xl border p-4">
          <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
            Belum dibagi
          </p>
          <p className="mt-1 text-2xl font-black text-slate-800">
            {data?.ringkasan.barisBelumDibagi ?? 0}
          </p>
        </div>
        <div className="lina-panel rounded-2xl border p-4">
          <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
            Sedang dikerjakan
          </p>
          <p className="mt-1 text-2xl font-black text-slate-800">
            {data?.ringkasan.tugasAktif ?? 0}
          </p>
        </div>
        <div
          className={`rounded-2xl border p-4 ${
            (data?.ringkasan.tugasTerlambat ?? 0) > 0
              ? "border-red-200 bg-red-50"
              : "lina-panel border"
          }`}
        >
          <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">Terlambat</p>
          <p
            className={`mt-1 text-2xl font-black ${
              (data?.ringkasan.tugasTerlambat ?? 0) > 0 ? "text-red-600" : "text-slate-800"
            }`}
          >
            {data?.ringkasan.tugasTerlambat ?? 0}
          </p>
        </div>
        <div className="lina-panel rounded-2xl border p-4">
          <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
            Masih kosong
          </p>
          <p className="mt-1 text-2xl font-black text-slate-800">
            {data?.ringkasan.pengrajinKosong ?? 0}
          </p>
        </div>
      </section>

      {memuat && (
        <div className="lina-panel rounded-2xl border p-12 text-center font-bold text-slate-400">
          Memuat papan tugas...
        </div>
      )}

      {/* ---------- Blok 1: BELUM DITUGASKAN (jaring pengaman) ----------
          Dikelompokkan PER NOTA seperti halaman Status Pesanan: nama toko dan
          nomor nota cukup ditulis sekali di kepala kartu, bukan diulang di
          setiap baris barang. */}
      {!memuat && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            {belumDitugaskanPerNota.length > 0 ? (
              <AlertTriangle size={20} className="text-amber-600" />
            ) : (
              <Check size={20} className="text-emerald-600" />
            )}
            <h2 className="text-lg font-black text-slate-800">
              Belum ditugaskan
              {belumDitugaskanPerNota.length > 0 && (
                <span className="ml-1 font-normal text-slate-400">
                  ({data?.belumDitugaskan.length} barang · {belumDitugaskanPerNota.length} nota)
                </span>
              )}
            </h2>
          </div>

          {belumDitugaskanPerNota.length === 0 ? (
            <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-8 text-center">
              <p className="font-bold text-emerald-700">Semua pekerjaan sudah dibagi.</p>
              <p className="mt-1 text-xs text-emerald-600">
                Tidak ada orderan yang menggantung tanpa pengrajin.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 xl:grid-cols-2">
              {belumDitugaskanPerNota.map((nota) => (
                <article
                  key={nota.transaksi.id}
                  className="overflow-hidden rounded-2xl border-2 border-amber-300 bg-amber-50"
                >
                  <div className="flex flex-col justify-between gap-2 border-b border-amber-200 bg-amber-100/70 p-5 sm:flex-row sm:items-start">
                    <div className="min-w-0">
                      <p className="font-mono text-sm font-black text-amber-800">
                        {namaNota(nota.transaksi)}
                      </p>
                      <h3 className="mt-1 truncate text-lg font-black text-slate-800">
                        {(nota.transaksi.nama_pembeli || "Tanpa nama").toUpperCase()}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {tanggalPendek(nota.transaksi.tanggal)} ·{" "}
                        {nota.transaksi.status_pengiriman}
                      </p>
                    </div>
                    <div className="shrink-0 text-left sm:text-right">
                      <p className="text-[10px] font-black uppercase tracking-wide text-amber-700">
                        Belum dibagi
                      </p>
                      <p className="text-lg font-black text-amber-800">
                        {nota.baris.length} barang
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 p-4">
                    {nota.baris.map((baris) => (
                      <div
                        key={baris.transactionItemId}
                        className="flex items-center gap-3 rounded-xl border border-amber-200 bg-white p-3"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-black text-slate-800">
                            {baris.namaProduk}
                            {baris.variantName && (
                              <span className="ml-1 font-bold text-amber-600">
                                ({baris.variantName})
                              </span>
                            )}
                          </p>
                          <p className="text-[11px] font-bold text-amber-700">
                            {baris.sisa} {baris.satuan}
                            {baris.sisa < baris.jumlahDipesan && (
                              <span className="font-normal text-slate-400">
                                {" "}
                                dari {baris.jumlahDipesan}
                              </span>
                            )}
                          </p>
                        </div>
                        {bolehMenulis && (
                          <button
                            onClick={() => bukaTugaskan(baris)}
                            className="flex shrink-0 items-center gap-1.5 rounded-lg bg-pink-600 px-3 py-2 text-[11px] font-black text-white hover:bg-pink-700"
                          >
                            <UserPlus size={13} /> Tugaskan
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ---------- Pemilih tampilan ---------- */}
      {!memuat && (
        <div className="flex gap-2">
          {(
            [
              ["pengrajin", "Per pengrajin"],
              ["toko", "Per toko"],
            ] as ["pengrajin" | "toko", string][]
          ).map(([nilai, teks]) => (
            <button
              key={nilai}
              onClick={() => setTampilan(nilai)}
              className={`rounded-xl border px-4 py-2 text-xs font-bold transition ${
                tampilan === nilai
                  ? "border-pink-300 bg-pink-600 text-white shadow-md shadow-pink-200"
                  : "border-pink-100 bg-white text-pink-600 hover:bg-pink-50"
              }`}
            >
              {teks}
            </button>
          ))}
        </div>
      )}

      {/* ---------- Blok 2: pekerjaan aktif ---------- */}
      {!memuat && tampilan === "pengrajin" && (
        <section className="grid gap-5 xl:grid-cols-2">
          {(data?.pekerjaanPerPengrajin.length ?? 0) === 0 && (
            <div className="lina-panel rounded-2xl border p-12 text-center xl:col-span-2">
              <p className="font-bold text-slate-500">Belum ada pekerjaan yang sedang berjalan.</p>
            </div>
          )}

          {data?.pekerjaanPerPengrajin.map((grup) => (
            <article key={grup.pengrajinId} className="lina-panel overflow-hidden rounded-2xl border">
              <div
                className={`flex items-center justify-between gap-3 border-b px-5 py-3 ${
                  grup.adaTerlambat
                    ? "border-red-200 bg-red-50"
                    : "border-pink-100 bg-pink-50"
                }`}
              >
                <div>
                  <h2 className="text-base font-black text-slate-800">{grup.nama}</h2>
                  {grup.kelompok && (
                    <p className="text-[10px] text-slate-500">{grup.kelompok}</p>
                  )}
                </div>
                <span className="text-xs font-black text-slate-600">
                  {grup.tugas.length} pekerjaan
                </span>
              </div>

              <div className="space-y-2 p-4">
                {grup.tugas.map((tugas) => (
                  <BarisTugasKartu
                    key={tugas.penugasanId}
                    tugas={tugas}
                    bolehMenulis={bolehMenulis}
                    onSetor={() => {
                      setSetor(tugas);
                      setJumlahSetor(String(tugas.sisa));
                      setTanggalSetor(tanggalWIBString(new Date()));
                    }}
                    onBatal={() => batalkanPenugasan(tugas)}
                    onUbah={(isi) => ubahPenugasan(tugas, isi)}
                    pilihanPengrajin={pengrajin}
                    tampilkanPengrajin={false}
                  />
                ))}
              </div>
            </article>
          ))}
        </section>
      )}

      {!memuat && tampilan === "toko" && (
        <section className="grid gap-5 xl:grid-cols-2">
          {perToko().map((grup) => (
            <article key={grup.nama} className="lina-panel overflow-hidden rounded-2xl border">
              <div className="border-b border-pink-100 bg-pink-50 px-5 py-4">
                <h2 className="text-lg font-black text-slate-800">{grup.nama.toUpperCase()}</h2>
                <p className="text-xs text-slate-500">{grup.tugas.length} pekerjaan berjalan</p>
              </div>
              <div className="space-y-2 p-4">
                {grup.tugas.map((tugas) => (
                  <BarisTugasKartu
                    key={tugas.penugasanId}
                    tugas={tugas}
                    bolehMenulis={bolehMenulis}
                    onSetor={() => {
                      setSetor(tugas);
                      setJumlahSetor(String(tugas.sisa));
                      setTanggalSetor(tanggalWIBString(new Date()));
                    }}
                    onBatal={() => batalkanPenugasan(tugas)}
                    onUbah={(isi) => ubahPenugasan(tugas, isi)}
                    pilihanPengrajin={pengrajin}
                    tampilkanPengrajin
                  />
                ))}
              </div>
            </article>
          ))}
        </section>
      )}

      {/* ---------- Blok 3: siapa masih kosong ---------- */}
      {!memuat && (data?.bebanKerja.length ?? 0) > 0 && (
        <section className="lina-panel rounded-2xl border p-5">
          <h2 className="text-base font-black text-slate-800">Beban kerja</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Diurutkan dari yang paling sedikit — ini jawaban &quot;siapa yang belum dapat
            kerjaan&quot;.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {data?.bebanKerja.map((p) => (
              <div
                key={p.pengrajinId}
                className={`rounded-xl border p-3 ${
                  p.masihKosong ? "border-emerald-200 bg-emerald-50" : "border-slate-100 bg-white"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-slate-800">{p.nama}</p>
                    {p.kelompok && <p className="text-[10px] text-slate-500">{p.kelompok}</p>}
                  </div>
                  {p.adaTerlambat && (
                    <span className="shrink-0 rounded-md border border-red-200 bg-red-50 px-1.5 py-0.5 text-[9px] font-black text-red-600">
                      TELAT
                    </span>
                  )}
                </div>
                <p
                  className={`mt-1.5 text-xs font-black ${
                    p.masihKosong ? "text-emerald-700" : "text-slate-600"
                  }`}
                >
                  {p.masihKosong ? "Masih kosong" : `${p.jumlahTugas} tugas · ${p.sisaUnit} unit`}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ---------- Modal tetapkan penugasan ---------- */}
      {tugaskan && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 desktop:items-center desktop:p-4">
          <div className="w-full max-w-md rounded-t-3xl bg-white p-6 shadow-2xl desktop:rounded-3xl">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="text-lg font-black text-slate-800">Tugaskan Pekerjaan</h2>
                <p className="text-xs text-slate-500">
                  {tugaskan.namaProduk} · {tugaskan.transaksi.nama_pembeli || "Tanpa nama"} · sisa{" "}
                  {tugaskan.sisa} {tugaskan.satuan}
                </p>
              </div>
              <button
                onClick={() => setTugaskan(null)}
                className="rounded-xl border border-pink-100 p-2 text-pink-600 hover:bg-pink-50"
                aria-label="Tutup"
              >
                <X size={18} />
              </button>
            </div>

            <label className="block text-[11px] font-black uppercase tracking-wide text-slate-400">
              Pengrajin
            </label>
            <select
              value={pilihPengrajin}
              onChange={(e) => setPilihPengrajin(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold text-slate-700 outline-none focus:border-pink-400"
            >
              <option value="">Pilih pengrajin…</option>
              {/* Diurutkan mengikuti beban kerja dari API — yang kosong di atas. */}
              {(data?.bebanKerja ?? []).map((p) => (
                <option key={p.pengrajinId} value={p.pengrajinId}>
                  {p.nama} {p.masihKosong ? "— masih kosong" : `— ${p.jumlahTugas} tugas`}
                </option>
              ))}
            </select>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wide text-slate-400">
                  Jumlah ({tugaskan.satuan})
                </label>
                <input
                  value={jumlahTugas}
                  onChange={(e) => setJumlahTugas(e.target.value.replace(/\D/g, ""))}
                  inputMode="numeric"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold outline-none focus:border-pink-400"
                />
              </div>
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wide text-slate-400">
                  Janji selesai
                </label>
                <input
                  type="date"
                  value={tenggat}
                  onChange={(e) => setTenggat(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold text-slate-700 outline-none focus:border-pink-400"
                />
              </div>
            </div>

            <p className="mt-3 text-[11px] text-slate-500">
              Boleh dibagi ke beberapa orang — isi sebagian dulu, sisanya tetap muncul di daftar
              &quot;belum ditugaskan&quot;.
            </p>

            <button
              onClick={simpanPenugasan}
              disabled={menyimpan}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-pink-600 py-3.5 text-sm font-black text-white shadow-lg shadow-pink-200 hover:bg-pink-700 disabled:opacity-50"
            >
              {menyimpan ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
              Tugaskan
            </button>
          </div>
        </div>
      )}

      {/* ---------- Modal setoran ---------- */}
      {setor && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 desktop:items-center desktop:p-4">
          <div className="w-full max-w-md rounded-t-3xl bg-white p-6 shadow-2xl desktop:rounded-3xl">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="text-lg font-black text-slate-800">Catat Setoran</h2>
                <p className="text-xs text-slate-500">
                  {setor.namaPengrajin} · {setor.namaProduk}
                </p>
              </div>
              <button
                onClick={() => setSetor(null)}
                className="rounded-xl border border-pink-100 p-2 text-pink-600 hover:bg-pink-50"
                aria-label="Tutup"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mb-4 grid grid-cols-3 gap-2 rounded-xl border border-pink-100 bg-pink-50 p-3 text-center">
              <div>
                <p className="text-[10px] font-bold text-slate-500">Ditugaskan</p>
                <p className="text-xs font-black text-slate-700">{setor.jumlahDitugaskan}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500">Sudah setor</p>
                <p className="text-xs font-black text-emerald-600">{setor.sudahDisetor}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500">Sisa</p>
                <p className="text-xs font-black text-red-600">{setor.sisa}</p>
              </div>
            </div>

            <label className="block text-[11px] font-black uppercase tracking-wide text-slate-400">
              Jumlah disetor ({setor.satuan})
            </label>
            <input
              value={jumlahSetor}
              onChange={(e) => setJumlahSetor(e.target.value.replace(/\D/g, ""))}
              inputMode="numeric"
              className="mt-1 w-full border-b-2 border-pink-100 bg-transparent pb-2 text-3xl font-black text-slate-800 outline-none focus:border-pink-400"
            />

            <div className="mt-4">
              <label className="block text-[11px] font-black uppercase tracking-wide text-slate-400">
                Tanggal
              </label>
              <input
                type="date"
                value={tanggalSetor}
                onChange={(e) => setTanggalSetor(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold text-slate-700 outline-none focus:border-pink-400"
              />
            </div>

            <p className="mt-3 rounded-xl border border-pink-100 bg-pink-50 px-3 py-2 text-[11px] leading-relaxed text-slate-600">
              Setoran ini sekaligus menambah saldo upah. Boleh sebagian — sisanya tetap tampil di
              papan.
            </p>

            <button
              onClick={simpanSetoran}
              disabled={menyimpan}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 text-sm font-black text-white shadow-lg shadow-emerald-100 hover:bg-emerald-700 disabled:opacity-50"
            >
              {menyimpan ? <Loader2 size={16} className="animate-spin" /> : <PackageCheck size={16} />}
              Catat Setoran
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function BarisTugasKartu({
  tugas,
  bolehMenulis,
  onSetor,
  onBatal,
  onUbah,
  pilihanPengrajin,
  tampilkanPengrajin,
}: {
  tugas: BarisTugas;
  bolehMenulis: boolean;
  onSetor: () => void;
  onBatal: () => void;
  onUbah: (isi: { pengrajinId?: number; tenggat?: string }) => void;
  pilihanPengrajin: PengrajinPilihan[];
  tampilkanPengrajin: boolean;
}) {
  const [ubahTerbuka, setUbahTerbuka] = useState(false);

  return (
    <div
      className={`rounded-xl border p-3 ${
        tugas.terlambat ? "border-red-200 bg-red-50" : "border-slate-100 bg-white"
      }`}
    >
      <div className="flex flex-wrap items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-black text-slate-800">
            {tugas.namaProduk}
            {tugas.variantName && (
              <span className="ml-1 font-bold text-amber-600">({tugas.variantName})</span>
            )}
          </p>
          <p className="text-[11px] text-slate-500">
            {tampilkanPengrajin && <b className="text-slate-700">{tugas.namaPengrajin} · </b>}
            {tugas.transaksi.nama_pembeli || "Tanpa nama"} · nota {namaNota(tugas.transaksi)}
          </p>
          <p className="mt-0.5 text-[11px]">
            <span className="font-bold text-slate-600">
              {tugas.sudahDisetor}/{tugas.jumlahDitugaskan} {tugas.satuan}
            </span>
            <span className="text-slate-400"> · sisa {tugas.sisa}</span>
          </p>
        </div>

        <div className="text-right">
          <p
            className={`text-[11px] font-black ${
              tugas.terlambat ? "text-red-600" : "text-slate-600"
            }`}
          >
            {tugas.terlambat
              ? `Telat ${Math.abs(tugas.hariKeTenggat)} hari`
              : tugas.hariKeTenggat === 0
                ? "Hari ini"
                : `${tugas.hariKeTenggat} hari lagi`}
          </p>
          <p className="text-[10px] text-slate-400">{tanggalPendek(tugas.tenggat)}</p>
        </div>
      </div>

      {bolehMenulis && (
        <>
          <div className="mt-3 flex gap-2 border-t border-slate-100 pt-2">
            <button
              onClick={onSetor}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-[11px] font-black text-white hover:bg-emerald-700"
            >
              <PackageCheck size={13} /> Catat Setoran
            </button>
            <button
              onClick={() => setUbahTerbuka((n) => !n)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] font-bold text-slate-600 hover:bg-slate-50"
            >
              {ubahTerbuka ? "Tutup" : "Ubah"}
            </button>
            {tugas.sudahDisetor === 0 && (
              <button
                onClick={onBatal}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] font-bold text-slate-500 hover:bg-slate-50"
              >
                Batal
              </button>
            )}
          </div>

          {ubahTerbuka && (
            <div className="mt-2 grid grid-cols-1 gap-2 rounded-lg bg-slate-50 p-2 sm:grid-cols-2">
              <div>
                <label className="block text-[9px] font-black uppercase tracking-wide text-slate-400">
                  Pindah ke
                </label>
                <select
                  value=""
                  onChange={(e) =>
                    e.target.value && onUbah({ pengrajinId: Number(e.target.value) })
                  }
                  className="mt-0.5 w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-[11px] font-bold text-slate-700 outline-none focus:border-pink-400"
                >
                  <option value="">
                    {tugas.sudahDisetor > 0 ? "Sudah ada setoran" : "Pilih pengrajin…"}
                  </option>
                  {pilihanPengrajin
                    .filter((p) => p.id !== tugas.pengrajinId)
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nama}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block text-[9px] font-black uppercase tracking-wide text-slate-400">
                  Geser tenggat
                </label>
                <input
                  type="date"
                  defaultValue={tugas.tenggat.slice(0, 10)}
                  onChange={(e) => e.target.value && onUbah({ tenggat: e.target.value })}
                  className="mt-0.5 w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-[11px] font-bold text-slate-700 outline-none focus:border-pink-400"
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
