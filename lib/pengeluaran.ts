// Kategori pengeluaran & aturan pemisahan biaya usaha dari ambilan pribadi.
//
// Kategori disimpan sebagai String di basis data (konsisten dengan `role`,
// `status`, `satuanHarga` di repo ini) dan divalidasi di sini, supaya menambah
// kategori kelak tidak memerlukan migrasi basis data.

export const KATEGORI_PENGELUARAN = [
  "Bahan Baku",
  "Transport",
  "Konsumsi",
  "Upah Pengrajin",
  "Operasional Lain",
  "Ambilan Pribadi",
] as const;

export type KategoriPengeluaran = (typeof KATEGORI_PENGELUARAN)[number];

// Kategori yang mengurangi LABA USAHA.
export const KATEGORI_BIAYA_USAHA: readonly KategoriPengeluaran[] = [
  "Bahan Baku",
  "Transport",
  "Konsumsi",
  "Upah Pengrajin",
  "Operasional Lain",
];

// Ambilan pribadi (prive) mengurangi KAS tetapi BUKAN biaya usaha — ini
// pembagian keuntungan, bukan ongkos menjalankan usaha. Karena itu ia tidak
// boleh ikut mengurangi laba.
export const KATEGORI_NON_BIAYA: readonly KategoriPengeluaran[] = ["Ambilan Pribadi"];

export const KATEGORI_PRIVE: KategoriPengeluaran = "Ambilan Pribadi";

export const METODE_PENGELUARAN = ["Tunai", "Transfer Bank", "QRIS"] as const;
export type MetodePengeluaran = (typeof METODE_PENGELUARAN)[number];

export const isKategoriPengeluaran = (nilai: unknown): nilai is KategoriPengeluaran =>
  typeof nilai === "string" && (KATEGORI_PENGELUARAN as readonly string[]).includes(nilai);

export const isMetodePengeluaran = (nilai: unknown): nilai is MetodePengeluaran =>
  typeof nilai === "string" && (METODE_PENGELUARAN as readonly string[]).includes(nilai);

export const isBiayaUsaha = (kategori: string): boolean =>
  (KATEGORI_BIAYA_USAHA as readonly string[]).includes(kategori);

export const isPrive = (kategori: string): boolean =>
  (KATEGORI_NON_BIAYA as readonly string[]).includes(kategori);

// Ikon & keterangan per kategori. Warnanya sengaja TIDAK ditaruh di sini:
// seluruh antarmuka memakai palet blush/pink dari app/globals.css, jadi warna
// per kategori hanya akan membuat halaman keluar dari tema.
export const INFO_KATEGORI: Record<
  KategoriPengeluaran,
  { emoji: string; keterangan: string }
> = {
  "Bahan Baku": {
    emoji: "🧵",
    keterangan: "Bando polos, pita, pompom, lem, benang",
  },
  Transport: {
    emoji: "⛽",
    keterangan: "Bensin, tol, parkir",
  },
  Konsumsi: {
    emoji: "🍚",
    keterangan: "Makan & minum selama kirim",
  },
  "Upah Pengrajin": {
    emoji: "🧑‍🏭",
    keterangan: "Bayaran pengrajin per setoran",
  },
  "Operasional Lain": {
    emoji: "🧾",
    keterangan: "Plastik, kertas nota, servis, listrik",
  },
  "Ambilan Pribadi": {
    emoji: "👛",
    keterangan: "Uang usaha yang dipakai pribadi — bukan biaya, tidak mengurangi laba",
  },
};

// Normalisasi nominal rupiah dari input bebas. Kembalikan null bila tidak sah,
// supaya pemanggil bisa menolak dengan 400 alih-alih menyimpan NaN.
export const normalisasiNominal = (nilai: unknown): number | null => {
  const angka =
    typeof nilai === "number"
      ? nilai
      : typeof nilai === "string"
        ? Number(nilai.replace(/[^\d-]/g, ""))
        : NaN;

  if (!Number.isFinite(angka)) return null;
  const bulat = Math.trunc(angka);
  if (bulat <= 0) return null;
  return bulat;
};
