import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Daftar kode pelanggan Aneka (AMN/SMT/ST/...) untuk autocomplete di modal POS.
// Kode saat ini KHUSUS pelanggan "ANEKA", jadi diseed dari histori Aneka:
//  - kode BARU: kolom `label` (dari transaksi & keranjang),
//  - kode LAMA: `variantName` pada transaksi Aneka yang belum pakai label
//    (dulu kode disimpan sebagai "variasi").
// Dinormalisasi UPPERCASE.
export async function GET() {
  try {
    const [txnLabels, cartLabels, anekaVariants] = await Promise.all([
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
      prisma.transactionItem.findMany({
        where: {
          label: null,
          variantName: { not: null },
          transaction: { nama_pembeli: { contains: "ANEKA", mode: "insensitive" } },
        },
        distinct: ["variantName"],
        select: { variantName: true },
        take: 1000,
      }),
    ]);

    const codes = new Set<string>();
    for (const row of txnLabels) {
      const code = row.label?.trim().toUpperCase();
      if (code) codes.add(code);
    }
    for (const row of cartLabels) {
      const code = row.label?.trim().toUpperCase();
      if (code) codes.add(code);
    }
    for (const row of anekaVariants) {
      const code = row.variantName?.trim().toUpperCase();
      if (code) codes.add(code);
    }

    return NextResponse.json([...codes].sort((a, b) => a.localeCompare(b, "id")));
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
