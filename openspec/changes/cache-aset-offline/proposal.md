## Why

Aplikasi ini punya `app/manifest.ts` sehingga bisa dipasang di layar HP, tetapi **tidak punya service worker sama sekali** — tidak ada `sw.js`, tidak ada `workbox`/`next-pwa`/`serwist`. Jadi "PWA"-nya baru sebatas ikon: begitu jaringan putus, layarnya kosong.

Kejadian 3 Agustus 2026 memperlihatkan kerugian nyatanya. Supabase memblokir Storage (`402 exceed_egress_quota`), dan **seluruh gambar produk langsung hilang dari semua perangkat** — termasuk perangkat yang sudah berkali-kali membuka katalog beberapa menit sebelumnya. Kalau gambarnya tersimpan di cache perangkat, pemadaman itu tidak akan terasa sama sekali bagi yang sudah pernah membukanya.

Menyimpan aset di perangkat juga memangkas permintaan berulang ke server — masalah yang sama yang sedang ditangani lewat perbaikan polling dan `next/image`.

## What Changes

- **Service worker ditulis tangan** di `public/sw.js`. Tanpa pustaka PWA: cakupannya kecil, dan pustaka semacam `next-pwa` menambah lapisan build yang justru menyulitkan saat ada yang salah.
- **Aset statis Next.js** (`/_next/static/**`) di-cache permanen — namanya sudah ber-hash, jadi tidak mungkin basi.
- **Gambar produk** (`/_next/image*` dan URL publik Supabase Storage) di-cache; disajikan dari cache lebih dulu, lalu disegarkan di latar. Inilah yang membuat pemadaman seperti 3 Agustus tidak menghilangkan gambar.
- **Navigasi halaman** memakai jaringan lebih dulu, jatuh ke cache bila gagal — sehingga aplikasi tetap **bisa dibuka** saat jaringan mati.
- **Permintaan API TIDAK PERNAH di-cache.** Harga, stok, pesanan, dan piutang harus selalu dari server; menyajikan versi basi lebih berbahaya daripada gagal terang-terangan.
- **Kendali pembaruan**: versi baru tidak mengambil alih diam-diam. Muncul pemberitahuan **"Versi baru tersedia — muat ulang"**, dan penggantiannya menunggu persetujuan pengguna.
- Service worker hanya didaftarkan di **produksi**, supaya tidak mengacaukan pengembangan.

## Non-Goals

- **Antrean transaksi offline.** Membuat transaksi saat jaringan mati, sinkronisasi, idempotensi, dan rekonsiliasi stok tetap menjadi cakupan `offline-pos` — di sana ada risiko transaksi ganda dan stok kacau, dan itu menyentuh uang.
- **Data offline.** Halaman tetap terbuka tanpa jaringan, tetapi isinya akan kosong karena API-nya tidak di-cache. Itu disengaja.

## Capabilities

### New Capabilities

- `asset-caching`: Aset statis dan gambar produk disimpan di perangkat sehingga tetap tampil saat jaringan atau penyedia penyimpanan sedang bermasalah, tanpa pernah menyajikan data bisnis yang basi.
- `update-control`: Pembaruan aplikasi tidak pernah mengambil alih diam-diam; pengguna diberi tahu dan memutuskan sendiri kapan memuat ulang.

## Impact

- **Berkas baru**: `public/sw.js` (service worker) dan `components/PendaftarServiceWorker.tsx` (pendaftaran + pemberitahuan versi baru).
- **`app/layout.tsx`**: memasang komponen pendaftar tersebut sekali di root.
- **`next.config.ts`**: header `Cache-Control: no-cache` untuk `/sw.js`, supaya peramban selalu dapat melihat ada versi baru. Ini penjagaan terpenting agar perangkat tidak pernah terkunci di versi lama.
- **Tidak ada perubahan basis data, API, atau tampilan halaman.**
- **Risiko yang disadari**: service worker menetap di perangkat pengguna. Kalau salah, ia bisa menyajikan versi lama walau server sudah diperbaiki. Karena itu ada kendali pembaruan, nama cache berversi, dan jalan keluar manual yang didokumentasikan. Pemakainya saat ini hanya pemilik repo dan adiknya — keduanya dapat membersihkan data situs sendiri bila perlu.
