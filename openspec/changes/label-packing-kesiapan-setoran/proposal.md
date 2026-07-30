## Why

Kerepotan yang sebenarnya terjadi **di rumah**, dari orderan masuk sampai barang naik ke mobil — bukan di alur luar rumah. Setelah Papan Tugas dan Checklist Packing ada, tinggal tiga lubang tersisa di rantai itu, dan ketiganya menyentuh jam paling kacau: pukul 08.00 sampai mobil berangkat.

1. **Label bungkus masih ditulis tangan.** Bibi menulis "Toko A, Bando Satin 1 gross" di kertas kecil lalu menempelkannya di tiap plastik. Ini satu-satunya pekerjaan tulis tangan di rumah yang sama sekali belum tersentuh, padahal seluruh datanya sudah ada di sistem.
2. **Checklist Packing tidak tahu barangnya sudah disetor atau belum.** Sejak ada Papan Tugas, sistem sebenarnya sudah tahu persis mana yang sudah masuk dari pengrajin mana — tetapi informasi itu berhenti di Papan Tugas. Bibi tetap harus mengingat sendiri saat menyiapkan barang.
3. **Tidak ada daftar "hari ini siapa yang harus ditagih setorannya".** Bibi menelepon pengrajin agar segera menyetorkan pekerjaan. Papan Tugas sudah menyimpan tenggat, tetapi belum pernah merangkumnya menjadi satu daftar yang bisa dibacakan sambil menelepon.

## What Changes

- **Label bungkus siap cetak** dari Checklist Packing: satu label per baris barang berisi nama toko, nomor nota, nama produk, variasi, kode pelanggan, dan jumlah. Dicetak dalam lembar A4 berisi banyak label untuk digunting, sehingga tidak butuh printer khusus.
- Label dapat dicetak **per nota** (semua barang satu toko) maupun **per baris** (mencetak ulang satu label yang rusak/hilang).
- **Status setoran tampil di Checklist Packing**: tiap baris menyebut sudah disetor berapa dan oleh siapa. Baris yang belum disetor sama sekali ditandai, karena mencentangnya berarti barang itu ada tanpa jejak dari pengrajin mana pun.
- **Penanda "siap dipacking"** pada nota yang seluruh barangnya sudah disetor pengrajin — supaya Bibi tahu nota mana yang bisa langsung dikerjakan, bukan menebak.
- **Daftar Tagih Setoran** di Papan Tugas: pekerjaan yang tenggatnya hari ini atau sudah lewat, dikelompokkan per pengrajin, lengkap dengan jumlah sisanya. Ada tombol menyalin teks siap kirim ke WhatsApp, mengikuti pola yang sudah dipakai halaman Piutang.

## Capabilities

### New Capabilities

- `packing-labels`: Label bungkus dapat dicetak dari data pesanan, per nota maupun per baris, menggantikan penulisan tangan.
- `packing-readiness`: Checklist Packing menampilkan status setoran tiap barang dan menandai nota yang seluruh barangnya sudah disetor sebagai siap dipacking.
- `deposit-reminder`: Papan Tugas merangkum pekerjaan yang jatuh tempo hari ini atau terlambat menjadi daftar tagihan setoran per pengrajin, dengan teks siap kirim.

### Modified Capabilities

<!-- `openspec/specs/` masih kosong; kapabilitas packing & papan tugas belum
     pernah terekam sebagai spec utama, jadi seluruhnya dicatat sebagai baru. -->

## Impact

- **Model data**: tidak ada perubahan skema. Seluruh informasi sudah tersedia dari `Penugasan`, `Setoran`, dan `TransactionItem`.
- **API**: `api/packing` diperluas mengembalikan ringkasan setoran per baris (jumlah disetor, nama pengrajin) dan penanda kesiapan per nota. `api/papan-tugas` diperluas dengan blok `tagihSetoran`.
- **UI**: Checklist Packing mendapat penanda setoran, penanda siap dipacking, dan tombol cetak label. Papan Tugas mendapat blok Tagih Setoran.
- **Cetak**: pembuat label baru di `lib/labelPacking.ts`, memakai pola cetak yang sudah ada (`lib/notaDocument.ts`) agar hasilnya konsisten.
- **Catatan penting**: penanda setoran hanya berarti untuk barang yang memang ditugaskan lewat Papan Tugas. Barang lama atau yang dikerjakan tanpa penugasan akan tampil "tanpa penugasan" — ini keadaan yang sah, bukan galat, dan tidak boleh menghalangi pencentangan packing.
