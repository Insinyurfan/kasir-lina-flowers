## ADDED Requirements

### Requirement: Pembaruan tidak pernah mengambil alih diam-diam

Service worker versi baru MUST menunggu persetujuan sebelum menggantikan versi yang sedang berjalan.

Sistem SHALL memberi tahu pengguna bahwa versi baru tersedia, beserta cara memuat ulang.

#### Scenario: Versi baru terdeteksi

- **WHEN** aplikasi mendeteksi service worker versi baru sudah terpasang dan menunggu
- **THEN** muncul pemberitahuan bahwa versi baru tersedia, dengan tombol untuk memuat ulang

#### Scenario: Pengguna menunda

- **WHEN** pengguna mengabaikan pemberitahuan itu
- **THEN** aplikasi tetap berjalan pada versi lama tanpa terganggu, dan pemberitahuannya muncul lagi pada kunjungan berikutnya

#### Scenario: Pengguna memuat ulang

- **WHEN** pengguna menekan tombol muat ulang
- **THEN** service worker baru mengambil alih dan halaman dimuat ulang pada versi terbaru

### Requirement: Berkas service worker tidak boleh di-cache

Berkas `/sw.js` MUST disajikan dengan header yang melarang penyimpanan cache.

Ini penjagaan terpenting: bila berkas itu ikut ter-cache, perangkat bisa terkunci selamanya pada versi lama dan tidak pernah tahu ada perbaikan.

#### Scenario: Peramban memeriksa versi baru

- **WHEN** peramban memuat aplikasi
- **THEN** `/sw.js` selalu diambil dari server, bukan dari cache

### Requirement: Hanya aktif di produksi

Service worker SHALL didaftarkan hanya pada lingkungan produksi.

Pada pengembangan lokal, service worker membuat perubahan kode tampak tidak berpengaruh dan menyulitkan penelusuran masalah.

#### Scenario: Menjalankan `npm run dev`

- **WHEN** aplikasi dijalankan di lingkungan pengembangan
- **THEN** tidak ada service worker yang didaftarkan

### Requirement: Jalan keluar bila perangkat tersangkut

Bila service worker tetap menyajikan versi lama, pengguna MUST dapat memulihkannya secara mandiri tanpa menunggu rilis baru.

Langkahnya SHALL terdokumentasi: menghapus data situs lewat pengaturan peramban, atau memasang ulang aplikasi bila dipasang sebagai PWA.

#### Scenario: Perangkat tersangkut di versi lama

- **WHEN** pengguna menghapus data situs lewat pengaturan peramban
- **THEN** service worker beserta seluruh cache-nya terhapus, dan kunjungan berikutnya memasang versi terbaru
