import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getActorFromPayload, recordActivityLog } from "@/lib/activityLog";

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const variants = await prisma.productVariant.findMany({
      where: { productId: Number(id) },
      orderBy: { order: "asc" },
    });
    return NextResponse.json(variants);
  } catch {
    return NextResponse.json({ error: "Gagal memuat varian produk" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();
    const actor = getActorFromPayload(data);
    const productId = Number(id);

    // Check jika produk ada
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json({ error: "Produk tidak ditemukan" }, { status: 404 });
    }

    // Check jika variant name sudah ada
    const existingVariant = await prisma.productVariant.findFirst({
      where: { productId, name: data.name?.trim() },
    });
    if (existingVariant) {
      return NextResponse.json({ error: "Varian dengan nama ini sudah ada" }, { status: 400 });
    }

    // Get highest order number
    const lastVariant = await prisma.productVariant.findFirst({
      where: { productId },
      orderBy: { order: "desc" },
    });
    const nextOrder = (lastVariant?.order ?? -1) + 1;

    const newVariant = await prisma.productVariant.create({
      data: {
        productId,
        name: data.name?.trim(),
        price: Number(data.price) || 0,
        order: nextOrder,
      },
    });

    await recordActivityLog({
      action: "TAMBAH",
      entity: "Varian Produk",
      entityId: newVariant.id.toString(),
      title: `Varian ditambahkan: ${product.nama_produk} - ${newVariant.name}`,
      description: `${actor.name} menambahkan varian ${newVariant.name} ke produk ${product.nama_produk}.`,
      actor,
      metadata: {
        productId,
        variantName: newVariant.name,
        price: newVariant.price,
      },
    });

    return NextResponse.json(newVariant, { status: 201 });
  } catch (error) {
    console.error("Error creating variant:", error);
    return NextResponse.json({ error: "Gagal membuat varian produk" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();
    const actor = getActorFromPayload(data);
    const productId = Number(id);

    // Check duplicate name jika mengubah name
    if (data.name) {
      const existingVariant = await prisma.productVariant.findFirst({
        where: {
          productId,
          name: data.name.trim(),
          id: { not: Number(data.variantId) },
        },
      });
      if (existingVariant) {
        return NextResponse.json({ error: "Varian dengan nama ini sudah ada" }, { status: 400 });
      }
    }

    const updatedVariant = await prisma.productVariant.update({
      where: { id: Number(data.variantId) },
      data: {
        name: data.name?.trim(),
        price: Number(data.price) || 0,
      },
    });

    return NextResponse.json(updatedVariant);
  } catch (error) {
    console.error("Error updating variant:", error);
    return NextResponse.json({ error: "Gagal memperbarui varian produk" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();
    const actor = getActorFromPayload(data);
    const productId = Number(id);

    const variant = await prisma.productVariant.findUnique({
      where: { id: Number(data.variantId) },
    });

    if (!variant || variant.productId !== productId) {
      return NextResponse.json({ error: "Varian tidak ditemukan" }, { status: 404 });
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });

    await prisma.productVariant.delete({
      where: { id: Number(data.variantId) },
    });

    await recordActivityLog({
      action: "HAPUS",
      entity: "Varian Produk",
      entityId: data.variantId,
      title: `Varian dihapus: ${product?.nama_produk} - ${variant.name}`,
      description: `${actor.name} menghapus varian ${variant.name} dari produk ${product?.nama_produk}.`,
      actor,
      metadata: {
        productId,
        variantName: variant.name,
        price: variant.price,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting variant:", error);
    return NextResponse.json({ error: "Gagal menghapus varian produk" }, { status: 500 });
  }
}
