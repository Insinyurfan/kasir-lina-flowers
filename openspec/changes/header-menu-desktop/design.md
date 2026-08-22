# Rancangan — Header navigasi desktop

## 1. Satu sumber susunan menu

Sekarang menu ditulis sebagai tujuh belas baris JSX berurutan di dalam
`app/layout.tsx`, masing-masing dengan syarat perannya sendiri. Menambah menu
berarti menempelkan satu baris lagi — dan itulah persis cara daftar ini tumbuh
menjadi berantakan.

Susunan menu dipindahkan ke satu modul data, dipakai bersama header desktop dan
laci HP:

```
KELOMPOK_MENU = [
  { id, label, menu: [ { href, label, ikon, syaratPeran } ] }
]
```

Keputusan yang menyertainya:

- **Sebagian label diganti — keputusan pemilik, 22 Agustus 2026.** Semula
  rancangan ini justru melarangnya, dengan alasan mengubah tempat dan nama
  sekaligus membuat pemakai lama kehilangan dua pegangan. Pemilik menimbang
  sebaliknya: karena tempatnya toh sudah berubah, sekalian saja namanya
  disamakan dengan istilah yang dipakai sehari-hari. Enam yang diganti:
  Jualan → Orderan, Rumah → Tugas, Uang → Keuangan, Request Pesanan → Orderan
  Manual, Papan Tugas → Tugas Pengrajin, Data Produk → Produk. Sisanya tetap.
- **Yang berubah hanya tulisannya.** Tidak ada `href` yang berpindah, sehingga
  tautan lama dan pintasan yang sudah tersimpan tetap sah. Judul di dalam
  halaman `papan-tugas` dan `request-pesanan` ikut diganti agar menu dan
  halamannya tidak menyebut dua nama berbeda.
- **Nilai data bertuliskan sama TIDAK ikut diganti.** `statusPengiriman`
  bernilai `"Request Pesanan"` tersimpan di basis data dan dicocokkan di
  `app/layout.tsx`; menggantinya akan memutus kecocokan dengan baris lama.
- **Ikon tetap dipakai** di dalam tarikan-bawah, mendampingi teks. Yang dibuang
  adalah keadaan hanya-ikon-tanpa-teks, bukan ikonnya.
- **Urutan di dalam kelompok mengikuti alur kerja**, bukan abjad. Di kelompok
  Orderan: Orderan Manual → Status Pesanan → Riwayat Penjualan → Unduh Nota,
  karena itu memang urutan hidup sebuah pesanan. Komentar yang sudah ada di
  `layout.tsx` mencatat alasan serupa untuk Orderan Manual, dan alasan itu
  dipertahankan.

## 2. Mengapa lima kelompok ini

Pengelompokan mengikuti **pekerjaan yang sedang dilakukan pemakai**, bukan
kemiripan teknis:

| Kelompok | Pertanyaan yang dijawabnya | Kapan dibuka |
|---|---|---|
| Orderan | "Pesanan ini bagaimana?" | Sepanjang hari |
| Tugas | "Barangnya siap belum?" | Pagi, sebelum mobil berangkat |
| Keuangan | "Untung tidak? Siapa belum bayar?" | Malam, akhir pekan |
| Data | "Ubah produk / pelanggan / pengrajin" | Sesekali |
| Sistem | "Siapa mengubah apa? Kelola akun" | Jarang |

Dashboard sengaja **di luar kelompok mana pun**: ia bukan salah satu pekerjaan,
melainkan titik berangkat. Menaruhnya di dalam tarikan-bawah berarti menyembunyikan
halaman pertama yang dibuka orang.

Kasir (POS) juga di luar kelompok, tetapi karena alasan berbeda: ia paling sering
dipakai. Yang jarang boleh disembunyikan, yang sering harus langsung terjangkau.

## 3. Kelompok kosong akibat peran

Penapisan peran berlaku pada tiap menu, sehingga sebuah kelompok bisa kehilangan
seluruh isinya bagi peran tertentu. Contoh nyata: kelompok **Sistem** bagi peran
selain Owner hanya menyisakan Log Aktivitas; dan bila kelak Manajemen Akun serta
Log Aktivitas sama-sama dibatasi, kelompoknya menjadi kosong sama sekali.

