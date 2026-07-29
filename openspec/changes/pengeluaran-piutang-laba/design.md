## Context

Aplikasi ini sudah berjalan di produksi (Vercel + Postgres/Prisma) dengan alur penjualan lengkap: POS, nota, checklist packing, master pelanggan, harga khusus per toko. Yang belum ada sama sekali adalah **sisi biaya**. Skema di `prisma/schema.prisma` tidak memuat satu pun entitas pengeluaran atau harga modal.

Pelunasan saat ini hanya berupa kolom `Transaction.status` bernilai `"Paid"` / `"Unpaid"` yang **dipilih manual** dari POS (`app/(frontend)/pos/page.tsx`) dan `ManualTransactionModal`. Konsekuensinya: tidak ada tanggal pembayaran, tidak ada pembayaran sebagian, dan tidak ada cara tahu sebuah tagihan sudah menggantung berapa lama.

Kendala yang membentuk desain ini:

- **Pengisi datanya bukan orang kantoran.** Pengeluaran dicatat sambil di jalan, lewat ponsel, di sela-sela kerja. Setiap field tambahan menurunkan kemungkinan fitur ini dipakai.
- **Server berjalan pada UTC** (Vercel), sementara seluruh operasi bisnis memakai WIB. Batas hari dan bulan MUST dihitung eksplisit, tidak boleh mengandalkan zona waktu proses.
- **Volume data kecil** — usaha rumahan dengan orde ratusan transaksi per bulan. Ini membolehkan pilihan desain yang mengutamakan kebenaran daripada optimasi.
- Fondasi yang sudah tersedia dan wajib dipakai ulang: `lib/apiAuth.ts` (`requireUser` / `requireRole`), `lib/supabaseStorage.ts` (unggah gambar), `lib/compressProductImage.ts`, `lib/activityLog.ts`, dan `lib/toast.ts`.

## Goals / Non-Goals

**Goals:**

- Mencatat pengeluaran dalam ≤ 15 detik dari layar terkunci ponsel.
- Memisahkan biaya usaha dari ambilan pribadi secara tegas di lapisan data, bukan hanya di laporan.
- Mengganti status lunas manual dengan pembayaran ber-tanggal yang mendukung cicilan.
- Menyajikan satu halaman yang menjawab "untung berapa" **dan** "kenapa uangnya habis" sekaligus.
- Tidak merusak apa pun yang sudah berjalan: nota, cetak, ekspor, checklist packing, harga khusus.

**Non-Goals:**

- HPP moving-average dan laba per produk — butuh data bahan baku, ditangani `bom-inventory`.
- Rekonsiliasi kas fisik harian (hitung uang di dompet vs sistem) — ditunda ke sisa `petty-cash-hpp`.
- Multi-akun kas (dompet / rekening bank terpisah). Metode pembayaran dicatat, tetapi saldo per akun tidak dilacak.
- Integrasi payment gateway atau pembacaan mutasi bank otomatis.
- Otomatisasi upah pengrajin — untuk sementara upah dicatat manual sebagai pengeluaran biasa.

## Decisions

### 1. Pembayaran sebagai ledger (`Payment`), bukan kolom nominal di `Transaction`

Setiap pembayaran menjadi satu baris `Payment(transactionId, tanggal, nominal, metode, catatan, pencatat)`.

*Alternatif yang ditolak:* menambah kolom `paidAmount` di `Transaction`. Kolom tunggal tidak bisa menyimpan **kapan** uang diterima, padahal itu justru yang dibutuhkan untuk laporan posisi kas dan perhitungan umur piutang. Cicilan juga mustahil direkam.

*Konsekuensi:* sisa tagihan dihitung lewat agregasi. Diterima karena volume data kecil.

### 2. `Transaction.status` tetap ada, tetapi menjadi cache yang hanya ditulis server

Kolom `status` tidak dihapus. Server memperbaruinya di dalam transaksi database yang sama saat pembayaran dicatat atau dihapus: `status = (Σ pembayaran ≥ total_harga) ? "Paid" : "Unpaid"`.

*Alasan:* dashboard, halaman laporan, dan ekspor Excel/PDF yang sudah ada menyaring dengan `status === "Paid"` di banyak tempat. Mempertahankan kolom ini membuat seluruh kode lama tetap benar tanpa disentuh, sehingga risiko regresi pada fitur cetak dan ekspor mendekati nol.

*Alternatif yang ditolak:* menghapus kolom dan mengubah semua pemanggil sekaligus — perubahan luas pada berkas besar yang sudah stabil, demi kerapian yang tidak dirasakan pengguna.

*Aturan yang mengikat:* tidak ada jalur tulis dari klien ke `status`. API MUST menolak `status` yang datang dari body.

