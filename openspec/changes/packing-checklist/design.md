## Context

Checklist packing sebagai **alat pantau** saat memuat barang ke mobil — tanpa mengunci pencetakan. Cetak tetap dari halaman Riwayat Penjualan (tidak diubah).

## Decisions

**1. Sumber & pengelompokan.**
Checklist menampilkan **transaksi dengan status pengiriman aktif** (belum `Selesai`), **dikelompokkan per transaksi/toko**. Buka satu toko → centang barang-barangnya. Paling natural untuk pengiriman ke banyak toko.

**2. Model data.**
Tambah flag per baris item di `TransactionItem`: `packed Boolean @default(false)` + `packedAt DateTime?`. Lebih ringkas daripada tabel terpisah (relasi 1:1 dengan item) dan langsung ikut saat transaksi di-query. Aditif & aman untuk data lama (default `false`).

**3. Tidak menyentuh cetak.**
Tidak ada gerbang cetak, tidak ada "Selesai → dokumen". Endpoint & halaman cetak yang ada dibiarkan.

**4. API terpisah `/api/packing`.**
- `GET` → transaksi status aktif + itemnya (termasuk `packed`), untuk daftar checklist. Wajib login (Owner/Admin).
- `PATCH` → toggle `packed` satu item `{ transactionItemId, checked }`. Wajib login.

## Non-Goals

- Format/alur cetak tidak berubah (tetap dari Riwayat Penjualan).
- Tidak ada penguncian atau otomatisasi cetak.

## Notes

- Status pengiriman "aktif" = `status_pengiriman <> "Selesai"`.
- Cocok dipadukan `split-invoice-backorder` nanti: checklist mengikuti jumlah yang dikirim.
