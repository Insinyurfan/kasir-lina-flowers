## 1. API: kesiapan setoran di Checklist Packing

- [x] 1.1 Perluas `app/(backend)/api/packing/route.ts` — sertakan `penugasan` beserta `setoran` pada tiap `TransactionItem`
- [x] 1.2 Kembalikan per baris: `totalDitugaskan`, `totalDisetor`, `adaPenugasan`, dan `pemegang[]` (nama pengrajin + jumlah disetor)
- [x] 1.3 Kembalikan per nota: `barisMenungguSetoran`, `barisBertugas`, dan `siapDipacking`
- [x] 1.4 Baris tanpa penugasan MUST diabaikan dalam penilaian kesiapan, bukan dianggap belum siap
- [x] 1.5 Pastikan `PATCH` centang packing tidak berubah perilakunya sama sekali

## 2. API: daftar tagih setoran

- [x] 2.1 Perluas `app/(backend)/api/papan-tugas/route.ts` dengan blok `tagihSetoran`
- [x] 2.2 Saring penugasan yang belum tuntas DAN tenggatnya hari ini atau sudah lewat (batas hari WIB dari `lib/waktu.ts`)
- [x] 2.3 Kelompokkan per pengrajin, urutkan dari yang paling terlambat
- [x] 2.4 Sertakan produk, toko, jumlah sisa, dan hari keterlambatan tiap baris

## 3. Pembuat label

- [x] 3.1 Buat `lib/labelPacking.ts` — bangun HTML A4 berisi banyak label dengan garis potong
- [x] 3.2 Tiap label memuat nama toko, nomor nota (format `TRX-0000`), nama produk, variasi, kode pelanggan, dan jumlah
- [x] 3.3 Jumlah memakai `formatQtySatuan` supaya `setengah_gross` terbaca "½ Gross"
- [x] 3.4 Dukung dua mode: seluruh baris satu nota, dan satu baris saja (cetak ulang)
- [x] 3.5 Buka jendela cetak peramban; pastikan tata letak tidak pecah saat berlanjut ke halaman kedua

## 4. UI Checklist Packing

- [x] 4.1 Tampilkan status setoran di tiap baris: nama pengrajin + jumlah disetor dari jumlah ditugaskan
- [x] 4.2 Tandai baris yang sudah ditugaskan tetapi belum disetor sama sekali
- [x] 4.3 Tandai baris tanpa penugasan sebagai "tanpa penugasan" — TIDAK sebagai galat, dan tetap bisa dicentang
- [x] 4.4 Penanda **siap dipacking** pada kepala kartu nota, menyebut dasar penilaiannya (mis. "8/8 baris bertugas sudah disetor")
- [x] 4.5 Tombol **Cetak Label** per nota di kepala kartu
- [x] 4.6 Tombol cetak ulang label per baris
- [ ] 4.7 Pastikan tinggi baris tidak membengkak di layar 360px — keterangan pengrajin satu baris kecil saja

## 5. UI Papan Tugas: Tagih Setoran

- [x] 5.1 Blok **Tagih Setoran** di Papan Tugas, dikelompokkan per pengrajin, yang paling terlambat di atas
- [x] 5.2 Tiap baris menyebut produk, toko, sisa, dan lama keterlambatan
- [x] 5.3 Tombol salin teks tagihan per pengrajin ke papan klip, mengikuti pola `susunTeksPenagihan` di `lib/piutang.ts`
- [x] 5.4 Keadaan kosong: nyatakan tidak ada yang perlu ditagih hari ini
- [x] 5.5 Sembunyikan blok ini bila tidak ada isinya, supaya papan tidak penuh penanda kosong

## 6. Verifikasi

- [ ] 6.1 Uji label: satu nota berisi banyak barang tercetak lengkap; satuan `setengah_gross` terbaca "½ Gross"; cetak ulang satu baris hanya menghasilkan satu label
- [ ] 6.2 Uji kesiapan: nota dengan semua baris disetor penuh ditandai siap; yang kurang menyebut jumlah baris yang menunggu
- [ ] 6.3 Uji pesanan lama tanpa penugasan: tetap bisa dicentang packing dan tidak tampak rusak
- [ ] 6.4 Uji tagih setoran: pekerjaan bertenggat kemarin muncul, yang bertenggat lusa tidak; urutan terlambat di atas
- [ ] 6.5 Uji batas WIB: tenggat kemarin sudah muncul di daftar tagih sejak pukul 00:30 WIB
- [x] 6.6 `npx tsc --noEmit` bersih dan ESLint tidak menambah error baru
- [x] 6.7 Uji otorisasi: endpoint packing & papan tugas tetap menolak 401 tanpa sesi
- [ ] 6.8 Uji tampilan 360px untuk Checklist Packing dan Papan Tugas
- [ ] 6.9 Cetak sungguhan satu lembar label lalu cocokkan ukurannya dengan plastik yang biasa dipakai
