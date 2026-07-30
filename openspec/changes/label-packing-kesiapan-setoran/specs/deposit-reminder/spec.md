## ADDED Requirements

### Requirement: Daftar tagih setoran

Papan Tugas SHALL menyediakan daftar pekerjaan yang tenggatnya **hari ini atau sudah lewat** dan belum tuntas disetor, dikelompokkan per pengrajin.

Setiap baris MUST menyebut produk, toko tujuan, jumlah sisa, dan berapa hari keterlambatannya. Batas hari MUST dihitung memakai kalender WIB.

Pengrajin yang paling terlambat MUST muncul lebih dulu.

#### Scenario: Ada yang harus ditagih hari ini

- **WHEN** seorang pengrajin punya pekerjaan bertenggat hari ini yang belum disetor
- **THEN** pekerjaan itu muncul di daftar tagih setoran beserta jumlah sisanya

#### Scenario: Yang terlambat naik ke atas

- **WHEN** seorang pengrajin punya pekerjaan terlambat 3 hari dan yang lain baru jatuh tempo hari ini
- **THEN** yang terlambat 3 hari tampil lebih dulu

#### Scenario: Belum jatuh tempo tidak ikut

- **WHEN** sebuah pekerjaan bertenggat dua hari lagi
- **THEN** pekerjaan itu tidak muncul di daftar tagih, tetapi tetap tampil di papan tugas seperti biasa

#### Scenario: Tidak ada yang perlu ditagih

- **WHEN** seluruh pekerjaan belum jatuh tempo atau sudah disetor
- **THEN** sistem menyatakan tidak ada yang perlu ditagih hari ini

### Requirement: Teks tagihan siap kirim

Sistem SHALL menyediakan tombol untuk menyalin teks tagihan seorang pengrajin ke papan klip, berisi sapaan, daftar pekerjaan yang ditunggu beserta jumlah dan toko tujuannya, mengikuti pola yang sudah dipakai teks penagihan di halaman Piutang.

#### Scenario: Menyalin teks tagihan

- **WHEN** pengguna menekan tombol salin pada seorang pengrajin di daftar tagih
- **THEN** teks tagihan tersalin ke papan klip dan sistem memberi notifikasi bahwa teks sudah disalin
