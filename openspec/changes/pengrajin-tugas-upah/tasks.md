## 1. Fondasi data & helper

- [ ] 1.1 Tambah model `Kelompok` (nama unik, ketuaId? unik → Pengrajin, createdAt) di `prisma/schema.prisma`
- [ ] 1.2 Tambah model `Pengrajin` (nama unik, kelompokId?, tarifCadangan Int?, satuanTarif String, penerimaUpah String default "SENDIRI", aktif Boolean, createdAt, updatedAt) dengan indeks pada `aktif` dan `kelompokId`; relasi ganda ke `Kelompok` (sebagai anggota dan sebagai ketua)
- [ ] 1.3 Tambah model `TarifPengrajin` (pengrajinId, productId, tarif Int, createdAt, updatedAt) dengan `@@unique([pengrajinId, productId])`
- [ ] 1.4 Tambah model `Penugasan` (transactionItemId, pengrajinId, jumlahDitugaskan Int, tenggat DateTime, catatan?, pembuatId?, pembuatNama?, createdAt, updatedAt) dengan indeks pada `transactionItemId`, `pengrajinId`, dan `tenggat`
- [ ] 1.5 Tambah model `Setoran` (penugasanId, pengrajinId **pekerja**, penerimaId **pemilik saldo**, tanggal, jumlah Int, tarifSnapshot Int, pakaiTarifCadangan Boolean, nilai Int, catatan?, pencatatId?, pencatatNama?, createdAt) dengan indeks pada `pengrajinId`, `penerimaId`, dan `tanggal`
- [ ] 1.6 Tambah model `Penarikan` (pengrajinId **penerima**, tanggal, nominal Int, expenseId? unik, catatan?, pencatatId?, pencatatNama?, createdAt) dengan indeks pada `pengrajinId` dan `tanggal`
- [ ] 1.7 Tambah relasi balik pada `TransactionItem` (`penugasan Penugasan[]`) dan `Product` (`tarifPengrajin TarifPengrajin[]`) — tidak mengubah kolom yang sudah ada
- [ ] 1.8 Tinjau SQL dengan `prisma migrate diff` (pastikan murni penambahan), lalu `prisma db push` + `prisma generate`
- [ ] 1.9 Buat `lib/pengrajin.ts`: `hitungSaldo`, `sisaPenugasan`, `sisaBelumDitugaskan`, `terlambat`, `tentukanPenerima`, `tentukanTarif` (tarif produk → tarif cadangan → tolak), dan validator tarif/jumlah/penerimaUpah

## 2. API master pengrajin & kelompok

- [ ] 2.1 Buat `app/(backend)/api/pengrajin/route.ts` — `GET` (daftar + beban kerja aktif + saldo) dan `POST`, memakai `requireRole(["Owner","Admin"])` untuk tulis
- [ ] 2.2 Buat `app/(backend)/api/pengrajin/[id]/route.ts` — `GET` (rinci + riwayat setoran & penarikan), `PATCH`, `DELETE`
- [ ] 2.3 Tolak `DELETE` bila pengrajin masih punya setoran atau saldo; sarankan menonaktifkan
- [ ] 2.4 Buat `app/(backend)/api/kelompok/route.ts` — `GET`, `POST`, dan `PATCH`/`DELETE` per id; `ketuaId` merujuk pengrajin, bukan teks bebas
- [ ] 2.5 Buat `app/(backend)/api/pengrajin/[id]/tarif/route.ts` — `GET` daftar tarif per produk, `PUT` menetapkan/mengubah satu tarif, `DELETE` menghapusnya
- [ ] 2.6 Validasi `penerimaUpah`: `KETUA` wajib punya kelompok yang berketua dan bukan dirinya sendiri; pengrajin yang menjadi ketua wajib `SENDIRI` (cegah rantai berputar)
- [ ] 2.7 Validasi server: nama unik (dinormalisasi UPPERCASE), semua tarif bulat > 0; tolak 400 dengan pesan berbahasa Indonesia
- [ ] 2.8 Catat aksi buat/ubah/hapus/nonaktifkan/ubah-tarif ke `lib/activityLog.ts`

## 3. API penugasan

- [ ] 3.1 Buat `app/(backend)/api/penugasan/route.ts` — `POST` menetapkan penugasan pada sebuah `transactionItemId`
- [ ] 3.2 Validasi: `jumlahDitugaskan` > 0 dan total seluruh penugasan pada baris itu tidak melebihi `jumlah` dipesan; pesan galat menyebut sisa yang masih boleh ditugaskan
- [ ] 3.3 Buat `app/(backend)/api/penugasan/[id]/route.ts` — `PATCH` (pindah pengrajin, ubah jumlah/tenggat) dan `DELETE`
- [ ] 3.4 Tolak `DELETE` dan pengurangan jumlah di bawah total setoran bila penugasan sudah punya setoran
- [ ] 3.5 Buat `app/(backend)/api/papan-tugas/route.ts` — kembalikan tiga blok: penugasan aktif per pengrajin, baris belum/kurang ditugaskan, dan beban kerja per pengrajin
- [ ] 3.6 Batasi papan tugas pada pesanan yang belum Selesai, dan hitung penanda terlambat memakai batas hari WIB dari `lib/waktu.ts`
- [ ] 3.7 Catat aksi penugasan ke log aktivitas

