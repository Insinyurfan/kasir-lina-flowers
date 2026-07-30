# Catatan Sesi — 30 Juli 2026

Semua sudah di-push ke `main` (`Insinyurfan/kasir-lina-flowers`), dari `e5e8f3c`
sampai **`7ad31ec`** — 12 commit. Tidak ada yang menggantung di working tree.

Sesi ini membangun **tiga modul baru** sekaligus, dan seluruhnya sudah ada
tabelnya di basis data produksi.

---

## 0. Kenapa modul-modul ini yang dibangun

Sebelum menulis kode, kita menyepakati dulu tujuan bisnisnya: **usaha ini untung
beneran atau cuma kelihatan untung?** Aplikasi lama hanya mencatat uang masuk —
tidak ada satu pun angka biaya di basis data — sehingga "Total Pendapatan Lunas"
di halaman Laporan itu sebenarnya **omzet**, bukan laba.

Urutan roadmap 5 langkah yang disepakati:

1. ~~Piutang + pengeluaran + laba rugi~~ ← **selesai sesi ini**
2. ~~Papan tugas & upah pengrajin~~ ← **selesai sesi ini**
3. Bahan baku + daftar belanja otomatis (`bom-inventory`) ← **berikutnya**
4. Kirim sebagian & bukti serah terima (`split-invoice-backorder`)
5. Jualan satuan/eceran

Di tengah sesi, pemilik meluruskan arah: **yang repot itu pekerjaan di rumah**
(orderan masuk → packing → berangkat), bukan alur di luar rumah. Karena itu
lahir modul ketiga di luar roadmap awal.

---

## 1. Modul keuangan — `pengeluaran-piutang-laba` (61/64)

**Halaman baru:** `/pengeluaran`, `/piutang`, `/laba-rugi`

- **Pengeluaran** — ramah-HP, diisi selagi di jalan. Kategori baku + foto struk
  opsional yang tidak pernah memblokir penyimpanan.
- **Ambilan Pribadi (prive)** — mengurangi kas, **TIDAK** mengurangi laba. Ini
  pembagian keuntungan, bukan biaya usaha.
- **Piutang** — `Payment` sebagai ledger, jadi satu nota bisa dicicil. Umur
  tagihan, teks tagihan siap tempel ke WhatsApp, pelunasan massal.
- **Laba Rugi** — menampilkan **dua angka berdampingan**:

      laba usaha − kenaikan piutang − ambilan pribadi = posisi kas

  Justru **selisih** itulah gejala "kelihatan untung tapi uang habis". Kalau
  hanya satu angka yang tampil, penjelasannya hilang.

### Keputusan yang mengikat

- `Transaction.status` **tidak dihapus**, hanya berubah jadi cache yang ditulis
  server. Alasannya: dashboard, laporan, dan ekspor menyaring `status === "Paid"`
  di banyak tempat — mempertahankannya membuat kode lama tetap benar tanpa
  disentuh. **Tidak ada jalur tulis dari klien ke kolom ini.**
- Biaya diakui **berbasis kas** (bahan dibeli hari ini = beban hari ini).
  Konsekuensinya laba bulanan bisa bergelombang; akan diperhalus oleh
  `bom-inventory`.

### Data lama

`scripts/backfill-payments.cjs` sudah dijalankan: **118 nota** lama berstatus
`Paid` dibuatkan bukti pembayaran, total **Rp565.551.012**. Skripnya idempoten
(dijalankan dua kali, yang kedua melaporkan 0). Punya `--dry-run`.

> **Temuan penting:** dari 118 nota, **tidak ada satu pun** yang berstatus belum
> bayar. Padahal Mama rutin menagih lewat WA — artinya piutang itu nyata, cuma
> tidak pernah tercatat. Jadi halaman Piutang akan **kosong** saat pertama
> dibuka; itu bukan bug. Ia baru terisi saat kasir memilih **"Belum Bayar"** di
> POS.

---

## 2. Modul pengrajin — `pengrajin-tugas-upah` (65/78)

**Halaman baru:** `/papan-tugas`, `/pengrajin`

Menjawab tiga dari empat keluhan operasional: orderan ke-skip, tidak tahu siapa
mengerjakan apa, dan upah yang cuma dicatat di buku.

### Temuan yang mengubah rancangan

