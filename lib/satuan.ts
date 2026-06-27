// Konversi satuan harga (pcs / lusin / gross).
// Modul murni tanpa dependensi agar bisa dipakai di server (API) maupun client (store/komponen).

export const PCS_PER_UNIT: Record<string, number> = { pcs: 1, lusin: 12, setengah_gross: 72, gross: 144 };
export const SATUAN_LABELS: Record<string, string> = { pcs: "Pcs", lusin: "Lusin", setengah_gross: "½ Gross", gross: "Gross" };

// Hitung harga untuk satuan pesan tertentu dari harga dasar (yang berbasis satuanHarga produk).
// Contoh: hargaBase 280.000 /gross → satuanPesan "lusin" = 280.000 × 12 ÷ 144 = 23.333.
export function hitungHargaSatuan(hargaBase: number, satuanHarga: string, satuanPesan: string): number {
  const perHarga = PCS_PER_UNIT[satuanHarga] ?? 1;
  const perPesan = PCS_PER_UNIT[satuanPesan] ?? 1;
  return Math.round((hargaBase * perPesan) / perHarga);
}
