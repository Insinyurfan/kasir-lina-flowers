// Aturan pengrajin: penerima upah, penentuan tarif, sisa penugasan, dan saldo.
//
// Dua hal yang paling mudah salah dan karena itu dikumpulkan di sini:
//
// 1. SIAPA yang saldonya bertambah. Sebagian pengrajin dibayar langsung,
//    sebagian lewat ketua kelompoknya. Setoran mencatat DUA pihak — pekerja
//    dan penerima — supaya riwayat kerja tetap menempel pada pekerjanya walau
//    upahnya masuk ke ketua.
//
// 2. TARIF MANA yang dipakai. Tarif per produk lebih dulu, lalu tarif cadangan
//    per orang. Tarif cadangan bukan kemalasan desain: tanpa itu, satu produk
//    baru membuat setoran gagal dicatat tepat di pagi tersibuk.

import { umurHariWIB } from "@/lib/waktu";

export const PENERIMA_UPAH = ["SENDIRI", "KETUA"] as const;
export type PenerimaUpah = (typeof PENERIMA_UPAH)[number];

export const isPenerimaUpah = (nilai: unknown): nilai is PenerimaUpah =>
  typeof nilai === "string" && (PENERIMA_UPAH as readonly string[]).includes(nilai);

// Satuan tarif mengikuti satuan pesanan yang sudah dipakai di repo ini.
export const SATUAN_TARIF = ["gross", "lusin", "pcs"] as const;
export type SatuanTarif = (typeof SATUAN_TARIF)[number];

export const isSatuanTarif = (nilai: unknown): nilai is SatuanTarif =>
  typeof nilai === "string" && (SATUAN_TARIF as readonly string[]).includes(nilai);

// Bawaan tenggat: 3 hari dari penugasan, sesuai lama pengerjaan yang biasa (2–4 hari).
export const HARI_TENGGAT_BAWAAN = 3;

export const normalisasiNama = (nilai: string) => nilai.trim().toUpperCase();

// ---------------------------------------------------------------- tarif

export type HasilTarif =
  | { ok: true; tarif: number; pakaiCadangan: boolean }
  | { ok: false; alasan: string };

/**
 * Tentukan tarif untuk sebuah setoran. Urutannya:
 *   1. tarif khusus untuk pasangan pengrajin × produk
 *   2. tarif cadangan pengrajin
 *   3. tolak, dengan pesan yang menyebut nama pengrajin dan produknya
 */
export const tentukanTarif = (args: {
  namaPengrajin: string;
  namaProduk: string;
  tarifProduk: number | null | undefined;
  tarifCadangan: number | null | undefined;
}): HasilTarif => {
  if (typeof args.tarifProduk === "number" && args.tarifProduk > 0) {
    return { ok: true, tarif: args.tarifProduk, pakaiCadangan: false };
  }

  if (typeof args.tarifCadangan === "number" && args.tarifCadangan > 0) {
    return { ok: true, tarif: args.tarifCadangan, pakaiCadangan: true };
  }

  return {
    ok: false,
    alasan: `Tarif ${args.namaPengrajin} untuk ${args.namaProduk} belum diatur, dan ${args.namaPengrajin} juga belum punya tarif cadangan.`,
  };
};

export const normalisasiTarif = (nilai: unknown): number | null => {
  const angka =
    typeof nilai === "number"
      ? nilai
      : typeof nilai === "string"
        ? Number(nilai.replace(/[^\d-]/g, ""))
        : NaN;

  if (!Number.isFinite(angka)) return null;
  const bulat = Math.trunc(angka);
  return bulat > 0 ? bulat : null;
};

export const normalisasiJumlah = (nilai: unknown): number | null => {
  const angka = typeof nilai === "number" ? nilai : Number(nilai);
  if (!Number.isFinite(angka)) return null;
  const bulat = Math.trunc(angka);
  return bulat > 0 ? bulat : null;
};

// ---------------------------------------------------------------- penerima upah

/**
 * Tentukan siapa yang saldonya bertambah dari sebuah setoran.
 * `KETUA` tanpa kelompok berketua seharusnya sudah ditolak saat menyimpan
 * master; kalau tetap terjadi (data lama/manual), jatuh ke pekerjanya sendiri
 * daripada kehilangan catatan upah sama sekali.
 */
