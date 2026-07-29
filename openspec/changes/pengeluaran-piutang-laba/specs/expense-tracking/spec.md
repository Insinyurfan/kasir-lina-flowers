## ADDED Requirements

### Requirement: Pencatatan pengeluaran

Sistem SHALL menyediakan pencatatan pengeluaran usaha yang berisi tanggal, nominal, kategori, catatan bebas, dan metode pembayaran. Nominal MUST bilangan bulat rupiah lebih besar dari nol. Tanggal MUST menggunakan zona waktu Asia/Jakarta dan default-nya adalah hari ini.

Formulir pencatatan SHALL dirancang untuk layar ponsel karena diisi saat pengguna sedang di perjalanan, bukan di depan komputer.

#### Scenario: Mencatat belanja bahan di jalan

- **WHEN** pengguna mengisi nominal 250000, kategori "Bahan Baku", catatan "Pasar Asemka - pita & pompom", metode "Tunai", lalu menyimpan
- **THEN** sistem menyimpan pengeluaran bertanggal hari ini dan menampilkannya di daftar pengeluaran hari tersebut

#### Scenario: Nominal tidak sah ditolak

- **WHEN** pengguna menyimpan pengeluaran dengan nominal 0 atau negatif
- **THEN** sistem menolak penyimpanan dan menampilkan pesan bahwa nominal harus lebih besar dari nol

#### Scenario: Mencatat pengeluaran untuk tanggal yang sudah lewat

- **WHEN** pengguna mengubah tanggal ke kemarin lalu menyimpan
- **THEN** sistem menyimpan pengeluaran pada tanggal tersebut dan pengeluaran itu ikut terhitung pada periode laporan yang memuat tanggal tersebut

### Requirement: Kategori pengeluaran baku

Sistem SHALL membatasi kategori pengeluaran pada daftar baku: `Bahan Baku`, `Transport`, `Konsumsi`, `Upah Pengrajin`, `Operasional Lain`, dan `Ambilan Pribadi`. Pengguna MUST memilih tepat satu kategori; kategori bebas-ketik TIDAK diperbolehkan agar laporan tetap dapat dijumlahkan.

#### Scenario: Kategori wajib dipilih

- **WHEN** pengguna menyimpan pengeluaran tanpa memilih kategori
- **THEN** sistem menolak penyimpanan dan meminta kategori dipilih

#### Scenario: Kategori di luar daftar ditolak

- **WHEN** permintaan penyimpanan memuat kategori yang tidak ada dalam daftar baku
- **THEN** sistem menolak permintaan tersebut

### Requirement: Ambilan pribadi dipisahkan dari biaya usaha

Pengeluaran berkategori `Ambilan Pribadi` SHALL diperlakukan sebagai pembagian keuntungan, bukan biaya usaha. Pengeluaran ini MUST mengurangi posisi kas tetapi MUST NOT mengurangi laba usaha.

Sistem SHALL menampilkan akumulasi ambilan pribadi per periode sebagai angka tersendiri agar besarannya terlihat oleh pemilik.

#### Scenario: Prive tidak mengurangi laba usaha

- **WHEN** dalam satu periode tercatat omzet Rp10.000.000, biaya usaha Rp6.000.000, dan ambilan pribadi Rp2.000.000
- **THEN** laba usaha periode itu adalah Rp4.000.000, bukan Rp2.000.000

#### Scenario: Prive tetap mengurangi kas

- **WHEN** periode yang sama dihitung posisi kasnya
- **THEN** ambilan pribadi Rp2.000.000 ikut mengurangi uang riil yang tersisa

#### Scenario: Akumulasi prive ditampilkan terpisah

- **WHEN** pengguna membuka ringkasan periode
- **THEN** sistem menampilkan total ambilan pribadi sebagai baris tersendiri, terpisah dari total biaya usaha

### Requirement: Bukti foto struk

Sistem SHALL memungkinkan melampirkan satu foto struk pada pengeluaran melalui kamera ponsel maupun berkas dari galeri. Lampiran ini OPTIONAL — pengeluaran tanpa foto tetap sah disimpan.

#### Scenario: Melampirkan foto struk

- **WHEN** pengguna memilih foto struk lalu menyimpan pengeluaran
- **THEN** sistem mengunggah gambar dan menautkannya ke pengeluaran tersebut, dan foto dapat dibuka kembali dari daftar pengeluaran

#### Scenario: Menyimpan tanpa foto

- **WHEN** pengguna menyimpan pengeluaran tanpa melampirkan foto
- **THEN** sistem tetap menyimpan pengeluaran tersebut tanpa peringatan

### Requirement: Koreksi dan penghapusan pengeluaran

Sistem SHALL memungkinkan pengubahan dan penghapusan pengeluaran yang salah catat. Setiap pengubahan dan penghapusan MUST tercatat di log aktivitas beserta identitas pelakunya.

#### Scenario: Menghapus pengeluaran salah catat

- **WHEN** pengguna menghapus sebuah pengeluaran
- **THEN** pengeluaran tersebut hilang dari daftar, tidak lagi terhitung di laporan periode mana pun, dan tercatat di log aktivitas beserta nama pelakunya

#### Scenario: Mengoreksi nominal

- **WHEN** pengguna mengubah nominal sebuah pengeluaran dari Rp250.000 menjadi Rp150.000
- **THEN** total pengeluaran periode terkait ikut berubah dan perubahan tercatat di log aktivitas

### Requirement: Otorisasi pencatatan pengeluaran

Seluruh endpoint pengeluaran MUST menurunkan identitas pemanggil dari sesi terverifikasi, bukan dari body permintaan. Membaca dan menulis pengeluaran SHALL dibatasi untuk peran Owner dan Admin.

#### Scenario: Pengguna tanpa sesi ditolak

- **WHEN** permintaan ke endpoint pengeluaran datang tanpa sesi yang sah
- **THEN** sistem menolak dengan status 401 dan tidak mengubah data apa pun

#### Scenario: Identitas pencatat diambil dari sesi

- **WHEN** pengguna yang login menyimpan pengeluaran sambil mengirimkan identitas pengguna lain di body permintaan
- **THEN** sistem mengabaikan identitas di body dan mencatat pemilik sesi sebagai pencatat
