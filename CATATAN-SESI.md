# Catatan Sesi — 3–5 Agustus 2026

Semua sudah di-push ke `main` (`Insinyurfan/kasir-lina-flowers`), dari `b4a95a5`
sampai **`18ee06f`** — 15 commit. Tidak ada yang menggantung di working tree.

Sesi ini **tidak membangun modul bisnis baru**. Seluruhnya habis untuk satu
kejadian: pada 3 Agustus, semua foto produk lenyap dari aplikasi sekaligus.
Menelusuri sebabnya membongkar tiga masalah yang saling menutupi, dan berakhir
dengan foto pindah rumah ke Cloudflare R2.

Catatan sesi 30 Juli sudah digantikan berkas ini; hal-hal yang masih terbuka
dari sana dibawa ke bagian 7.

---

## 0. Kejadiannya, berurutan

1. Foto produk hilang serentak dari semua perangkat. Supabase Storage membalas
   `402 exceed_egress_quota`.
2. Dugaan pertama — gambar terlalu besar — **salah**. Dashboard menunjukkan
   total penyimpanan cuma 0,01 GB, rata-rata 175 KB per gambar. Gambar bukan
   penyebabnya.
3. Ditemukan tiga perulangan polling **tiap 5 detik** yang tidak pernah berhenti
   walau tab tidak dilihat.
4. Pertanyaan pemilik — *"kenapa logo toko dan foto profil tetap ada?"* —
   membuka penyebab sebenarnya: **logo disimpan base64 di basis data**, dan
   `/api/pengaturan` dipanggil dari layout akar. Artinya **setiap** pemuatan
   halaman mengirim ±4 MB. 184 MB egress pada 1 Agustus setara hanya ~46 kali
   buka halaman.
5. Empat perbaikan efisiensi dikerjakan, lalu service worker supaya gambar
   bertahan walau sumbernya mati.
6. Pemilik memutuskan pindah ke R2 dan memotret ulang. Migrasinya berjalan, dan
   memunculkan **dua masalah jaringan** yang tidak ada hubungannya dengan R2.

---

## 1. Kesalahan penalaran yang perlu diingat

Ini bagian terpenting dari sesi ini, karena kesalahannya berulang dari dua arah.

**Ukuran gambar ditaksir dari plafon konfigurasi, bukan diukur.** Angka 900 KB
yang sempat disebut itu batas unggah, bukan ukuran sungguhan. Yang benar 175 KB.
Jangan menyimpulkan dari batas — ukur.

**Omzet kotor sempat dipakai sebagai alasan mampu berlangganan.** Pemilik yang
mengoreksi: *"omzet kotor doang, uangnya juga diputar lagi beli bahan baku."*
Itu persis kekeliruan yang membuat modul Laba Rugi dibangun. Omzet bukan uang
yang bisa dibelanjakan.

**Egress diperbesar oleh perbaikan sendiri.** Menambahkan `payments` ke
`transactionInclude` memperbesar muatan yang di-polling tiap 5 detik — jadi
perbaikan itu justru memperburuk masalah yang sedang ditangani.

---

## 2. Empat perbaikan efisiensi

| Perbaikan | Hasil terukur |
|---|---|
| `lib/pollingHemat.ts` — jeda 30–60 dtk, **berhenti saat tab tak terlihat** | dari tiap 5 detik tanpa henti |
| `/api/pengaturan?ringkas=1` & `?tampilan=1` | penuh 3.988 KB · `tampilan` 1.202 KB · `ringkas` **0 KB** |
| Logo struk dikompres saat diunggah | logo 4 MB tidak lagi lahir |
| `next/image` + `remotePatterns` | Vercel mengambil sekali, lalu dari CDN-nya sendiri |

Yang terakhir itu yang belakangan menyelamatkan keadaan — lihat bagian 5.

---

## 3. Service worker — `cache-aset-offline` (20/26)

`public/sw.js` **ditulis tangan**, tanpa next-pwa/workbox/serwist. Alasannya:
kalau service worker salah, salahnya **menetap di perangkat orang**, dan lapisan
build justru menghalangi penelusuran.