Aturannya: **kelompok yang tidak menyisakan satu menu pun tidak boleh dirender.**
Kepala kelompok yang membuka ke ruang kosong lebih membingungkan daripada tidak
ada sama sekali. Ini dihitung dari hasil penapisan, bukan ditulis manual per
peran — supaya tidak perlu diingat lagi saat ada menu baru.

## 4. Tarikan-bawah: kursor, papan ketik, dan jebakannya

Dibuka saat disentuh kursor, sesuai permintaan pemilik dan sejalan dengan
sidebar sekarang. Tiga hal yang harus ikut ditangani:

- **Jeda sebelum menutup.** Menutup seketika saat kursor keluar membuat menu
  tertutup di tengah jalan ketika pengguna bergerak diagonal menuju isinya.
  Perlu tenggang singkat sebelum benar-benar tertutup.
- **Papan ketik.** Membuka hanya lewat kursor membuat menu mustahil dijangkau
  papan ketik. Fokus pada kepala kelompok MUST ikut membukanya, dan `Esc` MUST
  menutupnya — pola yang sudah dipakai di modal katalog (lihat commit
  "tombol X bisa ditekan lagi, Esc menutup").
- **Layar sentuh.** Pada perangkat tanpa kursor, sentuhan pada kepala kelompok
  MUST membukanya. Ini bukan menambah cakupan HP — layar sentuh berukuran
  desktop tetap mendapat header ini, dan tanpa penanganan tersebut menunya tidak
  bisa dibuka sama sekali.

## 5. Penanda aktif

Halaman aktif berada di dalam kelompok yang tertutup, sehingga penandanya harus
naik ke kepala kelompok — jika tidak, pengguna kehilangan jejak posisinya begitu
tarikan-bawah tertutup.

Dua tingkat penanda:

- **Kepala kelompok** ditandai aktif bila `pathname` cocok dengan salah satu
  menu di dalamnya.
- **Baris menu** di dalam tarikan-bawah ditandai aktif seperti sekarang.

Pencocokannya memakai aturan yang sama dengan `NavItem` yang sudah ada, supaya
tidak ada dua definisi "sedang aktif" yang bisa berselisih.

## 6. Layar sempit

Lima kepala kelompok, Dashboard, tombol Kasir, lonceng, dan profil harus muat
berdampingan. Bila tidak, urutan pengorbanannya:

1. Nama toko di sebelah logo disembunyikan lebih dulu — logonya sudah cukup
   sebagai penanda.
2. Label tombol Kasir menyusut menjadi ikon saja (ikonnya sudah dikenal dari HP).
3. Baru setelah itu dipertimbangkan menggeser kelompok yang paling jarang
   dipakai ke dalam menu luapan.

Yang **tidak boleh** dikorbankan: teks kepala kelompok. Menyusutkannya menjadi
ikon berarti mengulang persis masalah yang sedang diperbaiki.

## 7. Batas dengan versi HP

Header ini `hidden desktop:flex`; laci hamburger dan menu bawah tetap
`desktop:hidden`. Keduanya tidak pernah tampil bersamaan, dan tidak satu pun
berkas khusus HP diubah — kecuali oleh tugas percobaan di bagian 8.

Sidebar dihapus dari desktop, tetapi **wujud lacinya untuk HP tetap ada**.
Keduanya kini merender dari `KELOMPOK_MENU` yang sama; bedanya hanya cara
menampilkan — laci HP menampilkan seluruh menu sekaligus (dengan atau tanpa
judul kelompok, lihat bagian 8), header desktop menyembunyikannya di balik
tarikan-bawah.

## 8. Percobaan yang bisa dibatalkan: judul kelompok di laci HP

Pemilik ingin mencobanya lebih dulu secara lokal dan mengembalikannya bila tidak
enak dipandang. Karena itu:

- Dikerjakan **paling akhir**, setelah header desktop selesai dan teruji.
- Menyentuh **hanya** bagian render laci HP: menyisipkan judul kelompok di antara
  menu. Tidak ada menu yang berpindah urutan, tidak ada yang hilang.
- Membatalkannya cukup dengan mengembalikan laci ke perataan datar dari
  `KELOMPOK_MENU` yang sama — susunan datanya tidak perlu diubah balik.

Dicatat sebagai keputusan yang belum final, bukan sebagai bagian yang sudah
disepakati.
