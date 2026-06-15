const { PrismaClient } = require("../lib/generated/prisma");

const prisma = new PrismaClient();
const tables = [
  "User",
  "Product",
  "Transaction",
  "TransactionItem",
  "StoreSetting",
  "Notification",
  "ActivityLog",
  "UserCart",
  "UserCartItem",
];

const quoteIdent = (value) => `"${String(value).replace(/"/g, '""')}"`;

const main = async () => {
  const counts = {};
  for (const table of tables) {
    const rows = await prisma.$queryRawUnsafe(
      `SELECT COUNT(*)::int AS count FROM ${quoteIdent(table)}`
    );
    counts[table] = rows[0].count;
  }

  const products = await prisma.product.findMany({
    select: {
      id: true,
      nama_produk: true,
      gambar: true,
    },
    orderBy: {
      id: "asc",
    },
  });

  console.log(
    JSON.stringify(
      {
        counts,
        images: products.map((product) => ({
          id: product.id,
          nama_produk: product.nama_produk,
          gambar: product.gambar
            ? product.gambar.includes("/storage/v1/object/public/produk/")
              ? "storage-url"
              : product.gambar.startsWith("data:image/")
                ? "base64"
                : "other"
            : "empty",
        })),
      },
      null,
      2
    )
  );
};

main()
  .catch((error) => {
    console.error(error.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
