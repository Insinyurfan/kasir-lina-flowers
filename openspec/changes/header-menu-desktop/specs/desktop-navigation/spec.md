## ADDED Requirements

### Requirement: Navigasi desktop berupa header dengan label selalu terbaca

Pada lebar layar desktop, sistem SHALL menampilkan navigasi sebagai header di
bagian atas halaman, dan MUST NOT menampilkan sidebar navigasi.

Setiap kepala kelompok pada header SHALL menampilkan teks labelnya tanpa
memerlukan interaksi apa pun terlebih dahulu.

Sistem MUST NOT menampilkan menu navigasi desktop dalam keadaan hanya-ikon yang
labelnya baru muncul saat disentuh kursor.

#### Scenario: Label terbaca tanpa disentuh

- **WHEN** pengguna membuka aplikasi di layar desktop dan belum menggerakkan kursor ke mana pun
- **THEN** seluruh kepala kelompok navigasi terbaca teksnya

#### Scenario: Sidebar tidak lagi tampil di desktop

- **WHEN** halaman ditampilkan pada lebar desktop
- **THEN** tidak ada sidebar navigasi di sisi kiri, dan lebar yang ditinggalkannya terpakai oleh konten

#### Scenario: Tampilan HP tidak berubah

- **WHEN** halaman ditampilkan pada lebar HP
- **THEN** header HP, laci hamburger, dan menu bawah berperilaku persis seperti sebelum perubahan ini, dan header desktop tidak tampil

### Requirement: Menu dikelompokkan menurut pekerjaan

Sistem SHALL mengelompokkan menu navigasi menjadi kelompok Orderan, Tugas,
Keuangan, Data, dan Sistem, dengan Dashboard sebagai tautan tunggal di luar kelompok mana
pun.

Susunan kelompok, label, ikon, dan syarat peran SHALL didefinisikan pada satu
sumber tunggal yang dipakai bersama oleh header desktop dan laci HP.

Sebagian label diganti atas keputusan pemilik pada 22 Agustus 2026 agar memakai
istilah yang dipakai sehari-hari. Yang berubah HANYA tulisannya: tidak ada
halaman yang ditambah, dihapus, digabung, atau dipindah alamatnya, dan setiap
`href` tetap sama seperti sebelumnya.

Judul di dalam halaman yang bersangkutan SHALL ikut memakai nama barunya, supaya
menu dan halaman yang dibukanya tidak menyebut dua nama berbeda.

Nilai data yang kebetulan bertuliskan sama — khususnya `statusPengiriman`
bernilai `"Request Pesanan"` yang tersimpan di basis data — MUST NOT ikut
diganti. Itu status tersimpan, bukan label tampilan; menggantinya akan memutus
kecocokan dengan baris yang sudah ada.

#### Scenario: Isi tiap kelompok

- **WHEN** pengguna berperan Owner membuka seluruh kelompok
- **THEN** Orderan berisi Orderan Manual, Status Pesanan, Riwayat Penjualan, dan Unduh Nota; Tugas berisi Tugas Pengrajin dan Checklist Packing; Keuangan berisi Piutang, Pengeluaran, Laba Rugi, dan Laporan; Data berisi Produk, Pelanggan, dan Pengrajin; Sistem berisi Log Aktivitas dan Manajemen Akun

#### Scenario: Tidak ada menu yang hilang

- **WHEN** seluruh kelompok dibuka oleh peran tertentu
- **THEN** himpunan halaman yang dapat dijangkau sama persis dengan sidebar lama bagi peran yang sama, meski sebagian labelnya kini bertuliskan lain

#### Scenario: Menambah menu baru cukup di satu tempat

- **WHEN** sebuah menu baru ditambahkan ke sumber susunan menu
- **THEN** menu itu muncul pada header desktop maupun laci HP tanpa penyuntingan terpisah pada masing-masing

### Requirement: Kasir berdiri sebagai tombol tersendiri

Sistem SHALL menampilkan Kasir (POS) sebagai tombol tersendiri pada header
desktop, dan MUST NOT menaruhnya di dalam tarikan-bawah kelompok mana pun.

Tombol tersebut SHALL mengikuti penapisan peran yang sama seperti sebelumnya.

#### Scenario: Kasir dijangkau satu klik

- **WHEN** pengguna yang berhak membuka halaman mana pun di desktop
- **THEN** Kasir dapat dibuka dengan satu klik tanpa membuka tarikan-bawah lebih dulu

#### Scenario: Kasir tetap tersembunyi bagi Tamu