`Transaction.nama_pengrajin` adalah **satu kolom teks bebas untuk seluruh nota**.
Secara struktural tidak mampu menyimpan kenyataan bahwa Bando Satin dan Bando
Pompom dalam satu nota dikerjakan orang berbeda — sebagus apa pun tampilannya
diperbaiki. Karena itu penugasan dipindah ke tingkat **`TransactionItem`**, dan
satu baris pun boleh dibagi ke beberapa pengrajin.

Kolom lamanya dipertahankan sebagai catatan sejarah; tidak ada fitur baru yang
membacanya untuk mengambil keputusan.

### Kenapa papan tugas & upah digabung satu modul

Keduanya berputar pada **satu kejadian yang sama**: pengrajin menyetorkan barang
jadi. Kejadian itu sekaligus menutup tugas di papan **dan** menambah saldo upah.
Kalau dipisah, "barang sudah disetor" harus dicatat dua kali — dan begitu
keduanya bisa berbeda, tidak ada lagi yang bisa dipercaya.

### Keputusan yang mengikat

- **Tarif per pasangan pengrajin × produk**, ditambah **tarif cadangan** per
  orang. Tanpa cadangan, satu produk baru membuat setoran gagal dicatat tepat di
  pagi tersibuk. Urutan: tarif produk → tarif cadangan → tolak.
- **Tarif disimpan sebagai snapshot** pada tiap setoran. Menaikkan tarif tidak
  boleh diam-diam mengubah nilai setoran yang mungkin sudah dibayar.
- **Setoran mencatat dua pihak**: pekerja dan penerima saldo. Riwayat kerja tetap
  menempel pada pekerjanya walau upahnya diteruskan ke ketua kelompok.
- **Saldo dihitung dari buku besar**, bukan kolom yang bisa disunting. Ini utang
  ke orang.
- **Biaya diakui saat PENARIKAN**, bukan saat setoran (konsisten basis kas).
  Konsekuensinya saldo terutang **belum masuk Laba Rugi** — karena itu
  ditampilkan sebagai kartu tersendiri di Dashboard dan halaman Pengrajin.
- Penarikan otomatis membuat `Expense` berkategori **Upah Pengrajin** dalam satu
  transaksi basis data. `Expense` itu **dikunci** dari halaman Pengeluaran.

### Penjaga validasi (urutan pengisian master penting!)

- `KETUA` wajib punya kelompok yang **sudah berketua**, dan bukan dirinya sendiri
- Pengrajin yang **menjadi** ketua wajib `SENDIRI` (cegah rantai berputar)

Urutan isi master yang benar: **buat kelompok → isi pengrajin (semua SENDIRI) →
tetapkan ketua tiap kelompok → baru ubah anggota jadi KETUA.** Kalau terbalik,
validasinya menolak.

---

## 3. Rantai kerja di rumah — `label-packing-kesiapan-setoran` (27/35)

Menutup tiga lubang terakhir di rentang **pukul 08.00 sampai mobil berangkat**.

- **Label bungkus siap cetak** ([lib/labelPacking.ts](lib/labelPacking.ts)) —
  menggantikan kertas kecil yang ditulis tangan Bibi. Bisa per nota atau per
  baris (cetak ulang). **HTML A4 dua label per baris + garis potong**, bukan
  format printer thermal: di rumah hanya ada printer biasa.
- **Status setoran di Checklist Packing** — tiap baris menyebut pengrajin dan
  jumlah setorannya; tiap nota ditandai siap dipacking.
- **Tagih Setoran di Papan Tugas** — pekerjaan jatuh tempo/terlambat per
  pengrajin, dengan teks siap salin.

### Dua keputusan yang perlu diingat

1. **Setoran TIDAK mengunci pencentangan packing.** Kenyataan lebih berantakan
   daripada data — pengrajin bisa menyerahkan barang tanpa sempat dicatat.
   Mengunci centang membuat orang berhenti memakai checklist sama sekali, dan
   checklist yang tidak dipakai lebih buruk daripada checklist tanpa penjagaan.
2. **Penilaian "siap dipacking" hanya menghitung baris yang punya penugasan.**
   Kalau tidak, semua pesanan lama akan selamanya tampak menggantung dan
   penandanya kehilangan arti sejak hari pertama. Penandanya menyebut dasarnya
   ("8/8 baris bertugas sudah disetor"), bukan sekadar lencana hijau.

