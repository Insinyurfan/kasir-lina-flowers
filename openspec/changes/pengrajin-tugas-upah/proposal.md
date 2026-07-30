## Why

Pembagian kerja ke pengrajin masih hidup di kepala satu orang dan di grup WhatsApp. Akibatnya, dari empat keluhan operasional pemilik, tiga berasal dari sini:

1. **Orderan ke-skip.** Saat pesanan menumpuk, penugasan dikirim ke grup pengrajin atau lewat bibi yang menentukan siapa yang masih kosong. Tidak ada daftar yang bisa dilihat bersama, jadi orderan Toko B atau C bisa terlewat sampai hari kirim — dan berujung cekcok.
2. **Tidak tahu siapa mengerjakan apa.** "Bando tipe A dikerjakan siapa? Tipe B? Siapa yang belum dapat kerjaan?" Semuanya diingat manual sambil mengurus hal lain.
3. **Upah dicatat di buku.** Sistemnya potong-per-unit dan pencairannya sewaktu-waktu, bisa sebagian. Rawan lupa, rawan salah hitung, dan tidak ada riwayat yang bisa dirujuk saat berselisih.

Sistem sekarang hanya punya `Transaction.nama_pengrajin` — **satu nama teks bebas untuk seluruh nota**. Itu tidak cukup: dalam satu orderan, tiap jenis produk bisa dikerjakan orang yang berbeda.

Selain itu, upah pengrajin adalah komponen biaya terbesar kedua setelah bahan baku. Tanpa angkanya, laporan Laba Rugi yang baru dibangun masih menampilkan laba yang lebih besar dari kenyataan.

## What Changes

- **Master Pengrajin & Kelompok**: struktur ketua → anggota (mis. Ketua Mama Budi → Mama Uri, Mama Ari), beserta tarif per unit.
- **Penugasan per baris barang**, bukan per nota. Satu `TransactionItem` dapat ditugaskan ke seorang pengrajin, sehingga Bando Satin dan Bando Pompom dalam satu nota bisa dipegang orang berbeda. **BREAKING (internal)**: `Transaction.nama_pengrajin` berhenti menjadi sumber kebenaran dan hanya dipertahankan sebagai catatan lama.
- **Papan Tugas**: satu layar berisi seluruh pekerjaan yang belum disetor, dikelompokkan per pengrajin dan per toko, dengan **tanggal janji selesai**. Menjawab "siapa mengerjakan apa" dan "orderan mana yang belum dipegang siapa pun".
- **Daftar belum ditugaskan**: baris barang yang belum punya pengrajin ditampilkan menonjol — ini jaring pengaman agar orderan tidak ke-skip.
- **Siapa masih kosong**: daftar pengrajin beserta jumlah pekerjaan aktifnya, sehingga penugasan tidak lagi menebak siapa yang menganggur.
- **Setoran**: saat pengrajin menyerahkan barang jadi, jumlahnya dicatat. Satu kejadian ini sekaligus (a) mengurangi/menutup tugas di papan dan (b) menambah saldo upah. Setoran boleh **sebagian** (dijanjikan 5 gross, baru setor 3).
- **Saldo & Tarik Upah**: saldo = Σ nilai setoran − Σ penarikan. Penarikan boleh penuh atau sebagian, dengan riwayat yang tidak bisa diubah sembarangan.
- **Upah masuk ke Laba Rugi**: penarikan upah otomatis tercatat sebagai pengeluaran berkategori `Upah Pengrajin`, sehingga laba tidak lagi melebih-lebihkan.
- **Bukan bagian dari perubahan ini**: kuota bahan baku per pengrajin (menunggu `bom-inventory`), dan akun login untuk pengrajin — penugasan tetap diinput oleh Owner/Admin di rumah.

## Capabilities

### New Capabilities

- `artisan-directory`: Pengrajin dan kelompok dikelola sebagai master data dengan struktur ketua → anggota dan tarif per unit.
- `work-assignment`: Setiap baris barang pada pesanan dapat ditugaskan ke seorang pengrajin dengan tanggal janji selesai; sistem menampilkan pekerjaan aktif per pengrajin, baris yang belum ditugaskan, dan siapa yang masih kosong.
- `artisan-payroll`: Setoran fisik pengrajin menjadi saldo upah yang menumpuk otomatis dan dapat ditarik penuh atau sebagian, dengan riwayat lengkap dan tercatat sebagai biaya usaha.

### Modified Capabilities

<!-- `openspec/specs/` masih kosong, jadi tidak ada spec terdahulu yang
     requirement-nya berubah. Penghentian `Transaction.nama_pengrajin` sebagai
     sumber kebenaran dicatat sebagai bagian dari `work-assignment`. -->

## Impact

- **Model data**:
  - `Kelompok` (nama, namaKetua) dan `Pengrajin` (nama, kelompokId, tarifPerUnit, aktif).
  - `Penugasan` (transactionItemId, pengrajinId, jumlahDitugaskan, tenggat, catatan) — kunci fitur ini.
  - `Setoran` (penugasanId, pengrajinId, tanggal, jumlah, tarifSnapshot, nilai).
  - `Penarikan` (pengrajinId, tanggal, nominal, expenseId) — tertaut ke `Expense` agar masuk Laba Rugi.
- **Keterkaitan dengan yang sudah ada**: `TransactionItem` sudah punya `packed`/`packedAt` untuk checklist packing. Penugasan dan setoran berdiri di sampingnya — barang boleh disetor pengrajin tetapi belum masuk mobil, dan keduanya perlu terlihat terpisah.
- **API**: rute baru `pengrajin` (CRUD + daftar beban kerja), `penugasan` (tetapkan/ubah/hapus), `setoran` (catat, termasuk sebagian), `upah` (saldo, penarikan). Semuanya memakai `lib/apiAuth.ts`; tulis dibatasi Owner/Admin.
- **UI**: halaman **Papan Tugas** (mobile-first — Bibi memakainya pagi-pagi sambil menyiapkan barang), halaman **Pengrajin** (master + saldo + tarik upah), dan tautan di sidebar.
- **Integrasi Laba Rugi**: penarikan upah membuat baris `Expense` berkategori `Upah Pengrajin`. Ini menutup lubang yang sengaja dibiarkan pada change `pengeluaran-piutang-laba`, di mana upah harus dicatat manual.
- **Migrasi data**: tidak ada yang perlu di-backfill. `Transaction.nama_pengrajin` yang sudah terisi dibiarkan apa adanya sebagai catatan sejarah; penugasan dimulai dari pesanan baru.
- **Perubahan pada rencana lain**: draf `pengrajin-payroll` digantikan sepenuhnya oleh change ini — bagian papan tugas yang menjadi keluhan utama tidak ada di draf tersebut.
