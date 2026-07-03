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

// Kode angka satuan untuk id baris keranjang (0 = satuan tak dikenal).
const SATUAN_CODE: Record<string, number> = { pcs: 1, lusin: 2, setengah_gross: 3, gross: 4 };

// Id baris keranjang: unik per produk + varian + SATUAN PESAN.
// Satuan ikut dikodekan supaya "1 Gross" dan "1/2 Gross" untuk varian yang sama
// menjadi BARIS TERPISAH di keranjang (tidak saling menimpa saat produk diklik lagi).
export function computeCartRowId(productId: number, variantId?: number | null, satuanPesan?: string | null): number {
  const baseId = variantId ? productId * 1000000 + variantId : productId;
  return baseId * 10 + (SATUAN_CODE[satuanPesan ?? ""] ?? 0);
}
