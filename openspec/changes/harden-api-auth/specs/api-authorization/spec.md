## ADDED Requirements

### Requirement: Server-derived caller identity

Untuk setiap endpoint terproteksi, sistem MUST menurunkan identitas dan peran pemanggil **hanya** dari cookie sesi bertanda-tangan, dan MUST NOT mempercayai field identitas apa pun (`actorId`, `actorRole`, `userId`, dsb.) yang dikirim melalui body atau query request.

#### Scenario: actorId palsu di body ditolak

- **WHEN** sebuah request ke endpoint terproteksi menyertakan `actorId` milik seorang Owner di dalam body, tetapi tidak membawa cookie sesi yang valid
- **THEN** sistem MUST menolak request dengan status `401` dan MUST NOT menjalankan aksi apa pun.

#### Scenario: Sesi valid menentukan identitas

- **WHEN** sebuah request membawa cookie sesi yang valid untuk seorang Owner, meskipun body memuat `actorId`/`actorRole` yang berbeda
- **THEN** sistem MUST memakai identitas dari sesi (Owner tersebut) dan mengabaikan field identitas dari body.

### Requirement: Role-based access control

Endpoint terproteksi MUST menegakkan peran minimum yang dibutuhkan. Aksi khusus Owner (kelola akun, hapus riwayat penjualan, hapus log aktivitas, ubah pengaturan toko) MUST hanya dapat dijalankan oleh pemanggil berperan `Owner`. Aksi operasional bersama (tulis transaksi, tulis katalog produk & variasi, harga khusus pelanggan, notifikasi, unggah gambar) MUST dapat dijalankan oleh `Owner` atau `Admin`.

#### Scenario: Admin diblokir dari aksi khusus Owner

- **WHEN** pemanggil dengan sesi valid berperan `Admin` mencoba membuat atau menghapus akun pengguna
- **THEN** sistem MUST menolak dengan status `403` dan MUST NOT mengubah data akun.

#### Scenario: Admin diizinkan untuk aksi operasional

- **WHEN** pemanggil dengan sesi valid berperan `Admin` menyimpan sebuah transaksi
- **THEN** sistem MUST mengizinkan aksi dan mencatat aktor pada log sebagai user dari sesi tersebut.

#### Scenario: Owner diizinkan untuk semua aksi terproteksi

- **WHEN** pemanggil dengan sesi valid berperan `Owner` menjalankan aksi khusus Owner
- **THEN** sistem MUST mengizinkan aksi tersebut.

### Requirement: Cart data ownership

Endpoint keranjang MUST hanya beroperasi pada keranjang milik pengguna yang terautentikasi. Sistem MUST mengabaikan `userId` dari request dan menggunakan `userId` dari sesi.

#### Scenario: Tidak bisa mengakses keranjang pengguna lain

- **WHEN** pengguna terautentikasi mengirim request keranjang dengan `userId` milik pengguna lain
- **THEN** sistem MUST beroperasi pada keranjang milik sesi pemanggil, atau menolak, dan MUST NOT membaca/menulis keranjang pengguna lain.

### Requirement: Authentication required for sensitive data

Endpoint yang mengekspos data bisnis (laporan, dashboard, riwayat transaksi, log aktivitas) MUST menolak request tanpa sesi yang valid.

#### Scenario: Akses data bisnis tanpa login ditolak

- **WHEN** sebuah request GET ke endpoint data bisnis tidak membawa sesi yang valid
- **THEN** sistem MUST menolak dengan status `401` dan MUST NOT mengembalikan data.

### Requirement: Explicit public endpoints

Sistem MUST mendefinisikan daftar endpoint publik secara eksplisit. Hanya endpoint pada daftar tersebut (login, baca katalog produk, pengiriman pesanan oleh pelanggan, pelacakan status pesanan) yang boleh diakses tanpa sesi. Endpoint lain di luar daftar MUST diperlakukan sebagai terproteksi secara default.

#### Scenario: Endpoint publik tetap dapat diakses

- **WHEN** seseorang mengakses endpoint yang ada pada daftar publik (mis. baca katalog produk) tanpa sesi
- **THEN** sistem MUST mengizinkan akses tersebut.

#### Scenario: Endpoint baru default terproteksi

- **WHEN** sebuah endpoint tidak tercantum pada daftar publik dan tidak menerapkan guard secara eksplisit
- **THEN** endpoint tersebut MUST menolak pemanggil tanpa sesi (fail-safe secara default).

### Requirement: Dedicated session secret

Sesi bertanda-tangan MUST menggunakan secret khusus dari variabel lingkungan `SESSION_SECRET`. Sistem MUST NOT menggunakan kredensial lain (mis. `DATABASE_URL`) sebagai secret sesi.

#### Scenario: Secret tidak dikonfigurasi → gagal aman

- **WHEN** `SESSION_SECRET` tidak dikonfigurasi
- **THEN** sistem MUST menolak menerbitkan atau memverifikasi sesi (gagal-tertutup), alih-alih jatuh ke secret yang dipakai ulang.
