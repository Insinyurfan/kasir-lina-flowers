## ADDED Requirements

### Requirement: Master pengrajin

Sistem SHALL menyimpan daftar pengrajin berisi nama, kelompok (opsional), tarif upah per unit, dan penanda aktif. Nama pengrajin MUST unik agar penugasan tidak pernah ambigu.

Pengrajin yang berhenti bekerja SHALL dapat ditandai tidak aktif alih-alih dihapus, sehingga riwayat setoran dan upahnya tetap utuh.

#### Scenario: Menambah pengrajin baru

- **WHEN** pengguna menyimpan pengrajin bernama "MAMA URI" dengan tarif Rp15.000 per gross
- **THEN** pengrajin tersebut muncul di daftar dan dapat dipilih saat menugaskan pekerjaan

#### Scenario: Nama ganda ditolak

- **WHEN** pengguna menyimpan pengrajin dengan nama yang sudah ada
- **THEN** sistem menolak penyimpanan dan memberitahu bahwa nama tersebut sudah terdaftar

#### Scenario: Menonaktifkan pengrajin

- **WHEN** seorang pengrajin ditandai tidak aktif
- **THEN** ia tidak lagi muncul sebagai pilihan penugasan baru, tetapi riwayat setoran, saldo, dan penarikannya tetap dapat dilihat

#### Scenario: Pengrajin bersaldo tidak dapat dihapus

- **WHEN** pengguna mencoba menghapus pengrajin yang masih punya saldo upah atau riwayat setoran
- **THEN** sistem menolak penghapusan dan menyarankan menonaktifkannya

### Requirement: Kelompok pengrajin

Sistem SHALL mendukung pengelompokan pengrajin di bawah seorang ketua (mis. Ketua Mama Budi → Mama Uri, Mama Ari). Kelompok bersifat OPTIONAL — pengrajin tanpa kelompok tetap sah.

#### Scenario: Mengelompokkan pengrajin

- **WHEN** pengguna menempatkan "MAMA URI" dan "MAMA ARI" ke kelompok berketua "MAMA BUDI"
- **THEN** papan tugas dapat menampilkan pekerjaan mereka dikelompokkan di bawah ketua tersebut

#### Scenario: Pengrajin tanpa kelompok

- **WHEN** pengguna menyimpan pengrajin tanpa memilih kelompok
- **THEN** pengrajin tetap tersimpan dan muncul dalam kelompok "Tanpa Kelompok" di papan tugas

### Requirement: Tarif upah per unit

Setiap pengrajin SHALL memiliki tarif upah per unit yang dipakai untuk menghitung nilai setoran. Tarif MUST bilangan bulat rupiah lebih besar dari nol.

Nilai tarif MUST disimpan sebagai snapshot pada setiap setoran, sehingga perubahan tarif di kemudian hari TIDAK mengubah nilai setoran yang sudah tercatat.

#### Scenario: Perubahan tarif tidak mengubah riwayat

- **WHEN** seorang pengrajin punya setoran lama bertarif Rp15.000 lalu tarifnya diubah menjadi Rp17.000
- **THEN** nilai setoran lama tetap dihitung dengan Rp15.000, dan hanya setoran berikutnya memakai Rp17.000

#### Scenario: Tarif tidak sah ditolak

- **WHEN** pengguna menyimpan pengrajin dengan tarif 0 atau negatif
- **THEN** sistem menolak penyimpanan dan meminta tarif yang lebih besar dari nol

### Requirement: Otorisasi master pengrajin

Endpoint pengrajin dan kelompok MUST menurunkan identitas pemanggil dari sesi terverifikasi. Menulis SHALL dibatasi untuk peran Owner dan Admin; membaca SHALL mewajibkan login.

#### Scenario: Permintaan tanpa sesi ditolak

- **WHEN** permintaan ke endpoint pengrajin datang tanpa sesi yang sah
- **THEN** sistem menolak dengan status 401 dan tidak mengubah data apa pun
