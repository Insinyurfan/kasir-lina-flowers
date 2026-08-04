## ADDED Requirements

### Requirement: Unggahan gambar disimpan di R2

Seluruh unggahan gambar baru — foto produk maupun foto struk pengeluaran — MUST disimpan ke bucket Cloudflare R2 melalui API S3-compatible dengan tanda tangan AWS SigV4.

Sistem SHALL mengembalikan URL publik berbasis domain yang dikonfigurasi, bukan endpoint internal R2.

#### Scenario: Unggah foto produk

- **WHEN** pengguna mengunggah foto pada halaman Produk
- **THEN** berkasnya tersimpan di R2 dan `Product.gambar` berisi URL publik pada domain gambar yang dikonfigurasi

#### Scenario: Unggah foto struk

- **WHEN** pengguna melampirkan foto struk pada sebuah pengeluaran
- **THEN** berkasnya tersimpan di R2 pada awalan terpisah dari foto produk

#### Scenario: Nama berkas tidak pernah bentrok

- **WHEN** dua unggahan terjadi bersamaan untuk produk yang sama
- **THEN** keduanya tersimpan dengan nama berbeda dan tidak saling menimpa

### Requirement: Konfigurasi wajib lengkap

Sistem MUST menolak unggahan dengan pesan yang jelas bila konfigurasi R2 belum lengkap, alih-alih gagal dengan galat yang membingungkan.

#### Scenario: Env belum diisi

- **WHEN** unggahan dilakukan sementara kredensial atau nama bucket R2 belum diatur
- **THEN** sistem menolak dengan pesan berbahasa Indonesia yang menyebutkan konfigurasi R2 belum lengkap

### Requirement: Batasan berkas tetap berlaku

Pemeriksaan yang sudah ada MUST dipertahankan: hanya berkas gambar yang diterima, dan ukurannya maksimal 3 MB.

#### Scenario: Berkas bukan gambar

- **WHEN** pengguna memilih berkas yang bukan gambar
- **THEN** sistem menolaknya sebelum menghubungi R2

#### Scenario: Berkas terlalu besar

- **WHEN** berkas melebihi 3 MB
- **THEN** sistem menolaknya dengan pesan batas ukuran

### Requirement: Penghapusan gambar

Sistem SHALL dapat menghapus berkas dari R2 ketika gambar produk diganti atau pengeluaran dihapus.

Kegagalan menghapus MUST NOT menggagalkan operasi utamanya — berkas yatim lebih baik daripada penghapusan data yang batal.

#### Scenario: Mengganti foto produk

- **WHEN** foto produk diganti dengan yang baru
- **THEN** berkas lama dihapus dari R2

#### Scenario: Penghapusan berkas gagal

- **WHEN** penghapusan di R2 gagal karena jaringan
- **THEN** penghapusan pengeluaran atau penggantian foto tetap berhasil

### Requirement: Gambar lama tetap dirujuk sampai diunggah ulang

Nilai `Product.gambar` yang menunjuk ke penyimpanan lama MUST NOT dihapus otomatis.

Produk yang gambarnya belum diunggah ulang akan tampil rusak — dan itu **disengaja**, karena menjadi penanda progres yang jujur selama pengisian ulang manual.

#### Scenario: Produk belum diunggah ulang

- **WHEN** sebuah produk masih menyimpan URL penyimpanan lama
- **THEN** gambarnya tidak tampil, tetapi data produknya tetap utuh dan dapat dijual seperti biasa

#### Scenario: Produk sudah diunggah ulang

- **WHEN** foto produk diunggah ulang
- **THEN** `Product.gambar` diganti dengan URL R2 dan gambarnya kembali tampil

### Requirement: Host gambar baru dikenali di seluruh lapisan

Domain gambar yang baru MUST diizinkan pada pengoptimal gambar Next.js, dan MUST dikenali service worker sebagai gambar yang layak di-cache.

#### Scenario: Optimasi gambar

- **WHEN** halaman menampilkan gambar dari domain R2
- **THEN** `next/image` dapat mengoptimasinya tanpa galat host tidak diizinkan

#### Scenario: Cache service worker

- **WHEN** gambar dari domain R2 dimuat
- **THEN** service worker menyimpannya sehingga tetap tampil bila sumbernya bermasalah
