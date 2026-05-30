import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getActorFromPayload, recordActivityLog } from "@/lib/activityLog";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const products = await prisma.product.findMany({ orderBy: { id: "desc" } });
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ error: "Gagal memuat produk" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const actor = getActorFromPayload(data);
    
    // Auto-generate barcode jika kosong (Contoh: LINA-171510293)
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
  } catch (error) {
    return NextResponse.json({ error: "Gagal membuat produk" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const data = await request.json();
    const actor = getActorFromPayload(data);
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
  } catch (error) {
    return NextResponse.json({ error: "Gagal memperbarui produk" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const data = await request.json();
    const { id } = data;
    const actor = getActorFromPayload(data);
    const product = await prisma.product.findUnique({ where: { id: Number(id) } });
    await prisma.product.delete({ where: { id: Number(id) } });
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
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Gagal menghapus produk" }, { status: 500 });
  }
}
