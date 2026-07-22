## 1. Fondasi otorisasi

- [x] 1.1 Buat `lib/apiAuth.ts`: `requireUser(request)` (kembalikan user sesi atau `Response 401`) dan `requireRole(request, roles[])` (kembalikan user atau `Response 401/403`)
- [x] 1.2 Set env `SESSION_SECRET` khusus di Vercel (production + preview); ubah `lib/serverSession.ts` agar tidak fallback ke `DATABASE_URL` (gagal-tertutup bila kosong) — _kode + `.env` lokal selesai; **set env di Vercel masih perlu dilakukan manual sebelum deploy**_
- [x] 1.3 Tetapkan & dokumentasikan daftar endpoint PUBLIK eksplisit (login, `produk` GET, `request-pesanan` POST, `status-pesanan` GET) — didokumentasikan sebagai `PUBLIC_ENDPOINTS` di `lib/apiAuth.ts`

## 2. Endpoint tulis khusus Owner

- [x] 2.1 `akun` POST/PATCH/DELETE → `requireRole(["Owner"])`, aktor log dari sesi (PATCH: wajib login + aturan "Owner atau akun sendiri" dipertahankan)
- [x] 2.2 `pengaturan` POST → Owner
- [x] 2.3 `log-aktivitas` DELETE → Owner
- [x] 2.4 `transaksi` DELETE + `transaksi/bulk-delete` POST → Owner

## 3. Endpoint tulis Owner/Admin

- [x] 3.1 `transaksi` POST/PATCH → Owner/Admin (hapus ketergantungan `getActorFromPayload` sebagai sumber identitas)
- [x] 3.2 `produk`, `produk/[id]`, `produk/[id]/variants` (tulis) → Owner/Admin
- [x] 3.3 `harga-pelanggan` POST/DELETE → Owner/Admin (GET → wajib login)
- [x] 3.4 `notifikasi` POST/PATCH/DELETE → wajib login (peran terkait: Owner/Admin; GET → wajib login)
- [x] 3.5 `upload/produk` POST → wajib login

## 4. Kepemilikan data & GET sensitif

- [x] 4.1 `cart` GET/PUT/DELETE → pakai `userId` dari sesi; tolak/isolasi bila `userId` request berbeda
- [x] 4.2 GET sensitif (`laporan`, `dashboard`, `transaksi` list, `log-aktivitas`) → wajib login
- [x] 4.3 Pastikan endpoint publik (bagian 1.3) TIDAK ikut terkunci

## 5. Penyesuaian klien (minimal)

- [x] 5.1 Pastikan semua fetch ke API bersifat same-origin (cookie otomatis terkirim); tidak perlu lagi mengandalkan `actorId` untuk otorisasi
- [x] 5.2 Tangani respons `401` secara global di klien → arahkan ke `/login` (`components/SessionExpiryHandler.tsx`, dipasang di `app/layout.tsx`)

## 6. Verifikasi & rilis

- [ ] 6.1 Uji manual per peran (Owner/Admin/Tamu) untuk tiap aksi kunci sesuai matriks — _perlu dijalankan bersama user_
- [ ] 6.2 Uji percobaan spoof: kirim `actorId` Owner tanpa sesi → harus `401`; Admin ke aksi Owner → `403` — _perlu dijalankan bersama user_
- [ ] 6.3 (Opsional) Tambah beberapa test integrasi untuk `requireRole` + 1-2 endpoint kritikal — _menunggu change `add-testing` (belum ada framework tes)_
- [ ] 6.4 Deploy ke preview → verifikasi; promote ke production saat sepi → verifikasi login, transaksi, cetak — _perlu dijalankan bersama user; jangan lupa set `SESSION_SECRET` di Vercel dulu_
