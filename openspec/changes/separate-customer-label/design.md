## Context

Saat change ini dibuat, sebagian utang teknis dari proposal **sudah teratasi** di kode berjalan:

- `TransactionItem.label` dan `UserCartItem.label` sudah ada → kode pelanggan (Aneka: AMN/SMT/ST) sudah menjadi **label per baris**, terpisah dari `variantName` (yang kini murni variasi ukuran S/M/L).
- Master `CustomerCode` + endpoint autocomplete `/api/kode-pelanggan` (kode) dan `/api/pelanggan` (nama, diturunkan dari `CustomerPrice.customerName` + `Transaction.nama_pembeli`) sudah ada.

Yang **belum** dan menjadi inti change ini:

- Belum ada entitas **`Customer`** sebagai master. "Pelanggan" sekarang hanyalah teks bebas ter-normalisasi UPPERCASE.
- **`CustomerPrice` masih dikunci ke `customerName` (teks bebas)** → salah ketik = "pelanggan baru", fitur Lock Price jadi rapuh.

## Goals / Non-Goals

**Goals:**
- Master `Customer` (nama kanonik unik) sebagai sumber tunggal identitas pelanggan.
- Harga khusus (`CustomerPrice`) dikunci ke `customerId`, bukan teks bebas.
- POS memilih pelanggan dari master (autocomplete), bukan mengetik bebas.
- Migrasi data live aman & idempoten (dijalankan manual oleh pemilik setelah backup).

**Non-Goals:**
- Merombak makna `label` baris (kode Aneka tetap label per baris — TIDAK dijadikan Customer sendiri).
- Menggabungkan/deduplikasi otomatis nama-nama yang mirip (mis. "TOKO TIARA" vs "TIARA"). Migrasi membuat 1 Customer per string distinct; merge dilakukan manual belakangan lewat CRUD.
- Menghapus kolom lama (`CustomerPrice.customerName`) pada change ini — dipertahankan sebagai snapshot/fallback demi transisi mulus; penghapusan bisa jadi change lanjutan.

## Decisions

**1. `Customer` = nama toko/pembeli kanonik.**
Kode Aneka (AMN/SMT/ST) TETAP `label` per baris seperti sekarang. Lock Price dikunci ke `Customer(nama)`. Alasan: paling dekat dengan struktur & data yang sudah ada → migrasi paling mulus; kode baris tetap fleksibel.

**2. Skema:**
```
model Customer {
  id        Int      @id @default(autoincrement())
  name      String   @unique   // nama kanonik, UPPERCASE
  phone     String?
  note      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  prices    CustomerPrice[]
  @@index([name])
}
```
- `CustomerPrice`: tambah `customerId Int?` (+ relasi ke `Customer`, `@@index`, `@@unique([customerId, productId, variantId])`). **Pertahankan** `customerName` + unique lamanya (dual-key selama transisi).
- `Transaction`: tambah `customerId Int?` (opsional) + relasi. `nama_pembeli` tetap sebagai snapshot tampilan. Berguna agar transaksi tertaut ke master; di-backfill best-effort.

**3. Nullable + fail-soft.**
`customerId` dibuat nullable agar `prisma db push` aman pada baris lama sebelum backfill. Lookup harga: utamakan `customerId`; bila belum ada, fallback ke `customerName` (kompatibel dengan data pra-migrasi).

**4. Migrasi = "siapkan, jangan jalankan".**
Perubahan `schema.prisma` + skrip migrasi data ditulis, tetapi `prisma db push`/skrip **tidak dijalankan** oleh AI. Pemilik menjalankan setelah backup DB. `prisma generate` (aman, hanya baca schema → tulis client) boleh dijalankan agar tipe klien tersedia untuk kompilasi.

## Migration Plan (dijalankan manual oleh pemilik)

1. **Backup DB** (Supabase → export / snapshot).
2. `npx prisma db push` — buat tabel `Customer`, kolom `customerId` (nullable) di `CustomerPrice` & `Transaction`.
3. Jalankan skrip `prisma/scripts/migrate-customers.ts` (idempoten):
   - Kumpulkan nama distinct dari `CustomerPrice.customerName` ∪ `Transaction.nama_pembeli` (UPPERCASE, buang kosong/"-").
   - Upsert 1 `Customer` per nama.
   - Backfill `CustomerPrice.customerId` dan `Transaction.customerId` berdasarkan kecocokan nama.
4. Verifikasi (task 4.1 & 4.2), lalu deploy.
5. Rollback: `customerId` nullable → cukup abaikan; kolom & tabel baru tidak merusak alur lama (fallback `customerName` masih jalan).

## Open Questions

- Kapan menghapus `CustomerPrice.customerName` (change lanjutan setelah semua path pakai `customerId`)?
- Perlukah UI merge pelanggan duplikat hasil typo lama? (di luar lingkup awal)
