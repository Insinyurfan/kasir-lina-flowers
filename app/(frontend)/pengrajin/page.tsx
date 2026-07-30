"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Loader2,
  Pencil,
  Plus,
  Tag,
  Trash2,
  UserRound,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { getSavedUserSession } from "@/lib/userSession";
import { toast } from "@/lib/toast";
import { PENERIMA_UPAH, SATUAN_TARIF, type PenerimaUpah, type SatuanTarif } from "@/lib/pengrajin";
import { tanggalWIBString } from "@/lib/waktu";

type RingkasanPengrajin = {
  id: number;
  nama: string;
  aktif: boolean;
  kelompok: { id: number; nama: string; ketuaId: number | null } | null;
  menjadiKetua: boolean;
  tarifCadangan: number | null;
  satuanTarif: string;
  penerimaUpah: string;
  upahMasukKe: { id: number; nama: string | null } | null;
  jumlahTarifProduk: number;
  pekerjaanAktif: number;
  sisaUnitAktif: number;
  saldo: number;
};

type Kelompok = {
  id: number;
  nama: string;
  ketuaId: number | null;
  ketua: { id: number; nama: string } | null;
};

type BarisTarif = {
  productId: number;
  namaProduk: string;
  satuanHarga: string;
  tarifKhusus: number | null;
  tarifBerlaku: number | null;
  pakaiCadangan: boolean;
  belumAdaTarif: boolean;
};

type BarisRiwayat = {
  kunci: string;
  jenis: "setoran" | "penarikan";
  tanggal: string;
  keterangan: string;
  nilai: number; // positif = menambah saldo, negatif = mengurangi
  saldoBerjalan: number;
};

const rupiah = (nilai: number) => `Rp ${Math.round(nilai || 0).toLocaleString("id-ID")}`;

const tanggalPendek = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  });
const formatRibuan = (nilai: string) => {
  const angka = nilai.replace(/\D/g, "");
  return angka ? Number(angka).toLocaleString("id-ID") : "";
};

