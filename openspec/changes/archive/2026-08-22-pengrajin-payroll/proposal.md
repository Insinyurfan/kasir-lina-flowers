> **DIGANTIKAN — 22 Agustus 2026.** Seluruh isi proposal ini diserap oleh
> `pengrajin-tugas-upah`, yang menambahkan hal yang tidak ada di sini: penugasan
> **per baris barang** (`TransactionItem`), tarif per pengrajin × produk, dan
> penerima upah yang boleh berbeda dari pekerjanya. Model `Kelompok`,
> `Pengrajin`, `TarifPengrajin`, `Penugasan`, `Setoran`, dan `Penarikan` sudah
> berdiri di `prisma/schema.prisma`; halaman `pengrajin` dan `papan-tugas` sudah
> ada. Diarsipkan tanpa dikerjakan — bukan karena batal, tetapi karena sudah
> terlaksana lewat change penggantinya.

## Why

Gaji pengrajin (piece-rate) masih dicatat di buku manual, rawan salah/lupa/manipulasi, padahal pencairan bersifat cash-on-demand (bisa sebagian). Perlu "dompet digital pengrajin": saldo gaji menumpuk otomatis dari setoran fisik harian, dan bisa ditarik penuh atau sebagian kapan saja dengan catatan yang akurat.

## What Changes

- Entitas **Pengrajin** & **Kelompok** (struktur ketua → anggota, mis. Ketua Mama Budi → Mama Uri, Mama Ari).
- **Input setoran harian**: jumlah fisik barang jadi yang disetor tiap pengrajin → nilai gaji (jumlah × tarif per unit) otomatis menumpuk sebagai **saldo belum dibayar (claimable balance)**.
- **Tarik Gaji**: penuh atau **sebagian** (mis. cairkan Rp1,5 jt dari saldo Rp3 jt), sisa tetap tercatat aman.
- Riwayat setoran & penarikan per pengrajin; laporan saldo terutang.
- (SOP pendukung) kuota bahan 1:1 dapat dipantau dari data setoran.

## Capabilities

### New Capabilities
- `pengrajin-payroll`: Sistem mencatat setoran fisik pengrajin menjadi saldo gaji yang menumpuk otomatis dan dapat ditarik penuh atau sebagian, dengan riwayat yang tak bisa dimanipulasi.

## Impact

- **Model data**: `Pengrajin` (nama, kelompokId, tarif), `Kelompok` (nama, ketua), `Setoran` (pengrajinId, tanggal, jumlah, nilai), `Penarikan` (pengrajinId, tanggal, nominal). Saldo = Σ setoran − Σ penarikan (ledger).
- **UI**: kelola pengrajin/kelompok; form input setoran harian; tombol Tarik Gaji (penuh/sebagian); halaman saldo & riwayat.
- **Peran**: tulis oleh Owner/Admin (setelah `harden-api-auth`).
- **Catatan**: tarif per produk/varian atau flat per unit → keputusan di design.
