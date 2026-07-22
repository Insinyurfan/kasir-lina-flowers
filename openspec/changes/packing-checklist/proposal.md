## Why

Proses packing masih mengandalkan ketelitian manual dan tulis tangan, sehingga sulit tahu barang mana yang sudah/belum masuk mobil. Perlu **checklist digital di HP** untuk mencentang barang saat dimuat ke mobil — sebagai alat pantau agar tidak ada yang terlewat, tanpa kertas & tanpa centang manual.

## What Changes

- Halaman **Checklist Packing** (ramah-HP) berisi daftar barang yang akan dikirim (dari transaksi/pesanan terkait).
- Petugas **mencentang** tiap produk saat memasukkannya ke mobil; status tersimpan ke server (tersinkron lintas perangkat).
- **Indikator progres** (mis. 6/8 sudah masuk) + terlihat jelas mana yang belum, agar cepat ketahuan bila ada yang terlewat.
- **TIDAK mengunci pencetakan.** Checklist murni alat pantau; mencetak dokumen tetap seperti biasa dari halaman **Riwayat Penjualan** (tidak diubah).

## Non-Goals

- Tidak mengubah alur/format cetak. Cetak Nota & Surat Jalan tetap dari **Riwayat Penjualan** seperti sekarang (format cetak di Status Pesanan sengaja dibiarkan berbeda).
- Tidak ada gerbang/penguncian cetak dan tidak ada tombol "Selesai → cetak 2 dokumen otomatis".

## Capabilities

### New Capabilities
- `packing-checklist`: Setiap pengiriman punya checklist barang yang bisa dicentang saat dimuat ke mobil, dengan indikator progres, sebagai alat pantau (tidak memengaruhi pencetakan dokumen).

## Impact

- **Model data**: penanda tercentang per item pengiriman (mis. tabel `PackingCheck(transactionItemId, checked, checkedAt)`), atau kolom status ringkas per transaksi.
- **UI**: halaman Checklist Packing ramah-HP (daftar item + centang besar + progres). Cetak **tidak** disentuh.
- **Integrasi**: cocok dipadukan dengan `split-invoice-backorder` (checklist mengikuti jumlah yang benar-benar dikirim).
