## Context

Rantai kerja di rumah — orderan masuk sampai barang naik ke mobil — kini hampir seluruhnya tercakup: POS mencatat pesanan, Papan Tugas membagi kerja dan menerima setoran, Checklist Packing mengawal pemuatan, dan nota dicetak dari Riwayat Penjualan. Change ini menutup tiga celah terakhir, semuanya di rentang waktu pukul 08.00 sampai mobil berangkat.

Kendala yang membentuk desain:

- **Tidak ada printer label khusus.** Yang tersedia printer biasa untuk mencetak nota A4. Label harus bisa dicetak di kertas biasa lalu digunting.
- **Dipakai sambil berdiri dan mengangkat barang.** Checklist Packing dibuka di ponsel. Tambahan informasi tidak boleh membuat tiap baris jadi bertingkat-tingkat sampai daftarnya panjang.
- **Data lama tidak punya penugasan.** Papan Tugas baru ada hari ini; seluruh pesanan sebelumnya tidak punya `Penugasan` sama sekali. Fitur baru tidak boleh membuat pesanan lama terlihat rusak atau terkunci.
- Yang wajib dipakai ulang: `lib/satuan.ts` (`formatQtySatuan`), `lib/notaDocument.ts` (pola pembuatan dokumen cetak), `lib/piutang.ts` (pola teks siap salin), `lib/waktu.ts` (batas hari WIB), dan tema `lina-panel`.

## Goals / Non-Goals

**Goals:**

- Menghapus satu-satunya pekerjaan tulis tangan yang tersisa di rumah.
- Menyambungkan informasi setoran yang selama ini berhenti di Papan Tugas ke tempat ia dibutuhkan: saat menyiapkan barang.
- Memberi Bibi satu daftar yang bisa dibacakan sambil menelepon pengrajin.
- Tidak menambah satu pun tabel baru — seluruh data sudah ada.

**Non-Goals:**

- Printer thermal / label satuan. Kalau kelak ada, tata letaknya tinggal ditambah, bukan diganti.
- Barcode atau QR pada label. Belum ada pemindai di alur ini, jadi hanya menambah kerumitan.
- Mengunci pencentangan packing berdasarkan setoran. Dua tahap ini sengaja tetap terpisah — lihat keputusan 3.
- Pengingat otomatis lewat WhatsApp. Teks disalin manual, seperti pola yang sudah dipakai halaman Piutang.

## Decisions

### 1. Label dicetak sebagai HTML A4 berisi banyak label, bukan format printer khusus

Satu halaman A4 memuat beberapa label dengan garis potong putus-putus.

*Alasan:* di rumah hanya ada printer biasa. Memaksa format printer thermal berarti fiturnya tidak bisa dipakai sama sekali sampai perangkatnya dibeli.

*Alternatif yang ditolak:* PDF lewat pembuat dokumen yang sudah ada di `lib/notaDocument.ts`. Nota butuh tata letak presisi karena diberikan ke toko; label hanya digunting dan ditempel, jadi jendela cetak peramban sudah cukup dan jauh lebih ringan.

### 2. Ringkasan setoran dihitung di server, bukan di klien

`api/packing` mengembalikan per baris: total ditugaskan, total disetor, dan daftar nama pengrajin beserta jumlahnya.

*Alasan:* halaman packing dibuka di ponsel sambil bekerja. Menarik data penugasan terpisah lalu menggabungkannya di klien berarti dua permintaan jaringan dan jeda yang terasa persis di jam tersibuk.

### 3. Setoran TIDAK mengunci pencentangan packing

Baris yang belum disetor tetap bisa dicentang; ia hanya diberi tanda.

*Alasan:* kenyataan lebih berantakan daripada data. Pengrajin bisa menyerahkan barang tanpa sempat dicatat, atau barang sudah ada di rumah sejak kemarin. Mengunci centang akan membuat orang berhenti memakai checklist-nya sama sekali — dan checklist yang tidak dipakai lebih buruk daripada checklist tanpa penjagaan. Penandaan memberi peringatan; penguncian memberi jalan buntu.

*Konsekuensi:* penanda ini alat bantu, bukan jaminan. Itu memang batas yang diterima.

### 4. Nota "siap dipacking" hanya menghitung baris yang punya penugasan

Baris tanpa penugasan diabaikan dalam penilaian kesiapan.

*Alasan:* kalau baris tanpa penugasan dianggap "belum siap", seluruh pesanan lama akan selamanya tampak menggantung dan penandanya kehilangan arti sejak hari pertama.

*Konsekuensi yang disadari:* nota yang seluruh barangnya tanpa penugasan akan langsung tampak "siap" padahal sistem tidak tahu apa-apa tentangnya. Karena itu penandanya menyebut dasar penilaiannya secara terbuka, bukan sekadar lencana hijau.

### 5. Daftar tagih memakai batas hari WIB, bukan selisih 24 jam

Sebuah pekerjaan masuk daftar tagih bila tenggatnya jatuh pada hari ini atau sebelumnya menurut kalender WIB.

*Alasan:* sama dengan alasan `lib/waktu.ts` dibuat. Pekerjaan bertenggat kemarin harus muncul begitu hari berganti pukul 00:00 WIB, bukan menunggu genap 24 jam — karena Bibi menelepon pagi-pagi.

### 6. Teks tagihan disalin manual, mengikuti pola halaman Piutang

*Alasan:* konsisten dengan yang sudah ada dan sudah dipahami. Mengirim otomatis lewat WhatsApp butuh integrasi yang jauh lebih besar, sementara menyalin-menempel sudah menghemat pekerjaan mengetik yang sesungguhnya.

## Risks / Trade-offs

**Label dicetak lalu pesanannya berubah.** Nota bisa disunting setelah labelnya dicetak, dan label yang sudah tertempel tidak ikut berubah.
→ Label mencantumkan nomor nota dan jumlahnya, jadi ketidakcocokan masih bisa ketahuan saat pencocokan akhir. Tidak ada penjagaan teknis untuk ini; yang bisa dilakukan hanya mencetak label sedekat mungkin dengan waktu packing.

**Penanda "siap dipacking" bisa memberi rasa aman palsu** pada nota lama yang memang tidak punya penugasan.
→ Penandanya menyebut dasar penilaiannya ("8 dari 8 baris bertugas sudah disetor"), bukan sekadar hijau polos.

**Baris packing jadi lebih tinggi** karena menambah baris nama pengrajin, sehingga daftar di ponsel makin panjang.
→ Nama pengrajin ditulis ringkas dalam satu baris kecil di bawah nama produk, dan hanya muncul bila penugasannya memang ada.

## Migration Plan

Tidak ada perubahan skema dan tidak ada backfill. Seluruh data sudah tersedia dari `Penugasan` dan `Setoran`. Fitur ini dapat dilepas kembali dengan menghapus perluasan pada dua endpoint dan bagian antarmukanya, tanpa memengaruhi data apa pun.

## Open Questions

1. **Ukuran label.** Sekarang dirancang beberapa label per A4 dengan ukuran sedang. Perlu dilihat sendiri saat dicetak apakah ukurannya pas untuk plastik yang biasa dipakai — mungkin perlu diperbesar atau diperkecil.
2. **Perlukah label memuat tanggal kirim?** Belum dimasukkan agar labelnya tetap ringkas, tetapi kalau barang menginap semalam sebelum dikirim, tanggal bisa membantu membedakan tumpukan.
