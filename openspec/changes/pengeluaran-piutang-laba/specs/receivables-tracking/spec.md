## ADDED Requirements

### Requirement: Pencatatan pembayaran transaksi

Sistem SHALL memungkinkan pencatatan satu atau lebih pembayaran atas sebuah transaksi. Setiap pembayaran MUST memuat tanggal, nominal, dan metode pembayaran, serta MAY memuat catatan.

Nominal pembayaran MUST lebih besar dari nol, dan total seluruh pembayaran sebuah transaksi MUST NOT melebihi total harga transaksi tersebut.

#### Scenario: Pembayaran penuh

- **WHEN** pengguna mencatat pembayaran Rp1.500.000 atas transaksi bertotal Rp1.500.000
- **THEN** sisa tagihan transaksi menjadi Rp0 dan transaksi ditandai lunas

#### Scenario: Pembayaran sebagian

- **WHEN** pengguna mencatat pembayaran Rp500.000 atas transaksi bertotal Rp1.500.000
- **THEN** sisa tagihan menjadi Rp1.000.000 dan transaksi tetap berstatus belum lunas

#### Scenario: Cicilan berikutnya melunasi

- **WHEN** transaksi bersisa Rp1.000.000 menerima pembayaran kedua sebesar Rp1.000.000
- **THEN** sisa tagihan menjadi Rp0 dan transaksi ditandai lunas

#### Scenario: Pembayaran melebihi sisa tagihan ditolak

- **WHEN** pengguna mencatat pembayaran Rp2.000.000 atas transaksi bersisa Rp1.000.000
- **THEN** sistem menolak pencatatan dan memberitahukan sisa tagihan yang sebenarnya

### Requirement: Status lunas diturunkan dari pembayaran

Status pelunasan sebuah transaksi SHALL dihitung dari total pembayaran yang tercatat, bukan diisi manual oleh pengguna. Antarmuka MUST NOT lagi menyediakan pemilihan status Lunas/Belum Lunas secara langsung.

Transaksi SHALL dianggap lunas ketika total pembayarannya sama dengan total harga transaksi.

#### Scenario: Status berubah otomatis

- **WHEN** pembayaran terakhir dicatat sehingga total pembayaran menyamai total harga
- **THEN** status transaksi berubah menjadi lunas tanpa tindakan tambahan dari pengguna

#### Scenario: Pemilihan status manual tidak tersedia

- **WHEN** pengguna membuka transaksi di POS maupun Riwayat Penjualan
- **THEN** tidak ada kendali untuk menetapkan status Lunas/Belum Lunas secara langsung; yang tersedia adalah pencatatan pembayaran

#### Scenario: Menghapus pembayaran mengembalikan status

- **WHEN** sebuah pembayaran atas transaksi lunas dihapus karena salah catat
- **THEN** transaksi kembali berstatus belum lunas dengan sisa tagihan sebesar nominal yang dihapus, dan penghapusan tercatat di log aktivitas

### Requirement: Pembayaran saat transaksi dibuat

Saat transaksi dibuat di POS, pengguna SHALL dapat langsung menandai transaksi sebagai dibayar lunas dengan metode tertentu, atau menandainya sebagai belum dibayar. Menandai lunas di titik ini MUST menghasilkan satu pembayaran senilai total transaksi bertanggal transaksi tersebut.

#### Scenario: Toko membayar langsung di tempat

- **WHEN** kasir menyimpan transaksi dengan metode "Tunai" dan menandainya dibayar lunas
- **THEN** sistem membuat satu pembayaran senilai total transaksi dan transaksi langsung berstatus lunas

#### Scenario: Toko membayar belakangan

- **WHEN** kasir menyimpan transaksi dan menandainya belum dibayar
- **THEN** sistem tidak membuat pembayaran apa pun dan transaksi muncul di daftar piutang

### Requirement: Daftar piutang dengan umur tagihan

Sistem SHALL menyediakan halaman piutang berisi seluruh transaksi yang belum lunas, dikelompokkan per pelanggan, memuat sisa tagihan tiap transaksi dan total sisa tagihan per pelanggan.

Setiap piutang MUST menampilkan **umur tagihan** dalam hari, dihitung dari tanggal transaksi sampai hari ini, dan dikelompokkan ke dalam rentang `0–7`, `8–14`, `15–30`, dan `lebih dari 30` hari.

Daftar SHALL diurutkan menempatkan tagihan tertua di atas secara bawaan.

#### Scenario: Melihat siapa yang menunggak

- **WHEN** pengguna membuka halaman piutang
- **THEN** sistem menampilkan tiap pelanggan yang punya tagihan belum lunas beserta total sisa tagihannya dan umur tagihan tertuanya

#### Scenario: Tagihan lewat 30 hari ditandai

- **WHEN** sebuah transaksi belum lunas berumur 45 hari
- **THEN** transaksi tersebut masuk kelompok "lebih dari 30 hari" dan ditandai secara visual sebagai yang paling mendesak

#### Scenario: Transaksi lunas tidak muncul

- **WHEN** sebuah transaksi telah lunas seluruhnya
- **THEN** transaksi tersebut tidak muncul di halaman piutang

#### Scenario: Ringkasan total piutang

- **WHEN** pengguna membuka halaman piutang
- **THEN** sistem menampilkan total seluruh piutang berjalan dan jumlah pelanggan yang memilikinya

### Requirement: Teks penagihan siap kirim

Sistem SHALL menyediakan tombol untuk menyalin teks penagihan sebuah pelanggan ke papan klip, berisi nama pelanggan, daftar nomor nota yang belum lunas beserta tanggal dan sisa tagihannya, dan total yang harus dibayar.

#### Scenario: Menyalin teks tagihan

- **WHEN** pengguna menekan tombol salin tagihan pada seorang pelanggan
- **THEN** teks penagihan tersalin ke papan klip dan sistem menampilkan notifikasi bahwa teks sudah disalin

### Requirement: Migrasi riwayat transaksi lama

Transaksi yang sudah ada sebelum perubahan ini SHALL dimigrasikan agar riwayat tidak mendadak terlihat menunggak. Transaksi berstatus `Paid` MUST dibuatkan satu pembayaran senilai total harganya bertanggal sama dengan tanggal transaksi. Transaksi berstatus `Unpaid` MUST dibiarkan tanpa pembayaran.

#### Scenario: Transaksi lama yang sudah lunas tetap lunas

- **WHEN** migrasi dijalankan atas transaksi lama berstatus `Paid` senilai Rp2.000.000 tertanggal 10 Juli 2026
- **THEN** transaksi memiliki satu pembayaran Rp2.000.000 tertanggal 10 Juli 2026, sisa tagihannya Rp0, dan tidak muncul di halaman piutang

#### Scenario: Transaksi lama yang belum lunas menjadi piutang

- **WHEN** migrasi dijalankan atas transaksi lama berstatus `Unpaid`
- **THEN** transaksi tidak memiliki pembayaran, sisa tagihannya sama dengan total harganya, dan muncul di halaman piutang dengan umur dihitung dari tanggal transaksinya

### Requirement: Otorisasi piutang dan pembayaran

Seluruh endpoint pembayaran dan piutang MUST menurunkan identitas pemanggil dari sesi terverifikasi. Mencatat dan menghapus pembayaran SHALL dibatasi untuk peran Owner dan Admin; membaca daftar piutang SHALL mewajibkan login.

#### Scenario: Permintaan tanpa sesi ditolak

- **WHEN** permintaan pencatatan pembayaran datang tanpa sesi yang sah
- **THEN** sistem menolak dengan status 401 dan tidak mengubah data apa pun
