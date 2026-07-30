## Context

Change `pengeluaran-piutang-laba` baru saja menutup sisi keuangan: pengeluaran, piutang, dan laporan laba rugi sudah berjalan di produksi. Satu lubang yang sengaja ditinggalkan di sana adalah **upah pengrajin** — untuk sementara harus dicatat manual sebagai pengeluaran biasa. Change ini menutupnya sekaligus menyelesaikan tiga keluhan operasional yang paling sering memicu cekcok.

Keadaan sekarang:

- `Transaction.nama_pengrajin` adalah satu kolom **teks bebas** yang diisi dari halaman Status Pesanan (`app/(backend)/api/status-pesanan/route.ts`). Satu nama untuk seluruh nota — tidak cukup, karena tiap jenis produk dalam satu orderan bisa dikerjakan orang berbeda.
- `TransactionItem` sudah punya `packed` dan `packedAt` untuk checklist packing. Penugasan pengrajin adalah tahap **sebelum** itu.
- Tidak ada entitas pengrajin, tidak ada tenggat, tidak ada catatan upah.

Kendala yang membentuk desain ini:

- **Pemakainya bibi pemilik, pagi-pagi, sambil mengangkat barang.** Ia datang pukul 08.00 dan mobil harus segera berangkat. Papan tugas harus terbaca dalam sekali lihat di layar ponsel, dan mencatat setoran harus cukup beberapa ketukan.
- **Penugasan tetap diinput orang rumah.** Pengrajin tidak diberi akun login — mereka dihubungi lewat WhatsApp seperti biasa. Sistem ini alat pantau bagi keluarga, bukan portal pengrajin.
- **Uang harus akurat.** Upah adalah utang nyata ke orang. Angka saldo tidak boleh bisa diubah tanpa jejak, dan tarif yang berubah tidak boleh mengubah nilai setoran lama.
- Fondasi yang wajib dipakai ulang: `lib/apiAuth.ts`, `lib/activityLog.ts`, `lib/waktu.ts` (batas hari WIB), `lib/pengeluaran.ts` (kategori `Upah Pengrajin` sudah ada), dan pola tema `lina-panel` / `lina-page-stack`.

## Goals / Non-Goals

**Goals:**

- Menjawab "siapa mengerjakan apa" dan "orderan mana yang belum dipegang siapa pun" dalam satu layar.
- Menghilangkan tebak-tebakan siapa yang masih menganggur.
- Mengubah setoran fisik menjadi saldo upah otomatis, dapat ditarik penuh atau sebagian, dengan riwayat yang tak bisa dimanipulasi.
- Memasukkan upah ke laporan Laba Rugi tanpa input ganda.
- Tidak merusak apa pun yang sudah berjalan: checklist packing, status pesanan, nota, dan laporan.

**Non-Goals:**

- Akun login untuk pengrajin, notifikasi WhatsApp otomatis, atau portal setoran mandiri.
- Kuota bahan baku 1:1 per pengrajin — menunggu `bom-inventory` menyediakan data bahan.
- Penjadwalan otomatis (sistem menyarankan siapa mengerjakan apa). Sistem hanya **menampilkan** beban kerja; keputusan tetap manusia.
- Penilaian kualitas atau catatan barang cacat.

## Decisions

### 1. Penugasan menempel pada `TransactionItem`, bukan pada `Transaction`

Tabel `Penugasan` memakai `transactionItemId` sebagai kunci.

*Alasan:* ini inti keluhan nomor 3. Satu nota Toko A bisa memuat Bando Satin (Mama Uri) dan Bando Pompom (Mama Ari). Kolom `nama_pengrajin` per nota secara struktural tidak mampu menyimpan itu, sebanyak apa pun UI-nya diperbaiki.

*Alternatif yang ditolak:* memperbaiki `Transaction.nama_pengrajin` menjadi daftar nama. Tetap tidak bisa menjawab "berapa gross yang dipegang siapa" maupun "sisa berapa".

### 2. Satu baris boleh dibagi ke beberapa pengrajin (relasi satu-ke-banyak)

`Penugasan` menyimpan `jumlahDitugaskan`, dan satu `TransactionItem` boleh punya beberapa penugasan. Jumlah seluruh penugasan divalidasi ≤ jumlah dipesan.

*Alasan:* pesanan besar memang dipecah — 5 gross bisa dikerjakan dua orang supaya selesai tepat waktu.

