## ADDED Requirements

### Requirement: Status setoran pada tiap baris packing

Checklist Packing SHALL menampilkan, untuk setiap baris barang, berapa banyak yang sudah disetor pengrajin dan siapa pengrajinnya.

Baris yang punya penugasan tetapi belum disetor sama sekali MUST ditandai secara visual, karena mencentangnya berarti barang itu ada tanpa jejak dari pengrajin mana pun.

#### Scenario: Barang sudah disetor

- **WHEN** sebuah baris 3 gross telah disetor penuh oleh "MAMA URI"
- **THEN** baris itu menampilkan nama Mama Uri beserta keterangan sudah disetor penuh

#### Scenario: Barang baru disetor sebagian

- **WHEN** dari 3 gross baru disetor 2 gross
- **THEN** baris itu menampilkan "2 Gross dari 3 Gross" dan ditandai belum lengkap

#### Scenario: Dikerjakan beberapa pengrajin

- **WHEN** satu baris dibagi ke dua pengrajin
- **THEN** kedua nama tampil beserta jumlah setoran masing-masing

#### Scenario: Barang belum disetor sama sekali

- **WHEN** sebuah baris sudah ditugaskan tetapi belum ada setoran
- **THEN** baris itu ditandai belum disetor

### Requirement: Baris tanpa penugasan tetap dapat dicentang

Baris barang yang tidak memiliki penugasan sama sekali — misalnya pesanan lama sebelum Papan Tugas ada, atau barang yang dikerjakan tanpa dicatat — MUST tetap dapat dicentang packing seperti biasa.

Sistem SHALL menandainya sebagai "tanpa penugasan" tanpa memperlakukannya sebagai galat, dan MUST NOT menghalangi pencentangan.

#### Scenario: Pesanan lama tetap bisa dipacking

- **WHEN** sebuah baris tanpa penugasan dicentang packing
- **THEN** centangnya tersimpan seperti biasa, dan baris itu hanya diberi keterangan bahwa penugasannya tidak tercatat

### Requirement: Penanda nota siap dipacking

Sistem SHALL menandai sebuah nota sebagai **siap dipacking** ketika seluruh baris barangnya yang memiliki penugasan sudah disetor penuh.

Nota yang masih menunggu setoran MUST menampilkan berapa baris yang belum lengkap, agar terlihat mana yang bisa langsung dikerjakan dan mana yang masih menunggu pengrajin.

#### Scenario: Seluruh barang sudah masuk

- **WHEN** seluruh baris sebuah nota sudah disetor penuh
- **THEN** nota itu ditandai siap dipacking

#### Scenario: Masih menunggu pengrajin

- **WHEN** 2 dari 8 baris belum disetor penuh
- **THEN** nota itu tidak ditandai siap dipacking dan menyebut 2 baris masih menunggu setoran

#### Scenario: Centang packing tetap berdiri sendiri

- **WHEN** sebuah nota belum siap dipacking
- **THEN** pencentangan packing pada baris yang sudah ada barangnya tetap diperbolehkan — kedua tahap itu terpisah dan boleh berbeda