- **WHEN** pengguna berperan Tamu membuka aplikasi di desktop
- **THEN** tombol Kasir tidak ditampilkan

### Requirement: Kelompok yang memuat halaman aktif ikut ditandai

Sistem SHALL menandai kepala kelompok sebagai aktif apabila halaman yang sedang
dibuka termasuk salah satu menu di dalamnya, termasuk ketika tarikan-bawahnya
sedang tertutup.

Baris menu di dalam tarikan-bawah SHALL ditandai aktif mengikuti aturan
pencocokan yang sama.

#### Scenario: Penanda naik ke kepala kelompok

- **WHEN** pengguna sedang membuka halaman Piutang dan seluruh tarikan-bawah tertutup
- **THEN** kepala kelompok Keuangan terlihat aktif

#### Scenario: Penanda di dalam tarikan-bawah

- **WHEN** pengguna sedang membuka halaman Piutang lalu membuka kelompok Keuangan
- **THEN** baris Piutang di dalamnya terlihat aktif

### Requirement: Penapisan peran dipertahankan dan kelompok kosong disembunyikan

Setiap menu SHALL menerapkan syarat peran yang sama persis seperti sebelum
perubahan ini.

Kelompok yang seluruh menunya tersaring habis bagi peran pengguna MUST NOT
dirender — baik kepala kelompoknya maupun tarikan-bawahnya.

#### Scenario: Menu khusus Owner tetap tersembunyi

- **WHEN** pengguna berperan Admin membuka kelompok Keuangan
- **THEN** Piutang dan Pengeluaran terlihat, sedangkan Laba Rugi dan Laporan tidak

#### Scenario: Kelompok tanpa isi tidak dirender

- **WHEN** seluruh menu di dalam sebuah kelompok tersaring habis bagi peran pengguna
- **THEN** kepala kelompok itu tidak ditampilkan sama sekali, bukan ditampilkan dengan isi kosong

### Requirement: Tarikan-bawah dapat dibuka lewat kursor, papan ketik, dan sentuhan

Tarikan-bawah SHALL terbuka saat kepala kelompok disentuh kursor.

Tarikan-bawah SHALL tetap terbuka selama tenggang singkat setelah kursor
meninggalkan kepala kelompok, agar pengguna sempat menggerakkan kursor ke
isinya.

Kepala kelompok SHALL dapat dijangkau papan ketik; menerima fokus MUST membuka
tarikan-bawahnya, dan menekan `Esc` MUST menutupnya.

Pada perangkat tanpa kursor, menyentuh kepala kelompok MUST membuka
tarikan-bawahnya.

#### Scenario: Kursor bergerak menuju isi menu

- **WHEN** pengguna menyentuh kepala kelompok dengan kursor lalu menggerakkannya menyerong ke arah isi tarikan-bawah
- **THEN** tarikan-bawah tetap terbuka sepanjang perjalanan kursor tersebut

#### Scenario: Dijangkau papan ketik

- **WHEN** pengguna menekan Tab hingga fokus berada pada sebuah kepala kelompok
- **THEN** tarikan-bawahnya terbuka dan menu di dalamnya dapat dijangkau Tab berikutnya

#### Scenario: Esc menutup

- **WHEN** sebuah tarikan-bawah sedang terbuka dan pengguna menekan `Esc`
- **THEN** tarikan-bawah tertutup

#### Scenario: Layar sentuh berukuran desktop

- **WHEN** pengguna pada perangkat layar sentuh selebar desktop menyentuh sebuah kepala kelompok
- **THEN** tarikan-bawahnya terbuka

### Requirement: Header tetap utuh pada desktop paling sempit

Pada lebar desktop terkecil yang didukung, seluruh kepala kelompok SHALL tetap
tampil beserta teksnya.

Bila ruang tidak mencukupi, sistem SHALL menyusutkan unsur lain lebih dulu —
nama toko, lalu label tombol Kasir — dan MUST NOT menyusutkan kepala kelompok
menjadi ikon tanpa teks.

Header MUST NOT menyebabkan halaman dapat digulung ke samping.

#### Scenario: Ruang menyempit

- **WHEN** lebar jendela dikecilkan hingga mendekati batas terkecil desktop
- **THEN** nama toko disembunyikan lebih dulu sementara seluruh kepala kelompok tetap terbaca

#### Scenario: Tidak ada gulungan menyamping

- **WHEN** header ditampilkan pada lebar desktop mana pun yang didukung
- **THEN** halaman tidak dapat digulung ke samping
