> **Urutannya penting.** Kelompok 1 dikerjakan pemilik akun (tidak bisa diwakilkan),
> kelompok 2–4 kode, kelompok 5 pengisian ulang foto bersama Mama.

## 1. Cloudflare R2 — dikerjakan pemilik akun

> **DNS TIDAK DIPINDAHKAN.** Rencana awal memakai domain sendiri
> (`img.linaflowers.my.id`), yang mensyaratkan nameserver `linaflowers.my.id`
> pindah dari anymhost ke Cloudflare. Itu langkah paling berisiko dari seluruh
> rencana ini — satu catatan DNS terlewat dan situsnya mati — dan ternyata tidak
> perlu: R2 punya subdomain publik bawaan `pub-<hash>.r2.dev` yang aktif dalam
> hitungan menit tanpa menyentuh DNS sama sekali.
>
> Konsekuensinya cuma dua: URL gambarnya jelek (tidak pernah dilihat pelanggan)
> dan Cloudflare membatasi lajunya bila trafiknya besar — jauh di atas skala toko
> ini. Pindah ke domain sendiri nanti tinggal mengganti `R2_PUBLIC_BASE_URL`;
> kode dan `next.config.ts` sudah menerima keduanya.

- [x] 1.1 Buat akun Cloudflare (gratis)
- [x] 1.2 Sidebar → **Storage & databases** → **R2** → aktifkan. Perlu kartu terdaftar meski pemakaiannya gratis
- [x] 1.3 Buat bucket, mis. `lina-produk`. Lokasi: **Asia-Pacific (APAC)**
- [x] 1.4 Catat **Account ID** — tampil di halaman ringkasan R2, bukan di halaman bucket
- [x] 1.5 Bucket → **Settings** → **Public access** → bagian **r2.dev subdomain** → *Allow Access*. Cloudflare minta ketik `allow` sebagai konfirmasi. Salin URL `https://pub-xxxxxxxx.r2.dev` yang muncul
- [x] 1.6 R2 → **Manage API tokens** → buat token **Object Read & Write**, dibatasi pada bucket itu saja. Simpan *Access Key ID* & *Secret Access Key* — secret hanya tampil sekali
- [x] 1.7 Isi env di Vercel (Production **dan** Preview): `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `R2_PUBLIC_BASE_URL=https://pub-xxxxxxxx.r2.dev`
- [x] 1.8 Salin env yang sama ke `.env` lokal untuk pengujian
- [x] 1.9 Setelah subdomain bucket diketahui, persempit pola `**.r2.dev` di `next.config.ts` menjadi host persisnya — lihat catatan keamanan di berkas itu

### Opsional, jauh di kemudian hari — domain sendiri

Hanya kalau r2.dev benar-benar terasa membatasi. Kerjakan **saat sepi, bukan pagi
hari kirim**: tambahkan `linaflowers.my.id` di Cloudflare lewat jalur *bring your
own* (bukan beli domain baru), **periksa satu per satu** hasil pindaian DNS-nya
terhadap panel anymhost — terutama catatan yang mengarah ke Vercel — setel
catatan Vercel jadi **DNS only**, baru ganti nameserver di anymhost. Setelah itu
bucket → Settings → Custom Domain → `img.linaflowers.my.id`, lalu ganti
`R2_PUBLIC_BASE_URL`.

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
- [x] 3.6 Env didokumentasikan di tugas 1.7 (repo ini tidak punya `.env.example`)
- [x] 3.7 `next.config.ts` → `dangerouslyAllowLocalIP` khusus `next dev`. Jaringan tethering di sini memakai DNS64/NAT64, dan Next 16 menolak host yang menghasilkan alamat `64:ff9b::…`. Hanya URL Supabase lama yang kena; host R2 menghasilkan IPv4 biasa

## 4. Verifikasi kode

- [x] 4.1 `npx tsc --noEmit` bersih, ESLint tidak menambah error baru
- [x] 4.2 Unggah satu foto produk di lokal → berkas muncul di bucket R2, URL-nya berbasis `R2_PUBLIC_BASE_URL`
- [x] 4.3 Buka gambarnya langsung di peramban → tampil, dan header responsnya berasal dari Cloudflare
- [ ] 4.4 Ganti foto produk yang sama → berkas lama terhapus dari bucket
- [ ] 4.5 Unggah foto struk pada sebuah pengeluaran → masuk ke awalan `struk/`
- [ ] 4.6 Uji env belum lengkap → pesan galatnya jelas, bukan galat mentah
- [x] 4.7 Pastikan `next/image` mengoptimasi gambar R2 tanpa galat host
- [ ] 4.8 Pastikan otorisasi rute unggah tidak berubah — tetap menolak 401 tanpa sesi
- [x] 4.9 Kredensial diuji langsung ke S3 R2 di luar aplikasi: `PUT` 200, `LIST` jalan, `DELETE` jalan, bucket kembali kosong
- [x] 4.10 Diuji dari produksi: `linaflowers.my.id/_next/image` atas gambar R2 membalas `200 image/webp`, sedangkan gambar Supabase lama membalas `502`. Vercel berhasil mengambil dari `r2.dev`, jadi akses publiknya ikut terbukti aktif

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
