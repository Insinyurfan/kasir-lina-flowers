## Why

Di layar desktop, navigasi aplikasi ini berupa sidebar selebar 80px berisi
**ikon tanpa label**. Lebarnya baru mengembang menjadi 256px saat kursor
menyentuhnya (`desktop:w-20 desktop:hover:w-64` di `app/layout.tsx`). Akibatnya
pemilik melihat tujuh belas ikon merah muda bertumpuk yang tidak satu pun bisa
dibaca sebelum disentuh satu per satu — dan tiga di antaranya berbentuk papan
jepit yang mirip (Status Pesanan, Checklist Packing, Log Aktivitas).

Masalahnya bertumpuk dua:

1. **Tidak ada pengelompokan.** Ketujuh belas menu berdiri sebagai satu daftar
   datar. Komentar di `app/layout.tsx` mencatat sebabnya dengan jujur: *"URUTAN
   LAMA — sengaja dipertahankan persis seperti sebelum ada modul keuangan &
   pengrajin... Menu baru dikumpulkan di bawah Log Aktivitas."* Keputusan itu
   benar saat diambil, demi menjaga otot ingatan pemakai lama. Tetapi aplikasi
   ini sekarang mengerjakan tiga pekerjaan yang dulu hanya satu — jualan,
   operasional rumah, dan keuangan — dan satu daftar datar tidak sanggup lagi
   menampungnya.
2. **Label disembunyikan.** Bahkan seandainya sudah dikelompokkan, tidak ada
   yang bisa dipindai mata selama teksnya baru muncul saat disentuh kursor.

Tidak ada header di desktop sama sekali; header yang ada ditandai
`desktop:hidden` dan memang khusus HP.

## What Changes

- **Header navigasi baru khusus desktop**, menggantikan sidebar. Menu
  dikelompokkan menjadi lima tarikan-bawah dengan label yang **selalu terbaca**,
  ditambah Dashboard sebagai tautan tunggal:

  | Kelompok | Isi |
  |---|---|
  | (tanpa kelompok) | Dashboard |
  | **Orderan** | Orderan Manual, Status Pesanan, Riwayat Penjualan, Unduh Nota |
  | **Tugas** | Tugas Pengrajin, Checklist Packing |
  | **Keuangan** | Piutang, Pengeluaran, Laba Rugi, Laporan |
  | **Data** | Produk, Pelanggan, Pengrajin |
  | **Sistem** | Log Aktivitas, Manajemen Akun |

- **Kasir (POS) berdiri sebagai tombol tersendiri** di sisi kanan header, bukan
  isi tarikan-bawah. Ini tindakan yang paling sering dilakukan; menyembunyikannya
  di dalam kelompok berarti menambah satu klik pada pekerjaan yang diulang
  puluhan kali sehari. Sejajar pula dengan header HP yang sudah menaruh tombol
  keranjang di sana.
- **Tarikan-bawah terbuka saat disentuh kursor**, mengikuti perilaku sidebar
  sekarang supaya tidak ada kebiasaan baru yang harus dipelajari.
- **Kelompok yang memuat halaman aktif ikut ditandai aktif.** Saat pengguna
  berada di `/piutang`, kelompok **Keuangan** terlihat aktif meski isinya sedang
  tertutup — tanpa ini pengguna kehilangan jejak posisinya.
- **Blok profil pindah ke pojok kanan header** (foto, nama, @username, dan label
  peran), mengikuti pola avatar-di-kanan yang lazim.
- **Sidebar dihapus di desktop.** Membiarkan keduanya berdampingan berarti dua
  navigasi untuk hal yang sama. Menghapusnya juga mengembalikan ~80px lebar
  untuk konten — paling terasa pada halaman bertabel lebar seperti Riwayat
  Penjualan dan Piutang — serta menghilangkan pergeseran tata letak saat kursor
  melintasi sidebar, karena elemennya `desktop:static` sehingga pelebarannya
  mendorong konten.
