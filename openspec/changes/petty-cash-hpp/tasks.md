> Cakupan dipersempit 22 Agustus 2026. Tugas "input pengeluaran + foto struk"
> dihapus dari daftar ini karena sudah selesai lewat `pengeluaran-piutang-laba`.

## 1. Rekonsiliasi kas — tidak bergantung pada change lain

- [ ] 1.1 Tabel `CashReconciliation` (tanggal, cashMasuk, totalBelanja, sisaSistem, sisaFisik, selisih) + `prisma db push`
- [ ] 1.2 Hitung sisa menurut sistem: pembayaran tunai diterima − pengeluaran tunai, dalam batas hari WIB
- [ ] 1.3 Halaman Rekonsiliasi ramah-HP: input sisa fisik → tampilkan cocok / selisih beserta nominalnya
- [ ] 1.4 Uji: catat beberapa pembayaran & pengeluaran tunai, masukkan sisa fisik yang sengaja beda → selisih muncul benar
- [ ] 1.5 Uji batas WIB: pengeluaran pukul 23.30 masuk hari yang benar

## 2. HPP moving-average — TERTAHAN sampai `bom-inventory` punya data

- [ ] 2.1 Tentukan penyimpanan harga modal rata-rata (kolom `hppAvg` per bahan/produk atau ledger pergerakan)
- [ ] 2.2 Saat pembelian bahan tercatat → perbarui rata-rata bergerak
- [ ] 2.3 Laba Rugi memakai HPP terbaru, bukan angka statis
- [ ] 2.4 Uji: dua pembelian dengan harga berbeda → HPP bergerak sesuai bobot jumlah, bukan rata-rata sederhana
