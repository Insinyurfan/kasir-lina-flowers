> **Urutannya penting.** Kelompok 1 dikerjakan pemilik akun (tidak bisa diwakilkan),
> kelompok 2–4 kode, kelompok 5 pengisian ulang foto bersama Mama.
> **Kelompok 1 wajib dikerjakan saat sepi — bukan pagi hari kirim.**

## 1. Cloudflare & DNS — dikerjakan pemilik akun

- [ ] 1.1 Buat akun Cloudflare (gratis)
- [ ] 1.2 **Add a site** → masukkan `linaflowers.my.id`. Cloudflare memindai catatan DNS yang ada
- [ ] 1.3 **PERIKSA SATU PER SATU** hasil pindaian itu terhadap panel anymhost — terutama catatan yang mengarah ke Vercel (`A`, `CNAME`, `TXT` verifikasi). **Satu catatan terlewat = situs mati.** Screenshot panel lama sebelum menyentuh apa pun
- [ ] 1.4 Setel catatan yang mengarah ke Vercel menjadi **DNS only (awan abu-abu)**, bukan Proxied. Vercel sudah punya CDN sendiri; menumpuknya dengan proxy Cloudflare kerap menimbulkan masalah SSL & pengalihan
- [ ] 1.5 Ganti nameserver di **anymhost.id** ke nameserver dari Cloudflare
- [ ] 1.6 Tunggu propagasi. Verifikasi: `nslookup -type=NS linaflowers.my.id` menunjukkan nameserver Cloudflare, dan situs Vercel **masih terbuka normal**
- [ ] 1.7 Aktifkan **R2** di dashboard Cloudflare (perlu kartu terdaftar meski pemakaiannya gratis)
- [ ] 1.8 Buat bucket, mis. `lina-produk`
- [ ] 1.9 Bucket → Settings → **Custom Domain** → `img.linaflowers.my.id`. Tunggu sampai statusnya aktif
- [ ] 1.10 Buat **R2 API Token** dengan izin baca+tulis pada bucket itu. Simpan *Access Key ID* & *Secret Access Key* — secret hanya tampil sekali
- [ ] 1.11 Isi env di Vercel (Production **dan** Preview): `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `R2_PUBLIC_BASE_URL=https://img.linaflowers.my.id`
- [ ] 1.12 Salin env yang sama ke `.env` lokal untuk pengujian

## 2. Lapisan penyimpanan

- [x] 2.1 Pasang dependensi `aws4fetch`
- [x] 2.2 Buat `lib/r2Storage.ts`: baca env, tolak dengan pesan jelas bila belum lengkap
- [x] 2.3 `unggahGambarProduk(file, namaProduk)` — awalan `produk/`, nama berkas cap waktu + UUID
- [x] 2.4 `unggahGambarStruk(file, kategori)` — awalan `struk/`
- [x] 2.5 Pertahankan pemeriksaan lama: harus gambar, maksimal 3 MB
- [x] 2.6 `hapusGambarR2(url)` — turunkan path dari URL publik; kegagalan tidak boleh melempar galat ke pemanggil
- [x] 2.7 Kembalikan URL publik berbasis `R2_PUBLIC_BASE_URL`, bukan endpoint `*.r2.cloudflarestorage.com`

## 3. Rute & konfigurasi

- [x] 3.1 `api/upload/produk` memakai `unggahGambarProduk`
- [x] 3.2 `api/upload/struk` memakai `unggahGambarStruk`
- [x] 3.3 Cari pemanggil `deleteProductImageFromStorage` & `deleteReceiptImageFromStorage`, arahkan ke `hapusGambarR2`
- [x] 3.4 `next.config.ts` → tambah `remotePatterns` untuk `img.linaflowers.my.id`; **pertahankan pola Supabase** supaya gambar lama tetap bisa dioptimasi selama masa transisi
- [x] 3.5 `public/sw.js` → pencocok gambar mengenali host R2, dan **naikkan `VERSI`** supaya cache lama dibersihkan
- [x] 3.6 Env didokumentasikan di tugas 1.11 (repo ini tidak punya `.env.example`)

## 4. Verifikasi kode

- [x] 4.1 `npx tsc --noEmit` bersih, ESLint tidak menambah error baru
- [ ] 4.2 Unggah satu foto produk di lokal → berkas muncul di bucket R2, URL-nya berbasis `img.linaflowers.my.id`
- [ ] 4.3 Buka gambarnya langsung di peramban → tampil, dan header responsnya berasal dari Cloudflare
- [ ] 4.4 Ganti foto produk yang sama → berkas lama terhapus dari bucket
- [ ] 4.5 Unggah foto struk pada sebuah pengeluaran → masuk ke awalan `struk/`
- [ ] 4.6 Uji env belum lengkap → pesan galatnya jelas, bukan galat mentah
- [ ] 4.7 Pastikan `next/image` mengoptimasi gambar R2 tanpa galat host
- [ ] 4.8 Pastikan otorisasi rute unggah tidak berubah — tetap menolak 401 tanpa sesi

## 5. Pengisian ulang foto — bersama Mama

- [ ] 5.1 Buka `gambar-produk/daftar-produk.txt` sebagai panduan nama produk
- [ ] 5.2 Unggah ulang foto lewat halaman Produk, satu per satu
- [ ] 5.3 Pantau progres lewat halaman Produk sendiri: yang gambarnya masih rusak = belum dikerjakan
- [ ] 5.4 Setelah semua masuk, cek katalog publik — tidak ada lagi gambar rusak
- [ ] 5.5 Jalankan `node scripts/unduh-gambar-produk.cjs` untuk membuat arsip lokal bernama produk

## 6. Setelah semua beres

- [ ] 6.1 Pantau **Egress** Supabase seminggu — seharusnya turun lagi karena gambar tidak lagi lewat sana
- [ ] 6.2 Pantau dashboard R2 — pastikan operasi baca/tulis masih jauh di bawah batas gratis
- [ ] 6.3 Setelah yakin, bucket `produk` & `struk` lama di Supabase boleh dikosongkan (opsional — ukurannya cuma 10 MB)
- [ ] 6.4 Perbarui `CATATAN-SESI.md`: gambar sekarang di R2, dan cara menambah env bila kredensialnya diputar
