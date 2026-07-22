## 1. Model data & migrasi

- [x] 1.1 Tabel `Customer` (nama kanonik, kode/alias, telp opsional) — `model Customer` di `prisma/schema.prisma` (name unik, phone, note)
- [x] 1.2 Tambah `label` (kode pelanggan) di CartItem/TransactionItem; tambah `customerId` di `CustomerPrice` — `label` **sudah ada sebelumnya**; ditambahkan `customerId` di `CustomerPrice` + `Transaction` (opsional)
- [x] 1.3 Migrasi data: petakan `customerName` lama → `Customer` + isi `customerId`; `prisma db push` — skrip `prisma/scripts/migrate-customers.ts` (idempoten). **`db push` + skrip belum dijalankan** (mode "siapkan, jangan jalankan"; jalankan setelah backup)

## 2. Master pelanggan

- [x] 2.1 CRUD pelanggan + pencarian — `/api/pelanggan` GET (nama string[] + `?master=1` objek + `?q=`), POST/PATCH/DELETE (Owner/Admin)
- [x] 2.2 POS: pilih pelanggan dari master (autocomplete), bukan teks bebas — autocomplete kini dari master; nama cocok → `customerId` diteruskan ke harga-pelanggan (fallback nama bila belum termigrasi)

## 3. Pisahkan label dari variasi

- [x] 3.1 Kode pelanggan disimpan sebagai `label` baris, `variantName` kembali murni variasi ukuran — **sudah terimplementasi** (kolom `label` + tampilan)
- [x] 3.2 Mode Aneka (nomor nota) mengelompok per `label` — **sudah terimplementasi** (`orderItemsAneka`/`buildNotaMap` di `penjualan/page.tsx`, dengan fallback data lama)
- [x] 3.3 Harga khusus (Lock Price) dikunci ke `customerId` — `/api/harga-pelanggan` resolve/upsert Customer & simpan `customerId` (customerName tetap sebagai snapshot/fallback)

## 4. Verifikasi

- [ ] 4.1 Uji: 1 produk bisa punya ukuran + kode pelanggan sekaligus; harga khusus tetap benar walau nama diketik beda ejaan — _perlu DB termigrasi; uji bersama user_
- [ ] 4.2 Uji regresi: transaksi & Mode Aneka lama tetap tampil benar setelah migrasi — _perlu DB termigrasi; uji bersama user_