*Trade-off:* validasi jadi lebih rumit dan "sisa belum ditugaskan" harus dihitung, bukan sekadar diperiksa null. Diterima karena tanpa ini pesanan besar tidak bisa dimodelkan sama sekali.

### 3. `Transaction.nama_pengrajin` dipertahankan tetapi berhenti dipakai

Kolomnya tidak dihapus dan nilainya yang sudah ada tidak diubah.

*Alasan:* sama dengan alasan mempertahankan `Transaction.status` pada change sebelumnya — halaman Status Pesanan dan log aktivitas sudah membacanya. Menghapusnya berarti menyentuh kode stabil demi kerapian yang tidak dirasakan pengguna. Field ini menjadi catatan sejarah.

*Aturan yang mengikat:* tidak ada fitur baru yang membaca kolom ini untuk mengambil keputusan.

### 4. Setoran adalah satu-satunya kejadian yang menggerakkan dua hal

Satu baris `Setoran` sekaligus (a) mengurangi sisa penugasan di papan tugas dan (b) menambah saldo upah.

*Alasan:* inilah sebabnya papan tugas dan upah digabung dalam satu change. Kalau dipisah, "barang sudah disetor" harus dicatat dua kali di dua tempat — dan begitu keduanya bisa berbeda, tidak ada lagi yang bisa dipercaya.

### 5. Saldo dihitung dari buku besar, bukan disimpan sebagai kolom

`saldo = Σ Setoran.nilai − Σ Penarikan.nominal`, dihitung saat dibaca.

*Alasan:* ini uang yang menjadi utang ke orang. Kolom saldo yang bisa ditulis langsung adalah pintu masuk manipulasi dan penyebab angka melenceng saat ada kegagalan di tengah proses. Volume datanya kecil (belasan pengrajin, puluhan setoran per bulan), jadi agregasi murah.

*Alternatif yang ditolak:* kolom `saldo` yang di-increment. Lebih cepat, tetapi kehilangan sifat "tidak bisa diubah tanpa jejak" yang justru menjadi alasan fitur ini dibuat.

### 6. Tarif disimpan sebagai snapshot pada setiap setoran

`Setoran.tarifSnapshot` diisi dari tarif yang berlaku saat setoran dicatat.

*Alasan:* tarif naik dari waktu ke waktu. Tanpa snapshot, menaikkan tarif akan diam-diam mengubah nilai setoran berbulan-bulan lalu — dan saldo yang sudah dibayar jadi tidak cocok. Pola ini sama dengan `basePrice`/`priceModifier` pada `TransactionItem` yang sudah ada di repo.

### 6a. Tarif per pasangan pengrajin × produk, dengan tarif cadangan per orang

Tabel `TarifPengrajin(pengrajinId, productId, tarif)` unik per pasangan, ditambah kolom opsional `Pengrajin.tarifCadangan`.

Urutan penentuan tarif saat setoran dicatat:

1. `TarifPengrajin` untuk pasangan pengrajin & produk itu, bila ada
2. `Pengrajin.tarifCadangan`, bila ada
3. bila keduanya kosong → **tolak** dengan pesan menyebut nama pengrajin dan produknya

*Alasan pilihan ini (diputuskan pemilik):* produk yang lebih rumit memang dibayar lebih tinggi, dan besarannya berbeda antar orang. Satu angka per orang tidak mencerminkan kenyataan.

*Alasan tarif cadangan:* tanpa langkah 2, satu produk baru akan membuat setoran tidak bisa dicatat tepat di pagi tersibuk — persis waktu ketika orang paling tidak punya kesabaran untuk membuka halaman master dan mengisi tarif. Tarif cadangan mengubah kegagalan keras menjadi perkiraan yang bisa dikoreksi belakangan.

*Trade-off:* tabel tarif tumbuh sebesar (jumlah pengrajin × jumlah produk yang ia kerjakan) dan perlu dirawat. Halaman Pengrajin MUST memperlihatkan produk mana yang masih memakai tarif cadangan, supaya yang belum diisi tidak terlupakan diam-diam.

### 6b. Setoran mencatat pekerja dan penerima secara terpisah

`Setoran.pengrajinId` = yang mengerjakan. `Setoran.penerimaId` = yang saldonya bertambah. Penerima diturunkan dari `Pengrajin.penerimaUpah` (`SENDIRI` atau `KETUA`) saat setoran dibuat, lalu disimpan.