export const tentukanPenerima = (pekerja: {
  id: number;
  penerimaUpah: string;
  kelompok?: { ketuaId: number | null } | null;
}): number => {
  if (pekerja.penerimaUpah !== "KETUA") return pekerja.id;

  const ketuaId = pekerja.kelompok?.ketuaId ?? null;
  if (!ketuaId || ketuaId === pekerja.id) return pekerja.id;
  return ketuaId;
};

export type HasilValidasiPenerima = { ok: true } | { ok: false; alasan: string };

/**
 * Penjaga master pengrajin. Dijalankan saat MENYIMPAN, bukan saat setoran,
 * supaya kesalahannya ketahuan lebih awal — bukan pada pagi tersibuk.
 */
export const validasiPenerimaUpah = (args: {
  penerimaUpah: string;
  pengrajinId: number | null; // null saat membuat baru
  kelompok: { ketuaId: number | null } | null;
  menjadiKetuaKelompok: boolean;
}): HasilValidasiPenerima => {
  if (args.menjadiKetuaKelompok && args.penerimaUpah === "KETUA") {
    return {
      ok: false,
      alasan:
        "Ketua kelompok harus menerima upahnya sendiri, supaya upah tidak berputar tanpa tujuan.",
    };
  }

  if (args.penerimaUpah !== "KETUA") return { ok: true };

  if (!args.kelompok) {
    return {
      ok: false,
      alasan: "Upah lewat ketua memerlukan kelompok. Pilih kelompoknya dulu.",
    };
  }

  if (!args.kelompok.ketuaId) {
    return {
      ok: false,
      alasan: "Kelompok ini belum punya ketua, jadi upahnya belum jelas masuk ke siapa.",
    };
  }

  if (args.pengrajinId !== null && args.kelompok.ketuaId === args.pengrajinId) {
    return {
      ok: false,
      alasan: "Tidak bisa meneruskan upah ke diri sendiri.",
    };
  }

  return { ok: true };
};

// ---------------------------------------------------------------- penugasan

export const jumlahkanSetoran = (setoran: { jumlah: number }[]): number =>
  setoran.reduce((total, s) => total + s.jumlah, 0);

export const sisaPenugasan = (jumlahDitugaskan: number, setoran: { jumlah: number }[]): number =>
  Math.max(0, jumlahDitugaskan - jumlahkanSetoran(setoran));

export const penugasanTuntas = (jumlahDitugaskan: number, setoran: { jumlah: number }[]): boolean =>
  sisaPenugasan(jumlahDitugaskan, setoran) === 0;

/**
 * Sisa jumlah pada sebuah baris pesanan yang belum ditugaskan ke siapa pun.
 * Dipakai untuk daftar "belum ditugaskan" — jaring pengaman agar orderan tidak
 * terlewat sampai hari kirim.
 */
export const sisaBelumDitugaskan = (
  jumlahDipesan: number,
  penugasan: { jumlahDitugaskan: number }[]
): number =>
  Math.max(
    0,
    jumlahDipesan - penugasan.reduce((total, p) => total + p.jumlahDitugaskan, 0)
  );

/** Penugasan terlambat bila tenggatnya sudah lewat hari ini (kalender WIB). */
export const terlambat = (tenggat: Date, sekarang: Date = new Date()): boolean =>
  umurHariWIB(tenggat, sekarang) > 0;

export const hariKeTenggat = (tenggat: Date, sekarang: Date = new Date()): number =>
  -umurHariWIB(tenggat, sekarang);

export const tenggatBawaan = (dari: Date = new Date()): Date =>
  new Date(dari.getTime() + HARI_TENGGAT_BAWAAN * 24 * 60 * 60 * 1000);

// ---------------------------------------------------------------- saldo

export const jumlahkanNilaiSetoran = (setoran: { nilai: number }[]): number =>
  setoran.reduce((total, s) => total + s.nilai, 0);

export const jumlahkanPenarikan = (penarikan: { nominal: number }[]): number =>
  penarikan.reduce((total, p) => total + p.nominal, 0);

/**
 * Saldo upah = Σ nilai setoran yang PENERIMANYA dia − Σ penarikannya.
 * Sengaja dihitung, tidak disimpan: ini utang ke orang, jadi tidak boleh ada
 * kolom yang bisa diubah tanpa jejak.
 */
export const hitungSaldo = (
  setoranDiterima: { nilai: number }[],
  penarikan: { nominal: number }[]
): number => jumlahkanNilaiSetoran(setoranDiterima) - jumlahkanPenarikan(penarikan);
