// Penyaluran alamat gambar supaya peramban tidak pernah menyentuh host R2.
//
// KENAPA ADA: 5 Agustus 2026, seluruh foto produk gagal dimuat dengan
// `net::ERR_CERT_AUTHORITY_INVALID`. Ada penyaringan di tingkat jaringan yang
// menyadap HTTPS ke `*.r2.dev` dan menyodorkan sertifikat tak tepercaya —
// `r2.dev` kerap masuk daftar blokir karena banyak dipakai menumpang berkas
// sembarangan. Server Vercel bisa mengambilnya tanpa hambatan; yang tersandung
// hanya peramban di jaringan yang menyaring.
//
// Karena itu alamat gambar dialihkan ke `/gambar?url=…` pada domain sendiri.
// Yang mengambil dari Cloudflare menjadi Vercel, dan peramban cukup berbicara
// dengan `linaflowers.my.id` — yang jelas tidak diblokir, karena situsnya
// sendiri terbuka.
//
// Ini bukan sekadar menambal masalah sendiri: pelanggan yang ISP-nya ikut
// memblokir `r2.dev` juga tidak akan melihat foto di katalog publik.

/** Hanya URL R2 yang perlu diantar. Sisanya dibiarkan apa adanya. */
const PERLU_PERANTARA = /^https:\/\/[^/]*\.r2\.dev\//i;

/**
 * Ubah alamat gambar tersimpan menjadi alamat yang aman dimuat peramban.
 *
 * Aman dipanggil untuk apa pun: `data:` (logo & pratinjau base64), path
 * relatif, dan URL Supabase lama semuanya dikembalikan tanpa perubahan.
 */
export const urlGambar = (sumber?: string | null): string => {
  if (!sumber) return "";
  if (!PERLU_PERANTARA.test(sumber)) return sumber;
  return `/gambar?url=${encodeURIComponent(sumber)}`;
};