- **Penapisan peran dipertahankan persis.** Menu yang sekarang hanya tampil bagi
  Owner atau Owner/Admin tetap demikian di dalam kelompoknya. Kelompok yang
  seluruh isinya tersembunyi bagi peran tertentu MUST ikut disembunyikan, bukan
  tampil kosong.
- **Satu sumber susunan menu.** Daftar menu beserta kelompok dan syarat perannya
  didefinisikan di satu tempat, lalu dipakai bersama oleh header desktop dan
  laci HP. Tanpa ini, keduanya akan menyimpang diam-diam begitu ada menu baru.

## Non-Goals

- **Versi HP tidak diubah.** Pemilik menyatakan tampilan HP saat ini sudah bagus.
  Header HP, laci hamburger, dan menu bawah tetap seperti sekarang. Satu-satunya
  sentuhan ke HP adalah tugas percobaan yang terpisah dan bisa dibatalkan sendiri
  (lihat bagian di bawah).
- **Menu bawah HP tidak ditukar isinya.** Sempat diusulkan menaikkan Piutang ke
  sana, tetapi pemilik menegaskan tidak ada yang rusak atau hilang di HP. Bukan
  masalah, jadi bukan cakupan.
- **Tidak ada halaman yang digabung, dipecah, dihapus, atau dipindah URL-nya.**
  Perubahan ini murni penyusunan ulang navigasi. `Laporan` dan `Laba Rugi`
  memang bertumpang tindih dan akan makin kentara begitu berdiri berdampingan di
  kelompok Keuangan — itu keputusan tersendiri, sengaja tidak diambil di sini.
- **Tidak ada perubahan pada isi halaman**, warna, atau tema — kecuali judul di
  `papan-tugas` dan `request-pesanan`, yang ikut memakai nama barunya agar menu
  dan halaman yang dibukanya tidak menyebut dua nama berbeda.

## Percobaan yang bisa dibatalkan: kelompok di laci HP

Pemilik ingin mencoba pengelompokan yang sama sebagai judul di dalam laci
hamburger HP, diuji dulu secara lokal: **kalau enak dipandang, dilanjutkan;
kalau tidak, dikembalikan seperti semula.** Karena itu bagian ini disusun
sebagai tugas terpisah di akhir daftar, tidak disentuh oleh tugas mana pun
sebelumnya, sehingga membatalkannya tidak merusak header desktop.

## Capabilities

### New Capabilities

- `desktop-navigation`: Navigasi desktop berupa header berisi menu yang
  dikelompokkan dengan label selalu terbaca, menandai kelompok yang memuat
  halaman aktif, dan menghormati penapisan peran yang berlaku.

## Impact

- **Berkas**: `app/layout.tsx` (bagian sidebar & header), ditambah satu modul
  baru berisi definisi susunan menu — kelompok, label, ikon, href, syarat peran.
- **Tidak ada perubahan** pada model data, API, maupun rute.
- **Risiko utama — otot ingatan.** Pemakai lama terbiasa dengan urutan sidebar
  yang sekarang. Pengelompokan mengubah tempat mencari, meski tidak ada yang
  hilang. Karena itu isi tiap kelompok mengikuti alur kerja nyata, bukan abjad.
  Enam label ikut diganti atas keputusan pemilik — alasannya justru meringankan
  risiko ini: karena tempat mencarinya toh sudah berubah, namanya sekalian
  disamakan dengan istilah yang dipakai sehari-hari.
- **Risiko kedua — layar sempit.** Lima kelompok plus Dashboard, tombol Kasir,
  lonceng, dan profil harus tetap muat pada desktop paling sempit yang dipakai.
  Perlu diuji, dengan perilaku mundur yang jelas bila tidak muat.
- **Aksesibilitas**: tarikan-bawah yang hanya terbuka lewat kursor tidak dapat
  dijangkau papan ketik. Fokus papan ketik MUST juga membukanya.
