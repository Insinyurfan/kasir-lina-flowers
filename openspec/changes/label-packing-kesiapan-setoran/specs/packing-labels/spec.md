## ADDED Requirements

### Requirement: Label bungkus siap cetak

Sistem SHALL dapat mencetak label bungkus dari data pesanan. Setiap label MUST memuat nama toko, nomor nota, nama produk, jumlah beserta satuannya, dan — bila ada — variasi serta kode pelanggan.

Jumlah MUST ditampilkan memakai pemformat satuan yang sama dengan nota, sehingga `setengah_gross` terbaca "½ Gross" dan bukan nilai mentah basis data.

#### Scenario: Mencetak label satu nota

- **WHEN** pengguna menekan cetak label pada sebuah nota berisi 8 barang
- **THEN** sistem menghasilkan dokumen berisi 8 label, masing-masing menyebut nama toko dan nomor nota yang sama

#### Scenario: Label memuat kode pelanggan

- **WHEN** sebuah baris pesanan punya kode pelanggan "AMN"
- **THEN** kode itu tercetak pada labelnya, karena kode itulah yang membedakan bungkus milik cabang berbeda dari toko yang sama

#### Scenario: Satuan terbaca wajar

- **WHEN** sebuah baris berjumlah 5 dengan satuan `setengah_gross`
- **THEN** labelnya tertulis "2½ Gross", bukan "5 setengah_gross"

### Requirement: Cetak ulang satu label

Sistem SHALL dapat mencetak ulang label untuk satu baris barang saja, tanpa harus mencetak ulang seluruh nota.

#### Scenario: Label rusak atau hilang

- **WHEN** pengguna menekan cetak label pada satu baris barang
- **THEN** sistem menghasilkan dokumen berisi satu label untuk baris tersebut

### Requirement: Tata letak siap gunting

Label SHALL disusun beberapa per halaman A4 dengan garis potong, sehingga dapat dicetak dengan printer biasa lalu digunting — tanpa memerlukan printer label khusus.

#### Scenario: Banyak label dalam satu halaman

- **WHEN** sebuah nota berisi 8 barang dicetak labelnya
- **THEN** seluruh label tersusun rapi dalam halaman A4 dengan batas potong yang terlihat, dan berlanjut ke halaman berikutnya bila tidak muat

### Requirement: Otorisasi cetak label

Data yang dipakai mencetak label MUST berasal dari endpoint yang mewajibkan sesi terverifikasi dengan peran Owner atau Admin.

#### Scenario: Tanpa sesi ditolak

- **WHEN** data packing diminta tanpa sesi yang sah
- **THEN** sistem menolak dengan status 401
