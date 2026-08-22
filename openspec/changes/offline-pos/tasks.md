> Cakupan dipersempit 22 Agustus 2026. Tugas service worker & cache app shell
> dihapus dari daftar ini karena sudah selesai lewat `cache-aset-offline`.

## 1. Fondasi antrean lokal

- [ ] 1.1 Penyimpanan IndexedDB untuk antrean transaksi (skema, versi, migrasi)
- [ ] 1.2 Simpan katalog produk seperlunya agar keranjang bisa disusun offline
- [ ] 1.3 Deteksi status online/offline (`navigator.onLine` + event, plus uji-hidup ke server)

## 2. Idempotensi server

- [ ] 2.1 Tambah `clientTxnId` unik pada transaksi + indeks unik di basis data
- [ ] 2.2 Endpoint transaksi menolak duplikat dan mengembalikan transaksi yang sudah ada, bukan error
- [ ] 2.3 Tentukan kapan `trxNumber` diberikan — saat sinkron di server, bukan di perangkat
- [ ] 2.4 Tentukan perlakuan stok saat transaksi masuk dari antrean (termasuk bila stok sudah habis diambil perangkat lain)

## 3. Alur POS offline

- [ ] 3.1 Saat offline, "Selesaikan Pesanan" menyimpan ke antrean lokal dan menandainya belum tersinkron
- [ ] 3.2 Saat online kembali, antrean dikirim berurutan; tandai sukses/gagal per transaksi
- [ ] 3.3 Indikator status jaringan + jumlah transaksi tertunda di UI POS
- [ ] 3.4 Transaksi yang gagal sinkron tidak hilang diam-diam — ada daftar dan tombol coba lagi

## 4. Batasan & verifikasi

- [ ] 4.1 Fitur yang tetap wajib online (laporan, piutang, cetak dokumen server) menampilkan pesan jelas saat offline
- [ ] 4.2 Uji: matikan jaringan → buat transaksi → nyalakan → tersinkron tanpa duplikat
- [ ] 4.3 Uji duplikat sengaja: kirim ulang antrean yang sama dua kali → tetap satu transaksi
- [ ] 4.4 Uji dua perangkat offline membuat transaksi atas produk yang stoknya tinggal sedikit → perilaku sesuai keputusan design, tidak diam-diam minus