export default function PengrajinPage() {
  const [user, setUser] = useState<{ role?: string } | null>(null);
  const [memuat, setMemuat] = useState(true);
  const [daftar, setDaftar] = useState<RingkasanPengrajin[]>([]);
  const [kelompok, setKelompok] = useState<Kelompok[]>([]);
  const [totalTerutang, setTotalTerutang] = useState(0);
  const [jumlahAktif, setJumlahAktif] = useState(0);
  const [tampilkanNonaktif, setTampilkanNonaktif] = useState(false);

  // Formulir pengrajin
  const [formTerbuka, setFormTerbuka] = useState(false);
  const [formId, setFormId] = useState<number | null>(null);
  const [formNama, setFormNama] = useState("");
  const [formKelompokId, setFormKelompokId] = useState<string>("");
  const [formPenerima, setFormPenerima] = useState<PenerimaUpah>("SENDIRI");
  const [formTarif, setFormTarif] = useState("");
  const [formSatuan, setFormSatuan] = useState<SatuanTarif>("gross");
  const [menyimpan, setMenyimpan] = useState(false);

  // Panel tarif per produk
  const [tarifUntuk, setTarifUntuk] = useState<RingkasanPengrajin | null>(null);
  const [barisTarif, setBarisTarif] = useState<BarisTarif[]>([]);
  const [draftTarif, setDraftTarif] = useState<Record<number, string>>({});

  // Panel riwayat: setoran & penarikan berurutan waktu beserta saldo berjalan.
  // Inilah yang membuat "riwayat tak bisa dimanipulasi" terasa nyata — kalau
  // tidak bisa dilihat, janji itu kosong.
  const [riwayatUntuk, setRiwayatUntuk] = useState<RingkasanPengrajin | null>(null);
  const [riwayat, setRiwayat] = useState<BarisRiwayat[]>([]);
  const [memuatRiwayat, setMemuatRiwayat] = useState(false);

  // Modal tarik upah
  const [tarikUntuk, setTarikUntuk] = useState<RingkasanPengrajin | null>(null);
  const [nominalTarik, setNominalTarik] = useState("");
  const [tanggalTarik, setTanggalTarik] = useState(() => tanggalWIBString(new Date()));
  const [catatanTarik, setCatatanTarik] = useState("");

  // Kelompok
  const [kelompokTerbuka, setKelompokTerbuka] = useState(false);
  const [namaKelompokBaru, setNamaKelompokBaru] = useState("");

  useEffect(() => {
    const idTimeout = window.setTimeout(() => {
      setUser(getSavedUserSession<{ role?: string }>());
    }, 0);
    return () => window.clearTimeout(idTimeout);
  }, []);

  const muat = useCallback(async () => {
    try {
      const res = await fetch(`/api/pengrajin${tampilkanNonaktif ? "?semua=1" : ""}`, {
        cache: "no-store",
      });
      if (!res.ok) {
        const galat = await res.json().catch(() => ({}));
        throw new Error(galat.error || "Gagal memuat pengrajin.");
      }
      const data = await res.json();
      setDaftar(data.pengrajin || []);
      setKelompok(data.kelompok || []);
      setTotalTerutang(data.totalTerutang || 0);
      setJumlahAktif(data.jumlahAktif || 0);
      setMemuat(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal memuat pengrajin.");
      setMemuat(false);
    }
  }, [tampilkanNonaktif]);

  useEffect(() => {
    const idTimeout = window.setTimeout(() => void muat(), 0);
    return () => window.clearTimeout(idTimeout);
  }, [muat]);

  const bolehMenulis = user?.role === "Owner" || user?.role === "Admin";

  const kosongkanForm = () => {
    setFormId(null);
    setFormNama("");
    setFormKelompokId("");
    setFormPenerima("SENDIRI");
    setFormTarif("");
    setFormSatuan("gross");
    setFormTerbuka(false);
  };

  const mulaiUbah = (p: RingkasanPengrajin) => {
    setFormId(p.id);
    setFormNama(p.nama);
    setFormKelompokId(p.kelompok ? String(p.kelompok.id) : "");
    setFormPenerima(p.penerimaUpah === "KETUA" ? "KETUA" : "SENDIRI");
    setFormTarif(p.tarifCadangan ? p.tarifCadangan.toLocaleString("id-ID") : "");
    setFormSatuan((SATUAN_TARIF as readonly string[]).includes(p.satuanTarif)
      ? (p.satuanTarif as SatuanTarif)
      : "gross");
    setFormTerbuka(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const simpanPengrajin = async () => {
    if (!formNama.trim()) return toast.error("Nama pengrajin belum diisi.");

    setMenyimpan(true);
    try {
      const isi = {
        nama: formNama,
        kelompokId: formKelompokId || null,
        penerimaUpah: formPenerima,
        tarifCadangan: formTarif ? Number(formTarif.replace(/\D/g, "")) : null,
        satuanTarif: formSatuan,
      };
      const res = await fetch(formId ? `/api/pengrajin/${formId}` : "/api/pengrajin", {
        method: formId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isi),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan pengrajin.");

      toast.success(formId ? "Data pengrajin diperbarui." : `${data.nama} ditambahkan.`);
      kosongkanForm();
      await muat();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menyimpan pengrajin.");
    } finally {
      setMenyimpan(false);
    }
  };

  const ubahAktif = async (p: RingkasanPengrajin) => {
    try {
      const res = await fetch(`/api/pengrajin/${p.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aktif: !p.aktif }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengubah status.");
      toast.success(`${p.nama} ${p.aktif ? "dinonaktifkan" : "diaktifkan kembali"}.`);
      await muat();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal mengubah status.");
    }
  };

  const hapusPengrajin = async (p: RingkasanPengrajin) => {
    if (!confirm(`Hapus pengrajin ${p.nama}?`)) return;
    try {
      const res = await fetch(`/api/pengrajin/${p.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menghapus pengrajin.");
      toast.success(`${p.nama} dihapus.`);
      await muat();
    } catch (error) {
      // Pesan dari server sudah menjelaskan kenapa ditolak & menyarankan
      // menonaktifkan — teruskan apa adanya.
      toast.error(error instanceof Error ? error.message : "Gagal menghapus pengrajin.");
    }
  };

  const bukaTarif = async (p: RingkasanPengrajin) => {
    setTarifUntuk(p);
    setBarisTarif([]);
    setDraftTarif({});
    try {
      const res = await fetch(`/api/pengrajin/${p.id}/tarif`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal memuat tarif.");
      setBarisTarif(data.produk || []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal memuat tarif.");
    }
  };

  const simpanTarif = async (productId: number) => {
    if (!tarifUntuk) return;
    const angka = Number((draftTarif[productId] || "").replace(/\D/g, ""));
    if (!angka) return toast.error("Tarif belum diisi.");

    try {
      const res = await fetch(`/api/pengrajin/${tarifUntuk.id}/tarif`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, tarif: angka }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan tarif.");
      toast.success("Tarif tersimpan. Setoran lama tidak berubah.");
      setDraftTarif((s) => ({ ...s, [productId]: "" }));
      await bukaTarif(tarifUntuk);
      await muat();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menyimpan tarif.");
    }
  };

  const hapusTarif = async (productId: number) => {
    if (!tarifUntuk) return;
    try {
      const res = await fetch(`/api/pengrajin/${tarifUntuk.id}/tarif?productId=${productId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menghapus tarif.");
      toast.success("Tarif khusus dihapus.");
      await bukaTarif(tarifUntuk);
      await muat();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menghapus tarif.");
    }
  };

  const bukaRiwayat = async (p: RingkasanPengrajin) => {
    setRiwayatUntuk(p);
    setRiwayat([]);
    setMemuatRiwayat(true);
    try {
      const res = await fetch(`/api/pengrajin/${p.id}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal memuat riwayat.");

      type SetoranMasuk = {
        id: number;
        nilai: number;
        tanggal: string;
        pengrajin: { nama: string };
      };
      type PenarikanKeluar = { id: number; nominal: number; tanggal: string; catatan: string | null };

      const gabungan: Omit<BarisRiwayat, "saldoBerjalan">[] = [
        ...(data.setoranTerima || []).map((s: SetoranMasuk) => ({
          kunci: `s${s.id}`,
          jenis: "setoran" as const,
          tanggal: s.tanggal,
          keterangan: `Setoran ${s.pengrajin.nama}`,
          nilai: s.nilai,
        })),
        ...(data.penarikan || []).map((t: PenarikanKeluar) => ({
          kunci: `t${t.id}`,
          jenis: "penarikan" as const,
          tanggal: t.tanggal,
          keterangan: t.catatan ? `Pencairan — ${t.catatan}` : "Pencairan upah",
          nilai: -t.nominal,
        })),
      ].sort((a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime());

      // Saldo berjalan dihitung dari yang tertua, lalu dibalik agar yang terbaru
      // di atas — sama seperti buku catatan yang dibaca dari belakang.
      let berjalan = 0;
      const berurutan = gabungan.map((baris) => {
        berjalan += baris.nilai;
        return { ...baris, saldoBerjalan: berjalan };
      });

      setRiwayat(berurutan.reverse());
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal memuat riwayat.");
    } finally {
      setMemuatRiwayat(false);
    }
  };

  const tarikUpah = async () => {
    if (!tarikUntuk) return;
    const angka = Number(nominalTarik.replace(/\D/g, ""));
    if (!angka) return toast.error("Nominal belum diisi.");

    setMenyimpan(true);
    try {
      const res = await fetch("/api/penarikan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pengrajinId: tarikUntuk.id,
          nominal: angka,
          tanggal: tanggalTarik,
          catatan: catatanTarik,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mencairkan upah.");

      toast.success(
        `Upah ${rupiah(angka)} dicairkan untuk ${tarikUntuk.nama}. Sisa saldo ${rupiah(data.saldoSisa)}.`
      );
      setTarikUntuk(null);
      setNominalTarik("");
      setCatatanTarik("");
      await muat();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal mencairkan upah.");
    } finally {
      setMenyimpan(false);
    }
  };

  const tambahKelompok = async () => {
    if (!namaKelompokBaru.trim()) return toast.error("Nama kelompok belum diisi.");
    try {
      const res = await fetch("/api/kelompok", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama: namaKelompokBaru }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menambah kelompok.");
      toast.success(`Kelompok ${data.nama} ditambahkan.`);
      setNamaKelompokBaru("");
      await muat();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menambah kelompok.");
    }
  };

  const ubahKetua = async (kelompokId: number, ketuaId: string) => {
    try {
      const res = await fetch("/api/kelompok", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: kelompokId, ketuaId: ketuaId || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengubah ketua.");
      toast.success("Ketua kelompok diperbarui.");
      await muat();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal mengubah ketua.");
    }
  };

  // Kelompokkan tampilan: per kelompok, lalu tanpa kelompok di akhir.
  const perKelompok = useMemo(() => {
    const peta = new Map<string, { nama: string; id: number | null; anggota: RingkasanPengrajin[] }>();
    for (const p of daftar) {
      const kunci = p.kelompok ? `k${p.kelompok.id}` : "tanpa";
      const isi = peta.get(kunci) ?? {
        nama: p.kelompok?.nama ?? "Tanpa Kelompok",
        id: p.kelompok?.id ?? null,
        anggota: [],
      };
      isi.anggota.push(p);
      peta.set(kunci, isi);
    }
    return Array.from(peta.values()).sort((a, b) => {
      if (a.id === null) return 1;
      if (b.id === null) return -1;
      return a.nama.localeCompare(b.nama);
    });
  }, [daftar]);

  return (
    <div className="lina-page-stack space-y-6">
      <header className="lina-panel rounded-2xl border p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-black text-slate-800">
              <Users className="text-pink-500" /> Pengrajin
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Daftar pengrajin, tarif upah per produk, dan saldo yang belum dicairkan.
            </p>
          </div>
          {bolehMenulis && (
            <button
              onClick={() => (formTerbuka ? kosongkanForm() : setFormTerbuka(true))}
              className="flex items-center gap-2 rounded-xl bg-pink-600 px-4 py-2.5 text-sm font-black text-white shadow-md shadow-pink-200 hover:bg-pink-700"
            >
              {formTerbuka ? <X size={16} /> : <Plus size={16} />}
              {formTerbuka ? "Tutup" : "Tambah Pengrajin"}
            </button>
          )}
        </div>
      </header>

      {/* ---------- Ringkasan ---------- */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="lina-panel rounded-2xl border p-5">
          <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">
            Pengrajin aktif
          </p>
          <p className="mt-1 text-3xl font-black text-slate-800">{jumlahAktif}</p>
        </div>
        <div className="lina-panel rounded-2xl border p-5">
          <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">
            Saldo upah terutang
          </p>
          <p className="mt-1 text-3xl font-black text-slate-800">{rupiah(totalTerutang)}</p>
          {/* Ini konsekuensi keputusan "biaya diakui saat pencairan": upah yang
              menumpuk belum muncul di Laba Rugi, jadi harus terlihat di sini. */}
          <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
            Sudah dikerjakan, belum dicairkan. <b>Belum masuk laporan Laba Rugi</b> — biaya baru
            dihitung saat uangnya benar-benar keluar.
          </p>
        </div>
      </section>

      {/* ---------- Formulir ---------- */}
      {formTerbuka && bolehMenulis && (
        <section className="lina-panel rounded-2xl border p-5">
          <h2 className="mb-4 text-base font-black text-slate-800">
            {formId ? "Ubah Pengrajin" : "Pengrajin Baru"}
          </h2>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-black uppercase tracking-wide text-slate-400">
                Nama
              </label>
              <input
                value={formNama}
                onChange={(e) => setFormNama(e.target.value)}
                placeholder="mis. MAMA URI"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm uppercase outline-none focus:border-pink-400"
              />
            </div>

            <div>
              <label className="block text-[11px] font-black uppercase tracking-wide text-slate-400">
                Kelompok
              </label>
              <select
                value={formKelompokId}
                onChange={(e) => setFormKelompokId(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold text-slate-700 outline-none focus:border-pink-400"
              >
                <option value="">Tanpa kelompok</option>
                {kelompok.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.nama}
                    {k.ketua ? ` (ketua ${k.ketua.nama})` : " (belum ada ketua)"}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-black uppercase tracking-wide text-slate-400">
                Upah masuk ke
              </label>
              <select
                value={formPenerima}
                onChange={(e) => setFormPenerima(e.target.value as PenerimaUpah)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold text-slate-700 outline-none focus:border-pink-400"
              >
                {PENERIMA_UPAH.map((nilai) => (
                  <option key={nilai} value={nilai}>
                    {nilai === "SENDIRI" ? "Dirinya sendiri" : "Ketua kelompoknya"}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-black uppercase tracking-wide text-slate-400">
                Tarif cadangan (opsional)
              </label>
              <input
                value={formTarif}
                onChange={(e) => setFormTarif(formatRibuan(e.target.value))}
                inputMode="numeric"
                placeholder="mis. 15.000"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-pink-400"
              />
            </div>

            <div>
              <label className="block text-[11px] font-black uppercase tracking-wide text-slate-400">
                Satuan
              </label>
              <select
                value={formSatuan}
                onChange={(e) => setFormSatuan(e.target.value as SatuanTarif)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold text-slate-700 outline-none focus:border-pink-400"
              >
                {SATUAN_TARIF.map((s) => (
                  <option key={s} value={s}>
                    per {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <p className="mt-3 rounded-xl border border-pink-100 bg-pink-50 px-3 py-2 text-[11px] leading-relaxed text-slate-600">
            Tarif cadangan dipakai kalau sebuah produk belum punya tarif khusus. Tanpa ini, produk
            baru bikin setoran <b>tidak bisa dicatat</b> sampai tarifnya diisi — dan itu biasanya
            baru ketahuan pas pagi tersibuk.
          </p>

          <div className="mt-4 flex gap-2">
            <button
              onClick={simpanPengrajin}
              disabled={menyimpan}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-pink-600 py-3 text-sm font-black text-white shadow-lg shadow-pink-200 hover:bg-pink-700 disabled:opacity-50"
            >
              {menyimpan ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
              Simpan
            </button>
            <button
              onClick={kosongkanForm}
              className="rounded-xl border border-pink-100 bg-white px-5 text-sm font-bold text-pink-600 hover:bg-pink-50"
            >
              Batal
            </button>
          </div>
        </section>
      )}

      {/* ---------- Kelompok ---------- */}
      <section className="lina-panel rounded-2xl border p-5">
        <button
          onClick={() => setKelompokTerbuka((n) => !n)}
          className="flex w-full items-center gap-2 text-left"
        >
          {kelompokTerbuka ? (
            <ChevronDown size={18} className="text-pink-500" />
          ) : (
            <ChevronRight size={18} className="text-pink-500" />
          )}
          <h2 className="flex-1 text-base font-black text-slate-800">
            Kelompok <span className="font-normal text-slate-400">({kelompok.length})</span>
          </h2>
        </button>

        {kelompokTerbuka && (
          <div className="mt-4 space-y-3">
            {kelompok.map((k) => (
              <div
                key={k.id}
                className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-100 bg-white p-3"
              >
                <p className="flex-1 text-sm font-black text-slate-700">{k.nama}</p>
                {bolehMenulis ? (
                  <select
                    value={k.ketuaId ?? ""}
                    onChange={(e) => ubahKetua(k.id, e.target.value)}
                    className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-bold text-slate-700 outline-none focus:border-pink-400"
                  >
                    <option value="">Belum ada ketua</option>
                    {daftar
                      .filter((p) => p.penerimaUpah === "SENDIRI")
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          Ketua: {p.nama}
                        </option>
                      ))}
                  </select>
                ) : (
                  <span className="text-xs text-slate-500">
                    {k.ketua ? `Ketua: ${k.ketua.nama}` : "Belum ada ketua"}
                  </span>
                )}
              </div>
            ))}

            {bolehMenulis && (
              <div className="flex gap-2">
                <input
                  value={namaKelompokBaru}
                  onChange={(e) => setNamaKelompokBaru(e.target.value)}
                  placeholder="Nama kelompok baru"
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm uppercase outline-none focus:border-pink-400"
                />
                <button
                  onClick={tambahKelompok}
                  className="rounded-xl bg-pink-600 px-4 text-sm font-black text-white hover:bg-pink-700"
                >
                  Tambah
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* ---------- Daftar pengrajin ---------- */}
      <div className="flex justify-end">
        <button
          onClick={() => setTampilkanNonaktif((n) => !n)}
          className="rounded-xl border border-pink-100 bg-white px-3 py-2 text-xs font-bold text-pink-600 hover:bg-pink-50"
        >
          {tampilkanNonaktif ? "Sembunyikan yang nonaktif" : "Tampilkan yang nonaktif"}
        </button>
      </div>

      <section className="space-y-4">
        {memuat && (
          <div className="lina-panel rounded-2xl border p-12 text-center font-bold text-slate-400">
            Memuat pengrajin...
          </div>
        )}

        {!memuat && daftar.length === 0 && (
          <div className="lina-panel rounded-2xl border p-12 text-center">
            <p className="font-bold text-slate-500">Belum ada pengrajin terdaftar.</p>
            <p className="mx-auto mt-2 max-w-md text-xs text-slate-400">
              Isi daftarnya dulu — papan tugas belum bisa dipakai sebelum ada nama yang bisa diberi
              pekerjaan.
            </p>
          </div>
        )}

        {perKelompok.map((grup) => (
          <article key={grup.id ?? "tanpa"} className="lina-panel overflow-hidden rounded-2xl border">
            <div className="border-b border-pink-100 bg-pink-50 px-5 py-3">
              <h2 className="text-sm font-black text-slate-700">{grup.nama}</h2>
            </div>
            <div className="space-y-2 p-4">
              {grup.anggota.map((p) => (
                <div
                  key={p.id}
                  className={`rounded-xl border p-4 ${
                    p.aktif ? "border-slate-100 bg-white" : "border-slate-200 bg-slate-50 opacity-70"
                  }`}
                >
                  <div className="flex flex-wrap items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-pink-100 text-pink-600">
                      <UserRound size={20} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="flex flex-wrap items-center gap-2 text-sm font-black text-slate-800">
                        {p.nama}
                        {p.menjadiKetua && (
                          <span className="rounded-md border border-pink-200 bg-pink-50 px-1.5 py-0.5 text-[9px] font-black text-pink-700">
                            KETUA
                          </span>
                        )}
                        {!p.aktif && (
                          <span className="rounded-md border border-slate-300 bg-slate-100 px-1.5 py-0.5 text-[9px] font-black text-slate-500">
                            NONAKTIF
                          </span>
                        )}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {p.pekerjaanAktif > 0
                          ? `${p.pekerjaanAktif} pekerjaan · sisa ${p.sisaUnitAktif} ${p.satuanTarif}`
                          : "Belum ada pekerjaan aktif"}
                        {" · "}
                        {p.jumlahTarifProduk > 0
                          ? `${p.jumlahTarifProduk} tarif produk`
                          : "belum ada tarif produk"}
                        {p.tarifCadangan
                          ? ` · cadangan ${rupiah(p.tarifCadangan)}/${p.satuanTarif}`
                          : " · tanpa tarif cadangan"}
                      </p>
                    </div>

                    <div className="text-right">
                      {p.upahMasukKe ? (
                        <p className="text-[11px] leading-tight text-slate-500">
                          Upah masuk ke
                          <br />
                          <b className="text-slate-700">{p.upahMasukKe.nama ?? "ketua"}</b>
                        </p>
                      ) : (
                        <>
                          <p className="text-[10px] font-bold text-slate-400">Saldo</p>
                          <p
                            className={`text-base font-black ${
                              p.saldo < 0 ? "text-red-600" : "text-slate-800"
                            }`}
                          >
                            {rupiah(p.saldo)}
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                  {bolehMenulis && (
                    <div className="mt-3 flex flex-wrap gap-2 border-t border-slate-100 pt-3">
                      {!p.upahMasukKe && p.saldo > 0 && (
                        <button
                          onClick={() => {
                            setTarikUntuk(p);
                            setNominalTarik(p.saldo.toLocaleString("id-ID"));
                            setTanggalTarik(tanggalWIBString(new Date()));
                            setCatatanTarik("");
                          }}
                          className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-[11px] font-black text-white hover:bg-emerald-700"
                        >
                          <Wallet size={13} /> Tarik Upah
                        </button>
                      )}
                      <button
                        onClick={() => bukaTarif(p)}
                        className="flex items-center gap-1.5 rounded-lg border border-pink-100 bg-white px-3 py-1.5 text-[11px] font-bold text-pink-600 hover:bg-pink-50"
                      >
                        <Tag size={13} /> Tarif Produk
                      </button>
                      <button
                        onClick={() => bukaRiwayat(p)}
                        className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-bold text-slate-600 hover:bg-slate-50"
                      >
                        <ClipboardList size={13} /> Riwayat
                      </button>
                      <button
                        onClick={() => mulaiUbah(p)}
                        className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-bold text-slate-600 hover:bg-slate-50"
                      >
                        <Pencil size={13} /> Ubah
                      </button>
                      <button
                        onClick={() => ubahAktif(p)}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-bold text-slate-600 hover:bg-slate-50"
                      >
                        {p.aktif ? "Nonaktifkan" : "Aktifkan"}
                      </button>
                      <button
                        onClick={() => hapusPengrajin(p)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                        aria-label="Hapus"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </article>
        ))}
      </section>

      {/* ---------- Panel tarif per produk ---------- */}
      {tarifUntuk && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 desktop:items-center desktop:p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl desktop:rounded-3xl">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="text-lg font-black text-slate-800">Tarif per Produk</h2>
                <p className="text-xs text-slate-500">
                  {tarifUntuk.nama} ·{" "}
                  {tarifUntuk.tarifCadangan
                    ? `cadangan ${rupiah(tarifUntuk.tarifCadangan)}/${tarifUntuk.satuanTarif}`
                    : "belum punya tarif cadangan"}
                </p>
              </div>
              <button
                onClick={() => setTarifUntuk(null)}
                className="rounded-xl border border-pink-100 p-2 text-pink-600 hover:bg-pink-50"
                aria-label="Tutup"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2">
              {barisTarif.map((baris) => (
                <div
                  key={baris.productId}
                  className={`rounded-xl border p-3 ${
                    baris.belumAdaTarif
                      ? "border-red-200 bg-red-50"
                      : baris.pakaiCadangan
                        ? "border-amber-200 bg-amber-50"
                        : "border-slate-100 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="min-w-0 flex-1 truncate text-xs font-black text-slate-700">
                      {baris.namaProduk}
                    </p>
                    <span className="text-xs font-black text-slate-700">
                      {baris.tarifBerlaku ? rupiah(baris.tarifBerlaku) : "—"}
                    </span>
                  </div>

                  <p className="mt-0.5 text-[10px] font-bold">
                    {baris.belumAdaTarif ? (
                      <span className="text-red-600">
                        Belum ada tarif — setoran produk ini akan ditolak
                      </span>
                    ) : baris.pakaiCadangan ? (
                      <span className="text-amber-700">Memakai tarif cadangan</span>
                    ) : (
                      <span className="text-emerald-600">Tarif khusus</span>
                    )}
                  </p>

                  <div className="mt-2 flex gap-2">
                    <input
                      value={draftTarif[baris.productId] || ""}
                      onChange={(e) =>
                        setDraftTarif((s) => ({
                          ...s,
                          [baris.productId]: formatRibuan(e.target.value),
                        }))
                      }
                      inputMode="numeric"
                      placeholder={`Tarif per ${baris.satuanHarga}`}
                      className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs outline-none focus:border-pink-400"
                    />
                    <button
                      onClick={() => simpanTarif(baris.productId)}
                      className="rounded-lg bg-pink-600 px-3 text-[11px] font-black text-white hover:bg-pink-700"
                    >
                      Simpan
                    </button>
                    {baris.tarifKhusus !== null && (
                      <button
                        onClick={() => hapusTarif(baris.productId)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                        aria-label="Hapus tarif khusus"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ---------- Panel riwayat ---------- */}
      {riwayatUntuk && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 desktop:items-center desktop:p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl desktop:rounded-3xl">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="text-lg font-black text-slate-800">Riwayat Upah</h2>
                <p className="text-xs text-slate-500">
                  {riwayatUntuk.nama}
                  {riwayatUntuk.upahMasukKe
                    ? ` · upah masuk ke ${riwayatUntuk.upahMasukKe.nama}`
                    : ` · saldo ${rupiah(riwayatUntuk.saldo)}`}
                </p>
              </div>
              <button
                onClick={() => setRiwayatUntuk(null)}
                className="rounded-xl border border-pink-100 p-2 text-pink-600 hover:bg-pink-50"
                aria-label="Tutup"
              >
                <X size={18} />
              </button>
            </div>

            {memuatRiwayat && (
              <p className="py-10 text-center text-sm font-bold text-slate-400">Memuat riwayat...</p>
            )}

            {!memuatRiwayat && riwayat.length === 0 && (
              <p className="py-10 text-center text-sm text-slate-400">
                {riwayatUntuk.upahMasukKe
                  ? `Upah ${riwayatUntuk.nama} masuk ke saldo ${riwayatUntuk.upahMasukKe.nama}, jadi riwayat saldonya ada di sana. Hasil kerjanya tetap tercatat.`
                  : "Belum ada setoran maupun pencairan."}
              </p>
            )}

            <div className="space-y-2">
              {riwayat.map((baris) => (
                <div
                  key={baris.kunci}
                  className={`flex items-center gap-3 rounded-xl border p-3 ${
                    baris.jenis === "setoran"
                      ? "border-emerald-100 bg-emerald-50"
                      : "border-pink-100 bg-pink-50"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-black text-slate-700">
                      {baris.keterangan}
                    </p>
                    <p className="text-[10px] text-slate-500">{tanggalPendek(baris.tanggal)}</p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-xs font-black ${
                        baris.nilai >= 0 ? "text-emerald-700" : "text-pink-700"
                      }`}
                    >
                      {baris.nilai >= 0 ? "+" : "−"}
                      {rupiah(Math.abs(baris.nilai))}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      saldo {rupiah(baris.saldoBerjalan)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ---------- Modal tarik upah ---------- */}
      {tarikUntuk && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 desktop:items-center desktop:p-4">
          <div className="w-full max-w-md rounded-t-3xl bg-white p-6 shadow-2xl desktop:rounded-3xl">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="text-lg font-black text-slate-800">Tarik Upah</h2>
                <p className="text-xs text-slate-500">
                  {tarikUntuk.nama} · saldo {rupiah(tarikUntuk.saldo)}
                </p>
              </div>
              <button
                onClick={() => setTarikUntuk(null)}
                className="rounded-xl border border-pink-100 p-2 text-pink-600 hover:bg-pink-50"
                aria-label="Tutup"
              >
                <X size={18} />
              </button>
            </div>

            <label className="block text-[11px] font-black uppercase tracking-wide text-slate-400">
              Nominal dicairkan
            </label>
            <div className="mt-1 flex items-baseline gap-2 border-b-2 border-pink-100 pb-2 focus-within:border-pink-400">
              <span className="text-base font-black text-pink-400">Rp</span>
              <input
                value={nominalTarik}
                onChange={(e) => setNominalTarik(formatRibuan(e.target.value))}
                inputMode="numeric"
                className="w-full bg-transparent text-2xl font-black text-slate-800 outline-none"
              />
            </div>

            <div className="mt-2 flex gap-2">
              <button
                onClick={() => setNominalTarik(tarikUntuk.saldo.toLocaleString("id-ID"))}
                className="rounded-lg border border-pink-100 bg-white px-2.5 py-1 text-[11px] font-bold text-pink-600 hover:bg-pink-50"
              >
                Semua
              </button>
              <button
                onClick={() =>
                  setNominalTarik(Math.round(tarikUntuk.saldo / 2).toLocaleString("id-ID"))
                }
                className="rounded-lg border border-pink-100 bg-white px-2.5 py-1 text-[11px] font-bold text-pink-600 hover:bg-pink-50"
              >
                Setengah
              </button>
            </div>

            <p className="mt-3 text-[11px] text-slate-500">
              Sisa setelah dicairkan:{" "}
              <b className="text-slate-700">
                {rupiah(tarikUntuk.saldo - Number(nominalTarik.replace(/\D/g, "") || 0))}
              </b>
            </p>

            <div className="mt-4">
              <label className="block text-[11px] font-black uppercase tracking-wide text-slate-400">
                Tanggal
              </label>
              <input
                type="date"
                value={tanggalTarik}
                onChange={(e) => setTanggalTarik(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold text-slate-700 outline-none focus:border-pink-400"
              />
            </div>

            <input
              value={catatanTarik}
              onChange={(e) => setCatatanTarik(e.target.value)}
              placeholder="Catatan (opsional)"
              className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-pink-400"
            />

            <p className="mt-3 rounded-xl border border-pink-100 bg-pink-50 px-3 py-2 text-[11px] leading-relaxed text-slate-600">
              Pencairan ini otomatis tercatat sebagai pengeluaran <b>Upah Pengrajin</b> dan
              mengurangi laba bulan ini.
            </p>

            <button
              onClick={tarikUpah}
              disabled={menyimpan}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 text-sm font-black text-white shadow-lg shadow-emerald-100 hover:bg-emerald-700 disabled:opacity-50"
            >
              {menyimpan ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
              Cairkan Upah
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
