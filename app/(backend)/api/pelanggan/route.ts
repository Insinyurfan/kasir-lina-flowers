import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Daftar nama pelanggan/toko yang pernah ada (untuk autocomplete di POS),
// digabung dari harga khusus tersimpan + riwayat transaksi. Dinormalisasi UPPERCASE.
export async function GET() {
  try {
    const [priceRows, txnRows] = await Promise.all([
      prisma.customerPrice.findMany({
        distinct: ["customerName"],
        select: { customerName: true },
      }),
      prisma.transaction.findMany({
        where: { nama_pembeli: { not: null } },
        distinct: ["nama_pembeli"],
        select: { nama_pembeli: true },
        take: 2000,
      }),
    ]);

    const names = new Set<string>();
    for (const row of priceRows) {
      const name = row.customerName?.trim().toUpperCase();
      if (name) names.add(name);
    }
    for (const row of txnRows) {
      const name = row.nama_pembeli?.trim().toUpperCase();
      if (name && name !== "-") names.add(name);
    }

    const sorted = [...names].sort((a, b) => a.localeCompare(b, "id"));
    return NextResponse.json(sorted);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
