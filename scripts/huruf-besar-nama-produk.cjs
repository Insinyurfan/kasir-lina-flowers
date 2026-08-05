// Ubah nama produk yang sudah ada di database menjadi HURUF BESAR semua.
// Jalankan sekali saja; aman diulang (produk yang sudah huruf besar dilewati).
//
//   node scripts/huruf-besar-nama-produk.cjs          → hanya menampilkan rencana
//   node scripts/huruf-besar-nama-produk.cjs --terapkan → benar-benar menyimpan

const { PrismaClient } = require("../lib/generated/prisma");

const prisma = new PrismaClient();
const terapkan = process.argv.includes("--terapkan");

const main = async () => {
  const products = await prisma.product.findMany({
    select: { id: true, nama_produk: true },
    orderBy: { id: "asc" },
  });

  const perluUbah = products
    .map((p) => ({ id: p.id, lama: p.nama_produk, baru: String(p.nama_produk ?? "").toUpperCase().trim() }))
    .filter((p) => p.lama !== p.baru);

  console.log(`Total produk: ${products.length}`);
  console.log(`Perlu diubah: ${perluUbah.length}`);
  for (const p of perluUbah) {
    console.log(`  #${p.id}  ${p.lama}  →  ${p.baru}`);
  }

  if (!terapkan) {
    console.log("\n(Uji coba saja. Tambahkan --terapkan untuk menyimpan perubahan.)");
    return;
  }

  for (const p of perluUbah) {
    await prisma.product.update({ where: { id: p.id }, data: { nama_produk: p.baru } });
  }
  console.log(`\nSelesai. ${perluUbah.length} nama produk diubah jadi huruf besar.`);
};

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
