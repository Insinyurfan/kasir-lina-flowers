## 1. Fondasi data & helper

- [x] 1.1 Tambah model `Expense` di `prisma/schema.prisma` (tanggal, nominal Int, kategori String, catatan String?, metode String, fotoUrl String?, pencatatId Int?, pencatatNama String?, createdAt, updatedAt) beserta indeks pada `tanggal` dan `kategori`
- [x] 1.2 Tambah model `Payment` di `prisma/schema.prisma` (transactionId, tanggal, nominal Int, metode String, catatan String?, pencatatId Int?, pencatatNama String?, createdAt) dengan relasi `onDelete: Cascade` ke `Transaction` dan indeks pada `transactionId` serta `tanggal`
- [x] 1.3 Jalankan migrasi Prisma (via `prisma db push`; repo ini tidak memakai folder migrations) (hanya penambahan tabel, tidak menyentuh kolom `Transaction` yang sudah ada) dan regenerate client ke `lib/generated/prisma`
- [x] 1.4 Buat `lib/waktu.ts`: `awalHariWIB`, `akhirHariWIB`, `rentangBulanWIB`, `umurHariWIB` dengan offset UTC+7 tetap
- [x] 1.5 Buat `lib/pengeluaran.ts`: konstanta `KATEGORI_PENGELUARAN`, `KATEGORI_BIAYA_USAHA`, `KATEGORI_NON_BIAYA`, dan validator kategori
- [x] 1.6 Buat `lib/piutang.ts`: `hitungSisaTagihan`, `turunkanStatus`, dan pengelompokan umur (`0–7`, `8–14`, `15–30`, `>30`)

## 2. Skrip migrasi data lama

- [x] 2.1 Tulis `scripts/backfill-payments.cjs` (mengikuti konvensi `.cjs` skrip lain di repo — tidak ada `tsx`/`ts-node` terpasang) yang membuat satu `Payment` senilai `total_harga` bertanggal transaksi untuk setiap `Transaction` ber-status `Paid`, dengan catatan penanda `"Migrasi otomatis dari status lama"`
- [x] 2.2 Pastikan skrip idempoten — melewati transaksi yang sudah memiliki `Payment`, sehingga aman dijalankan berulang
- [x] 2.3 Sediakan mode `--dry-run` yang hanya melaporkan jumlah baris yang akan dibuat
- [x] 2.4 Jalankan skrip dan verifikasi bahwa jumlah transaksi lunas sebelum dan sesudah migrasi identik

## 3. API pengeluaran

- [x] 3.1 Buat `app/(backend)/api/pengeluaran/route.ts` — `GET` (filter rentang tanggal & kategori) dan `POST`, memakai `requireRole(["Owner","Admin"])`
- [x] 3.2 Buat `app/(backend)/api/pengeluaran/[id]/route.ts` — `PATCH` dan `DELETE` dengan otorisasi yang sama
- [x] 3.3 Validasi server: nominal bulat > 0, kategori termasuk daftar baku, tanggal sah; tolak 400 dengan pesan berbahasa Indonesia
- [x] 3.4 Ambil `pencatatId`/`pencatatNama` dari sesi dan abaikan nilai serupa yang datang dari body
- [x] 3.5 Catat aksi buat/ubah/hapus ke `lib/activityLog.ts`
- [x] 3.6 Buat `app/(backend)/api/upload/struk/route.ts` yang memanggil `lib/supabaseStorage.ts` dengan folder terpisah untuk foto struk

## 4. API pembayaran & piutang

- [x] 4.1 Buat `app/(backend)/api/pembayaran/route.ts` — `POST` mencatat pembayaran, menolak bila nominal melebihi sisa tagihan, dan memperbarui `Transaction.status` dalam satu transaksi basis data
- [x] 4.2 Buat `app/(backend)/api/pembayaran/[id]/route.ts` — `DELETE` yang menghapus pembayaran lalu menghitung ulang `Transaction.status` dalam transaksi basis data yang sama
- [x] 4.3 Buat `app/(backend)/api/piutang/route.ts` — daftar transaksi belum lunas dikelompokkan per pelanggan, memuat sisa tagihan, umur hari, kelompok umur, total per pelanggan, dan total keseluruhan
- [x] 4.4 Terapkan penyaringan bawaan 90 hari terakhir pada endpoint piutang, dengan parameter untuk membuka seluruh riwayat
- [x] 4.5 Tambahkan endpoint penandaan lunas massal untuk pembersihan awal di `api/piutang/lunas-massal` (membuat `Payment` senilai sisa tagihan atas sekumpulan transaksi terpilih, bertanggal transaksi asal)
- [x] 4.6 Tolak `status` yang dikirim dari body pada seluruh endpoint transaksi — status hanya boleh ditulis server
- [x] 4.7 Catat aksi pembayaran dan penghapusan pembayaran ke log aktivitas

## 5. API laporan laba rugi

- [x] 5.1 Buat `app/(backend)/api/laba-rugi/route.ts` dengan parameter rentang tanggal, memakai `requireRole(["Owner"])`
- [x] 5.2 Hitung laba akrual: omzet transaksi dalam periode − pengeluaran berkategori biaya usaha dalam periode, dengan rincian per kategori
- [x] 5.3 Hitung posisi kas: pembayaran diterima dalam periode − seluruh pengeluaran dalam periode termasuk ambilan pribadi
- [x] 5.4 Hitung perubahan piutang dan total ambilan pribadi periode, lalu kembalikan jembatan `laba − kenaikan piutang − prive = kas`
- [x] 5.5 Sertakan angka pembanding periode sebelumnya dalam respons
- [x] 5.6 Pastikan seluruh batas periode memakai `lib/waktu.ts`, bukan zona waktu proses

