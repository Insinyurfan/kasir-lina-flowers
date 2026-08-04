## Context

Setelah pemadaman 3 Agustus 2026, tiga perbaikan sudah dikerjakan: polling dijarangkan, `next/image` mengaktifkan cache CDN, dan service worker menyimpan gambar di perangkat. Permintaan ke sumber gambar sekarang jauh lebih sedikit.

Change ini bukan lagi tentang mengurangi lalu lintas, melainkan tentang **memisahkan nasib**: selama gambar dan basis data berbagi kuota yang sama, apa pun yang membuat salah satunya jebol akan mematikan keduanya.

Keadaan yang membentuk keputusan:

- Storage lama **masih diblokir**, jadi migrasi otomatis mustahil — berkasnya tidak bisa dibaca.
- Ibu pemilik sedang di rumah dan hafal produknya. Ini jendela waktu untuk mencocokkan 57 foto secara manual yang tidak selalu ada.
- Domain masih di `anymhost.id`, bukan Cloudflare.
- Situs produksi berjalan di Vercel dengan domain itu.

## Goals / Non-Goals

**Goals:**

- Lalu lintas gambar tidak lagi membebani kuota Supabase, permanen.
- Gambar mati tidak ikut mematikan basis data, dan sebaliknya.
- Perpindahan tidak mematikan situs produksi.
- Menambah sesedikit mungkin dependensi.

**Non-Goals:**

- Memindahkan basis data. Supabase Postgres sehat dan tetap dipakai.
- Memindahkan logo toko & struk — keduanya base64 di dalam basis data.
- Skrip migrasi berkas lama.

## Decisions

### 1. Domain sendiri, bukan URL `r2.dev`

Bucket diakses lewat `img.linaflowers.my.id`, bukan `<bucket>.r2.dev`.

*Alasan:* Cloudflare membatasi laju URL `r2.dev` dan menyatakan secara terbuka bahwa itu bukan untuk lalu lintas produksi. Memakainya berarti **mengulang persis pola kegagalan yang sedang kita tinggalkan**: gambar tiba-tiba tidak tampil karena dibatasi penyedia. Tidak ada gunanya pindah kalau risikonya dibawa serta.

*Ongkosnya:* domain harus dipindahkan ke DNS Cloudflare — dan domain itu melayani situs produksi. Karena itu langkahnya diuraikan rinci dan wajib dikerjakan saat sepi.

### 2. `aws4fetch`, bukan `@aws-sdk/client-s3`

*Alasan:* yang dibutuhkan hanya tanda tangan AWS SigV4 untuk `PUT` dan `DELETE`. `aws4fetch` beberapa kilobyte; SDK resmi berukuran megabyte dan membawa banyak hal yang tidak dipakai — beban nyata pada fungsi serverless.

*Alternatif yang ditolak:* menulis tanda tangan SigV4 sendiri. Berbeda dengan `supabaseStorage.ts` yang cukup memasang header token, SigV4 melibatkan canonical request, hashing bertingkat, dan turunan kunci per tanggal. Salah sedikit menghasilkan `403` yang sulit ditelusuri. Ini satu kasus di mana dependensi memang lebih murah daripada menulis sendiri.

### 3. Catatan DNS Vercel disetel **DNS only**, bukan Proxied

*Alasan:* Vercel sudah punya CDN dan mengelola sertifikatnya sendiri. Menumpuknya dengan proxy Cloudflare (awan oranye) kerap menimbulkan masalah SSL berulang dan pengalihan berlebih. Cloudflare cukup berperan sebagai DNS untuk situsnya; proxy hanya dipakai pada subdomain gambar, yang memang dilayani Cloudflare sendiri.

### 4. `Product.gambar` lama TIDAK dikosongkan

*Alasan:* mengosongkannya membuat semua produk tampak "tidak punya foto", padahal yang sebenarnya terjadi adalah "foto belum diunggah ulang". Dengan membiarkan URL lama, produk yang gambarnya rusak **adalah daftar pekerjaan yang tersisa** — terlihat langsung di halaman Produk tanpa perlu catatan terpisah.

*Konsekuensi yang disengaja:* selama masa transisi, katalog publik menampilkan sebagian gambar rusak. Diterima, karena masa transisinya pendek dan dikerjakan sekaligus.

### 5. Pola `remotePatterns` Supabase dipertahankan

*Alasan:* selama sebagian produk masih menunjuk ke URL lama, `next/image` tetap perlu diizinkan memuatnya. Menghapus polanya lebih awal akan mengubah "gambar rusak" menjadi "halaman galat".

Boleh dihapus setelah seluruh foto diunggah ulang.

### 6. Unggah manual, bukan skrip migrasi

*Alasan:* skrip mustahil selama Storage lama diblokir, dan kesempatan mencocokkan foto bersama orang yang hafal produknya justru sedang ada. Menunggu blokir terangkat hanya demi skrip berarti menyia-nyiakan jendela waktu itu.

## Risks / Trade-offs

**Pemindahan DNS bisa mematikan situs produksi.** Ini risiko terbesar di seluruh change ini, dan letaknya bukan di kode.
→ Screenshot panel DNS lama sebelum menyentuh apa pun; periksa hasil pindaian Cloudflare satu per satu; kerjakan saat sepi. Kalau ada yang salah, kembalikan nameserver ke anymhost — perubahan nameserver bisa dibatalkan, walau propagasinya memakan waktu.

**R2 menagih operasi baca/tulis** meski egress-nya nol.
→ Dengan 57 gambar, `next/image` yang meng-cache di Vercel, dan service worker yang meng-cache di perangkat, jumlah operasinya akan jauh di bawah batas gratis. Tetap perlu dipantau beberapa minggu pertama.

**Dua dashboard untuk dipantau.**
→ Diterima sebagai konsekuensi memisahkan nasib. Justru itu tujuannya.

**Kredensial R2 bocor berarti orang bisa menulis ke bucket.**
→ Token dibuat khusus untuk satu bucket, bukan akun penuh. Disimpan sebagai env di Vercel, tidak pernah masuk repo.

## Migration Plan

1. Pemindahan DNS (kelompok 1) — **sebelum** apa pun yang lain, karena domain gambar bergantung padanya.
2. Kode dirilis. Selama env R2 belum lengkap, unggahan baru ditolak dengan pesan jelas; gambar lama tetap tampil apa adanya.
3. Env diisi di Vercel → unggahan baru mulai masuk R2.
4. Foto diunggah ulang manual.
5. Setelah semuanya masuk, pola `remotePatterns` Supabase boleh dihapus.

**Rollback:** kembalikan rute unggah ke `lib/supabaseStorage.ts`. Gambar yang sudah terlanjur di R2 tetap dapat diakses selama bucket dan domainnya masih ada — tidak ada data yang hilang. Pemindahan DNS dapat dibatalkan dengan mengembalikan nameserver.

## Open Questions

1. **Nasib bucket Supabase lama.** Setelah semua foto diunggah ulang, bucket `produk` & `struk` di Supabase boleh dikosongkan — tetapi ukurannya cuma 10 MB, jadi tidak mendesak. Menyimpannya sebentar juga berfungsi sebagai cadangan bila ternyata ada foto yang terlewat.
2. **Apakah foto struk perlu ikut pindah?** Sekarang ikut, demi konsistensi satu tempat. Kalau ternyata merepotkan, foto struk bisa dikembalikan ke Supabase karena jumlahnya sedikit dan tidak pernah dilihat publik.
