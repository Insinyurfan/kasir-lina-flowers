## ADDED Requirements

### Requirement: Aset statis disimpan di perangkat

Service worker SHALL menyimpan aset statis Next.js (`/_next/static/**`) di cache perangkat dan menyajikannya dari cache lebih dulu.

Aset tersebut MUST diperlakukan sebagai tidak pernah basi, karena namanya sudah mengandung hash isi — berkas berbeda selalu bernama berbeda.

#### Scenario: Aset tersaji dari cache

- **WHEN** pengguna membuka halaman untuk kedua kalinya
- **THEN** berkas JavaScript dan CSS disajikan dari cache perangkat tanpa permintaan ke server

#### Scenario: Aset baru setelah deploy

- **WHEN** aplikasi di-deploy ulang sehingga nama berkasnya berubah
- **THEN** berkas baru itu diambil dari jaringan lalu ikut disimpan

### Requirement: Gambar produk bertahan saat sumbernya bermasalah

Service worker SHALL menyimpan gambar produk — baik yang melalui pengoptimal Next (`/_next/image*`) maupun URL publik Supabase Storage — dan menyajikannya dari cache lebih dulu, lalu menyegarkannya di latar belakang.

Gambar yang sudah tersimpan MUST tetap tampil walau server asalnya membalas galat.

#### Scenario: Penyedia penyimpanan diblokir

- **WHEN** Supabase Storage membalas `402` untuk seluruh gambar
- **THEN** perangkat yang sudah pernah memuat gambar itu tetap menampilkannya dari cache

#### Scenario: Gambar belum pernah dimuat

- **WHEN** perangkat membuka produk yang gambarnya belum pernah dimuat, sementara sumbernya sedang bermasalah
- **THEN** gambar itu tidak tampil — cache hanya menolong yang sudah pernah diambil

#### Scenario: Gambar diperbarui di server

- **WHEN** gambar produk diganti dan pengguna membuka halaman saat daring
- **THEN** versi lama tetap tampil seketika, dan versi barunya diambil di latar untuk tampilan berikutnya

### Requirement: Halaman tetap dapat dibuka tanpa jaringan

Permintaan navigasi SHALL memakai jaringan lebih dulu, dan jatuh ke salinan cache bila jaringan gagal.

#### Scenario: Membuka aplikasi saat jaringan mati

- **WHEN** pengguna membuka halaman yang pernah dikunjungi sementara jaringan mati
- **THEN** kerangka halaman tetap tampil dari cache

#### Scenario: Isi halaman tetap kosong

- **WHEN** halaman terbuka dari cache tanpa jaringan
- **THEN** datanya kosong karena permintaan API tidak pernah di-cache — ini perilaku yang disengaja, bukan galat

### Requirement: Data bisnis tidak pernah disajikan dari cache

Service worker MUST NOT menyimpan maupun menyajikan respons dari jalur API (`/api/**`).

Harga, stok, pesanan, piutang, dan saldo upah harus selalu berasal dari server. Menyajikan angka basi lebih berbahaya daripada gagal terang-terangan.

#### Scenario: Permintaan API saat jaringan mati

- **WHEN** halaman meminta data ke `/api/...` sementara jaringan mati
- **THEN** permintaan itu gagal seperti biasa, dan tidak ada respons lama yang disajikan

#### Scenario: Harga berubah di server

- **WHEN** harga produk diubah lalu halaman dibuka kembali
- **THEN** harga yang tampil selalu yang terbaru dari server

### Requirement: Cache dibersihkan saat versi berganti

Nama cache MUST mengandung penanda versi. Saat service worker versi baru aktif, seluruh cache milik versi lama MUST dihapus.

#### Scenario: Versi baru aktif

- **WHEN** service worker versi baru mengambil alih
- **THEN** cache milik versi sebelumnya dihapus sehingga penyimpanan tidak menumpuk
