## Why

Aplikasi sudah dapat diakses publik di Vercel, tetapi otorisasi API mengambil identitas pemanggil dari **body request** (mis. `actorId`, `actorRole`). Akibatnya siapa pun yang tahu endpoint dapat menyamar sebagai Owner — membuat/menghapus akun, menghapus riwayat penjualan & log, mengubah pengaturan toko — cukup dengan mengirim `actorId` sebuah angka kecil. Mekanisme sesi bertanda-tangan (`getServerSessionUser`, HMAC) **sudah ada** dan sudah dipakai benar di 2 rute (`status-pesanan`, `request-pesanan`), namun mayoritas endpoint tulis belum memakainya. Perlu dikonsistenkan sekarang sebelum ada yang iseng menyalahgunakannya.

## What Changes

- Semua endpoint API yang mengubah data atau mengekspos data bisnis MUST menurunkan identitas pemanggil dari **sesi terverifikasi** (cookie ber-HMAC), bukan dari body/query. **BREAKING (internal)**: field `actorId`/`actorRole` pada body tidak lagi menjadi sumber identitas (diabaikan server).
- Tambah helper otorisasi terpusat (`requireUser`, `requireRole`) agar seragam dan mengurangi kesalahan tiap rute.
- Endpoint sensitif menegakkan aturan peran:
  - **Owner saja**: kelola akun, hapus riwayat, hapus log aktivitas, ubah pengaturan.
  - **Owner/Admin**: transaksi (tulis), katalog produk & variasi (tulis), harga khusus pelanggan, notifikasi.
- Endpoint keranjang (`cart`) MUST memastikan `userId` sama dengan pemilik sesi (cegah baca/tulis keranjang milik pengguna lain).
- Endpoint GET data bisnis (laporan, dashboard, riwayat transaksi, log aktivitas) MUST wajib login.
- Endpoint publik yang sah (login, baca katalog produk, pelanggan menaruh pesanan, lacak status pesanan) tetap dapat diakses tanpa peran khusus — didefinisikan **secara eksplisit**.
- Hardening: gunakan env `SESSION_SECRET` khusus (bukan fallback ke `DATABASE_URL`).

## Capabilities

### New Capabilities
- `api-authorization`: Setiap endpoint API menurunkan identitas pemanggil dari sesi terverifikasi dan menegakkan kontrol akses berbasis peran serta kepemilikan data; endpoint publik didefinisikan secara eksplisit.

### Modified Capabilities
<!-- Tidak ada — belum ada spec yang terekam sebelumnya. -->

## Impact

- **Kode**: seluruh `app/(backend)/api/**/route.ts` (semua handler tulis + GET sensitif), helper baru `lib/apiAuth.ts`, dan `lib/serverSession.ts` (secret khusus).
- **API**: `actorId`/`actorRole` di body tidak lagi dipercaya. Bagi pengguna yang **sudah login**, perilaku sukses tidak berubah.
- **Frontend**: nyaris tidak berubah — cookie sesi `lina_session` otomatis terkirim di setiap fetch same-origin. Tambahan kecil: menangani respons `401` → arahkan ke `/login`.
- **Env**: tambah `SESSION_SECRET`.
- **Risiko**: aplikasi live tanpa test otomatis → butuh rilis hati-hati & verifikasi manual per peran.