Aturan yang tidak boleh dilanggar:

```js
// ATURAN PALING PENTING — data bisnis tidak pernah disentuh.
if (url.pathname.startsWith("/api/")) return;
```

Aplikasi ini memegang harga, stok, piutang, dan saldo upah orang. **Angka basi
yang tampak wajar jauh lebih berbahaya daripada gagal terang-terangan** —
kegagalan yang kelihatan bisa ditangani manusia.

Yang lain:

- `install` **sengaja tidak** memanggil `skipWaiting()`. Versi baru menunggu
  pengguna menekan "muat ulang". Mengambil alih di tengah sesi bisa membuat
  halaman terbuka meminta potongan JavaScript yang sudah tidak ada — tepat saat
  orang sedang membuat nota.
- Respons galat **tidak pernah menimpa** salinan yang masih baik. Inilah yang
  membuat gambar bertahan saat sumbernya membalas 402.
- Setiap kali `public/sw.js` diubah, **naikkan konstanta `VERSI`**. Sekarang
  `v3`.

---

## 4. Pindah ke Cloudflare R2 — `pindah-gambar-ke-r2`

### Kenapa R2

R2 **tidak menagih egress sama sekali**, dan yang lebih penting: ia memisahkan
nasib gambar dari nasib basis data. Di Supabase keduanya berbagi satu jatah, jadi
apa pun yang menjebolkan salah satunya mematikan keduanya.

### Keputusan besar: DNS tidak jadi dipindahkan

Rencana awal memakai `img.linaflowers.my.id`, yang mensyaratkan nameserver
`linaflowers.my.id` pindah dari anymhost ke Cloudflare. **Itu dibatalkan.** Satu
catatan DNS terlewat saat migrasi = situs jualan mati.

Ternyata tidak perlu: R2 punya subdomain publik bawaan `pub-<hash>.r2.dev` yang
aktif dalam hitungan menit tanpa menyentuh DNS. Konsekuensinya cuma URL yang
jelek — tidak pernah dilihat pelanggan.

Jalur domain sendiri disimpan sebagai lampiran opsional di `tasks.md`, lengkap
dengan peringatannya. Kalau suatu hari dikerjakan, cukup ganti
`R2_PUBLIC_BASE_URL`; kode dan `next.config.ts` sudah menerima keduanya.

### Kenapa `aws4fetch`, bukan `@aws-sdk/client-s3`

Yang dibutuhkan hanya tanda tangan SigV4 untuk PUT dan DELETE. aws4fetch ~84 KB;
SDK resminya megabyte-an. Menulis SigV4 sendiri juga ditolak — salah sedikit
menghasilkan 403 yang sulit ditelusuri.

### `hapusGambarR2` sengaja tidak pernah melempar galat

Berkas yatim jauh lebih ringan akibatnya daripada penghapusan pengeluaran atau
penggantian foto yang batal gara-gara jaringan sedang bermasalah.

---

## 5. Dua masalah jaringan yang menyamar jadi masalah R2

Keduanya memakan waktu panjang karena gejalanya persis seperti salah konfigurasi.

### 5a. `resolved to private ip ["64:ff9b::…"]` — hanya di `next dev`

Next 16 menolak mengoptimasi gambar bila nama hostnya menghasilkan alamat
non-unicast, memakai `dns.lookup(hints: ALL)`. Jaringan tethering di sini
memakai **DNS64/NAT64**, jadi `supabase.co` ikut mengembalikan bentuk
`64:ff9b::6812:260a` — yang sebenarnya alamat Cloudflare publik `104.18.38.10`,
tapi digolongkan `ipaddr.js` sebagai rentang `rfc6052`. Next menolak begitu **ada
satu** yang tersaring, walau IPv4 yang sah juga ikut dikembalikan.

Ditangani: `dangerouslyAllowLocalIP` menyala **hanya saat `next dev`**. Produksi
tidak boleh, dan `remotePatterns` tetap berlaku saat opsi ini menyala.

### 5b. `ERR_CERT_AUTHORITY_INVALID` — ini yang serius