*Alasan (diputuskan pemilik):* di lapangan campur — sebagian pengrajin dibayar langsung, sebagian lewat ketua kelompoknya yang lalu membagi sendiri. Kalau saldo hanya per individu, alur lewat ketua tidak terwakili; kalau hanya per kelompok, yang dibayar langsung jadi hilang jejaknya.

*Konsekuensi yang disengaja:* riwayat kerja tetap menempel pada pekerjanya walau upahnya masuk ke ketua. Jadi pertanyaan "Mama Ari sudah mengerjakan apa saja bulan ini" tetap terjawab, sekalipun saldonya nol.

*Aturan penjaga:* ketua kelompok MUST bernilai `SENDIRI`, dan `KETUA` MUST punya kelompok yang berketua — supaya tidak ada rantai penerusan berputar atau upah yang tidak jelas tujuannya. Ini divalidasi saat menyimpan master, bukan saat setoran, agar kesalahannya ketahuan lebih awal.

*Alternatif yang ditolak:* menyimpan saldo di `Kelompok` alih-alih di ketua. Ketua juga bekerja sendiri (bibi pemilik adalah salah satu pengrajin), jadi saldonya akan bercampur antara upah pribadinya dan limpahan anggota tanpa cara memisahkan. Menaruh saldo pada pengrajin-yang-menjadi-ketua membuat keduanya satu kantong yang memang begitu kenyataannya.

### 7. Biaya diakui saat **penarikan**, bukan saat setoran

`Penarikan` membuat satu baris `Expense` berkategori `Upah Pengrajin` dan menyimpan `expenseId`-nya.

*Alasan:* konsisten dengan basis kas yang sudah dipilih pada change sebelumnya — biaya diakui saat uang keluar. Kalau setoran langsung dibebankan, laporan kas akan mencatat pengeluaran yang belum benar-benar terjadi, karena upah bisa menumpuk berminggu-minggu sebelum dicairkan.

*Konsekuensi yang disadari:* saldo upah terutang adalah kewajiban yang belum muncul di Laba Rugi. Halaman pengrajin MUST menampilkan total saldo terutang agar tidak terlupakan.

*Alternatif yang ditolak:* mengakui biaya saat setoran (basis akrual). Lebih tepat secara akuntansi, tetapi membuat dua basis bercampur dalam satu laporan — dan penjelasan "kenapa dua angkanya berbeda" yang sudah ada di halaman Laba Rugi akan jadi menyesatkan.

### 8. Penarikan dan `Expense` ditulis dalam satu transaksi basis data

Keduanya dibuat dan dihapus bersama-sama, memakai `prisma.$transaction`.

*Alasan:* kalau salah satu gagal, halaman Pengrajin dan halaman Laba Rugi akan menampilkan angka berbeda untuk kejadian yang sama — tepat jenis ketidakpercayaan yang membuat orang kembali ke buku tulis.

### 9. Pengrajin dinonaktifkan, tidak dihapus

`Pengrajin.aktif` sebagai penanda. Penghapusan ditolak bila ada riwayat setoran atau saldo.

*Alasan:* menghapus pengrajin akan melubangi riwayat upah dan laporan biaya bulan-bulan lampau.

### 10. Papan tugas adalah halaman terpisah `/papan-tugas`

Bukan tab di dalam Status Pesanan.

*Alasan:* penggunanya, waktunya, dan pertanyaannya berbeda. Status Pesanan menjawab "pesanan ini sudah sampai tahap mana"; papan tugas menjawab "siapa harus mengerjakan apa hari ini". Menumpuknya di satu halaman membuat keduanya lebih sulit dibaca justru di jam tersibuk.

## Risks / Trade-offs

**Penugasan tidak diisi, lalu papan tugas kosong dan diabaikan.** Ini risiko terbesar dan sifatnya perilaku. Kalau Mama tetap mengirim tugas lewat WhatsApp tanpa mencatatnya, papan tugas hanya jadi pekerjaan tambahan.
→ Daftar "belum ditugaskan" dibuat menonjol di puncak halaman, sehingga papan tugas tetap berguna bahkan saat belum ada satu pun penugasan — ia langsung memperlihatkan pekerjaan yang belum dibagi. Menetapkan penugasan dirancang cukup dua ketukan dari baris itu: pilih pengrajin, pilih tenggat.

