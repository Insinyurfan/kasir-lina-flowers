> **TERTUNDA — 22 Agustus 2026. Bukan dibatalkan.**
>
> Kode-nya sudah berdiri (65/78): model `Kelompok`, `Pengrajin`,
> `TarifPengrajin`, `Penugasan`, `Setoran`, `Penarikan`, serta halaman
> `/pengrajin` dan `/papan-tugas`. Yang tersisa bukan pekerjaan koding —
> melainkan mengisi master pengrajin bersama pemilik dan mengubah kebiasaan
> dari buku ke layar (tugas 9.10 dan 9.11).
>
> Penundaannya disengaja. Tujuan awal proyek ini adalah membuat nota, mencatat
> penjualan, dan mengetahui nota siapa yang belum terbayar — dan bagian itulah
> yang sampai sekarang masih paling merepotkan. Halaman Piutang sudah jadi
> tetapi belum dinyatakan dipakai (tugas 10.8 di `pengeluaran-piutang-laba`).
> Mengadopsi penggajian sebelum piutang benar-benar terpakai berarti meminta
> pemilik mengubah dua kebiasaan sekaligus.
>
> **Akibat yang harus disadari selama tertunda:** tidak ada `Penarikan`, berarti
> tidak ada `Expense` berkategori `Upah Pengrajin`, berarti **laba usaha yang
> ditampilkan lebih besar dari kenyataan** — pos biaya terbesar kedua bernilai
> Rp0. Penanganan sementaranya ada di bagian "Selama tertunda" di bawah.

## Why

Pembagian kerja ke pengrajin masih hidup di kepala satu orang dan di grup WhatsApp. Akibatnya, dari empat keluhan operasional pemilik, tiga berasal dari sini:

1. **Orderan ke-skip.** Saat pesanan menumpuk, penugasan dikirim ke grup pengrajin atau lewat bibi yang menentukan siapa yang masih kosong. Tidak ada daftar yang bisa dilihat bersama, jadi orderan Toko B atau C bisa terlewat sampai hari kirim — dan berujung cekcok.
2. **Tidak tahu siapa mengerjakan apa.** "Bando tipe A dikerjakan siapa? Tipe B? Siapa yang belum dapat kerjaan?" Semuanya diingat manual sambil mengurus hal lain.
3. **Upah dicatat di buku.** Sistemnya potong-per-unit dan pencairannya sewaktu-waktu, bisa sebagian. Rawan lupa, rawan salah hitung, dan tidak ada riwayat yang bisa dirujuk saat berselisih.

Sistem sekarang hanya punya `Transaction.nama_pengrajin` — **satu nama teks bebas untuk seluruh nota**. Itu tidak cukup: dalam satu orderan, tiap jenis produk bisa dikerjakan orang yang berbeda.

Selain itu, upah pengrajin adalah komponen biaya terbesar kedua setelah bahan baku. Tanpa angkanya, laporan Laba Rugi yang baru dibangun masih menampilkan laba yang lebih besar dari kenyataan.

## What Changes

- **Master Pengrajin & Kelompok**: struktur ketua → anggota (mis. Ketua Mama Budi → Mama Uri, Mama Ari). Ketua adalah pengrajin biasa yang juga mengerjakan barang — sesuai kenyataan di lapangan.
- **Tarif per pengrajin × produk**: Bando Pompom yang lebih rumit dibayar lebih tinggi daripada Bando Satin, dan besarannya bisa berbeda antar orang. Setiap pengrajin MAY punya **tarif cadangan** yang dipakai bila tarif untuk produk tertentu belum diisi, sehingga produk baru tidak pernah membuat setoran gagal dicatat.
- **Penerima upah dapat berbeda dari pekerja**: sebagian pengrajin menerima upahnya sendiri, sebagian lewat ketua kelompoknya yang lalu membagi sendiri. Setoran mencatat keduanya — siapa yang mengerjakan, dan saldo siapa yang bertambah.
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

- `artisan-directory`: Pengrajin dan kelompok dikelola sebagai master data dengan struktur ketua → anggota, tarif upah per pengrajin × produk beserta tarif cadangan, dan penetapan penerima upah.
- `work-assignment`: Setiap baris barang pada pesanan dapat ditugaskan ke seorang pengrajin dengan tanggal janji selesai; sistem menampilkan pekerjaan aktif per pengrajin, baris yang belum ditugaskan, dan siapa yang masih kosong.
- `artisan-payroll`: Setoran fisik pengrajin menjadi saldo upah pada penerima yang ditetapkan (dirinya sendiri atau ketua kelompoknya), menumpuk otomatis, dapat ditarik penuh atau sebagian, dengan riwayat lengkap dan tercatat sebagai biaya usaha.

### Modified Capabilities

<!-- `openspec/specs/` masih kosong, jadi tidak ada spec terdahulu yang
     requirement-nya berubah. Penghentian `Transaction.nama_pengrajin` sebagai
     sumber kebenaran dicatat sebagai bagian dari `work-assignment`. -->

## Impact

- **Model data**:
  - `Kelompok` (nama, ketuaId → Pengrajin) dan `Pengrajin` (nama, kelompokId, tarifCadangan?, satuanTarif, penerimaUpah, aktif).
  - `TarifPengrajin` (pengrajinId, productId, tarif) — unik per pasangan, inilah tarif per produk.
  - `Penugasan` (transactionItemId, pengrajinId, jumlahDitugaskan, tenggat, catatan) — kunci fitur ini.
  - `Setoran` (penugasanId, pengrajinId **pekerja**, penerimaId **pemilik saldo**, tanggal, jumlah, tarifSnapshot, nilai).
  - `Penarikan` (pengrajinId **penerima**, tanggal, nominal, expenseId) — tertaut ke `Expense` agar masuk Laba Rugi.
