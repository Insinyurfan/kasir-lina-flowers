## Why

Pada 3 Agustus 2026 Supabase memblokir Storage (`402 exceed_egress_quota`) dan seluruh gambar produk lenyap dari website. Penyebab utamanya ternyata bukan gambar melainkan egress database — tetapi kejadian itu memperlihatkan satu sifat yang tidak bisa diperbaiki dengan optimasi: **di Supabase, kuota gambar dan kuota database berbagi jatah yang sama.** Apa pun yang membuat salah satunya jebol akan mematikan keduanya.

Cloudflare R2 tidak menagih egress sama sekali. Memindahkan gambar ke sana **menutup satu kategori masalah secara permanen**, sekaligus memisahkan nasib gambar dari nasib database: satu mati, yang lain tetap hidup.

Pemilik juga sedang punya kesempatan yang tidak selalu ada — ibunya sedang di rumah dan hafal produknya, sehingga 57 foto bisa dicocokkan dan diunggah ulang secara manual. Ini menghapus kebutuhan migrasi otomatis, yang lagipula mustahil dilakukan selama Storage lama masih diblokir.

## What Changes

- **Penyimpanan gambar pindah ke Cloudflare R2** lewat API S3-compatible.
- Domain `linaflowers.my.id` dipindahkan ke DNS Cloudflare agar bucket bisa memakai **domain sendiri** (`img.linaflowers.my.id`). URL `r2.dev` bawaan sengaja tidak dipakai — Cloudflare membatasi lajunya dan menyatakan bukan untuk produksi, yang berarti mengulang pola kegagalan yang sama.
- Ditambah satu dependensi: **`aws4fetch`** untuk tanda tangan AWS SigV4. Dipilih karena hanya beberapa kilobyte, dibanding `@aws-sdk/client-s3` yang berukuran megabyte.
- `lib/supabaseStorage.ts` digantikan `lib/r2Storage.ts`; rute `api/upload/produk` dan `api/upload/struk` diarahkan ke sana.
- `next.config.ts` dan `public/sw.js` mengenali host gambar yang baru.
- **Foto diunggah ulang manual** lewat halaman Produk. Tidak ada skrip migrasi.
- **`Product.gambar` lama TIDAK dikosongkan.** Produk yang gambarnya masih rusak berarti belum diunggah ulang — itu menjadi penanda progres yang jujur selama pengerjaan.

## Non-Goals

- Memindahkan database. Supabase Postgres tetap dipakai dan sehat.
- Memindahkan logo toko & logo struk. Keduanya base64 di dalam database, dan sudah ditangani terpisah.
- Migrasi otomatis berkas lama. Mustahil selama Storage lama diblokir, dan tidak diperlukan karena foto akan diunggah ulang.

## Capabilities

### New Capabilities

- `r2-image-storage`: Gambar produk dan foto struk disimpan di Cloudflare R2 dan disajikan lewat domain sendiri, sehingga lalu lintas gambar tidak lagi membebani kuota penyedia basis data.

## Impact

- **Berkas baru**: `lib/r2Storage.ts`.
- **Diganti**: `lib/supabaseStorage.ts` tidak lagi dipakai untuk unggahan baru.
- **Rute**: `api/upload/produk`, `api/upload/struk`.
- **Konfigurasi**: `next.config.ts` (`remotePatterns`), `public/sw.js` (pencocok gambar + naikkan `VERSI`).
- **Dependensi**: `aws4fetch`.
- **Env baru**: `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `R2_PUBLIC_BASE_URL`.
- **Tidak ada perubahan skema basis data.** Kolom `Product.gambar` tetap menyimpan URL; hanya nama host-nya yang berubah untuk unggahan baru.
- **Risiko terbesar bukan di kode, tapi di pemindahan DNS.** Domain ini melayani situs produksi di Vercel. Salah satu catatan DNS terlewat berarti situsnya mati. Karena itu langkahnya diuraikan rinci di `tasks.md` dan wajib dikerjakan saat sepi — bukan pagi hari kirim.
