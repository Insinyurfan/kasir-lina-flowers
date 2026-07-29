// Perhitungan sisa tagihan, status pelunasan, dan umur piutang.
//
// Aturan yang mengikat: `Transaction.status` TIDAK pernah ditulis dari klien.
// Ia diturunkan dari total pembayaran lewat `turunkanStatus()` dan hanya ditulis
// server di dalam transaksi basis data yang sama dengan perubahan `Payment`.

import { umurHariWIB } from "@/lib/waktu";

export const STATUS_LUNAS = "Paid";
export const STATUS_BELUM_LUNAS = "Unpaid";

export const METODE_PEMBAYARAN = ["Tunai", "Transfer Bank", "QRIS"] as const;
export type MetodePembayaran = (typeof METODE_PEMBAYARAN)[number];

export const isMetodePembayaran = (nilai: unknown): nilai is MetodePembayaran =>
  typeof nilai === "string" && (METODE_PEMBAYARAN as readonly string[]).includes(nilai);

// Penanda pada Payment hasil skrip backfill. Dipakai juga untuk rollback:
// menghapus baris bercatatan ini mengembalikan keadaan sebelum migrasi.
export const CATATAN_MIGRASI = "Migrasi otomatis dari status lama";

export const jumlahkanPembayaran = (pembayaran: { nominal: number }[]): number =>
  pembayaran.reduce((total, bayar) => total + bayar.nominal, 0);

export const hitungSisaTagihan = (totalHarga: number, totalDibayar: number): number =>
  Math.max(0, totalHarga - totalDibayar);

// Sebuah transaksi lunas ketika pembayarannya sudah menutup total harga.
// Memakai >= (bukan ===) supaya kelebihan bayar akibat data lama tidak membuat
// transaksi terlihat menunggak selamanya.
export const turunkanStatus = (totalHarga: number, totalDibayar: number): string =>
  totalDibayar >= totalHarga ? STATUS_LUNAS : STATUS_BELUM_LUNAS;

export const KELOMPOK_UMUR = ["0-7", "8-14", "15-30", ">30"] as const;
export type KelompokUmur = (typeof KELOMPOK_UMUR)[number];

export const kelompokkanUmur = (umurHari: number): KelompokUmur => {
  if (umurHari <= 7) return "0-7";
  if (umurHari <= 14) return "8-14";
  if (umurHari <= 30) return "15-30";
  return ">30";
};

export const LABEL_KELOMPOK_UMUR: Record<KelompokUmur, string> = {
  "0-7": "0–7 hari",
  "8-14": "8–14 hari",
  "15-30": "15–30 hari",
  ">30": "Lebih dari 30 hari",
};

// Kelas warna per kelompok umur, dipakai seragam di halaman piutang.
export const WARNA_KELOMPOK_UMUR: Record<KelompokUmur, string> = {
  "0-7": "bg-emerald-100 text-emerald-700 border-emerald-200",
  "8-14": "bg-amber-100 text-amber-700 border-amber-200",
  "15-30": "bg-orange-100 text-orange-700 border-orange-200",
  ">30": "bg-rose-100 text-rose-700 border-rose-300",
};

export type PiutangTransaksi = {
  id: number;
  trxNumber: number | null;
  tanggal: Date;
  totalHarga: number;
  totalDibayar: number;
  sisaTagihan: number;
  umurHari: number;
  kelompokUmur: KelompokUmur;
};

// Bentuk satu baris piutang dari transaksi + pembayarannya.
export const bentukPiutang = (
  transaksi: {
    id: number;
    trxNumber: number | null;
    tanggal: Date;
    total_harga: number;
    payments: { nominal: number }[];
  },
  sekarang: Date = new Date()
): PiutangTransaksi => {
  const totalDibayar = jumlahkanPembayaran(transaksi.payments);
  const umurHari = umurHariWIB(transaksi.tanggal, sekarang);

  return {
    id: transaksi.id,
    trxNumber: transaksi.trxNumber,
    tanggal: transaksi.tanggal,
    totalHarga: transaksi.total_harga,
    totalDibayar,
    sisaTagihan: hitungSisaTagihan(transaksi.total_harga, totalDibayar),
    umurHari,
    kelompokUmur: kelompokkanUmur(umurHari),
  };
};

// Teks penagihan siap tempel ke WhatsApp.
export const susunTeksPenagihan = (
  namaPelanggan: string,
  daftar: PiutangTransaksi[],
  namaToko: string
): string => {
  const rupiah = (nilai: number) => `Rp${nilai.toLocaleString("id-ID")}`;
  const tanggalPendek = (tanggal: Date) =>
    tanggal.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "Asia/Jakarta",
    });

  const baris = daftar.map((item) => {
    const nomor = item.trxNumber ? `Nota #${item.trxNumber}` : `Nota ID ${item.id}`;
    return `• ${nomor} (${tanggalPendek(item.tanggal)}) — ${rupiah(item.sisaTagihan)}`;
  });

  const total = daftar.reduce((jumlah, item) => jumlah + item.sisaTagihan, 0);

  return [
    `Halo ${namaPelanggan}, berikut rincian tagihan yang belum lunas:`,
    "",
    ...baris,
    "",
    `Total: ${rupiah(total)}`,
    "",
    `Terima kasih 🙏 — ${namaToko}`,
  ].join("\n");
};