---

## 4. Perbaikan dari feedback pemilik

Enam commit lahir dari koreksi langsung, dan semuanya menemukan masalah nyata:

| Keluhan | Penyebab sebenarnya |
|---|---|
| Tampilan beda tema | Padding dobel (`<main>` sudah memberi padding), tidak pakai `lina-panel`, palet rose/emerald/violet acak |
| Navbar kepotong | `min-h-0` tidak ada → flex item menolak menyusut, `overflow-y-auto` tidak pernah aktif |
| Label menu terpotong 1 huruf | `scrollbar-gutter: stable` yang saya tambahkan memakan ~6px permanen |
| Tampilan memanjang | 25 baris dari **satu** nota mengulang keterangan yang sama 25 kali |
| Ada tulisan `setengah_gross` | Nilai mentah DB bocor ke layar — **dan** beban kerja menjumlahkan satuan berbeda (2 gross + 5 lusin = "7 unit"), sehingga urutan "siapa paling kosong" salah |
| Barang hilang setelah ditugaskan | Kartu nota makin kosong, gambaran utuh notanya lenyap |
| Jangan tampilkan pcs | Benar — pcs kini hanya dipakai server untuk mengurutkan, tidak pernah tampil |

---

## 5. Yang BELUM diverifikasi (perlu dicoba sendiri)

Selama sesi ini tidak ada peramban dengan sesi login di sisi asisten. Yang sudah
diverifikasi: typecheck bersih, ESLint tidak menambah error baru, **17 endpoint
baru menolak 401 tanpa sesi**, seluruh halaman ter-render 200, dan
`scripts/uji-perhitungan.mts` **21/21 lolos** (batas hari WIB + jembatan
laba↔kas).

Yang belum pernah benar-benar dilihat berjalan:

- [ ] **Alur pembayaran piutang** — bayar penuh, sebagian, cicil sampai lunas,
      coba melebihi sisa (harus ditolak), hapus pembayaran (harus balik jadi
      piutang)
- [ ] **Alur pengrajin lengkap** — tugaskan → setor sebagian → tarik upah →
      cek muncul di Laba Rugi dan hilang saat penarikan dibatalkan
- [ ] **Bagi satu baris ke dua pengrajin** (5 gross → 3 ke A, 2 ke B)
- [ ] **Penerusan upah ke ketua** — saldo masuk ke ketua, riwayat kerja tetap di
      anggota, penarikan atas nama anggota ditolak
- [ ] **Cetak sungguhan satu lembar label** lalu cocokkan ukurannya dengan
      plastik — ukurannya masih tebakan, belum pernah melihat plastiknya
- [ ] **Tampilan 360px** untuk Pengeluaran, Piutang, Papan Tugas, Pengrajin
- [ ] **Admin ditolak** di halaman Laba Rugi & rekap upah (butuh login Admin)

---

## 6. Hal terbuka / keputusan yang menunggu

### Mendesak

1. **Isi tarif produk tiap pengrajin.** Saat ini hampir semua masih "belum ada
   tarif produk". Tanpa ini setoran ditolak, dan itu baru ketahuan di pagi
   tersibuk. Tarif cadangan sudah menolong, tapi angkanya jadi perkiraan.
2. **Cek `SESSION_SECRET` sudah diset di Vercel** (tugas 6.4 di
   `harden-api-auth`). Lima menit, tapi ini lubang keamanan kalau belum.
3. **Agustus mulai 2 hari lagi dan itu bulan tersibuk** (17 Agustus). Dua modul
   besar belum pernah dipakai sungguhan. Uji alur lengkapnya **sebelum** tanggal
   1 — kalau ketahuan rusak pas orderan membanjir, itu waktu paling buruk.

### Perlu diputuskan

4. **Angka Juli abaikan saja.** Omzet besar tanpa satu pun biaya tercatat, jadi
   labanya bohong. Pemilik sudah memutuskan fitur ini **mulai dipakai Agustus
   dengan data baru**.
5. **Bulan pertama akan bergelombang** — bahan dibeli 31 Juli tapi produknya
   terjual Agustus. Jangan ambil kesimpulan dari satu bulan; baca dari bulan
   kedua atau lihat total dua bulan.
