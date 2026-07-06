import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Daftar kode pelanggan (mis. Aneka: AMN/SMT/HARLIS) untuk autocomplete di modal POS.
// Sumber: master `CustomerCode` (di-seed dari variasi-kode lama) + kode yang dipakai
// pada transaksi & keranjang (kolom `label`). Dinormalisasi UPPERCASE.
export async function GET() {
  try {
    const [master, txnLabels, cartLabels] = await Promise.all([
      prisma.customerCode.findMany({ select: { code: true } }),
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
    for (const row of master) {
      const code = row.code?.trim().toUpperCase();
      if (code) codes.add(code);
    }
    for (const row of [...txnLabels, ...cartLabels]) {
      const code = row.label?.trim().toUpperCase();
      if (code) codes.add(code);
    }

    return NextResponse.json([...codes].sort((a, b) => a.localeCompare(b, "id")));
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
