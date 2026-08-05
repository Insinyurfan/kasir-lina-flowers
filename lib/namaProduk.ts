// Nama produk selalu HURUF BESAR semua supaya konsisten di katalog, nota, dan
// pencarian — kasir tidak perlu repot menekan Caps Lock saat mengetik.
// Modul murni tanpa dependensi agar bisa dipakai di server (API) maupun client (form).

export function normalisasiNamaProduk(nama: unknown): string {
  return String(nama ?? "").toUpperCase().trim();
}
