// Backfill pembayaran untuk transaksi lama.
//
// Sebelum change `pengeluaran-piutang-laba`, pelunasan hanya berupa kolom
// `Transaction.status` yang dipilih manual. Setelah ada tabel `Payment`, semua
// transaksi lama akan terlihat menunggak karena belum punya baris pembayaran.
//
// Skrip ini membuat SATU pembayaran senilai `total_harga` untuk setiap transaksi
// ber-status "Paid", bertanggal sama dengan tanggal transaksinya.
// Transaksi "Unpaid" sengaja DIBIARKAN — memang itu piutang yang sebenarnya.
//
// Aman dijalankan berulang: transaksi yang sudah punya pembayaran dilewati.
//
// Pemakaian:
//   node scripts/backfill-payments.cjs --dry-run   # hanya laporan, tidak menulis
//   node scripts/backfill-payments.cjs             # jalankan sungguhan
//
// Rollback:
//   DELETE FROM "Payment" WHERE catatan = 'Migrasi otomatis dari status lama';

const fs = require("node:fs");
const path = require("node:path");
const { PrismaClient } = require("../lib/generated/prisma");

const PROJECT_ROOT = path.resolve(__dirname, "..");

// Harus sama persis dengan CATATAN_MIGRASI di lib/piutang.ts.
const CATATAN_MIGRASI = "Migrasi otomatis dari status lama";
const STATUS_LUNAS = "Paid";
const UKURAN_BATCH = 200;

const loadEnvFile = (filePath) => {
  if (!fs.existsSync(filePath)) return;

  for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = process.env[key] || value;
  }
};

loadEnvFile(path.join(PROJECT_ROOT, ".env"));

const rupiah = (nilai) => `Rp${Number(nilai).toLocaleString("id-ID")}`;

const main = async () => {
  const dryRun = process.argv.includes("--dry-run");
  const prisma = new PrismaClient();

  try {
    // Hitungan "sebelum" untuk diverifikasi ulang di akhir (task 2.4).
    const totalTransaksi = await prisma.transaction.count();
    const lunasSebelum = await prisma.transaction.count({ where: { status: STATUS_LUNAS } });
    const pembayaranSebelum = await prisma.payment.count();

    console.log("=== Backfill pembayaran transaksi lama ===");
    console.log(dryRun ? "Mode      : DRY RUN (tidak menulis apa pun)" : "Mode      : JALANKAN");
    console.log(`Transaksi : ${totalTransaksi} total, ${lunasSebelum} berstatus ${STATUS_LUNAS}`);
    console.log(`Pembayaran: ${pembayaranSebelum} baris sudah ada sebelum skrip ini\n`);

    // Idempotensi: hanya transaksi lunas yang BELUM punya pembayaran sama sekali.
    const kandidat = await prisma.transaction.findMany({
      where: { status: STATUS_LUNAS, payments: { none: {} } },
      select: { id: true, trxNumber: true, tanggal: true, total_harga: true, nama_pembeli: true },
      orderBy: { id: "asc" },
    });

    const totalNominal = kandidat.reduce((jumlah, trx) => jumlah + trx.total_harga, 0);

    console.log(`Perlu dibuatkan pembayaran: ${kandidat.length} transaksi (${rupiah(totalNominal)})`);

    if (kandidat.length === 0) {
      console.log("\nTidak ada yang perlu dimigrasikan. Skrip sudah pernah dijalankan sampai tuntas.");
      return;
    }

    for (const contoh of kandidat.slice(0, 5)) {
      const nomor = contoh.trxNumber ? `#${contoh.trxNumber}` : `ID ${contoh.id}`;
      console.log(`  contoh: ${nomor} — ${contoh.nama_pembeli || "(tanpa nama)"} — ${rupiah(contoh.total_harga)}`);
    }
    if (kandidat.length > 5) console.log(`  ... dan ${kandidat.length - 5} lainnya`);

    if (dryRun) {
      console.log("\nDRY RUN selesai. Tidak ada data yang ditulis.");
      console.log("Jalankan tanpa --dry-run untuk benar-benar memigrasikan.");
      return;
    }

    // Transaksi bernominal 0 dilewati: `Payment.nominal` harus > 0 dan transaksi
    // senilai nol memang tidak butuh bukti pembayaran.
    const layak = kandidat.filter((trx) => trx.total_harga > 0);
    const dilewatiNol = kandidat.length - layak.length;

    let dibuat = 0;
    for (let mulai = 0; mulai < layak.length; mulai += UKURAN_BATCH) {
      const batch = layak.slice(mulai, mulai + UKURAN_BATCH);
      const hasil = await prisma.payment.createMany({
        data: batch.map((trx) => ({
          transactionId: trx.id,
          tanggal: trx.tanggal,
          nominal: trx.total_harga,
          metode: "Tunai",
          catatan: CATATAN_MIGRASI,
          pencatatNama: "Sistem",
        })),
      });
      dibuat += hasil.count;
      console.log(`  ...${dibuat}/${layak.length} pembayaran dibuat`);
    }

    // Verifikasi: jumlah transaksi lunas TIDAK boleh berubah. Skrip ini hanya
    // menambah bukti pembayaran, tidak mengubah status satu pun transaksi.
    const lunasSesudah = await prisma.transaction.count({ where: { status: STATUS_LUNAS } });
    const pembayaranSesudah = await prisma.payment.count();
    const masihTanpaBukti = await prisma.transaction.count({
      where: { status: STATUS_LUNAS, payments: { none: {} }, total_harga: { gt: 0 } },
    });

    console.log("\n=== Hasil ===");
    console.log(`Pembayaran dibuat     : ${dibuat}`);
    if (dilewatiNol > 0) console.log(`Dilewati (nominal 0)  : ${dilewatiNol}`);
    console.log(`Pembayaran total      : ${pembayaranSebelum} → ${pembayaranSesudah}`);
    console.log(`Transaksi lunas       : ${lunasSebelum} → ${lunasSesudah} ${lunasSebelum === lunasSesudah ? "✓ tidak berubah" : "✗ BERUBAH — periksa!"}`);
    console.log(`Lunas tanpa bukti bayar: ${masihTanpaBukti} ${masihTanpaBukti === 0 ? "✓" : "✗ masih tersisa"}`);

    if (lunasSebelum !== lunasSesudah || masihTanpaBukti !== 0) {
      process.exitCode = 1;
      console.error("\nVerifikasi GAGAL. Jangan lanjut ke rilis antarmuka sebelum ini beres.");
    } else {
      console.log("\nVerifikasi lolos. Aman dijalankan ulang kapan saja (idempoten).");
    }
  } finally {
    await prisma.$disconnect();
  }
};

main().catch((error) => {
  console.error("Backfill gagal:", error);
  process.exitCode = 1;
});
