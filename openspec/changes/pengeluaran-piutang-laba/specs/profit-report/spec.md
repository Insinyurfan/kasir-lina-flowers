## ADDED Requirements

### Requirement: Laba usaha berbasis akrual

Sistem SHALL menghitung laba usaha suatu periode sebagai omzet seluruh transaksi bertanggal dalam periode itu — terlepas sudah dibayar atau belum — dikurangi seluruh pengeluaran berkategori biaya usaha pada periode yang sama.

Pengeluaran berkategori `Ambilan Pribadi` MUST NOT ikut mengurangi laba usaha.

Rincian biaya SHALL ditampilkan per kategori agar terlihat komponen mana yang paling besar.

#### Scenario: Menghitung laba periode

- **WHEN** dalam suatu bulan tercatat omzet Rp10.000.000 dan pengeluaran Bahan Baku Rp4.000.000, Upah Pengrajin Rp2.000.000, Transport Rp500.000, serta Ambilan Pribadi Rp3.000.000
- **THEN** sistem melaporkan biaya usaha Rp6.500.000 dan laba usaha Rp3.500.000

#### Scenario: Omzet mencakup transaksi yang belum dibayar

- **WHEN** sebuah transaksi Rp1.000.000 dibuat dalam periode tersebut dan belum dibayar sama sekali
- **THEN** transaksi itu tetap terhitung dalam omzet periode tersebut

#### Scenario: Rincian per kategori

- **WHEN** pengguna membuka laporan laba rugi sebuah periode
- **THEN** sistem menampilkan nominal tiap kategori biaya beserta porsinya terhadap total biaya usaha

#### Scenario: Periode rugi ditampilkan apa adanya

- **WHEN** biaya usaha suatu periode melebihi omzetnya
- **THEN** sistem menampilkan laba negatif secara eksplisit dan menandainya sebagai rugi

### Requirement: Posisi kas berbasis uang riil

Sistem SHALL menghitung posisi kas suatu periode sebagai total pembayaran yang benar-benar diterima pada periode itu dikurangi seluruh pengeluaran pada periode itu, **termasuk** ambilan pribadi.

Angka ini SHALL ditampilkan berdampingan dengan laba usaha, bukan menggantikannya.

#### Scenario: Kas dihitung dari pembayaran yang diterima

- **WHEN** dalam suatu periode diterima pembayaran Rp7.000.000 dan tercatat pengeluaran total Rp9.500.000 termasuk ambilan pribadi Rp3.000.000
- **THEN** sistem melaporkan posisi kas periode itu minus Rp2.500.000

#### Scenario: Pembayaran atas transaksi periode sebelumnya

- **WHEN** pada periode berjalan diterima pelunasan atas transaksi dari periode sebelumnya
- **THEN** pembayaran itu menambah posisi kas periode berjalan tetapi tidak menambah omzet maupun laba usaha periode berjalan

### Requirement: Penjelasan selisih laba dan kas

Sistem SHALL menampilkan penjelasan selisih antara laba usaha dan posisi kas dalam satu periode, dijabarkan atas dua sebab utama: perubahan piutang berjalan dan ambilan pribadi.

Penjelasan ini MUST ditulis dalam kalimat yang dapat dipahami tanpa latar belakang akuntansi.

#### Scenario: Untung tetapi kas menipis

- **WHEN** suatu periode menunjukkan laba usaha positif namun posisi kas negatif
- **THEN** sistem menjelaskan berapa bagian selisih yang berasal dari tagihan yang belum tertagih dan berapa yang berasal dari ambilan pribadi

#### Scenario: Rekonsiliasi selisih utuh

- **WHEN** laba usaha, posisi kas, perubahan piutang, dan ambilan pribadi suatu periode dihitung
- **THEN** laba usaha dikurangi kenaikan piutang dikurangi ambilan pribadi sama dengan posisi kas periode tersebut

### Requirement: Pemilihan periode laporan

Sistem SHALL menyediakan pemilihan periode laporan minimal berupa bulan berjalan, bulan sebelumnya, dan rentang tanggal bebas. Seluruh perhitungan MUST memakai zona waktu Asia/Jakarta, dengan tanggal awal dan akhir tercakup penuh.

#### Scenario: Memilih rentang bebas

- **WHEN** pengguna memilih rentang 1 Juli 2026 sampai 31 Juli 2026
- **THEN** seluruh transaksi, pembayaran, dan pengeluaran bertanggal di dalam rentang itu ikut terhitung, termasuk yang bertanggal 1 dan 31 Juli

#### Scenario: Membandingkan dengan bulan sebelumnya

- **WHEN** pengguna membuka laporan bulan berjalan
- **THEN** sistem menampilkan laba usaha bulan sebelumnya sebagai pembanding

### Requirement: Ringkasan di dashboard

Dashboard SHALL menampilkan tiga angka ringkas: total piutang berjalan, total pengeluaran bulan berjalan, dan laba usaha bulan berjalan. Setiap angka MUST dapat ditekan untuk membuka halaman rinciannya.

#### Scenario: Melihat ringkasan tanpa membuka laporan

- **WHEN** pengguna membuka dashboard
- **THEN** ketiga angka tersebut tampil untuk bulan berjalan dan menautkan ke halaman piutang, pengeluaran, dan laba rugi

### Requirement: Otorisasi laporan laba rugi

Endpoint dan halaman laba rugi MUST menurunkan identitas pemanggil dari sesi terverifikasi dan SHALL dibatasi untuk peran Owner.

#### Scenario: Peran selain Owner ditolak

- **WHEN** pengguna berperan Admin membuka laporan laba rugi
- **THEN** sistem menolak akses dan tidak mengungkapkan angka laba maupun rincian biaya
