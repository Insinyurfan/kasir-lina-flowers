import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { recordActivityLog } from "@/lib/activityLog";
// Masa transisi: gambar bisa berada di R2 (baru) ATAU Supabase (lama).
// Keduanya dipanggil; masing-masing tidak melakukan apa-apa untuk URL yang
// bukan miliknya.
import { hapusGambarR2 } from "@/lib/r2Storage";
import { deleteProductImageFromStorage } from "@/lib/supabaseStorage";
import { actorFromUser, requireRole } from "@/lib/apiAuth";

export const dynamic = 'force-dynamic';

const cleanupProductImage = async (imageUrl?: string | null) => {
  try {
    await hapusGambarR2(imageUrl);
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
          harga: true,
          stok: true,
          gambar: true,
          gambarPosX: true,
          gambarPosY: true,
          variants: {
            select: { id: true, name: true, priceModifier: true },
            orderBy: { order: "asc" }
          },
        },
      });
      return NextResponse.json(products);
    }

    const products = await prisma.product.findMany({
      where: { isArchived: showArsip },
      orderBy: { id: "desc" },
      include: {
        variants: {
          select: { id: true, name: true, priceModifier: true },
          orderBy: { order: "asc" }
        }
      }
    });
    return NextResponse.json(products);
  } catch {
    return NextResponse.json({ error: "Gagal memuat produk" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireRole(request, ["Owner", "Admin"]);
    if (!auth.ok) return auth.response;
    const actor = actorFromUser(auth.user);

    const data = await request.json();

    let finalBarcode = data.barcode;
    if (!finalBarcode || finalBarcode.trim() === "") {
      finalBarcode = `LINA-${Date.now().toString().slice(-6)}`;
    }

    const newProduct = await prisma.product.create({
      data: {
        nama_produk: data.nama_produk,
        harga: Number(data.harga),
        satuanHarga: data.satuanHarga || "pcs",
        stok: Number(data.stok),
        barcode: finalBarcode,
        gambar: data.gambar || null,
        gambarPosX: data.gambarPosX != null ? Math.max(0, Math.min(100, Number(data.gambarPosX))) : 50,
        gambarPosY: data.gambarPosY != null ? Math.max(0, Math.min(100, Number(data.gambarPosY))) : 50,
        variants: data.variants && Array.isArray(data.variants)
          ? {
              create: data.variants
                .filter((v: any) => v.name && v.name.trim())
                .map((v: any, idx: number) => ({
                  name: v.name.trim(),
                  priceModifier: v.priceModifier != null ? Number(v.priceModifier) : 0,
                  order: idx,
                }))
            }
          : undefined,
      },
      include: {
        variants: {
          select: { id: true, name: true, priceModifier: true },
          orderBy: { order: "asc" }
        }
      }
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
    // Pembatasan peran (server-side): Admin boleh ubah data non-harga + arsip/pulihkan;
    // harga, satuan harga, dan variasi hanya Owner.
    const auth = await requireRole(request, ["Owner", "Admin"]);
    if (!auth.ok) return auth.response;
    const actor = actorFromUser(auth.user);
    const isOwner = auth.user.role === "Owner";

    const data = await request.json();

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
        // Non-Owner: harga & satuan dipertahankan dari data lama (tidak boleh diubah).
        harga: isOwner ? Number(data.harga) : (before?.harga ?? Number(data.harga)),
        satuanHarga: isOwner ? (data.satuanHarga || before?.satuanHarga || "pcs") : (before?.satuanHarga || "pcs"),
        stok: Number(data.stok),
        barcode: finalBarcode,
        gambar: data.gambar || null,
        gambarPosX: data.gambarPosX != null ? Math.max(0, Math.min(100, Number(data.gambarPosX))) : (before?.gambarPosX ?? 50),
        gambarPosY: data.gambarPosY != null ? Math.max(0, Math.min(100, Number(data.gambarPosY))) : (before?.gambarPosY ?? 50),
        // Non-Owner: variasi (memuat harga) diabaikan — tidak disentuh sama sekali.
        variants: isOwner && data.variants !== undefined ? {
          deleteMany: {},
          create: data.variants
            .filter((v: any) => v.name && v.name.trim())
            .map((v: any, idx: number) => ({
              name: v.name.trim(),
              priceModifier: v.priceModifier != null ? Number(v.priceModifier) : 0,
              order: idx,
            }))
        } : undefined,
      },
      include: {
        variants: {
          select: { id: true, name: true, priceModifier: true },
          orderBy: { order: "asc" }
        }
      }
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
    // Hapus permanen bersifat destruktif → hanya Owner (dicek di server, bukan cuma UI).
    const auth = await requireRole(request, ["Owner"]);
    if (!auth.ok) return auth.response;
    const actor = actorFromUser(auth.user);

    const data = await request.json();
    const { id } = data;
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
