# Panduan pindah gambar ke Cloudflare R2 — dari nol sampai selesai

Ditulis 5 Agustus 2026. Ikuti berurutan. Setiap tahap punya **tanda berhasil** —
jangan lanjut sebelum tandanya muncul.

**Tidak ada langkah DNS di sini.** Domain `linaflowers.my.id` tetap di anymhost
dan tidak disentuh sama sekali.

---

## TAHAP 1 — Siapkan R2 di Cloudflare (± 15 menit)

### 1.1 Aktifkan R2

Sidebar kiri → **Storage & databases** → **R2** → tombol aktivasi.

Cloudflare meminta kartu didaftarkan. Ini normal dan bukan tagihan: batas
gratisnya 10 GB penyimpanan, sedangkan seluruh foto produk cuma sekitar 10 MB.

### 1.2 Buat bucket

Tombol **Create bucket**.

- Nama: `lina-produk`
- Location: **Asia-Pacific (APAC)**

> Nama bucket tidak bisa diubah setelah dibuat. Salah ketik → hapus dan buat lagi.

### 1.3 Catat Account ID

Ada di halaman **ringkasan R2** (panel kanan), **bukan** di halaman bucket.
Bentuknya deretan 32 huruf-angka. Simpan.

### 1.4 Nyalakan akses publik ← pengganti langkah DNS

Buka bucket `lina-produk` → tab **Settings** → bagian **Public access** →
**r2.dev subdomain** → **Allow Access**.

Cloudflare minta mengetik `allow` sebagai konfirmasi.

**Tanda berhasil:** muncul URL seperti `https://pub-8f3a1c2d....r2.dev`.
Salin dan simpan — ini yang jadi `R2_PUBLIC_BASE_URL`.

### 1.5 Buat API token

R2 → **Manage API tokens** → **Create API token**.

- Permission: **Object Read & Write**
- Specify bucket: **hanya** `lina-produk`
- TTL: biarkan default

**Secret Access Key hanya ditampilkan sekali.** Salin *Access Key ID* dan
*Secret Access Key* sebelum menutup halaman. Kalau terlanjur tertutup, hapus
tokennya dan buat baru — tidak bisa dilihat ulang.

---

## TAHAP 2 — Isi env

### 2.1 Di komputer (untuk pengujian dulu)

Buka berkas `.env` di folder proyek, tambahkan di paling bawah:

```
R2_ACCOUNT_ID=isi_account_id_dari_1.3
R2_ACCESS_KEY_ID=isi_dari_1.5
R2_SECRET_ACCESS_KEY=isi_dari_1.5
R2_BUCKET=lina-produk
R2_PUBLIC_BASE_URL=https://pub-xxxxxxxx.r2.dev
```

`R2_PUBLIC_BASE_URL` **tanpa garis miring di akhir**.

### 2.2 Di Vercel — nanti, setelah pengujian lokal lolos

Belum sekarang. Lihat Tahap 4.

---

## TAHAP 3 — Uji di komputer sebelum menyentuh produksi

Ini tahap paling penting. Kalau ada yang salah, ketahuannya di sini — bukan saat
Mama sudah memotret 70 produk.

```bash
npm run dev
```

### 3.1 Uji unggah

Buka `http://localhost:3000/produk` → pilih satu produk → ganti fotonya →
simpan.

**Tanda berhasil:** foto langsung tampil di daftar produk.

**Kalau muncul pesan "Konfigurasi Cloudflare R2 belum lengkap"** — pesan itu
menyebutkan env mana yang kosong. Periksa ejaannya di `.env`, lalu **matikan dan
jalankan ulang `npm run dev`** (env hanya dibaca saat server menyala).

### 3.2 Periksa berkasnya benar-benar sampai

Kembali ke Cloudflare → bucket `lina-produk` → tab **Objects**.

**Tanda berhasil:** ada berkas dengan jalur seperti
`produk/bando-lilitan-mersi-no-1/1754...-a3f2....webp`

### 3.3 Periksa gambarnya bisa dibuka publik

Klik kanan gambar di halaman produk → *Buka gambar di tab baru*. Alamatnya harus
mengandung `pub-xxxxxxxx.r2.dev`.

**Tanda berhasil:** gambarnya tampil di tab baru.

**Kalau 401/403:** langkah 1.4 belum benar-benar tersimpan — ulangi *Allow Access*.

### 3.4 Uji ganti foto (berkas lama harus terhapus)