## 4. API setoran

- [ ] 4.1 Buat `app/(backend)/api/setoran/route.ts` — `POST` mencatat setoran terhadap sebuah penugasan
- [ ] 4.2 Tentukan tarif lewat `tentukanTarif`: tarif produk → tarif cadangan → tolak 400 menyebut nama pengrajin & produknya. Simpan `tarifSnapshot` dan `pakaiTarifCadangan`
- [ ] 4.3 Hitung `nilai = jumlah × tarifSnapshot`, sehingga perubahan tarif kelak tidak mengubah setoran lama
- [ ] 4.4 Tentukan `penerimaId` lewat `tentukanPenerima` (SENDIRI → dirinya; KETUA → ketua kelompoknya) lalu simpan, jangan dihitung ulang saat dibaca
- [ ] 4.5 Validasi: total setoran tidak melebihi `jumlahDitugaskan`; pesan galat menyebut sisa sebenarnya
- [ ] 4.6 Buat `app/(backend)/api/setoran/[id]/route.ts` — `DELETE` untuk koreksi salah catat (saldo penerima yang berkurang)
- [ ] 4.7 Ambil tanggal setoran lewat `dariTanggalInputWIB`, bawaannya hari ini
- [ ] 4.8 Catat aksi setoran & penghapusannya ke log aktivitas, sebut pekerja dan penerimanya bila berbeda

## 5. API upah (saldo & penarikan)

- [ ] 5.1 Buat `app/(backend)/api/upah/route.ts` — `GET` rekap saldo seluruh pengrajin + total terutang, memakai `requireRole(["Owner"])`
- [ ] 5.2 Buat `app/(backend)/api/penarikan/route.ts` — `POST` mencatat penarikan penuh atau sebagian
- [ ] 5.3 Validasi nominal > 0 dan tidak melebihi saldo; tolak penarikan atas nama pengrajin berpenanda `KETUA` dan arahkan ke ketuanya; pesan galat menyebut saldo tersedia
- [ ] 5.4 Dalam satu `prisma.$transaction`: buat `Penarikan` **dan** `Expense` berkategori `Upah Pengrajin` bertanggal sama, lalu simpan `expenseId` pada penarikan
- [ ] 5.5 Buat `app/(backend)/api/penarikan/[id]/route.ts` — `DELETE` yang menghapus penarikan beserta `Expense` tertautnya dalam satu transaksi basis data
- [ ] 5.6 Pastikan tidak ada jalur yang menulis saldo secara langsung — saldo selalu hasil agregasi
- [ ] 5.7 Catat aksi penarikan & penghapusannya ke log aktivitas

## 6. Halaman Pengrajin

- [ ] 6.1 Buat `app/(frontend)/pengrajin/page.tsx` mengikuti tema: `lina-page-stack space-y-6`, panel `lina-panel rounded-2xl border`, judul `text-2xl font-black` + ikon `text-pink-500`
- [ ] 6.2 Kartu ringkasan: jumlah pengrajin aktif dan **total saldo upah terutang** (dengan keterangan bahwa ini kewajiban yang belum masuk laba)
- [ ] 6.3 Daftar pengrajin per kelompok, memuat jumlah pekerjaan aktif dan saldo; pengrajin berpenanda `KETUA` menyatakan "upah masuk ke <nama ketua>" alih-alih menampilkan saldo nol tanpa penjelasan
- [ ] 6.4 Form tambah/ubah pengrajin (nama, kelompok, penerima upah, tarif cadangan, satuan) dan pengelolaan kelompok beserta ketuanya
- [ ] 6.4a Editor tarif per produk untuk seorang pengrajin, dengan penanda jelas produk mana yang masih memakai tarif cadangan supaya tidak terlupakan
- [ ] 6.5 Aksi nonaktifkan/aktifkan, dan hapus dengan penjelasan bila ditolak karena ada riwayat
- [ ] 6.6 Panel rinci per pengrajin: riwayat setoran & penarikan berurutan waktu beserta saldo berjalan
- [ ] 6.7 Tombol **Tarik Upah** (penuh/sebagian) dengan pratinjau sisa saldo sebelum disimpan
- [ ] 6.8 Umpan balik memakai `lib/toast.ts`

## 7. Halaman Papan Tugas