Setelah semuanya benar, foto tetap kosong. Konsol peramban menunjukkan
sertifikat TLS untuk `*.r2.dev` **tidak tepercaya**. Ada penyaringan tingkat
jaringan yang menyadap HTTPS ke host itu — `r2.dev` kerap masuk daftar blokir
karena banyak dipakai menumpang berkas sembarangan.

Yang membuatnya sulit dibaca: **gambar tampil di katalog publik tapi kosong di
halaman Produk.** Sebabnya katalog memakai `<Image>` (Vercel yang mengambil)
sedangkan halaman Produk memakai `<img>` mentah (peramban yang mengambil). Di
seluruh aplikasi ada **35 `<img>` mentah berbanding 7 `<Image>`**.

Ini bukan cuma masalah sendiri — **pelanggan yang ISP-nya ikut memblokir `r2.dev`
juga tidak akan melihat foto di katalog.**

Ditangani: seluruh alamat gambar disalurkan lewat `/gambar?url=…` pada domain
sendiri (`lib/gambar.ts` + `app/(backend)/gambar/route.ts`).

> **Jangan sederhanakan `urlGambar(foto)` kembali menjadi alamat R2 langsung.**
> Gambar akan hilang lagi, dan hanya di sebagian jaringan — sulit ditelusuri.

Dua rincian rancangan yang penting:

- Rutenya **sengaja di luar `/api/`**. Service worker melewatkan seluruh
  `/api/**`; menaruhnya di sana akan mencabut kemampuan gambar bertahan offline.
- Pembatasan awalan memakai `` `${basis}/` `` **dengan garis miring**, supaya
  `pub-xxx.r2.dev.penyerang.com` tidak lolos. Tanpa itu, rute ini jadi perantara
  terbuka.

---

## 6. Keadaan sekarang

### Sudah terbukti jalan (diuji di produksi)

| | |
|---|---|
| Unggah lewat aplikasi → R2 | ✅ berkas masuk bucket, URL tersimpan benar |
| `/_next/image` atas gambar R2 | ✅ `200 image/webp` |
| `/_next/image` atas gambar Supabase | ❌ `502` — memang masih diblokir |
| Perantara `/gambar` | ✅ `200`, `Cache-Control: immutable` |
| Penjagaan perantara | ✅ bucket lain, serangan awalan, host asing, `169.254.169.254`, tanpa parameter → semua `400` |
| Kredensial R2 langsung ke S3 | ✅ PUT / LIST / DELETE |

### Sebaran gambar

```
71 produk →  1 di R2 (TESTING PRODUK — hapus kalau cuma uji coba)
            57 di Supabase (rusak permanen, harus difoto ulang)
            13 tanpa foto
```

### Cara mengambil kembali gambar dari R2

Ini beda mendasar dari Supabase dulu. Ketika Supabase memblokir, **tidak ada
jalan masuk sama sekali** — gambarnya hilang untuk selamanya. Di R2 kita
memegang kredensial S3-nya, dan endpoint `<account>.r2.cloudflarestorage.com`
**tidak ikut disaring** jaringan yang memblokir `r2.dev`.

```bash
node scripts/unduh-gambar-produk.cjs
```

Skripnya mengambil URL R2 lewat **S3 bertanda tangan**, bukan alamat publiknya,
lalu menamai tiap berkas menurut nama produknya:

```
gambar-produk/074 - TESTING PRODUK.webp
gambar-produk/daftar-produk.txt      ← daftar teks, gampang di-Ctrl+F
gambar-produk/index.html             ← katalog offline, buka di peramban
```

Sudah diuji: gambar R2 terunduh, 57 gambar Supabase gagal `402` seperti yang
diharapkan. Jalankan ulang setelah sesi foto ulang selesai — yang sudah ada
dilewati.

---

## 7. Yang belum selesai

### Mendesak — sisa pekerjaan tangan

