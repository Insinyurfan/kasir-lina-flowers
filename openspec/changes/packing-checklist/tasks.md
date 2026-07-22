## 1. Model data

- [x] 1.1 Penanda tercentang per item pengiriman: `TransactionItem.packed` (Boolean) + `packedAt` (DateTime?)
- [x] 1.2 `prisma db push` (aditif, sudah diterapkan ke DB)

## 2. Halaman checklist

- [x] 2.1 Halaman `/packing` ramah-HP: kartu per transaksi/toko (status aktif) + item + checkbox besar
- [x] 2.2 Simpan status centang ke server (`PATCH /api/packing`) + muat ulang saat fokus (sinkron lintas perangkat)
- [x] 2.3 Indikator progres per transaksi (bar + `packedItems/totalItems`) + item belum tercentang terlihat jelas
- [x] 2.4 Optimistic toggle + `packedAt` (waktu tercentang) tersimpan; uncentang mengembalikan status

## 3. Verifikasi

- [ ] 3.1 Uji: centang/uncentang tersimpan & tetap benar setelah refresh / ganti perangkat — _uji bersama user_
- [ ] 3.2 Pastikan pencetakan di Riwayat Penjualan TIDAK terpengaruh — tidak ada kode cetak yang disentuh
