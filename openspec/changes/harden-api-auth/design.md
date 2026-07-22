## Context

Otorisasi API saat ini "percaya pada klien": handler membaca `actorId` dari body lalu `findAccountById(actorId)` dan mengecek perannya. Karena `actorId` dikirim klien, identitas bisa dipalsukan. Sebaliknya, sudah tersedia sesi ber-tanda-tangan HMAC di `lib/serverSession.ts` (`getServerSessionUser(request)`) yang membaca cookie `lina_session`, memverifikasi tanda tangan + kedaluwarsa, lalu mengambil user dari DB. Cookie ini `httpOnly`, `sameSite=lax`, `path=/`, sehingga **otomatis ikut** pada setiap fetch same-origin dari frontend.

Kondisi sekarang setengah jalan:
- `status-pesanan` & `request-pesanan` (PATCH) → sudah memakai `getServerSessionUser` + cek peran (pola rujukan).
- Sisanya (`akun`, `transaksi` tulis, `produk`, `harga-pelanggan`, `pengaturan`, `log-aktivitas`, `notifikasi`, `cart`, `upload`, `bulk-delete`) → masih berbasis body/query.

## Goals / Non-Goals

**Goals:**
- Menjadikan sesi terverifikasi sebagai satu-satunya sumber identitas untuk endpoint terproteksi.
- Menegakkan aturan peran (Owner / Owner+Admin) dan kepemilikan data (keranjang) secara konsisten.
- Perubahan frontend seminimal mungkin (memanfaatkan cookie yang sudah otomatis terkirim).

**Non-Goals:**
- Merombak model data (varian/kode pelanggan, id baris keranjang) — di luar lingkup.
- Menambah OAuth/2FA/rate-limiting menyeluruh — bisa jadi change terpisah.
- Refactor UI atau fitur baru.

## Decisions

**1. Guard per-rute via helper, bukan `middleware.ts`.**
Alasan: verifikasi butuh lookup DB (ambil role user), sementara Next middleware berjalan di edge dan lebih cocok untuk cek ringan. Helper `requireUser(req)` / `requireRole(req, roles)` memberi kontrol halus per-handler dan mudah diuji. Alternatif ditolak: middleware edge (tak nyaman untuk DB + role granular).

**2. Abaikan `actorId`/`actorRole` dari body, jangan hapus field-nya dulu.**
Alasan: menjaga kompatibilitas — frontend boleh tetap mengirimnya; server cukup tidak mempercayainya. Untuk pencatatan log aktivitas, nama aktor diambil dari **user sesi**, bukan payload. Alternatif ditolak: mengubah semua pemanggilan frontend sekaligus (risiko besar, tak perlu).

**3. `SESSION_SECRET` khusus + fail-closed.**
Alasan: saat ini secret jatuh ke `DATABASE_URL` bila `SESSION_SECRET` kosong — rapuh (URL DB bocor = token bisa dipalsu; ganti URL = semua sesi hangus). Set env khusus; bila tak ada, tolak terbitkan/verifikasi sesi. Migrasi: set env dulu SEBELUM deploy agar sesi lama tetap valid (secret sama bila sengaja disamakan sementara).

**4. Matriks peran eksplisit.**
```
Owner saja        : akun (POST/PATCH/DELETE), pengaturan (POST),
                    log-aktivitas (DELETE), transaksi (DELETE) + bulk-delete
Owner atau Admin  : transaksi (POST/PATCH), produk (+[id]/variants tulis),
                    harga-pelanggan (POST/DELETE), notifikasi (tulis),
                    upload/produk (POST), status/request-pesanan (PATCH)
Wajib login       : cart (pemilik), GET sensitif (laporan/dashboard/
                    riwayat/log)
Publik            : login, produk GET (katalog), request-pesanan POST,
                    status-pesanan GET (lacak)
```

## Risks / Trade-offs

- **[Salah kunci flow publik]** → mengunci pelanggan/tamu. Mitigasi: daftar publik dieksplisitkan & diuji sebelum rilis; default "wajib login" hanya diterapkan setelah daftar publik dipastikan.
- **[Live tanpa test]** → regresi tak terdeteksi. Mitigasi: checklist uji manual per peran + uji spoof; opsional beberapa test integrasi auth; rilis saat jam sepi.
- **[Fail-closed pada SESSION_SECRET]** → bila env lupa diset, semua user ter-logout. Mitigasi: set env dulu, verifikasi di preview, baru promote ke production.
- **[Beban DB naik]** → tiap request terproteksi lookup user. Mitigasi: query ringan (select kolom minimal); dapat di-cache singkat bila perlu (di luar lingkup awal).

## Migration Plan

1. Set `SESSION_SECRET` di Vercel (production + preview).
2. Rilis helper `lib/apiAuth.ts` + terapkan ke rute (bertahap: publik dipastikan dulu, lalu rute tulis, lalu GET sensitif).
3. Deploy ke **preview**, uji tiap peran + percobaan spoof.
4. Promote ke production saat sepi; segera verifikasi login, transaksi, cetak.
5. Rollback: revert commit + (jika perlu) kembalikan fallback secret sementara.

## Open Questions

- Apakah `request-pesanan POST` (pelanggan menaruh pesanan) benar-benar publik, atau butuh sesi Tamu? (Perlu konfirmasi alur tamu saat ini.)
- Apakah `produk GET`, `laporan GET`, `dashboard GET` perlu dibedakan publik vs login? (Katalog publik, laporan/dashboard wajib login.)
- Apakah perlu logout paksa (invalidasi sesi) saat peran user diubah/di-hapus?