6. **Ukuran label** — dua per baris A4, tinggi ~34mm. Ubah di
   [lib/labelPacking.ts](lib/labelPacking.ts) kalau tidak pas.
7. **Satuan tarif vs satuan pesanan** — sekarang diasumsikan sama. Kalau ada
   pengrajin dibayar per pcs meski pesanannya per gross, perlu konversi.
8. **Barang cacat** — sekarang seluruh setoran dibayar penuh. Kalau perlu
   dipotong, cara termudah: catat setoran sejumlah yang layak saja.

### Warisan sesi 27 Juli (masih terbuka)

9. **Logo toko tidak bisa diakses dari desktop** — header tempat logo hanya
   muncul di mobile.
10. **Centang packing saat qty bertambah** — kalau qty dinaikkan 2 → 5 dan sudah
    tercentang, centangnya tetap. Risikonya 3 pcs tambahan terlewat.
11. **Kartu produk agak gemuk di jendela 900–1000px** — sifat bawaan `auto-fill`.

### Kerapian

12. **Dua commit punya `@` nyasar di judulnya** (`75538d1`, `64763cc`) — akibat
    sintaks here-string PowerShell dipakai di shell Bash. Isinya benar, hanya
    judulnya jelek di `git log`. Merapikannya harus menulis ulang riwayat yang
    sudah ter-push.
13. **Draf usang** — `pengrajin-payroll` sudah **tergantikan penuh** oleh
    `pengrajin-tugas-upah`, dan `petty-cash-hpp` tinggal separuh isinya (bagian
    pengeluaran sudah dikerjakan). Sebaiknya diarsipkan supaya sesi berikutnya
    tidak salah ambil rencana.

---

## 7. Cara melanjutkan besok

```bash
npm run dev          # http://localhost:3000
```

Perintah pemeriksaan yang dipakai sepanjang sesi:

```bash
npx tsc --noEmit -p tsconfig.json                    # typecheck
npx eslint "app/(frontend)/nama/page.tsx"            # lint satu berkas
node --experimental-strip-types scripts/uji-perhitungan.mts   # 21 uji hitung
node scripts/backfill-payments.cjs --dry-run         # cek migrasi (aman)
openspec list                                         # progres semua change
```

**Jebakan yang memakan waktu sesi ini:**

- **Cache Turbopack menahan CSS rusak.** Setelah `app/globals.css` diubah dan
  sempat salah, halaman terus 500 walau sumbernya sudah benar. Obatnya:
  hentikan server → `rm -rf .next` → `npm run dev`.
- **Jangan pakai sintaks here-string PowerShell (`@'...'@`) di Bash tool.**
  Tanda `@`-nya masuk sebagai teks ke pesan commit. Pakai `git commit -F -` dengan
  heredoc `<<'EOF'`.

**Catatan lint:** repo ini sudah punya error/warning ESLint bawaan yang tidak
berhubungan (`prefer-const`, `no-explicit-any`, `set-state-in-effect`, warning
`<img>`). Yang penting **tidak ada tambahan baru** — cara mengeceknya: salin
versi `HEAD` berkas itu ke folder sementara, lint keduanya, bandingkan jumlahnya.

---

## Berkas penting yang lahir di sesi ini

| Berkas | Isi |
|---|---|
| `lib/waktu.ts` | Batas hari & bulan **WIB** dihitung eksplisit — server Vercel jalan UTC, tanpa ini transaksi pukul 00:00–07:00 WIB jatuh ke tanggal salah |
| `lib/pengeluaran.ts` | Kategori pengeluaran + pemisahan biaya usaha vs prive |
| `lib/piutang.ts` | Sisa tagihan, status pelunasan, umur piutang, teks penagihan |
| `lib/pengrajin.ts` | Penentuan tarif, penerima upah, sisa penugasan, saldo, penjaga rantai berputar |
| `lib/labelPacking.ts` | Pembuat label bungkus siap gunting |
| `scripts/backfill-payments.cjs` | Migrasi bukti pembayaran nota lama (idempoten, punya `--dry-run`) |
| `scripts/uji-perhitungan.mts` | 21 pemeriksaan batas WIB & jembatan laba↔kas |

**Model basis data baru** (semua sudah ada di produksi): `Payment`, `Expense`,
`Kelompok`, `Pengrajin`, `TarifPengrajin`, `Penugasan`, `Setoran`, `Penarikan`.