Ganti foto produk yang sama sekali lagi. Lihat tab **Objects** di Cloudflare:
berkas yang lama hilang, tersisa yang baru.

### 3.5 Uji foto struk

Halaman **Pengeluaran** → catat satu pengeluaran percobaan → lampirkan foto.
Di bucket harus muncul jalur berawalan `struk/`.

Hapus lagi pengeluaran percobaan itu setelah selesai.

---

## TAHAP 4 — Pasang di produksi

### 4.1 Isi env di Vercel

Vercel → proyek → **Settings** → **Environment Variables**.

Masukkan kelima env dari Tahap 2.1 satu per satu. Untuk setiap env, centang
**Production**, **Preview**, dan **Development**.

### 4.2 Deploy ulang

**Env baru tidak berlaku pada deployment yang sudah ada.** Vercel →
**Deployments** → deployment teratas → menu titik tiga → **Redeploy**.

Jangan centang "Use existing Build Cache".

### 4.3 Verifikasi produksi

Buka `linaflowers.my.id/produk` di HP → unggah satu foto.

**Tanda berhasil:** foto tampil, dan berkasnya muncul di bucket Cloudflare.

Kalau di sini gagal padahal lokal berhasil, penyebabnya hampir selalu env yang
belum tersalin atau deploy ulang yang belum dilakukan.

---

## TAHAP 5 — Unggah ulang foto bersama Mama (± 70 produk)

Tahap ini butuh Mama karena hanya beliau yang hafal wujud tiap produk.

### 5.1 Siapkan daftar

Buka `gambar-produk/daftar-produk.txt` — berisi 70 produk lengkap dengan nomor
dan namanya. Bisa dibuka di HP lewat GitHub kalau lebih enak.

### 5.2 Cara kerjanya

Kerjakan **berurutan dari nomor terkecil**. Untuk tiap produk:

1. Buka halaman **Produk** di HP
2. Cari produk sesuai nama di daftar
3. Foto barangnya langsung dari HP, atau pilih dari galeri
4. Simpan

Foto otomatis dikompres ke WebP — tidak perlu mengecilkan sendiri. Mentahnya
boleh sampai 20 MB, jadi hasil kamera HP aman.

### 5.3 Cara tahu sudah sampai mana

Halaman Produk itu sendiri jadi penanda progres: **yang gambarnya masih rusak
berarti belum dikerjakan.** Tidak perlu mencatat di tempat lain.

### 5.4 Tidak harus sekali duduk

70 produk itu banyak. Boleh dicicil — tidak ada yang rusak kalau berhenti di
tengah. Produk yang sudah diunggah langsung aman.

### 5.5 Setelah semua masuk

- Buka katalog publik → pastikan tidak ada lagi gambar rusak
- Jalankan `node scripts/unduh-gambar-produk.cjs` untuk membuat arsip lokal
  bernama produk. Ini cadangan kalau suatu hari perlu memindahkan lagi.

---

## TAHAP 6 — Beres-beres

- [ ] Persempit pola `**.r2.dev` di `next.config.ts` menjadi host bucket yang
      persis (lihat catatan keamanan di berkas itu)
- [ ] Unggah ulang logo toko & foto profil lewat halaman Pengaturan — keduanya
      tersimpan di basis data, bukan di storage, jadi ini urusan terpisah
- [ ] Pantau **Egress** Supabase seminggu — mestinya turun karena gambar tidak
      lagi lewat sana
- [ ] Pantau dashboard R2 — operasi baca/tulis harus jauh di bawah batas gratis
- [ ] Setelah yakin semua aman, bucket lama `produk` & `struk` di Supabase boleh
      dikosongkan (opsional, ukurannya cuma 10 MB)

---

## Kalau macet

| Gejala | Penyebab tersering |
|---|---|
| "Konfigurasi Cloudflare R2 belum lengkap" | Env kurang/salah ketik, atau `npm run dev` belum dijalankan ulang |
| Unggah gagal 403 | API token bukan *Object Read & Write*, atau dibatasi ke bucket lain |
| Gambar 401/403 saat dibuka | Langkah 1.4 (*Allow Access*) belum tersimpan |
| Lokal jalan, produksi tidak | Env belum diisi di Vercel, atau belum deploy ulang |
| Gambar lama masih rusak | Wajar — yang lama ada di Supabase yang sedang diblokir. Hilang setelah diunggah ulang di Tahap 5 |
