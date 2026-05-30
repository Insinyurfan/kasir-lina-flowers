import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getActorFromPayload, recordActivityLog } from "@/lib/activityLog";

// Method DELETE: Untuk dipanggil frontend saat menekan tombol "Hapus"
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = Number(idParam);
    const payload = await request.json().catch(() => ({}));
    const actor = getActorFromPayload(payload as Record<string, unknown>);
    const product = await prisma.product.findUnique({ where: { id } });

    await prisma.product.delete({
      where: { id: id },
    });

    await recordActivityLog({
      action: "HAPUS",
      entity: "Produk",
      entityId: id,
      title: `Produk dihapus: ${product?.nama_produk || `ID ${id}`}`,
      description: `${actor.name} menghapus produk ${product?.nama_produk || `ID ${id}`}.`,
      actor,
      metadata: product
        ? {
            nama_produk: product.nama_produk,
            harga: product.harga,
            stok: product.stok,
            barcode: product.barcode,
          }
        : null,
    });

    return NextResponse.json({ message: "Produk berhasil dihapus" });
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal menghapus produk" },
      { status: 500 }
    );
  }
}
