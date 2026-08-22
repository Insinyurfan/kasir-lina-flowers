## 1. Model data

- [ ] 1.1 Tabel `Kelompok` (nama, ketua) & `Pengrajin` (nama, kelompokId, tarif)
- [ ] 1.2 Tabel `Setoran` (pengrajinId, tanggal, jumlah, nilai) & `Penarikan` (pengrajinId, tanggal, nominal)
- [ ] 1.3 `prisma db push`

## 2. Kelola pengrajin

- [ ] 2.1 CRUD kelompok & pengrajin (struktur ketua → anggota)
- [ ] 2.2 Tentukan tarif (per unit / per produk-varian)

## 3. Setoran & saldo

- [ ] 3.1 Form input setoran harian (jumlah fisik) → hitung nilai gaji, tambah ke saldo
- [ ] 3.2 Halaman saldo per pengrajin = Σ setoran − Σ penarikan (ledger)

## 4. Penarikan (cash on demand)

- [ ] 4.1 Tombol Tarik Gaji: penuh atau sebagian (validasi ≤ saldo)
- [ ] 4.2 Riwayat setoran & penarikan (tak bisa diedit sembarangan / tercatat)

## 5. Verifikasi

- [ ] 5.1 Uji: input beberapa setoran → saldo benar; tarik sebagian → sisa akurat; riwayat lengkap
