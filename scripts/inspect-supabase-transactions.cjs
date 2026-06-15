const { PrismaClient } = require("../lib/generated/prisma");

const prisma = new PrismaClient();

const main = async () => {
  const rows = await prisma.transaction.findMany({
    select: {
      id: true,
      tanggal: true,
      status: true,
      status_pengiriman: true,
      total_harga: true,
      nama_pembeli: true,
      _count: {
        select: {
          items: true,
        },
      },
    },
    orderBy: {
      tanggal: "desc",
    },
    take: 20,
  });

  console.log(JSON.stringify(rows, null, 2));
};

main()
  .catch((error) => {
    console.error(error.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