### 3. Ambilan pribadi adalah **kategori**, bukan entitas atau flag terpisah

Prive dicatat sebagai `Expense` berkategori `Ambilan Pribadi`. Pemisahannya terjadi di lapisan perhitungan lewat satu konstanta:

```
KATEGORI_BIAYA_USAHA = [Bahan Baku, Transport, Konsumsi, Upah Pengrajin, Operasional Lain]
KATEGORI_NON_BIAYA   = [Ambilan Pribadi]
```

*Alasan:* satu formulir, satu daftar, satu alur mental bagi pengisi. Menambah tabel atau flag terpisah berarti pengguna harus memutuskan "ini masuk mana" sebelum mengetik nominal — hambatan tepat di titik yang paling rawan diabaikan.

### 4. Kategori disimpan sebagai `String` tervalidasi, bukan enum Prisma

Daftar kategori hidup di `lib/pengeluaran.ts` sebagai konstanta, divalidasi di server sebelum menulis.

*Alasan:* konsisten dengan pola yang sudah dipakai di repo ini (`role`, `status`, `satuanHarga`, `metode_pembayaran` semuanya `String`), dan menambah kategori kelak tidak memerlukan migrasi basis data.

*Trade-off:* kehilangan jaminan tipe di level basis data. Dimitigasi oleh validasi terpusat di satu berkas dan test unit.

### 5. Dua angka berdampingan: laba akrual dan posisi kas

Laporan tidak memilih satu basis. Keduanya dihitung dan ditampilkan bersama, disertai jembatan yang harus selalu berimbang:

```
laba usaha − kenaikan piutang − ambilan pribadi = posisi kas
```

*Alasan:* justru **selisih** kedua angka itulah gejala yang dirasakan pemilik ("kelihatan untung tapi uang habis"). Menampilkan salah satu saja menghilangkan penjelasannya. Identitas di atas juga berfungsi sebagai uji kebenaran otomatis — bila tidak berimbang, ada perhitungan yang salah.

### 6. Biaya diakui berbasis kas

Bahan yang dibeli hari ini dibebankan hari ini, tanpa konsep persediaan.

*Alasan:* mencatat persediaan menuntut disiplin stok opname yang belum ada. Basis kas cukup akurat pada rentang bulanan karena bahan di usaha ini terpakai dalam hitungan hari.

*Trade-off:* laba bulanan bergelombang bila belanja besar menumpuk di akhir bulan. Dimitigasi dengan menampilkan pembanding bulan sebelumnya, dan akan diperhalus setelah `bom-inventory` menyediakan data persediaan.

### 7. Batas periode dihitung eksplisit dalam WIB di server

Helper baru `lib/waktu.ts` menyediakan `awalHariWIB`, `akhirHariWIB`, dan `rentangBulanWIB`, memakai offset UTC+7 tetap (Indonesia tidak menerapkan daylight saving).

*Alasan:* proses di Vercel berjalan pada UTC. Tanpa perhitungan eksplisit, transaksi antara pukul 00:00–07:00 WIB akan jatuh ke tanggal yang salah — persis jam saat mobil kirim berangkat.

### 8. Halaman Laba Rugi berdiri sendiri di `/laba-rugi`

*Alternatif yang ditolak:* menjadikannya tab di dalam halaman Laporan. Berkas `app/(frontend)/laporan/page.tsx` sudah melewati 1.000 baris dan memuat pembuat PDF, ekspor Excel, serta beberapa mode tampilan. Menambah cabang di situ menaikkan risiko merusak fitur cetak yang sudah terbukti jalan, tanpa manfaat bagi pengguna.

Halaman lain: `/pengeluaran` (mobile-first) dan `/piutang`.

### 9. Foto struk memakai jalur unggah yang sudah ada

Rute baru `api/upload/struk` memanggil `lib/supabaseStorage.ts` dengan folder berbeda, dan klien mengompresi lebih dulu memakai `lib/compressProductImage.ts`.

*Alasan:* menyalin pola yang sudah terbukti, bukan membangun jalur unggah kedua.

### 10. Otorisasi mengikuti `lib/apiAuth.ts` yang sudah ada

- `requireRole(request, ["Owner", "Admin"])` — tulis/baca pengeluaran, tulis pembayaran.
- `requireUser(request)` — baca daftar piutang.
- `requireRole(request, ["Owner"])` — laporan laba rugi.

Tidak ada endpoint baru yang masuk ke `PUBLIC_ENDPOINTS`.

## Risks / Trade-offs

**Fitur ini mati kalau tidak diisi.** Ini risiko terbesar, dan sifatnya perilaku, bukan teknis.
→ Formulir dipangkas sampai tiga isian wajib (nominal, kategori, metode) dengan tanggal dan pencatat terisi otomatis. Kategori berupa tombol besar, bukan dropdown. Foto struk opsional dan tidak pernah memblokir penyimpanan. Ditargetkan selesai dalam satu layar tanpa menggulir.

