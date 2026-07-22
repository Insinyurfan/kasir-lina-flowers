import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/apiAuth";

export const dynamic = "force-dynamic";

// GET /api/packing
// Daftar transaksi dengan status pengiriman AKTIF (belum "Selesai"), dikelompokkan
// per transaksi/toko, beserta itemnya + status centang (packed). Untuk checklist packing.
export async function GET(request: Request) {
  const auth = await requireRole(request, ["Owner", "Admin"]);
  if (!auth.ok) return auth.response;

  try {
    const transactions = await prisma.transaction.findMany({
      where: { status_pengiriman: { not: "Selesai" } },
      orderBy: { tanggal: "desc" },
      include: {
        items: {
          orderBy: { id: "asc" },
          include: {
            product: {
              select: { id: true, nama_produk: true, gambar: true, gambarPosX: true, gambarPosY: true },
            },
          },
        },
      },
    });

    const data = transactions.map((trx) => {
      const items = trx.items.map((item) => ({
        id: item.id,
        nama_produk: item.product?.nama_produk ?? "-",
        variantName: item.variantName,
        label: item.label,
        jumlah: item.jumlah,
        satuan: item.satuanHarga,
        gambar: item.product?.gambar ?? null,
        gambarPosX: item.product?.gambarPosX ?? 50,
        gambarPosY: item.product?.gambarPosY ?? 50,
        packed: item.packed,
        packedAt: item.packedAt,
      }));
      return {
        id: trx.id,
        trxNumber: trx.trxNumber,
        tanggal: trx.tanggal,
        nama_pembeli: trx.nama_pembeli,
        status_pengiriman: trx.status_pengiriman,
        totalItems: items.length,
        packedItems: items.filter((i) => i.packed).length,
        items,
      };
    });

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Gagal memuat checklist packing." }, { status: 500 });
  }
}

// PATCH /api/packing  { transactionItemId, checked }
// Toggle status centang satu item (sudah/belum masuk mobil).
export async function PATCH(request: Request) {
  try {
    const auth = await requireRole(request, ["Owner", "Admin"]);
    if (!auth.ok) return auth.response;

    const { transactionItemId, checked } = (await request.json()) as {
      transactionItemId?: number;
      checked?: boolean;
    };
    const id = Number(transactionItemId);
    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ error: "Item tidak valid." }, { status: 400 });
    }

    const packed = Boolean(checked);
    const updated = await prisma.transactionItem.update({
      where: { id },
      data: { packed, packedAt: packed ? new Date() : null },
      select: { id: true, packed: true, packedAt: true },
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Gagal memperbarui centang." }, { status: 500 });
  }
}