## 6. Halaman Pengeluaran

- [x] 6.1 Buat `app/(frontend)/pengeluaran/page.tsx` dengan tata letak mobile-first
- [x] 6.2 Formulir input: nominal (papan angka besar), kategori sebagai tombol/chip besar, metode bayar, catatan opsional, tanggal terisi hari ini dan dapat diubah — seluruhnya muat dalam satu layar tanpa menggulir
- [x] 6.3 Lampiran foto struk opsional: ambil dari kamera atau galeri, kompresi klien memakai `lib/compressProductImage.ts`, dan tidak pernah memblokir penyimpanan bila unggah gagal
- [x] 6.4 Daftar pengeluaran per hari dengan subtotal harian dan pratinjau foto struk yang dapat dibuka
- [x] 6.5 Aksi ubah dan hapus dengan konfirmasi, memakai `lib/toast.ts` untuk umpan balik
- [x] 6.6 Penjelasan singkat di antarmuka bahwa Ambilan Pribadi bukan biaya dan tidak mengurangi laba
- [x] 6.7 Tambahkan tautan Pengeluaran ke sidebar (bottom nav sengaja TIDAK disentuh — sudah penuh 5 ikon dan rawan sesak di 360px; dijangkau lewat kartu Dashboard)

## 7. Halaman Piutang

- [x] 7.1 Buat `app/(frontend)/piutang/page.tsx` — daftar per pelanggan, tagihan tertua di atas secara bawaan
- [x] 7.2 Tampilkan sisa tagihan per transaksi, umur hari, dan penanda visual untuk kelompok lebih dari 30 hari
- [x] 7.3 Kartu ringkasan: total piutang berjalan dan jumlah pelanggan yang memilikinya
- [x] 7.4 Modal catat pembayaran (penuh atau sebagian) dengan tanggal, nominal, metode, dan catatan
- [x] 7.5 Tampilkan riwayat pembayaran per transaksi beserta aksi hapus untuk koreksi
- [x] 7.6 Tombol salin teks penagihan per pelanggan (nama, daftar nomor nota + tanggal + sisa, total) ke papan klip
- [x] 7.7 Mode pembersihan awal: pilih banyak transaksi lalu tandai lunas sekaligus
- [x] 7.8 Tambahkan tautan Piutang ke sidebar (bottom nav tidak disentuh, alasan sama seperti 6.7)

## 8. Halaman Laba Rugi

- [x] 8.1 Buat `app/(frontend)/laba-rugi/page.tsx` dengan pemilih periode: bulan berjalan, bulan sebelumnya, rentang bebas
- [x] 8.2 Tampilkan laba usaha dan posisi kas berdampingan — laba tidak pernah tampil sendirian
- [x] 8.3 Rincian biaya per kategori beserta porsinya terhadap total biaya usaha
- [x] 8.4 Blok penjelasan selisih dalam kalimat awam: berapa dari tagihan belum tertagih, berapa dari ambilan pribadi
- [x] 8.5 Tandai periode rugi secara eksplisit bila laba negatif
- [x] 8.6 Tampilkan pembanding bulan sebelumnya
- [x] 8.7 Batasi akses halaman untuk peran Owner saja

## 9. Penyesuaian alur yang sudah ada

- [x] 9.1 POS: ganti pemilihan status menjadi penandaan "dibayar lunas sekarang" (membuat satu `Payment` senilai total) atau "belum dibayar" (tanpa `Payment`)
- [x] 9.2 Riwayat Penjualan: ganti dropdown status manual dengan tombol "Catat Pembayaran" di posisi yang sama, menampilkan sisa tagihan
- [x] 9.3 `ManualTransactionModal`: selaraskan dengan alur pembayaran yang baru, hapus pilihan Lunas/Belum Lunas
- [x] 9.4 Dashboard: tambahkan tiga kartu — piutang berjalan, pengeluaran bulan berjalan, laba usaha bulan berjalan — masing-masing menautkan ke halaman rinciannya
- [x] 9.5 Verifikasi halaman Laporan, ekspor Excel/PDF, dan pembuat nota tetap berperilaku sama karena `Transaction.status` tidak berubah maknanya

## 10. Verifikasi

- [x] 10.1 Uji hitung: laba, kas, dan jembatan `laba − kenaikan piutang − prive = kas` selalu berimbang pada data contoh
- [x] 10.2 Uji batas WIB: transaksi dan pengeluaran pada pukul 00:30 dan 23:30 WIB jatuh ke tanggal yang benar pada laporan
- [ ] 10.3 Uji pembayaran: penuh, sebagian, cicilan sampai lunas, melebihi sisa (ditolak), dan penghapusan yang mengembalikan status
- [x] 10.4 Uji otorisasi: 9 endpoint baru menolak 401 tanpa sesi, dan `actorRole: "Owner"` palsu di body tetap ditolak. **Sisa untuk kamu**: peran Admin ditolak di laba rugi (butuh login Admin)
- [x] 10.5 Uji skrip backfill dijalankan dua kali — tidak menghasilkan pembayaran ganda
- [x] 10.6 `npx tsc --noEmit -p tsconfig.json` bersih, dan ESLint tidak menambah error baru dibanding sebelum perubahan
- [ ] 10.7 Uji tampilan di lebar 360px untuk halaman Pengeluaran dan Piutang (bottom nav tidak berubah)
- [ ] 10.8 Sesi pembersihan piutang lama bersama pemilik sebelum halaman dinyatakan dipakai