1. **Foto ulang ~70 produk bersama Mama.** Panduan namanya di
   `gambar-produk/daftar-produk.txt`. Kerjakan langsung dari HP di
   `linaflowers.my.id/produk` — **tidak perlu localhost**. Halaman Produk sendiri
   jadi penanda progres: yang masih kosong berarti belum dikerjakan. Boleh
   dicicil.
2. **Unggah ulang logo toko & foto profil** lewat halaman Pengaturan. Keduanya
   tersimpan di basis data, bukan storage, jadi urusannya terpisah.
3. **Isi tarif produk tiap pengrajin.** Tanpa ini setoran ditolak, dan itu baru
   ketahuan di pagi tersibuk.
4. **Cek `SESSION_SECRET` sudah diset di Vercel** — lubang keamanan kalau belum.
   (Terkonfirmasi ada di daftar env Vercel, tapi belum diverifikasi nilainya.)

### Belum pernah dilihat berjalan

Sesi ini tidak punya peramban dengan sesi login di sisi asisten, sama seperti
sesi sebelumnya. Yang masih menunggu:

- [ ] **Ganti foto produk yang sama** → berkas lama benar-benar terhapus dari
      bucket
- [ ] **Unggah foto struk** pada sebuah pengeluaran → masuk ke awalan `struk/`
- [ ] **Alur pembayaran piutang** — bayar penuh, sebagian, cicil, melebihi sisa
      (harus ditolak), hapus pembayaran
- [ ] **Alur pengrajin lengkap** — tugaskan → setor sebagian → tarik upah → cek
      di Laba Rugi
- [ ] **Bagi satu baris ke dua pengrajin**, dan **penerusan upah ke ketua**
- [ ] **Cetak sungguhan satu lembar label** lalu cocokkan dengan plastiknya
- [ ] **Tampilan 360px** untuk Pengeluaran, Piutang, Papan Tugas, Pengrajin
- [ ] **Verifikasi service worker di peramban** — gambar bertahan saat jaringan
      mati, `/api/**` benar-benar tidak di-cache, alur toast pembaruan

### Perlu diputuskan

5. **Angka Juli abaikan saja** — omzet besar tanpa biaya tercatat. Pemilik sudah
   memutuskan fitur keuangan dipakai **mulai Agustus dengan data baru**.
6. **Bulan pertama akan bergelombang** — bahan dibeli Juli, terjual Agustus.
   Baca dari bulan kedua, atau lihat total dua bulan.
7. **Satuan tarif vs satuan pesanan** — sekarang diasumsikan sama.
8. **Barang cacat** — seluruh setoran dibayar penuh. Kalau perlu dipotong, catat
   setoran sejumlah yang layak saja.
9. **Ukuran label** — dua per baris A4, tinggi ~34mm, di `lib/labelPacking.ts`.

### Warisan lama (masih terbuka)

10. **Logo toko tidak bisa diakses dari desktop** — headernya `desktop:hidden`.
11. **Centang packing saat qty bertambah** — qty 2 → 5 tapi centang tetap.
12. **Kartu produk agak gemuk di jendela 900–1000px** — sifat bawaan `auto-fill`.

### Kerapian

13. **Dua commit punya `@` nyasar di judulnya** (`75538d1`, `64763cc`) — akibat
    sintaks here-string PowerShell dipakai di Bash tool. Isinya benar.
    Merapikannya harus menulis ulang riwayat yang sudah ter-push.
14. **Draf usang** — `pengrajin-payroll` sudah tergantikan penuh oleh
    `pengrajin-tugas-upah`; `petty-cash-hpp` tinggal separuh. Sebaiknya
    diarsipkan supaya sesi berikutnya tidak salah ambil rencana.
15. **Persempit `**.r2.dev`** — sudah dikerjakan, kini menunjuk host bucket yang
    persis. Kalau subdomain R2 pernah dibuat ulang, perbarui di `next.config.ts`
    **dan** `R2_PUBLIC_BASE_URL`.

---

## 8. Cara melanjutkan

> **JANGAN jalankan dua server dev sekaligus.** Sesi ini sempat membuat laptop
> ngefreeze karena tiga instance Turbopack jalan bersamaan sampai muncul
> `ENOMEM`. Untuk sesi foto ulang, localhost **tidak dibutuhkan sama sekali** —
> kerjakan dari HP lewat produksi.