- [ ] 7.1 Buat `app/(frontend)/papan-tugas/page.tsx`, mobile-first — dipakai pagi hari sambil menyiapkan barang
- [ ] 7.2 Blok teratas **"Belum ditugaskan"**: baris pesanan tanpa pengrajin atau yang kurang, menyebut toko, produk, dan jumlah sisa
- [ ] 7.3 Tetapkan penugasan langsung dari baris itu — pilih pengrajin, tenggat (bawaan 3 hari), jumlah (bawaan sisa penuh)
- [ ] 7.4 Blok **pekerjaan aktif per pengrajin**: produk, toko, nota, ditugaskan/disetor/sisa, dan tenggat
- [ ] 7.5 Tandai penugasan terlambat secara visual dan urutkan lebih dulu
- [ ] 7.6 Tombol **Catat Setoran** pada tiap baris, dengan jumlah sisa terisi otomatis supaya lebih cepat daripada menulis di kertas
- [ ] 7.7 Blok **siapa masih kosong**: pengrajin aktif diurutkan dari beban kerja paling sedikit
- [ ] 7.8 Tampilan kedua: kelompokkan per toko alih-alih per pengrajin
- [ ] 7.9 Aksi pindah pengrajin & ubah tenggat dari papan
- [ ] 7.10 Tambahkan tautan Papan Tugas dan Pengrajin ke sidebar (bottom nav sengaja tidak disentuh — sudah penuh 5 ikon)

## 8. Integrasi dengan yang sudah ada

- [ ] 8.1 Dashboard: tambahkan kartu **saldo upah terutang** yang menautkan ke halaman Pengrajin
- [ ] 8.2 Halaman Pengeluaran: baris `Upah Pengrajin` hasil penarikan ditampilkan dengan penanda bahwa ia berasal dari penarikan upah dan tidak boleh diubah dari sana
- [ ] 8.3 Cegah penghapusan/pengubahan `Expense` yang tertaut ke `Penarikan` dari endpoint pengeluaran — arahkan ke halaman Pengrajin
- [ ] 8.4 Status Pesanan: tampilkan ringkasan penugasan per nota (siapa saja yang memegang) sebagai ganti kolom `nama_pengrajin` teks bebas
- [ ] 8.5 Verifikasi checklist packing tidak terpengaruh — `packed` dan penugasan adalah dua tahap terpisah dan boleh berbeda

## 9. Verifikasi

- [ ] 9.1 Uji pembagian: satu nota ke dua pengrajin, dan satu baris dibagi ke dua pengrajin; total penugasan tidak boleh melebihi jumlah dipesan
- [ ] 9.2 Uji setoran: penuh, sebagian, bertahap sampai tuntas, melebihi sisa (ditolak), dan penghapusan yang mengembalikan sisa penugasan
- [ ] 9.3 Uji tarif snapshot: ubah tarif setelah ada setoran, pastikan nilai setoran lama tidak berubah
- [ ] 9.3a Uji penentuan tarif: tarif produk dipakai bila ada; jatuh ke tarif cadangan bila belum ada; ditolak dengan pesan jelas bila dua-duanya kosong
- [ ] 9.3b Uji tarif berbeda antar pengrajin untuk produk sama, dan antar produk untuk pengrajin sama
- [ ] 9.4 Uji saldo & penarikan: penuh, sebagian, melebihi saldo (ditolak), dan penghapusan yang mengembalikan saldo
- [ ] 9.4a Uji penerusan upah: setoran anggota berpenanda `KETUA` menambah saldo ketua dan bukan saldo anggota; riwayat kerja tetap pada anggota; penarikan atas nama anggota ditolak
- [ ] 9.4b Uji penjaga master: `KETUA` tanpa kelompok/tanpa ketua ditolak, dan ketua yang ditandai `KETUA` ditolak
- [ ] 9.5 Uji integrasi Laba Rugi: penarikan Rp1,5 jt memunculkan satu `Expense` `Upah Pengrajin` bertanggal sama dan mengurangi laba bulan itu; menghapus penarikan menghapus `Expense`-nya
- [ ] 9.6 Uji batas WIB: setoran pukul 00:30 dan 23:30 WIB jatuh ke tanggal yang benar; tenggat kemarin ditandai terlambat
- [ ] 9.7 Uji otorisasi: tanpa sesi ditolak 401; Admin ditolak pada rekap upah; identitas dari body diabaikan
- [ ] 9.8 `npx tsc --noEmit -p tsconfig.json` bersih, dan ESLint tidak menambah error baru dibanding sebelum perubahan
- [ ] 9.9 Uji tampilan 360px untuk Papan Tugas dan Pengrajin
- [ ] 9.10 Isi master pengrajin bersama pemilik (nama, kelompok, tarif) — prasyarat sebelum papan tugas bisa dipakai
- [ ] 9.11 Uji coba satu hari kirim dengan pencatatan ganda (papan tugas **dan** kertas) sebelum kertasnya ditinggalkan
