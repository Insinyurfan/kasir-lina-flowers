## 1. Service worker

- [x] 1.1 Buat `public/sw.js` dengan nama cache berversi (mis. `lina-v1-aset`, `lina-v1-gambar`, `lina-v1-halaman`)
- [x] 1.2 `install`: siapkan cache, JANGAN panggil `skipWaiting()` otomatis — tunggu perintah dari halaman
- [x] 1.3 `activate`: hapus seluruh cache milik versi lama, lalu `clients.claim()`
- [x] 1.4 `fetch` — `/_next/static/**`: cache dulu, simpan permanen (nama sudah ber-hash)
- [x] 1.5 `fetch` — gambar (`/_next/image*` + URL publik Supabase): cache dulu, segarkan di latar
- [x] 1.6 `fetch` — navigasi: jaringan dulu, jatuh ke cache bila gagal
- [x] 1.7 `fetch` — `/api/**`: lewatkan begitu saja, JANGAN pernah di-cache atau disimpan
- [x] 1.8 Abaikan permintaan non-GET dan skema selain http/https
- [x] 1.9 Dengarkan pesan `LEWATI_MENUNGGU` dari halaman lalu panggil `skipWaiting()`

## 2. Pendaftaran & kendali pembaruan

- [x] 2.1 Buat `components/PendaftarServiceWorker.tsx` — komponen klien tanpa tampilan
- [x] 2.2 Daftarkan `/sw.js` hanya bila `process.env.NODE_ENV === "production"`
- [x] 2.3 Deteksi service worker yang menunggu, lalu tampilkan toast **"Versi baru tersedia — muat ulang"**
- [x] 2.4 Tombol pada toast mengirim `LEWATI_MENUNGGU` lalu memuat ulang halaman setelah `controllerchange`
- [x] 2.5 Cegah muat ulang berulang (`controllerchange` bisa terpicu lebih dari sekali)
- [x] 2.6 Pasang komponen itu sekali di `app/layout.tsx`

## 3. Header & konfigurasi

- [x] 3.1 `next.config.ts`: sajikan `/sw.js` dengan `Cache-Control: no-cache, no-store, must-revalidate`
- [x] 3.2 Pastikan `Service-Worker-Allowed` tidak diperlukan (cakupannya `/`, sama dengan lokasi berkasnya)

## 4. Verifikasi

- [x] 4.1 `npx tsc --noEmit` bersih dan ESLint tidak menambah error baru
- [x] 4.2 Build produksi berhasil; `/sw.js` tersaji utuh dengan header `no-cache` & `Service-Worker-Allowed: /`. **Sisa untuk kamu**: pastikan benar-benar terdaftar & menyajikan dari cache di peramban
- [ ] 4.3 Uji gambar bertahan: muat katalog, matikan jaringan di DevTools, muat ulang — gambar tetap tampil
- [ ] 4.4 Uji API tidak di-cache: matikan jaringan, pastikan permintaan `/api/**` gagal dan TIDAK menyajikan data lama
- [ ] 4.5 Uji navigasi luring: halaman yang pernah dibuka tetap tampil kerangkanya
- [ ] 4.6 Uji pembaruan: ubah `sw.js`, deploy ulang, pastikan toast "Versi baru tersedia" muncul dan muat ulang bekerja
- [ ] 4.7 Uji pembersihan cache: setelah versi baru aktif, cache versi lama sudah tidak ada di DevTools → Application → Cache Storage
- [ ] 4.8 Pastikan `npm run dev` TIDAK mendaftarkan service worker
- [x] 4.9 Catat jalan keluar manual di `CATATAN-SESI.md`: hapus data situs lewat pengaturan peramban, atau pasang ulang PWA