```bash
npm run dev          # http://localhost:3000  — satu saja
```

Perintah pemeriksaan:

```bash
npx tsc --noEmit                                     # typecheck
npx eslint "app/(frontend)/nama/page.tsx"            # lint satu berkas
node --experimental-strip-types scripts/uji-perhitungan.mts   # 21 uji hitung
node scripts/unduh-gambar-produk.cjs                 # arsip gambar bernama produk
node scripts/unduh-gambar-produk.cjs --peta-saja     # daftar saja, tanpa unduh
openspec list                                        # progres semua change
```

### Env yang wajib ada

`DATABASE_URL`, `DIRECT_URL`, `SESSION_SECRET`, `SUPABASE_URL`,
`SUPABASE_SERVICE_ROLE_KEY`, `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`,
`R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `R2_PUBLIC_BASE_URL`.

> **Env Supabase JANGAN dihapus** walau storage-nya ditinggalkan.
> `DATABASE_URL`/`DIRECT_URL` adalah basis datanya sendiri, dan
> `SUPABASE_SERVICE_ROLE_KEY` masih jadi cadangan secret sesi di
> `lib/serverSession.ts` — dihapus berarti semua yang sedang login terlempar
> keluar.

Kalau kredensial R2 diputar: buat token baru di R2 → Manage API tokens (Object
Read & Write, dibatasi ke bucket `lina-produk`), perbarui env di Vercel
**dan** `.env` lokal, lalu **Redeploy tanpa build cache**.

### Kalau perangkat tersangkut di versi lama (service worker)

- **Chrome Android**: titik tiga → Setelan situs → `linaflowers.my.id` → Hapus data
- **PWA terpasang**: hapus aplikasinya, pasang ulang
- **Desktop**: DevTools → Application → Service Workers → Unregister, lalu Clear
  site data

### Jebakan yang memakan waktu

- **Cache Turbopack menahan berkas rusak.** Kalau halaman terus 500 walau
  sumbernya sudah benar: hentikan server → `rm -rf .next` → `npm run dev`.
- **Jangan pakai here-string PowerShell (`@'...'@`) di Bash tool.** Pakai
  `git commit -F -` dengan heredoc `<<'EOF'`.
- **Env hanya dibaca saat server menyala.** Setelah mengubah `.env` atau
  `next.config.ts`, jalankan ulang.
- **Skrip di scratchpad tidak menemukan `node_modules`.** Rujuk dengan path
  penuh: `await import("file:///D:/kasir/kasir-digital/node_modules/…")`.

**Catatan lint:** repo ini sudah punya error/warning bawaan yang tidak
berhubungan (`prefer-const`, `no-explicit-any`, `set-state-in-effect`, warning
`<img>`). Yang penting **tidak ada tambahan baru** — cara tercepat mengecek:
`git stash` → lint → `git stash pop` → lint, bandingkan jumlahnya.

---

## Berkas yang lahir di sesi ini

| Berkas | Isi |
|---|---|
| `lib/r2Storage.ts` | Unggah/hapus gambar di R2 lewat SigV4; menolak dengan pesan jelas bila env kurang |
| `lib/gambar.ts` | `urlGambar()` — salurkan alamat R2 lewat domain sendiri; aman untuk base64 & path relatif |
| `app/(backend)/gambar/route.ts` | Perantara gambar, di luar `/api/` supaya tetap bisa di-cache offline |
| `lib/pollingHemat.ts` | Jeda polling + berhenti saat tab tak terlihat |
| `public/sw.js` | Service worker tulis tangan; `/api/**` tidak pernah disentuh |
| `components/PendaftarServiceWorker.tsx` | Pendaftaran + toast pembaruan, hanya di produksi |
| `PANDUAN-R2.md` | Panduan langkah demi langkah, dipakai sambil mengerjakan |
| `scripts/unduh-gambar-produk.cjs` | Arsip gambar bernama produk + katalog offline; R2 lewat S3 bertanda tangan |
