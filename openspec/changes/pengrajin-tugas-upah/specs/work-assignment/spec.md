## ADDED Requirements

### Requirement: Penugasan per baris barang

Sistem SHALL memungkinkan penugasan pekerjaan pada tingkat **baris barang pesanan**, bukan pada tingkat nota. Satu nota yang memuat beberapa jenis produk MUST dapat dibagi ke beberapa pengrajin.

Setiap penugasan MUST memuat pengrajin, jumlah yang ditugaskan, dan tanggal janji selesai (tenggat). Jumlah ditugaskan MUST lebih besar dari nol dan MUST NOT melebihi jumlah yang dipesan pada baris tersebut.

`Transaction.nama_pengrajin` MUST NOT lagi dipakai sebagai sumber kebenaran penugasan; ia hanya dipertahankan sebagai catatan lama.

#### Scenario: Satu nota dibagi ke dua pengrajin

- **WHEN** sebuah nota memuat 2 gross Bando Satin dan 3 gross Bando Pompom, lalu Bando Satin ditugaskan ke "MAMA URI" dan Bando Pompom ke "MAMA ARI"
- **THEN** papan tugas menampilkan Bando Satin di bawah MAMA URI dan Bando Pompom di bawah MAMA ARI, keduanya menyebut nota dan nama toko yang sama

#### Scenario: Satu baris dibagi ke dua pengrajin

- **WHEN** baris 5 gross Bando Pompom ditugaskan 3 gross ke "MAMA URI" dan 2 gross ke "MAMA ARI"
- **THEN** kedua penugasan tercatat dan totalnya sama dengan jumlah dipesan

#### Scenario: Penugasan melebihi jumlah pesanan ditolak

- **WHEN** pengguna menugaskan 6 gross pada baris yang hanya dipesan 5 gross
- **THEN** sistem menolak dan memberitahukan sisa yang masih boleh ditugaskan

#### Scenario: Mengubah dan membatalkan penugasan

- **WHEN** sebuah penugasan yang belum punya setoran dipindahkan ke pengrajin lain atau dihapus
- **THEN** perubahan tersimpan, papan tugas menyesuaikan, dan aksi tercatat di log aktivitas

#### Scenario: Penugasan bersetoran tidak dapat dihapus

- **WHEN** pengguna mencoba menghapus penugasan yang sudah punya setoran
- **THEN** sistem menolak penghapusan, karena setoran itu sudah menjadi dasar upah yang mungkin telah dibayar

### Requirement: Papan tugas pekerjaan aktif

Sistem SHALL menyediakan satu halaman berisi seluruh penugasan yang **belum tuntas disetor**, dikelompokkan per pengrajin, dan menyebut nama toko serta nota asalnya.

Setiap baris MUST menampilkan jumlah ditugaskan, jumlah sudah disetor, jumlah sisa, dan tenggatnya. Penugasan yang tenggatnya sudah lewat MUST ditandai secara visual.

Halaman ini MUST dapat dipakai di layar ponsel, karena digunakan pagi hari sambil menyiapkan barang.

#### Scenario: Melihat siapa mengerjakan apa

- **WHEN** pengguna membuka papan tugas
- **THEN** sistem menampilkan tiap pengrajin beserta daftar pekerjaan aktifnya, lengkap dengan produk, toko, jumlah sisa, dan tenggat

#### Scenario: Tenggat terlewat ditandai

- **WHEN** sebuah penugasan bertenggat kemarin dan belum tuntas disetor
- **THEN** penugasan itu ditandai terlambat dan diurutkan lebih dulu

#### Scenario: Penugasan tuntas hilang dari papan

- **WHEN** seluruh jumlah pada sebuah penugasan sudah disetor
- **THEN** penugasan itu tidak lagi muncul di papan tugas, tetapi tetap ada di riwayat setoran

### Requirement: Baris pesanan yang belum ditugaskan

Sistem SHALL menampilkan daftar baris barang dari pesanan aktif yang **belum ditugaskan ke pengrajin mana pun**, atau yang jumlah penugasannya masih kurang dari jumlah dipesan.

Daftar ini MUST tampil menonjol di papan tugas, karena inilah jaring pengaman agar orderan tidak terlewat sampai hari kirim.

#### Scenario: Orderan baru belum dipegang siapa pun

- **WHEN** sebuah pesanan baru masuk dan belum ada penugasan
- **THEN** seluruh baris barangnya muncul di daftar "belum ditugaskan" beserta nama toko dan jumlahnya

#### Scenario: Penugasan sebagian tetap terdaftar

- **WHEN** baris 5 gross baru ditugaskan 3 gross
- **THEN** baris itu tetap muncul di daftar belum ditugaskan dengan keterangan sisa 2 gross

#### Scenario: Daftar bersih ketika semua sudah dibagi

- **WHEN** seluruh baris pesanan aktif sudah ditugaskan penuh
- **THEN** sistem menyatakan tidak ada pekerjaan yang belum dibagi

### Requirement: Beban kerja per pengrajin

Sistem SHALL menampilkan daftar pengrajin aktif beserta jumlah pekerjaan yang masih harus diselesaikan, diurutkan dari yang paling sedikit, sehingga penugasan berikutnya tidak lagi menebak siapa yang menganggur.

#### Scenario: Menemukan pengrajin yang masih kosong

- **WHEN** pengguna membuka daftar beban kerja
- **THEN** pengrajin tanpa pekerjaan aktif muncul di urutan teratas dan ditandai masih kosong

#### Scenario: Beban kerja berkurang setelah setoran

- **WHEN** seorang pengrajin menyetorkan seluruh sisa pekerjaan pada satu penugasan
- **THEN** jumlah pekerjaan aktifnya berkurang, dan posisinya di daftar naik

### Requirement: Otorisasi penugasan

Endpoint penugasan MUST menurunkan identitas pemanggil dari sesi terverifikasi. Menetapkan, mengubah, dan menghapus penugasan SHALL dibatasi untuk peran Owner dan Admin; membaca papan tugas SHALL mewajibkan login.

#### Scenario: Permintaan tanpa sesi ditolak

- **WHEN** permintaan penetapan penugasan datang tanpa sesi yang sah
- **THEN** sistem menolak dengan status 401 dan tidak mengubah data apa pun
