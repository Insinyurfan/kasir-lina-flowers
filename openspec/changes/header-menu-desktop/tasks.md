## 1. Sumber susunan menu

- [x] 1.1 Buat modul definisi menu: kelompok (id, label) + menu (href, label, ikon, syarat peran)
- [x] 1.2 Isi dengan susunan yang disepakati: Dashboard di luar kelompok; Jualan, Rumah, Uang, Data, Sistem
- [x] 1.3 Pindahkan seluruh syarat peran dari JSX `app/layout.tsx` ke definisi ini, tanpa mengubah satu pun aturannya
- [x] 1.4 Sediakan penyaring berdasarkan peran yang membuang kelompok tanpa sisa isi
- [x] 1.5 Pastikan urutan di dalam kelompok mengikuti alur kerja, bukan abjad (Request Pesanan → Status Pesanan → Riwayat Penjualan → Unduh Nota)

## 2. Header desktop

- [x] 2.1 Rangka header `hidden desktop:flex`: logo + nama toko, Dashboard, kepala kelompok, lalu tombol Kasir, lonceng, dan profil di kanan
- [x] 2.2 Kepala kelompok dengan teks selalu tampil
- [x] 2.3 Panel tarikan-bawah: ikon + label tiap menu, memakai ikon yang sudah ada
- [x] 2.4 Tombol Kasir tersendiri di kanan, mengikuti penapisan peran yang sama
- [x] 2.5 Pindahkan blok profil (foto, nama, @username, label peran) beserta menu akunnya ke pojok kanan header
- [x] 2.6 Pindahkan lonceng notifikasi ke header desktop, memakai kembali panel notifikasi yang sudah ada

## 3. Perilaku tarikan-bawah

- [x] 3.1 Terbuka saat disentuh kursor
- [x] 3.2 Tenggang singkat sebelum menutup, agar kursor sempat bergerak menyerong ke isinya
- [x] 3.3 Fokus papan ketik membuka; `Esc` menutup; menu di dalamnya dapat dijangkau Tab
- [x] 3.4 Sentuhan pada perangkat tanpa kursor ikut membuka
- [x] 3.5 Menutup sendiri setelah sebuah menu dipilih
- [x] 3.6 Hanya satu tarikan-bawah terbuka pada satu waktu

## 4. Penanda aktif

- [x] 4.1 Kepala kelompok ditandai aktif bila `pathname` cocok dengan salah satu menu di dalamnya
- [x] 4.2 Baris menu di dalam tarikan-bawah ditandai aktif
- [x] 4.3 Pakai aturan pencocokan yang sama dengan `NavItem` yang ada — jangan menulis definisi "aktif" yang kedua

## 5. Hapus sidebar dari desktop

- [x] 5.1 Sidebar tidak lagi dirender pada lebar desktop; wujud lacinya untuk HP tetap utuh
- [x] 5.2 Buang `desktop:w-20` dan `desktop:hover:w-64` beserta peralihan lebarnya
- [x] 5.3 Sesuaikan tata letak konten agar mengisi lebar yang ditinggalkan sidebar
- [x] 5.4 Pastikan tidak ada lagi pergeseran tata letak saat kursor melintasi sisi kiri halaman
- [x] 5.5 Laci HP dirender dari sumber susunan menu yang sama (urutan lamanya ditulis eksplisit sebagai `URUTAN_LACI_HP` — meratakan `KELOMPOK_MENU` akan mengacak urutan HP, dan pemilik minta HP tidak berubah)

## 6. Verifikasi

- [x] 6.1 Bandingkan menu yang terlihat sebelum dan sesudah untuk tiap peran (Owner, Admin, Tamu) — himpunannya harus sama persis · **diaudit mekanis: 17/17 aturan peran identik dengan JSX lama**
- [x] 6.2 Uji kelompok kosong: peran yang seluruh isi salah satu kelompoknya tersaring habis tidak melihat kepala kelompok itu · **disimulasikan: Tamu → hanya kelompok Data yang dirender, empat lainnya hilang**
- [ ] 6.3 Uji penanda aktif dari tiap halaman: kepala kelompok yang benar ikut menyala
- [ ] 6.4 Uji papan ketik menyeluruh: Tab dari awal header sampai akhir, `Esc` menutup, tidak ada jebakan fokus
- [ ] 6.5 Uji lebar desktop terkecil yang didukung: seluruh kepala kelompok terbaca, halaman tidak bisa digulung ke samping
- [ ] 6.6 Uji layar sentuh selebar desktop: tarikan-bawah bisa dibuka
- [ ] 6.7 **Uji regresi HP**: header, laci hamburger, dan menu bawah berperilaku persis seperti sebelumnya — ini yang secara tegas diminta pemilik agar tidak rusak
- [ ] 6.8 Uji pada halaman bertabel lebar (Riwayat Penjualan, Piutang) bahwa lebar tambahan benar-benar terpakai
- [ ] 6.9 Tinjau bersama pemilik di lokal sebelum di-push

## 7. Percobaan yang bisa dibatalkan — judul kelompok di laci HP

> Dikerjakan paling akhir. Diuji lokal; dilanjutkan bila enak dipandang,
> dikembalikan bila tidak. Tidak ada tugas di atas yang bergantung pada bagian ini.

- [x] 7.1 Sisipkan judul kelompok di antara menu pada laci HP, tanpa mengubah urutan atau isi menu · **dipasang di balik saklar `LACI_HP_DIKELOMPOKKAN`; urutan memang ikut berubah mengikuti kelompok, itulah yang akan dinilai pemilik**
- [ ] 7.2 Uji di lebar 360px: judul tidak membuat daftar jadi terlalu panjang atau perlu digulung berlebihan
- [ ] 7.3 Tunjukkan ke pemilik; putuskan lanjut atau kembalikan ke perataan datar
