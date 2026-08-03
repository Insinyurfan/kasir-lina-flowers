## Context

Aplikasi punya `app/manifest.ts` (bisa dipasang di layar HP) tetapi **tanpa service worker sama sekali**. Draf `offline-pos` sempat menyebut "aplikasi sudah PWA" — itu hanya benar sebatas ikon; tidak ada satu pun kemampuan luring.

Pemicunya kejadian 3 Agustus 2026: Supabase memblokir Storage karena kuota egress siklus Juli terlampaui, dan seluruh gambar produk lenyap dari semua perangkat sekaligus — termasuk yang baru saja membukanya.

Kendala yang membentuk desain:

- **Pemakainya dua orang**: pemilik repo dan adiknya. Orang tua tidak memakai aplikasinya. Ini menurunkan risiko "perangkat terkunci di versi rusak" secara drastis — keduanya bisa membersihkan data situs sendiri.
- **Agustus adalah bulan tersibuk** dan aplikasi ini menjalankan operasional. Perubahan yang menyentuh uang ditunda.
- Yang wajib dipakai ulang: `lib/toast.ts` untuk pemberitahuan versi baru, mengikuti pola yang sudah ada.

## Goals / Non-Goals

**Goals:**

- Gambar yang sudah pernah dimuat tetap tampil walau penyedia penyimpanannya bermasalah.
- Aplikasi tetap bisa dibuka saat jaringan mati.
- Pembaruan tidak pernah mengambil alih diam-diam.
- Tidak menambah satu pun dependensi.

**Non-Goals:**

- Antrean transaksi luring, sinkronisasi, idempotensi, rekonsiliasi stok → tetap milik `offline-pos`.
- Data bisnis luring. Halaman terbuka, isinya kosong. Itu disengaja.
- Menyembunyikan keadaan luring dari pengguna.

## Decisions

### 1. Service worker ditulis tangan, tanpa pustaka PWA

`public/sw.js` sekitar seratus baris, dibaca sekali langsung paham.

*Alasan:* `next-pwa` dan sejenisnya menambah lapisan build yang menghasilkan service worker. Saat ada yang salah — dan pada service worker, "salah" berarti menetap di perangkat orang — lapisan itu justru menghalangi penelusuran. Cakupannya kecil, jadi ongkos menulis sendiri jauh lebih murah daripada ongkos men-debug hasil generator.

*Trade-off:* tidak dapat pembaruan otomatis kalau pustaka itu memperbaiki bug. Diterima, karena permukaannya memang sempit.

### 2. Strategi cache berbeda per jenis permintaan

| Jenis | Strategi | Alasan |
|---|---|---|
| `/_next/static/**` | Cache dulu, permanen | Nama sudah ber-hash — mustahil basi |
| Gambar (`/_next/image*`, Supabase publik) | Cache dulu, segarkan di latar | Tampil seketika, dan **bertahan saat sumbernya mati** |
| Navigasi halaman | Jaringan dulu, cache bila gagal | Selalu segar saat daring, tetap terbuka saat luring |
| `/api/**` | **Tidak pernah di-cache** | Lihat keputusan 3 |

### 3. Data bisnis TIDAK PERNAH di-cache

Seluruh `/api/**` dilewatkan begitu saja ke jaringan.

*Alasan:* ini aplikasi yang memegang harga, stok, piutang, dan saldo upah orang. Menyajikan angka basi dari cache jauh lebih berbahaya daripada gagal terang-terangan — kasir bisa menagih dengan harga lama, atau melihat stok yang sudah habis. Kegagalan yang kelihatan bisa ditangani manusia; angka yang salah tapi tampak wajar tidak.

*Konsekuensi yang disengaja:* saat luring, halaman terbuka tapi kosong. Itu jujur, dan tidak menyesatkan.

### 4. Pembaruan menunggu persetujuan, bukan `skipWaiting` otomatis

Service worker baru masuk keadaan menunggu; aplikasi menampilkan toast "Versi baru tersedia — muat ulang", dan barulah `skipWaiting` dikirim.

*Alasan:* `skipWaiting()` otomatis menukar aset di tengah sesi yang sedang berjalan. Halaman yang sudah dimuat bisa meminta potongan JavaScript yang sudah tidak ada lagi, lalu gagal dengan galat yang membingungkan — tepat saat orang sedang membuat nota.

*Alternatif yang ditolak:* mengambil alih diam-diam saat semua tab ditutup (perilaku bawaan). PWA yang dipasang di layar HP nyaris tidak pernah benar-benar ditutup, sehingga perangkat bisa berminggu-minggu tertinggal versi — persis pertanyaan yang diajukan pemilik.

### 5. `/sw.js` disajikan dengan `Cache-Control: no-cache`

*Alasan:* ini penjagaan paling penting di seluruh change ini. Kalau berkas service worker sendiri ikut ter-cache, perangkat tidak akan pernah tahu ada versi baru — terkunci selamanya, dan tidak ada rilis yang bisa menyelamatkannya dari jarak jauh.

### 6. Hanya didaftarkan di produksi

*Alasan:* pada pengembangan, service worker membuat perubahan kode tampak tidak berpengaruh. Repo ini sudah punya jebakan serupa (cache Turbopack menahan CSS), dan menambah satu lapisan lagi hanya akan memperpanjang waktu penelusuran.

## Risks / Trade-offs

**Service worker menetap di perangkat pengguna.** Ini risiko yang tidak bisa dihilangkan, hanya dikecilkan.
→ Tiga lapis penjagaan: `/sw.js` tidak pernah di-cache, nama cache berversi dengan pembersihan otomatis, dan pembaruan yang menunggu persetujuan. Jalan keluar manual (hapus data situs / pasang ulang PWA) didokumentasikan di tasks.

**HTML lama di cache bisa merujuk potongan JavaScript yang sudah terhapus** setelah beberapa kali deploy.
→ Navigasi memakai jaringan lebih dulu, jadi pengguna daring selalu dapat HTML segar. Cache hanya dipakai saat jaringan benar-benar gagal, dan saat itu memang lebih baik menampilkan sesuatu daripada layar kosong.

**Gambar bisa tampil basi** kalau foto produk diganti.
→ Disegarkan di latar setiap kali diakses saat daring, jadi paling lama tertinggal satu kali tampil.

**Cache bisa dibuang peramban** saat penyimpanan HP menipis.
→ Tidak bisa dicegah, dan tidak apa-apa: ini peredam, bukan jaminan. Perangkat akan mengambil ulang saat daring.

## Migration Plan

Tidak ada perubahan basis data maupun API. Penerapannya cukup deploy biasa.

Kunjungan pertama setelah deploy memasang service worker tetapi belum memakainya — barulah kunjungan berikutnya menikmati cache. Ini perilaku bawaan peramban, bukan kesalahan.

**Rollback:** hapus `public/sw.js` dan pendaftarannya, lalu deploy. Perangkat yang sudah terlanjur memasang perlu dibersihkan manual (hapus data situs) — inilah sebabnya jalan keluar itu didokumentasikan sejak awal, bukan dipikirkan belakangan.

## Open Questions

1. **Apakah katalog publik perlu ikut di-cache?** Sekarang ikut, karena aturannya berlaku untuk semua navigasi. Kalau ternyata pelanggan melihat katalog basi setelah produk diubah, navigasi untuk halaman publik bisa dikecualikan.
2. **Berapa lama gambar layak disimpan?** Sekarang tidak ada batas waktu — hanya dibersihkan saat versi service worker berganti. Kalau penyimpanan HP jadi masalah, bisa ditambahkan batas jumlah berkas.