**Membagi satu baris ke beberapa pengrajin membuat papan tugas ramai** saat pesanan besar.
→ Papan dikelompokkan per pengrajin lebih dulu, bukan per nota, sehingga tiap orang melihat daftarnya sendiri. Pengelompokan per toko tersedia sebagai tampilan kedua.

**Setoran dicatat belakangan, bukan saat barang diterima.** Kalau baru diisi malam hari, papan tugas di pagi berikutnya sudah kedaluwarsa.
→ Form setoran dibuat langsung dari baris papan tugas dengan jumlah sisa terisi otomatis, supaya mencatat lebih cepat daripada menulis di kertas. Tetap tidak ada jaminan teknis untuk ini — perlu kesepakatan dengan bibi.

**Upah terutang tak terlihat di Laba Rugi.** Konsekuensi keputusan 7: laba bulan ini bisa terlihat bagus padahal ada saldo upah besar yang belum dibayar.
→ Total saldo terutang ditampilkan di halaman Pengrajin dan sebagai kartu di Dashboard, dengan keterangan bahwa itu kewajiban yang belum masuk laba.

**Tenggat yang tidak realistis membuat semua baris tampak terlambat**, lalu penanda merah kehilangan arti.
→ Tenggat diisi manual oleh yang menugaskan, bukan otomatis, dan bawaannya 3 hari dari hari penugasan sesuai lama pengerjaan yang biasa (2–4 hari).

## Migration Plan

1. **Migrasi skema** — tambah `Kelompok`, `Pengrajin`, `Penugasan`, `Setoran`, `Penarikan`. Seluruhnya penambahan; `Transaction` dan `TransactionItem` tidak diubah selain menerima relasi baru. Dijalankan dengan `prisma db push` seperti change sebelumnya (repo ini tidak memakai folder migrations).
2. **Tidak ada backfill.** `Transaction.nama_pengrajin` dibiarkan sebagai catatan sejarah. Penugasan dimulai dari pesanan baru.
3. **Isi master pengrajin** bersama pemilik: nama, kelompok, dan tarif per unit. Ini prasyarat sebelum penugasan bisa dipakai, dan butuh satu sesi tanya-jawab — tarif tiap orang belum tentu sama.
4. **Rilis API** lalu **rilis antarmuka**: halaman Pengrajin lebih dulu (agar master bisa diisi), baru Papan Tugas.
5. **Uji coba satu hari kirim** dengan pencatatan ganda (papan tugas **dan** kertas seperti biasa), untuk membandingkan hasilnya sebelum kertasnya ditinggalkan.

**Rollback:** halaman dan tautan dapat dilepas tanpa memengaruhi fitur lain, karena tidak ada alur lama yang bergantung pada tabel baru. `Expense` hasil penarikan dapat ditemukan lewat `Penarikan.expenseId`. Tabel baru boleh ditinggalkan begitu saja bila fiturnya dibatalkan.

## Open Questions

1. ~~Tarif per pengrajin atau per produk?~~ **Terjawab 30 Juli 2026:** per pasangan pengrajin × produk, dengan tarif cadangan per orang. Lihat keputusan 6a.
2. ~~Kelompok dan upah.~~ **Terjawab 30 Juli 2026:** campur — sebagian dibayar langsung, sebagian lewat ketua. Lihat keputusan 6b.
3. **Satuan setoran.** Penugasan memakai satuan pesanan (gross/lusin/pcs). Apakah tarif upah selalu mengikuti satuan yang sama, atau ada pengrajin yang dibayar per pcs meski pesanannya per gross? Desain saat ini mengasumsikan satuan tarif sama dengan satuan pesanan; kalau tidak, perlu konversi dan `satuanTarif` menjadi wajib dipakai dalam perhitungan, bukan sekadar label.
4. **Barang cacat.** Kalau dari 3 gross setoran ada yang tidak layak kirim, apakah upahnya dipotong? Desain saat ini menganggap seluruh setoran dibayar penuh. Kalau perlu dipotong, cara paling sederhana adalah mencatat setoran sejumlah yang layak saja, lalu sisanya tetap menggantung di papan tugas sebagai pekerjaan ulang.
5. **Perubahan tarif dan setoran yang belum ditarik.** Bila tarif naik sementara ada saldo dari setoran lama, saldo itu tetap memakai tarif lama (sesuai keputusan 6). Perlu dipastikan pemilik setuju bahwa kenaikan tarif tidak berlaku surut.
