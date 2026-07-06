import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Daftar kode pelanggan (mis. Aneka: AMN/SMT/ST) yang pernah dipakai,
// untuk autocomplete di modal POS. Dinormalisasi UPPERCASE. Awalnya kosong,
// tumbuh seiring pemakaian.
export async function GET() {
  try {
    const [txnRows, cartRows] = await Promise.all([
      prisma.transactionItem.findMany({
        where: { label: { not: null } },
        distinct: ["label"],
        select: { label: true },
        take: 1000,
      }),
      prisma.userCartItem.findMany({
        where: { label: { not: null } },
        distinct: ["label"],
        select: { label: true },
        take: 1000,
      }),
    ]);

    const codes = new Set<string>();
    for (const row of [...txnRows, ...cartRows]) {
      const code = row.label?.trim().toUpperCase();
      if (code) codes.add(code);
    }

    return NextResponse.json([...codes].sort((a, b) => a.localeCompare(b, "id")));
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
