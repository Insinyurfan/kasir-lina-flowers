// Konversi satuan harga (pcs / lusin / gross).
// Modul murni tanpa dependensi agar bisa dipakai di server (API) maupun client (store/komponen).

export const PCS_PER_UNIT: Record<string, number> = { pcs: 1, lusin: 12, setengah_gross: 72, gross: 144 };
export const SATUAN_LABELS: Record<string, string> = { pcs: "Pcs", lusin: "Lusin", setengah_gross: "½ Gross", gross: "Gross" };

// Format "jumlah + satuan" untuk ditampilkan di nota/struk/surat jalan.
// Untuk satuan pecahan (mis. "½ Gross"): jumlah 1 cukup ditulis "½ Gross"
// (tanpa angka 1, agar tidak terbaca 1,5 gross); jumlah >1 pakai pemisah "×"
// (mis. "2 × ½ Gross") supaya tetap jelas.
export function formatQtySatuan(jumlah: number | string, satuanHarga?: string | null): string {
  const key = satuanHarga || "pcs";
  const label = SATUAN_LABELS[key] ?? "Pcs";
  const isFraction = /[½¼¾]/.test(label);
  if (!isFraction) return `${jumlah} ${label}`;
  return Number(jumlah) === 1 ? label : `${jumlah} × ${label}`;
}

// Harga per unit untuk TAMPILAN dokumen. Item ½ gross ditampilkan sebagai harga
// per Gross PENUH (permintaan pelanggan: patokan harga tetap /Gross; subtotal
// yang mencerminkan setengahnya). Contoh: subtotal 250rb utk ½ gross →
// tampil "Rp 500.000/Gross", subtotal tetap 250rb (½ × 500rb).
export function formatUnitPriceSatuan(unitPrice: number, satuanHarga?: string | null): { value: number; label: string } {
  const key = satuanHarga || "pcs";
  if (key === "setengah_gross") return { value: Math.round(unitPrice * 2), label: SATUAN_LABELS.gross };
  return { value: Math.round(unitPrice), label: SATUAN_LABELS[key] ?? "Pcs" };
}

// Hitung harga untuk satuan pesan tertentu dari harga dasar (yang berbasis satuanHarga produk).
// Contoh: hargaBase 280.000 /gross → satuanPesan "lusin" = 280.000 × 12 ÷ 144 = 23.333.
export function hitungHargaSatuan(hargaBase: number, satuanHarga: string, satuanPesan: string): number {
  const perHarga = PCS_PER_UNIT[satuanHarga] ?? 1;
  const perPesan = PCS_PER_UNIT[satuanPesan] ?? 1;
  return Math.round((hargaBase * perPesan) / perHarga);
}

// Id baris keranjang: unik per produk + varian + SATUAN PESAN + KODE PELANGGAN (label).
// Berbasis teks agar kode pelanggan (mis. Aneka: AMN/SMT) bisa ikut membedakan baris —
// produk+ukuran yang sama untuk kode berbeda menjadi BARIS TERPISAH.
export function computeCartRowId(
  productId: number,
  variantId?: number | null,
  satuanPesan?: string | null,
  label?: string | null,
): string {
  const v = variantId ? Number(variantId) : 0;
  const s = satuanPesan ?? "pcs";
  const l = (label ?? "").trim().toUpperCase();
  return `${productId}:${v}:${s}:${l}`;
}
