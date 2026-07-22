/**
 * Migrasi data: nama pelanggan (teks bebas) → master `Customer`, lalu backfill
 * `CustomerPrice.customerId` dan `Transaction.customerId`.
 *
 * IDEMPOTEN — aman dijalankan berulang. JALANKAN SETELAH:
 *   1) Backup database.
 *   2) `npx prisma db push` (membuat tabel Customer + kolom customerId nullable).
 *
 * Cara jalan:
 *   npx tsx prisma/scripts/migrate-customers.ts
 *   (atau: npx ts-node --compiler-options '{"module":"commonjs"}' prisma/scripts/migrate-customers.ts)
 */
import prisma from "../../lib/prisma";

const norm = (value: string | null | undefined) => (value ?? "").trim().toUpperCase();

async function main() {
  // 1) Kumpulkan nama distinct dari harga khusus + riwayat transaksi.
  const [priceRows, txnRows] = await Promise.all([
    prisma.customerPrice.findMany({ distinct: ["customerName"], select: { customerName: true } }),
    prisma.transaction.findMany({
      where: { nama_pembeli: { not: null } },
      distinct: ["nama_pembeli"],
      select: { nama_pembeli: true },
    }),
  ]);

  const names = new Set<string>();
  for (const row of priceRows) {
    const name = norm(row.customerName);
    if (name) names.add(name);
  }
  for (const row of txnRows) {
    const name = norm(row.nama_pembeli);
    if (name && name !== "-") names.add(name);
  }

  // 2) Upsert 1 Customer per nama kanonik.
  for (const name of names) {
    await prisma.customer.upsert({ where: { name }, update: {}, create: { name } });
  }

  // 3) Peta nama → id.
  const customers = await prisma.customer.findMany({ select: { id: true, name: true } });
  const idByName = new Map(customers.map((c) => [c.name, c.id]));

  // 4) Backfill CustomerPrice.customerId (hanya yang masih kosong).
  const prices = await prisma.customerPrice.findMany({
    where: { customerId: null },
    select: { id: true, customerName: true },
  });
  let priceFilled = 0;
  let priceConflict = 0;
  for (const price of prices) {
    const customerId = idByName.get(norm(price.customerName));
    if (!customerId) continue;
    try {
      await prisma.customerPrice.update({ where: { id: price.id }, data: { customerId } });
      priceFilled += 1;
    } catch {
      // Konflik unique (customerId, productId, variantId): baris duplikat hasil ejaan
      // berbeda yang menormalisasi ke Customer sama. Dilewati agar migrasi tetap jalan.
      priceConflict += 1;
    }
  }

  // 5) Backfill Transaction.customerId (hanya yang masih kosong & punya nama_pembeli).
  const txns = await prisma.transaction.findMany({
    where: { customerId: null, nama_pembeli: { not: null } },
    select: { id: true, nama_pembeli: true },
  });
  let txnFilled = 0;
  for (const txn of txns) {
    const customerId = idByName.get(norm(txn.nama_pembeli));
    if (!customerId) continue;
    await prisma.transaction.update({ where: { id: txn.id }, data: { customerId } });
    txnFilled += 1;
  }

  console.log(
    `Migrasi selesai:\n` +
      `  - Customer master : ${names.size}\n` +
      `  - CustomerPrice   : ${priceFilled} di-backfill` +
      (priceConflict ? `, ${priceConflict} dilewati (duplikat)` : "") +
      `\n` +
      `  - Transaction     : ${txnFilled} di-backfill`
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error("Migrasi GAGAL:", error);
    await prisma.$disconnect();
    process.exit(1);
  });
