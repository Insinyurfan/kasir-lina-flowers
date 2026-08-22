> **DIPERSEMPIT — 22 Agustus 2026.** Bagian "Input Pengeluaran" sudah selesai
> lewat `pengeluaran-piutang-laba`: model `Expense` (tanggal, nominal, kategori,
> metode, `fotoUrl`) sudah berdiri dan formnya sudah dipakai. Yang tersisa di
> change ini hanya dua bagian yang belum tersentuh sama sekali — dipastikan
> lewat pencarian di seluruh repo: tidak ada kolom harga modal / `hppAvg`
> di mana pun, dan tidak ada model `CashReconciliation`.

## Why

Dua lubang tersisa setelah pencatatan pengeluaran berjalan.

**1. Laba belum memperhitungkan modal barang.** Halaman Laba Rugi menghitung
laba usaha sebagai omzet dikurangi `Expense`. Itu benar selama seluruh biaya
tercatat sebagai pengeluaran bulan berjalan — tetapi tidak menjawab "satu gross
Bando Pompom ini modalnya berapa". Tanpa angka modal per produk, harga jual
(terutama untuk rencana jualan eceran) hanya bisa ditebak, dan bulan yang banyak
belanja bahan untuk stok akan terlihat rugi padahal barangnya masih ada.

**2. Kas fisik tidak pernah dicocokkan.** Belanja bahan dilakukan di jalan
memakai uang tunai hasil tagihan toko. Sistem tahu berapa yang masuk dan berapa
yang tercatat keluar, tetapi tidak pernah dibandingkan dengan uang yang benar-benar
ada di dompet. Selisihnya — entah karena lupa mencatat atau kebocoran — tidak
akan pernah ketahuan.

## What Changes

- **HPP Moving Average**: setiap pembelian bahan memperbarui harga modal
  rata-rata bergerak per bahan/produk, sehingga laba tetap akurat meski harga
  pasar naik-turun.
- **Rekonsiliasi Kas** harian: `cash masuk − belanja = sisa menurut sistem`,
  dibandingkan dengan hitungan fisik uang di dompet; selisihnya ditampilkan
  terang-terangan.

## Non-Goals

- **Form input pengeluaran & foto struk.** Sudah ada. Change ini membaca
  `Expense` yang sudah tercatat, tidak membuat jalur input baru.
- **Pemisahan prive dari biaya usaha.** Sudah ditangani `lib/pengeluaran.ts`.

## Prasyarat

**HPP moving-average bergantung pada `bom-inventory`.** Harga modal rata-rata
hanya bermakna bila ada entitas bahan baku yang dibeli berulang kali dengan harga
berbeda. Selama bahan baku belum punya data, angka HPP apa pun hanyalah input
manual yang menyamar sebagai hasil hitungan. Rekonsiliasi kas **tidak** punya
ketergantungan ini dan bisa dikerjakan lebih dulu.

## Capabilities

### New Capabilities
- `cash-and-cost-tracking`: Sistem menghitung HPP moving-average dari pembelian
  bahan dan menyediakan rekonsiliasi kas harian antara catatan dan uang fisik.

## Impact

- **Model data**: `CashReconciliation` (tanggal, cashMasuk, totalBelanja,
  sisaSistem, sisaFisik, selisih). HPP: harga modal rata-rata per bahan/produk
  (kolom atau ledger — keputusan di design).
- **UI**: halaman Rekonsiliasi Kas; angka modal ikut tampil di Laba Rugi.
- **Integrasi**: membaca `Expense` yang sudah ada; HPP menunggu `bom-inventory`.
