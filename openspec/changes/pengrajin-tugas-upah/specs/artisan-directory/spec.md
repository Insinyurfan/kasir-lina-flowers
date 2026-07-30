## ADDED Requirements

### Requirement: Master pengrajin

Sistem SHALL menyimpan daftar pengrajin berisi nama, kelompok (opsional), tarif cadangan (opsional), penerima upah, dan penanda aktif. Nama pengrajin MUST unik agar penugasan tidak pernah ambigu.

Pengrajin yang berhenti bekerja SHALL dapat ditandai tidak aktif alih-alih dihapus, sehingga riwayat setoran dan upahnya tetap utuh.

#### Scenario: Menambah pengrajin baru

- **WHEN** pengguna menyimpan pengrajin bernama "MAMA URI" dengan tarif cadangan Rp15.000 per gross
- **THEN** pengrajin tersebut muncul di daftar dan dapat dipilih saat menugaskan pekerjaan

#### Scenario: Nama ganda ditolak

- **WHEN** pengguna menyimpan pengrajin dengan nama yang sudah ada
- **THEN** sistem menolak penyimpanan dan memberitahu bahwa nama tersebut sudah terdaftar

#### Scenario: Menonaktifkan pengrajin

- **WHEN** seorang pengrajin ditandai tidak aktif
- **THEN** ia tidak lagi muncul sebagai pilihan penugasan baru, tetapi riwayat setoran, saldo, dan penarikannya tetap dapat dilihat

#### Scenario: Pengrajin bersaldo tidak dapat dihapus

- **WHEN** pengguna mencoba menghapus pengrajin yang masih punya saldo upah atau riwayat setoran
- **THEN** sistem menolak penghapusan dan menyarankan menonaktifkannya

### Requirement: Kelompok pengrajin

Sistem SHALL mendukung pengelompokan pengrajin di bawah seorang ketua (mis. Ketua Mama Budi → Mama Uri, Mama Ari). Kelompok bersifat OPTIONAL — pengrajin tanpa kelompok tetap sah.

Ketua kelompok MUST merujuk ke sebuah pengrajin, bukan nama teks bebas, karena ketua juga mengerjakan barang dan dapat memegang saldo upah.

#### Scenario: Mengelompokkan pengrajin

- **WHEN** pengguna menempatkan "MAMA URI" dan "MAMA ARI" ke kelompok berketua pengrajin "MAMA BUDI"
- **THEN** papan tugas dapat menampilkan pekerjaan mereka dikelompokkan di bawah ketua tersebut

#### Scenario: Ketua juga mengerjakan barang

- **WHEN** pekerjaan ditugaskan kepada "MAMA BUDI" yang merupakan ketua kelompok
- **THEN** penugasan tersebut sah dan muncul di papan tugas seperti pengrajin lain

#### Scenario: Pengrajin tanpa kelompok

- **WHEN** pengguna menyimpan pengrajin tanpa memilih kelompok
- **THEN** pengrajin tetap tersimpan dan muncul dalam kelompok "Tanpa Kelompok" di papan tugas

### Requirement: Tarif upah per pengrajin dan produk

Sistem SHALL menyimpan tarif upah per pasangan **pengrajin × produk**, karena produk yang lebih rumit dibayar lebih tinggi dan besarannya dapat berbeda antar orang. Pasangan pengrajin dan produk MUST unik.

Setiap pengrajin MAY memiliki **tarif cadangan** yang dipakai bila tarif untuk produk tertentu belum diisi. Tanpa mekanisme ini, satu produk baru akan membuat setoran gagal dicatat tepat di jam tersibuk.

Seluruh tarif MUST bilangan bulat rupiah lebih besar dari nol.

#### Scenario: Tarif berbeda antar produk

- **WHEN** Mama Uri punya tarif Bando Satin Rp12.000 dan Bando Pompom Rp18.000 per gross
- **THEN** setoran 3 gross Bando Satin bernilai Rp36.000 dan setoran 3 gross Bando Pompom bernilai Rp54.000

#### Scenario: Tarif berbeda antar pengrajin untuk produk yang sama

- **WHEN** Bando Pompom bertarif Rp18.000 untuk Mama Uri dan Rp20.000 untuk Mama Ari
- **THEN** setoran masing-masing dihitung dengan tarifnya sendiri

#### Scenario: Produk belum punya tarif khusus

- **WHEN** setoran dicatat untuk produk yang belum punya tarif khusus, sementara pengrajinnya punya tarif cadangan Rp15.000
- **THEN** sistem memakai Rp15.000 dan menandai pada setoran bahwa tarif cadangan yang dipakai

#### Scenario: Tanpa tarif khusus maupun cadangan

- **WHEN** setoran dicatat untuk produk tanpa tarif khusus dan pengrajinnya tidak punya tarif cadangan
- **THEN** sistem menolak pencatatan dan menyebut nama pengrajin serta produk yang tarifnya belum diatur

#### Scenario: Tarif tidak sah ditolak

- **WHEN** pengguna menyimpan tarif 0 atau negatif
- **THEN** sistem menolak penyimpanan dan meminta tarif yang lebih besar dari nol

### Requirement: Penetapan penerima upah

Setiap pengrajin SHALL memiliki penanda penerima upah bernilai `SENDIRI` atau `KETUA`. Bawaannya `SENDIRI`.

Pengrajin bernilai `KETUA` MUST tergabung dalam kelompok yang sudah punya ketua, dan ketuanya MUST NOT berupa dirinya sendiri.

Pengrajin yang menjadi ketua kelompok MUST bernilai `SENDIRI`, agar tidak terbentuk rantai penerusan upah yang berputar.

#### Scenario: Menetapkan upah lewat ketua

- **WHEN** "MAMA ARI" ditetapkan `KETUA` dan ia anggota kelompok berketua "MAMA BUDI"
- **THEN** penetapan tersimpan, dan setoran Mama Ari kelak menambah saldo Mama Budi

#### Scenario: KETUA tanpa kelompok ditolak

- **WHEN** pengguna menetapkan `KETUA` pada pengrajin yang tidak punya kelompok, atau kelompoknya belum punya ketua
- **THEN** sistem menolak penyimpanan dan menjelaskan bahwa penerima upahnya belum jelas

#### Scenario: Ketua tidak boleh meneruskan ke dirinya sendiri

- **WHEN** pengguna menetapkan `KETUA` pada pengrajin yang justru menjadi ketua kelompok itu
- **THEN** sistem menolak penyimpanan

### Requirement: Otorisasi master pengrajin

Endpoint pengrajin dan kelompok MUST menurunkan identitas pemanggil dari sesi terverifikasi. Menulis SHALL dibatasi untuk peran Owner dan Admin; membaca SHALL mewajibkan login.

#### Scenario: Permintaan tanpa sesi ditolak

- **WHEN** permintaan ke endpoint pengrajin datang tanpa sesi yang sah
- **THEN** sistem menolak dengan status 401 dan tidak mengubah data apa pun
