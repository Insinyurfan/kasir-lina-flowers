## Why

Aplikasi ini hanya mencatat **uang masuk**. Tidak ada satu pun angka biaya di basis data, sehingga "Total Pendapatan Lunas" di halaman Laporan sebenarnya **omzet**, bukan laba. Akibatnya pemilik usaha tidak bisa menjawab pertanyaan paling mendasar: usaha ini untung berapa, dan ke mana perginya uang itu.

Tiga kebocoran yang saat ini tak terlihat sama sekali:

1. **Modal muter dikira untung** — uang tagihan Toko A langsung dipakai membeli bahan untuk orderan Toko B. Saldo bank terlihat tebal di bulan ramai (Agustus, Desember), lalu menipis drastis di bulan sepi karena tidak pernah benar-benar surplus.
2. **Kas usaha dan kas pribadi menyatu** — setiap pengambilan pribadi tidak terasa satuan, tapi akumulasinya menggerus modal kerja tanpa jejak.
3. **Piutang dikira uang** — omzet tercatat saat barang dikirim, padahal pembayaran toko menyusul belakangan. Penagihan masih manual: memfoto nota lalu mengirimkannya lewat WhatsApp satu per satu, tanpa daftar siapa yang belum bayar dan sudah berapa lama.

Perubahan ini membangun sisi "uang keluar" dan "uang belum masuk", lalu mempertemukannya dengan omzet yang sudah ada menjadi satu angka laba.

## What Changes

- **Catatan Pengeluaran** (ramah-HP, diisi saat masih di jalan): nominal, tanggal, kategori, catatan, metode bayar, dan **foto struk** opsional.
- **Kategori pengeluaran** baku: Bahan Baku, Transport (bensin/tol/parkir), Konsumsi, Upah Pengrajin, Operasional Lain, dan **Ambilan Pribadi (Prive)**.
- **Prive diperlakukan khusus**: masuk arus kas (mengurangi uang riil) tetapi **tidak mengurangi laba**, karena itu pembagian keuntungan, bukan biaya usaha. Ditampilkan sebagai baris tersendiri agar akumulasinya terlihat.
- **Pembayaran per transaksi**, termasuk **pembayaran sebagian** (toko mencicil). Status Lunas/Belum Lunas berhenti diisi manual — diturunkan dari total pembayaran yang tercatat.
- **Halaman Piutang**: daftar transaksi yang belum lunas per pelanggan, sisa tagihan, dan **umur piutang** (0–7 / 8–14 / 15–30 / >30 hari). Ada tombol menyalin teks penagihan siap kirim ke WhatsApp.
- **Halaman Laba Rugi** per periode yang menampilkan **dua angka berdampingan**:
  - **Laba usaha (akrual)** = omzet transaksi terkirim − biaya usaha (tanpa prive). Menjawab "usaha ini untung atau tidak".
  - **Uang riil (kas)** = pembayaran diterima − seluruh pengeluaran termasuk prive. Menjawab "kenapa uangnya habis".
  - Selisih keduanya dijelaskan eksplisit (piutang berjalan + prive), karena justru selisih inilah gejala yang dirasakan pemilik.
- **Kartu ringkas di Dashboard**: piutang berjalan, pengeluaran bulan ini, laba bulan berjalan.
- **Bukan bagian dari perubahan ini** (sengaja ditunda): HPP moving-average, rekonsiliasi kas fisik harian, dan laba per produk. Ketiganya butuh data bahan baku yang belum ada dan akan ditangani `bom-inventory` serta sisa `petty-cash-hpp`.

## Capabilities

### New Capabilities

- `expense-tracking`: Pengeluaran usaha dicatat dengan kategori baku, bukti foto opsional, dan pemisahan tegas antara biaya usaha dan ambilan pribadi (prive).
- `receivables-tracking`: Setiap transaksi dapat menerima pembayaran penuh maupun sebagian; sisa tagihan dan umur piutang terpantau per pelanggan, dan status lunas diturunkan dari pembayaran (bukan diisi manual).
- `profit-report`: Sistem menyajikan laba usaha (akrual) dan posisi kas (uang riil) untuk suatu periode secara berdampingan, beserta penjelasan selisih antara keduanya.

### Modified Capabilities

<!-- Belum ada spec yang terekam di openspec/specs/, jadi tidak ada kapabilitas
     terdahulu yang requirement-nya berubah. Status Lunas/Belum Lunas yang kini
     diturunkan dari pembayaran dicatat sebagai bagian dari `receivables-tracking`. -->

## Impact

- **Model data**:
  - `Expense` (tanggal, nominal, kategori, catatan, metode bayar, fotoUrl, pencatat).
  - `Payment` (transactionId, tanggal, nominal, metode, catatan, pencatat) — sumber kebenaran baru untuk pelunasan.
  - `Transaction` menerima kolom turunan/pendukung untuk sisa tagihan dan jatuh tempo. `status` tetap ada demi kompatibilitas tetapi **tidak lagi diisi manual dari UI**.
- **Migrasi data**: transaksi lama berstatus `Paid` perlu dibuatkan satu baris `Payment` senilai `total_harga` bertanggal transaksi, agar riwayat tidak mendadak terlihat menunggak. Transaksi `Unpaid` dibiarkan tanpa pembayaran.
- **API**: rute baru `pengeluaran` (CRUD), `pembayaran` (catat/hapus), `piutang` (daftar + agregat umur), dan perluasan `laporan` untuk laba rugi. Seluruhnya memakai `lib/apiAuth.ts` yang sudah ada — identitas dari sesi, bukan body.
- **UI**: halaman Pengeluaran (mobile-first, tombol input besar), halaman Piutang, bagian Laba Rugi di halaman Laporan, kartu Dashboard, dan penghapusan pemilihan status Lunas manual di POS serta Riwayat Penjualan.
- **Upload**: foto struk memakai mekanisme unggah gambar yang sudah ada (`api/upload`).
- **Peran**: pencatatan pengeluaran & pembayaran terbuka untuk Owner/Admin; laporan laba rugi hanya Owner.
- **Keterbatasan yang disadari**: biaya diakui berbasis kas (bahan dibeli hari ini = beban hari ini), sehingga laba bulanan bisa bergelombang bila belanja bahan menumpuk di satu hari. Ini diterima demi kesederhanaan input dan akan diperhalus saat `bom-inventory` menyediakan data persediaan.
- **Perubahan pada rencana lain**: draf `petty-cash-hpp` menyusut menjadi khusus HPP moving-average & rekonsiliasi kas fisik; bagian input pengeluarannya digantikan change ini.