**Piutang lama menumpuk begitu migrasi dijalankan.** Transaksi ber-status `Unpaid` sejak lama akan langsung muncul sebagai tagihan berumur ratusan hari, sebagian mungkin sebenarnya sudah dibayar tapi tidak pernah diperbarui statusnya. Daftar yang ramai sampah membuat orang berhenti mempercayainya sejak hari pertama.
→ Halaman piutang menyaring 90 hari terakhir secara bawaan, dan menyediakan penandaan lunas massal untuk pembersihan awal. Perlu satu sesi pembersihan bersama pemilik sebelum fitur ini dianggap hidup.

**Kategori "Ambilan Pribadi" bisa terasa menghakimi** sehingga sengaja tidak diisi — padahal justru angka ini yang dicari.
→ Penamaan dibuat netral dan penjelasan di antarmuka menyatakan tegas bahwa ini **bukan** biaya dan **tidak** mengurangi laba; ini bagian keuntungan yang diambil. Bila tetap tidak diisi, selisih laba dan kas akan menganga tanpa penjelasan — dan halaman laba rugi akan menampilkan selisih tak terjelaskan itu apa adanya, bukan menyembunyikannya.

**Angka laba salah ditafsirkan sebagai uang yang tersedia.**
→ Kedua angka selalu tampil berpasangan, tidak pernah laba sendirian.

**Menghilangkan pilihan status Lunas manual mengubah kebiasaan.** Pengguna yang terbiasa mengubah dropdown di Riwayat Penjualan akan mencarinya.
→ Kendali lama diganti tombol "Catat Pembayaran" di posisi yang sama, sehingga jalurnya tetap terasa serupa.

**Agregasi sisa tagihan tanpa kolom denormalisasi** akan melambat bila data tumbuh jauh melampaui perkiraan.
→ Diterima untuk sekarang; kolom turunan dapat ditambahkan belakangan tanpa mengubah kontrak API, karena sisa tagihan sudah dihitung di server dan tidak pernah dihitung ulang di klien.

## Migration Plan

1. **Migrasi skema** — tambah tabel `Expense` dan `Payment`, tanpa mengubah kolom `Transaction` yang sudah ada. Aman dijalankan pada basis data hidup karena hanya menambah.
2. **Backfill** — skrip di `scripts/` membuat satu `Payment` untuk setiap `Transaction` ber-status `Paid`, dengan `tanggal` sama dengan tanggal transaksi dan catatan penanda `"Migrasi otomatis dari status lama"`. Skrip MUST idempoten: melewati transaksi yang sudah punya pembayaran, sehingga aman dijalankan ulang.
3. **Rilis API** — endpoint pengeluaran, pembayaran, piutang, laba rugi. Pada tahap ini antarmuka lama masih berjalan apa adanya.
4. **Rilis antarmuka** — halaman baru, kartu dashboard, lalu penggantian kendali status manual di POS dan Riwayat Penjualan sebagai langkah terakhir.
5. **Sesi pembersihan piutang** bersama pemilik sebelum halaman piutang dinyatakan dipakai.

**Rollback:** langkah 4 dapat dibalik dengan mengembalikan kendali status manual — kolom `status` tidak pernah hilang, sehingga alur lama tetap utuh. Backfill dapat dibatalkan dengan menghapus `Payment` bercatatan penanda migrasi. Tabel baru dapat ditinggalkan tanpa memengaruhi fitur lain.

## Open Questions

1. **Tempo pembayaran per pelanggan.** Apakah tiap toko punya tempo yang disepakati (mis. 14 hari) sehingga sistem dapat menandai "lewat jatuh tempo", atau cukup menampilkan umur tagihan apa adanya? Desain saat ini memilih yang kedua karena lebih sedikit data yang harus dirawat.
2. **Upah pengrajin.** Untuk sementara dicatat manual sebagai pengeluaran. Saat `pengrajin-payroll` dikerjakan, apakah penarikan gaji otomatis membuat `Expense` berkategori Upah Pengrajin, atau laporan menjumlahkan dari dua sumber? Keputusan ini ditunda sampai change tersebut dimulai.
3. **Pengingat pencatatan.** Perlukah dashboard menampilkan pengingat pada hari yang ada pengiriman tetapi belum ada pengeluaran tercatat? Berpotensi membantu disiplin, berpotensi juga terasa mengomel.
4. **Batas awal piutang.** Berapa jauh ke belakang piutang lama layak ditampilkan setelah sesi pembersihan — 90 hari, atau seluruhnya?
