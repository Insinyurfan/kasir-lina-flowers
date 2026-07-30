## ADDED Requirements

### Requirement: Pencatatan setoran

Sistem SHALL mencatat setoran barang jadi dari pengrajin terhadap sebuah penugasan. Setiap setoran MUST memuat tanggal, jumlah fisik yang diserahkan, dan nilai upahnya.

Nilai upah MUST dihitung sebagai `jumlah × tarif yang berlaku untuk pasangan pengrajin dan produk tersebut`, dan tarif itu MUST disimpan sebagai snapshot pada setoran.

Setiap setoran MUST mencatat dua pihak: **pekerja** (pengrajin yang mengerjakan) dan **penerima** (pengrajin yang saldonya bertambah). Penerima ditentukan dari penanda penerima upah pekerja — dirinya sendiri, atau ketua kelompoknya.

Total setoran sebuah penugasan MUST NOT melebihi jumlah yang ditugaskan.

Tanggal setoran MUST memakai kalender WIB.

#### Scenario: Setoran penuh

- **WHEN** seorang pengrajin menyetorkan seluruh 3 gross dari penugasan 3 gross bertarif Rp15.000
- **THEN** setoran tercatat bernilai Rp45.000, penugasan menjadi tuntas, dan hilang dari papan tugas

#### Scenario: Setoran sebagian

- **WHEN** dari penugasan 5 gross baru disetorkan 3 gross
- **THEN** setoran tercatat, sisa penugasan menjadi 2 gross, dan penugasan tetap tampil di papan tugas

#### Scenario: Setoran melebihi penugasan ditolak

- **WHEN** pengguna mencatat setoran 4 gross pada penugasan bersisa 2 gross
- **THEN** sistem menolak dan memberitahukan sisa yang sebenarnya

#### Scenario: Setoran menambah saldo pekerja sendiri

- **WHEN** setoran bernilai Rp45.000 tercatat untuk pengrajin berpenanda `SENDIRI` yang bersaldo Rp0
- **THEN** saldo upah pengrajin itu menjadi Rp45.000

#### Scenario: Setoran menambah saldo ketua kelompok

- **WHEN** "MAMA ARI" berpenanda `KETUA` menyetorkan barang bernilai Rp45.000, dan ketua kelompoknya "MAMA BUDI"
- **THEN** saldo Mama Budi bertambah Rp45.000, saldo Mama Ari tetap Rp0, dan setoran itu tetap tercatat sebagai hasil kerja Mama Ari

#### Scenario: Riwayat kerja tetap pada pekerjanya

- **WHEN** pengguna membuka riwayat "MAMA ARI" yang upahnya lewat ketua
- **THEN** seluruh setorannya tetap terlihat sebagai pekerjaannya, dengan keterangan bahwa upahnya masuk ke saldo Mama Budi

#### Scenario: Koreksi setoran salah catat

- **WHEN** sebuah setoran dihapus karena salah catat
- **THEN** saldo upah **penerima** berkurang sebesar nilai setoran itu, sisa penugasan bertambah kembali, dan penghapusan tercatat di log aktivitas

### Requirement: Saldo upah sebagai buku besar

Saldo upah seorang pengrajin SHALL dihitung sebagai `Σ nilai setoran yang penerimanya dia − Σ nominal penarikannya`. Saldo MUST NOT disimpan sebagai angka yang dapat disunting langsung, sehingga tidak bisa dimanipulasi tanpa jejak.

Pengrajin yang upahnya diteruskan ke ketua SHALL selalu bersaldo nol, dan antarmuka MUST menyatakan ke siapa upahnya masuk agar tidak disalahpahami sebagai belum dibayar.

#### Scenario: Saldo mengikuti setoran dan penarikan

- **WHEN** seorang pengrajin punya setoran total Rp3.000.000 dan penarikan total Rp1.500.000
- **THEN** saldonya Rp1.500.000

#### Scenario: Saldo ketua menggabungkan kerja anggotanya

- **WHEN** Mama Budi bekerja sendiri bernilai Rp500.000 dan menerima limpahan dua anggota masing-masing Rp300.000
- **THEN** saldo Mama Budi Rp1.100.000

