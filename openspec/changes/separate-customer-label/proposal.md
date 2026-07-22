## Why

Dua utang model data saling terkait: (1) `variantName` dipakai untuk dua makna — variasi asli (ukuran S/M/L) DAN kode pelanggan Aneka (AMN/SMT/ST) — sehingga satu produk tak bisa punya ukuran sekaligus kode; (2) harga khusus pelanggan (fitur "Lock Price" yang sudah ada) memakai **nama teks bebas** sebagai kunci, sehingga salah ketik = "pelanggan baru". Perlu master pelanggan dan pemisahan kode dari variasi.

## What Changes

- Tambah entitas **Pelanggan (Customer)** sebagai master (nama kanonik + kode/alias).
- Kode pelanggan (Aneka) menjadi **label per baris keranjang/transaksi**, terpisah dari `variantName` (variasi ukuran tetap murni variasi produk).
- Harga khusus (`CustomerPrice`) dikunci ke **customerId**, bukan nama teks bebas → "Lock Price" jadi andal.
- POS: pilih pelanggan dari master (autocomplete) alih-alih mengetik bebas; nomor nota Aneka mengelompok per label pelanggan.

## Capabilities

### New Capabilities
- `customer-master`: Pelanggan dikelola sebagai master data; kode pelanggan menjadi label baris yang terpisah dari variasi produk; harga khusus terikat ke pelanggan (bukan teks bebas).

## Impact

- **Model data**: tabel `Customer`; `TransactionItem`/cart tambah `label` (kode pelanggan); `CustomerPrice.customerId` menggantikan `customerName`. **BREAKING (data)**: perlu migrasi data harga lama (nama → customer).
- **UI**: POS memilih pelanggan dari master; input harga khusus terhubung ke customerId; Mode Aneka (nomor nota) memakai label baris.
- **Manfaat**: menyempurnakan fitur Lock Price yang sudah ada, dan membuka jalan untuk `split-invoice-backorder` (backorder per pelanggan yang konsisten).
- **Catatan**: butuh migrasi hati-hati (data live). Idealnya setelah `harden-api-auth` & `add-testing`.
