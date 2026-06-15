import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getActorFromPayload, recordActivityLog } from "@/lib/activityLog";
import { deleteProductImageFromStorage } from "@/lib/supabaseStorage";

export const dynamic = 'force-dynamic';

const cleanupProductImage = async (imageUrl?: string | null) => {
  try {
    await deleteProductImageFromStorage(imageUrl);
  } catch (error) {
    console.error("Gagal menghapus foto produk dari Supabase Storage", error);
  }
};

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const isPublicCatalog = url.searchParams.get("public") === "1";
    const showArsip = url.searchParams.get("arsip") === "1";

    if (isPublicCatalog) {
      const products = await prisma.product.findMany({
        where: { isArchived: false },
        orderBy: { id: "desc" },
        select: {
          id: true,
          nama_produk: true,
          stok: true,
          gambar: true,
        },
      });
      return NextResponse.json(products);
    }

    const products = await prisma.product.findMany({
      where: { isArchived: showArsip },
      orderBy: { id: "desc" },
    });
    return NextResponse.json(products);
  } catch {
    return NextResponse.json({ error: "Gagal memuat produk" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const actor = getActorFromPayload(data);

    let finalBarcode = data.barcode;
    if (!finalBarcode || finalBarcode.trim() === "") {
      finalBarcode = `LINA-${Date.now().toString().slice(-6)}`;
    }

    const newProduct = await prisma.product.create({
      data: {
        nama_produk: data.nama_produk,
        harga: Number(data.harga),
        stok: Number(data.stok),
        barcode: finalBarcode,
        gambar: data.gambar || null,
      },
    });
    await recordActivityLog({
      action: "TAMBAH",
      entity: "Produk",
      entityId: newProduct.id,
      title: `Produk ditambahkan: ${newProduct.nama_produk}`,
      description: `${actor.name} menambahkan produk ${newProduct.nama_produk} dengan stok ${newProduct.stok}.`,
      actor,
      metadata: {
        harga: newProduct.harga,
        stok: newProduct.stok,
        barcode: newProduct.barcode,
      },
    });
    return NextResponse.json(newProduct, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Gagal membuat produk" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const data = await request.json();
    const actor = getActorFromPayload(data);

    if (data.action === "arsipkan" || data.action === "batalkanArsip") {
      const isArchived = data.action === "arsipkan";
      const updated = await prisma.product.update({
        where: { id: Number(data.id) },
        data: { isArchived },
      });
      const actionLabel = isArchived ? "diarsipkan" : "dipulihkan dari arsip";
      await recordActivityLog({
        action: isArchived ? "ARSIP" : "PULIHKAN",
        entity: "Produk",
        entityId: updated.id,
        title: `Produk ${actionLabel}: ${updated.nama_produk}`,
        description: `${actor.name} ${actionLabel} produk ${updated.nama_produk}.`,
        actor,
        metadata: { isArchived },
      });
      return NextResponse.json(updated);
    }

    const before = await prisma.product.findUnique({ where: { id: Number(data.id) } });

    let finalBarcode = data.barcode;
    if (!finalBarcode || finalBarcode.trim() === "") {
      finalBarcode = `LINA-${Date.now().toString().slice(-6)}`;
    }

    const updatedProduct = await prisma.product.update({
      where: { id: Number(data.id) },
      data: {
        nama_produk: data.nama_produk,
        harga: Number(data.harga),
        stok: Number(data.stok),
        barcode: finalBarcode,
        gambar: data.gambar || null,
      },
    });
    if (before?.gambar && before.gambar !== updatedProduct.gambar) {
      await cleanupProductImage(before.gambar);
    }
    await recordActivityLog({
      action: "UPDATE",
      entity: "Produk",
      entityId: updatedProduct.id,
      title: `Produk diperbarui: ${updatedProduct.nama_produk}`,
      description: `${actor.name} memperbarui data produk ${updatedProduct.nama_produk}.`,
      actor,
      metadata: {
        sebelum: before
          ? {
              nama_produk: before.nama_produk,
              harga: before.harga,
              stok: before.stok,
              barcode: before.barcode,
              punyaGambar: Boolean(before.gambar),
            }
          : null,
        sesudah: {
          nama_produk: updatedProduct.nama_produk,
          harga: updatedProduct.harga,
          stok: updatedProduct.stok,
          barcode: updatedProduct.barcode,
          punyaGambar: Boolean(updatedProduct.gambar),
        },
      },
    });
    return NextResponse.json(updatedProduct);
  } catch {
    return NextResponse.json({ error: "Gagal memperbarui produk" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const data = await request.json();
    const { id } = data;
    const actor = getActorFromPayload(data);
    const product = await prisma.product.findUnique({ where: { id: Number(id) } });

    await prisma.$transaction(async (tx) => {
      await tx.orderRequestItem.deleteMany({ where: { productId: Number(id) } });
      await tx.transactionItem.deleteMany({ where: { productId: Number(id) } });
      await tx.product.delete({ where: { id: Number(id) } });
    });

    await cleanupProductImage(product?.gambar);
    await recordActivityLog({
      action: "HAPUS",
      entity: "Produk",
      entityId: id,
      title: `Produk dihapus: ${product?.nama_produk || `ID ${id}`}`,
      description: `${actor.name} menghapus produk ${product?.nama_produk || `ID ${id}`} secara permanen.`,
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
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Gagal menghapus produk" }, { status: 500 });
  }
}