- **Keterkaitan dengan yang sudah ada**: `TransactionItem` sudah punya `packed`/`packedAt` untuk checklist packing. Penugasan dan setoran berdiri di sampingnya — barang boleh disetor pengrajin tetapi belum masuk mobil, dan keduanya perlu terlihat terpisah.
- **API**: rute baru `pengrajin` (CRUD + daftar beban kerja), `penugasan` (tetapkan/ubah/hapus), `setoran` (catat, termasuk sebagian), `upah` (saldo, penarikan). Semuanya memakai `lib/apiAuth.ts`; tulis dibatasi Owner/Admin.
- **UI**: halaman **Papan Tugas** (mobile-first — Bibi memakainya pagi-pagi sambil menyiapkan barang), halaman **Pengrajin** (master + saldo + tarik upah), dan tautan di sidebar.
- **Integrasi Laba Rugi**: penarikan upah membuat baris `Expense` berkategori `Upah Pengrajin`. Ini menutup lubang yang sengaja dibiarkan pada change `pengeluaran-piutang-laba`, di mana upah harus dicatat manual.
- **Migrasi data**: tidak ada yang perlu di-backfill. `Transaction.nama_pengrajin` yang sudah terisi dibiarkan apa adanya sebagai catatan sejarah; penugasan dimulai dari pesanan baru.
- **Perubahan pada rencana lain**: draf `pengrajin-payroll` digantikan sepenuhnya oleh change ini — bagian papan tugas yang menjadi keluhan utama tidak ada di draf tersebut. Diarsipkan 22 Agustus 2026 sebagai `archive/2026-08-22-pengrajin-payroll`.

## Selama tertunda

Selama Papan Tugas belum dipakai, upah pengrajin **tetap boleh dicatat manual**
sebagai `Expense` berkategori `Upah Pengrajin` lewat halaman Pengeluaran yang
sudah ada. Kategorinya sudah tersedia di form, dan tanggalnya boleh diisi mundur,
jadi pembayaran yang sudah lewat masih bisa disusulkan dari buku catatan.

**Aturan peralihan — WAJIB ditegakkan saat Papan Tugas mulai dipakai:** begitu
`Penarikan` pertama tercatat lewat sistem, pencatatan manual untuk kategori
`Upah Pengrajin` HARUS berhenti. `Penarikan` membuat `Expense`-nya sendiri;
mencatat manual di samping itu membuat biaya terhitung dua kali dan laba
terlihat lebih kecil dari kenyataan. Peralihan ini terjadi sekali dan sulit
ditemukan belakangan — karena itu ditulis di sini, bukan diingat.

## Arah lanjutan (belum dijadwalkan, bukan bagian dari change ini)

Tujuan akhir yang diinginkan pemilik melampaui pencatatan internal: **pengrajin
melihat sendiri upahnya lewat website ini.**

Alurnya sebagaimana yang dibayangkan pemilik:

1. Pengrajin datang ke rumah → dicatat bahan yang dibawa, serta perkiraan produk
   apa dan berapa banyak yang akan jadi.
2. Saat menyetorkan barang jadi → dicatat lagi, lalu nilai upahnya ditetapkan.
3. Bila upahnya tidak langsung diambil, pengrajin dapat **mengecek saldonya
   sendiri** lewat website, kapan saja.
4. Sekalian melihat-lihat katalog produk — siapa tahu ingin mempromosikannya ke
   orang terdekat.

Pemetaan terhadap yang sudah ada:

| Bagian | Keadaan |
|---|---|
| Perkiraan hasil & jumlah (langkah 1) | Sudah tercakup `Penugasan` (`jumlahDitugaskan` + `tenggat`) |
| Bahan fisik yang dibawa keluar (langkah 1) | **Belum ada** — wilayah `bom-inventory` |
| Setoran → nilai upah (langkah 2) | Sudah ada (`Setoran` + `tarifSnapshot`, boleh sebagian) |
| Pengrajin login & lihat saldo sendiri (langkah 3) | **Belum ada sama sekali** |
| Katalog untuk dilihat pengrajin (langkah 4) | Mesinnya sudah ada — katalog publik, 17 Agustus 2026 |

Hambatan utamanya satu: **`Pengrajin` tidak punya kaitan apa pun ke `User`.**
Tidak ada `userId`, tidak ada kata sandi. Pengrajin saat ini adalah catatan data,
bukan identitas yang bisa masuk. Menjembatani keduanya adalah pekerjaan
tersendiri, dan membawa syarat privasi yang harus eksplisit sejak awal:

- Pengrajin HANYA boleh melihat saldo dan riwayat kerjanya sendiri.
- Pengrajin TIDAK boleh melihat milik pengrajin lain — termasuk anggota
  sekelompoknya. Perlu keputusan khusus untuk ketua kelompok, yang menerima
  upah limpahan anggotanya dan karenanya punya alasan sah melihat sebagian data
  mereka.
- Pengrajin TIDAK boleh melihat omzet, laba, piutang, harga jual, atau data
  pelanggan.
- Mekanisme masuknya belum diputuskan. Kata sandi untuk orang yang jarang
  memakai aplikasi punya masalahnya sendiri (lupa, dititipkan, dipakai bersama).
  Pola tautan pelacakan pesanan publik yang sudah ada mungkin lebih cocok, tetapi
  saldo upah lebih sensitif daripada status pesanan — perlu ditimbang tersendiri.

Ditulis di sini agar tidak menguap selama change ini tertunda. Bila kelak
dikerjakan, ini layak menjadi change tersendiri, bukan tambahan pada yang ini.
