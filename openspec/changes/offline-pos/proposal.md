> **DIPERSEMPIT — 22 Agustus 2026.** Bagian service worker & cache aset sudah
> dikerjakan lewat `cache-aset-offline` (`public/sw.js` sudah ada), dan change
> itu memang menyatakan di Non-Goals-nya bahwa antrean transaksi offline tetap
> milik change ini. Yang tersisa di sini adalah intinya, dan sampai sekarang
> utuh belum tersentuh: pencarian `indexedDB` / `background-sync` di seluruh
> `app`, `lib`, `components`, dan `public` tidak menemukan apa pun.

## Why

Aplikasi kini **bisa dibuka** tanpa jaringan — halaman dan gambar tersaji dari
cache. Tetapi isinya kosong dan tidak ada yang bisa dikerjakan, karena permintaan
API sengaja tidak pernah di-cache. Untuk aplikasi kasir, "bisa dibuka" bukan
tujuan akhirnya: yang dibutuhkan adalah **transaksi tetap bisa dibuat** saat
jaringan mati, lalu tersinkron sendiri saat sinyal kembali.

Ini bagian yang menyentuh uang, dan itulah alasannya dipisahkan sejak awal.
Sinkron ulang yang tidak idempoten akan menggandakan transaksi; stok yang
dipotong dari dua perangkat offline akan bertabrakan. Satu kesalahan di sini
lebih merugikan daripada tidak punya fitur ini sama sekali.

## What Changes

- **Antrean transaksi offline**: saat jaringan mati, transaksi POS disimpan di
  IndexedDB dan ditandai "belum tersinkron".
- **Sinkron otomatis** saat online kembali: antrean dikirim berurutan, konflik
  nomor transaksi & stok ditangani eksplisit.
- **Idempotensi server**: `clientTxnId` unik per transaksi; pengiriman ulang
  tidak pernah menghasilkan transaksi kedua.
- **Indikator status jaringan** dan jumlah transaksi tertunda di UI POS.
- **Batasan** ditegaskan: laporan dan cetak dokumen server tetap wajib online,
  dengan pesan yang jelas — bukan gagal diam-diam.

## Non-Goals

- **Service worker & cache aset.** Selesai di `cache-aset-offline`. Change ini
  menumpang service worker yang sudah ada, tidak menulis ulang strategi cache-nya.
- **Cache data API untuk dibaca offline.** Menyajikan harga, stok, atau piutang
  yang basi lebih berbahaya daripada gagal terang-terangan — keputusan itu sudah
  diambil di `cache-aset-offline` dan tetap berlaku. Pengecualiannya hanya
  katalog produk seperlunya, sebatas yang dibutuhkan untuk menyusun keranjang.

## Capabilities

### New Capabilities
- `offline-resilience`: POS dapat membuat transaksi saat offline dan
  menyinkronkannya secara otomatis tanpa duplikat saat koneksi kembali.

## Impact

- **Klien**: IndexedDB untuk antrean transaksi + katalog produk seperlunya;
  deteksi online/offline; UI indikator + coba-ulang.
- **Server**: endpoint transaksi menerima `clientTxnId` dan menolak duplikat;
  penomoran transaksi & pemotongan stok dievaluasi saat sinkron, bukan saat
  transaksi dibuat di perangkat.
- **Risiko**: stok bertabrakan bila beberapa perangkat offline lalu sinkron
  bersamaan; butuh strategi rekonsiliasi yang diputuskan di design.
- **Urutan**: sebaiknya setelah `harden-api-auth` tuntas, karena jalur sinkron
  menambah endpoint tulis baru.