#### Scenario: Saldo tidak dapat disunting langsung

- **WHEN** permintaan mencoba menetapkan nilai saldo secara langsung
- **THEN** sistem menolak permintaan tersebut

### Requirement: Penarikan upah penuh atau sebagian

Sistem SHALL memungkinkan penarikan upah penuh maupun sebagian. Nominal penarikan MUST lebih besar dari nol dan MUST NOT melebihi saldo yang tersedia.

Penarikan hanya dapat dilakukan oleh **penerima** saldo. Pengrajin yang upahnya diteruskan ke ketua MUST NOT dapat menarik sendiri.

Setiap penarikan MUST tercatat dengan tanggal dan pencatatnya, dan MUST muncul di riwayat pengrajin bersangkutan.

#### Scenario: Menarik sebagian saldo

- **WHEN** seorang pengrajin bersaldo Rp3.000.000 menarik Rp1.500.000
- **THEN** penarikan tercatat dan sisa saldonya menjadi Rp1.500.000

#### Scenario: Penarikan melebihi saldo ditolak

- **WHEN** pengguna mencatat penarikan Rp4.000.000 atas saldo Rp3.000.000
- **THEN** sistem menolak dan memberitahukan saldo yang tersedia

#### Scenario: Anggota berpenanda KETUA tidak dapat menarik sendiri

- **WHEN** pengguna mencoba mencatat penarikan atas nama pengrajin yang upahnya diteruskan ke ketua
- **THEN** sistem menolak dan mengarahkan penarikan ke ketua kelompoknya

#### Scenario: Riwayat lengkap per pengrajin

- **WHEN** pengguna membuka halaman seorang pengrajin
- **THEN** sistem menampilkan seluruh setoran dan penarikannya berurutan waktu, beserta saldo berjalannya

### Requirement: Penarikan upah tercatat sebagai biaya usaha

Setiap penarikan upah MUST menghasilkan satu pengeluaran berkategori `Upah Pengrajin`, bertanggal sama dengan tanggal penarikan, agar laporan Laba Rugi tidak lagi melebih-lebihkan laba.

Menghapus penarikan MUST ikut menghapus pengeluaran yang tertaut, sehingga kedua laporan tidak pernah berbeda.

Setoran itu sendiri MUST NOT menghasilkan pengeluaran — biaya baru diakui saat uang benar-benar keluar.

#### Scenario: Penarikan muncul di Laba Rugi

- **WHEN** penarikan upah Rp1.500.000 dicatat pada 5 Agustus 2026
- **THEN** halaman Pengeluaran menampilkan satu baris `Upah Pengrajin` Rp1.500.000 bertanggal 5 Agustus 2026, dan laba usaha bulan itu berkurang Rp1.500.000

#### Scenario: Setoran belum menjadi biaya

- **WHEN** setoran bernilai Rp45.000 tercatat tetapi belum ditarik
- **THEN** tidak ada pengeluaran yang terbentuk, dan laba usaha belum terpengaruh

#### Scenario: Menghapus penarikan menghapus biayanya

- **WHEN** sebuah penarikan dihapus
- **THEN** pengeluaran `Upah Pengrajin` yang tertaut ikut terhapus dan saldo pengrajin kembali seperti sebelumnya

### Requirement: Otorisasi setoran dan upah

Endpoint setoran dan penarikan MUST menurunkan identitas pemanggil dari sesi terverifikasi. Mencatat setoran dan penarikan SHALL dibatasi untuk peran Owner dan Admin; melihat rekap saldo seluruh pengrajin SHALL dibatasi untuk peran Owner.

#### Scenario: Permintaan tanpa sesi ditolak

- **WHEN** permintaan pencatatan penarikan datang tanpa sesi yang sah
- **THEN** sistem menolak dengan status 401 dan tidak mengubah data apa pun

#### Scenario: Identitas dari body diabaikan

- **WHEN** pengguna yang login mencatat setoran sambil mengirimkan identitas pengguna lain di body permintaan
- **THEN** sistem mengabaikan identitas di body dan mencatat pemilik sesi sebagai pencatat
