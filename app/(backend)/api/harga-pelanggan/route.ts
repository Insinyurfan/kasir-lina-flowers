import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

const normalizeName = (value: unknown): string =>
  typeof value === "string" ? value.trim().toUpperCase() : "";

// GET /api/harga-pelanggan?customerName=ANEKA
// Mengembalikan daftar harga khusus tersimpan untuk pelanggan tersebut.
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const customerName = normalizeName(searchParams.get("customerName"));
  if (!customerName) return NextResponse.json([]);

  try {
    const rows = await prisma.customerPrice.findMany({
      where: { customerName },
      select: { productId: true, variantId: true, price: true },
    });
    return NextResponse.json(rows);
  } catch {
    return NextResponse.json({ error: "Gagal memuat harga pelanggan." }, { status: 500 });
  }
}

// POST /api/harga-pelanggan  { customerName, productId, variantId?, price }
// Simpan / perbarui (upsert) harga khusus untuk pelanggan + produk (+ varian opsional).
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const customerName = normalizeName(data.customerName);
    const productId = Number(data.productId);
    const variantId = Number(data.variantId) || 0;
    const price = Math.max(0, Math.round(Number(data.price)));

    if (!customerName || !Number.isInteger(productId) || productId <= 0 || !Number.isFinite(price)) {
      return NextResponse.json({ error: "Data harga pelanggan tidak valid." }, { status: 400 });
    }

    const saved = await prisma.customerPrice.upsert({
      where: { customerName_productId_variantId: { customerName, productId, variantId } },
      update: { price },
      create: { customerName, productId, variantId, price },
    });
    return NextResponse.json(saved);
  } catch {
    return NextResponse.json({ error: "Gagal menyimpan harga pelanggan." }, { status: 500 });
  }
}

// DELETE /api/harga-pelanggan  { customerName, productId, variantId? }
// Hapus harga khusus sehingga kembali memakai harga universal.
export async function DELETE(request: NextRequest) {
  try {
    const data = await request.json();
    const customerName = normalizeName(data.customerName);
    const productId = Number(data.productId);
    const variantId = Number(data.variantId) || 0;

    if (!customerName || !Number.isInteger(productId) || productId <= 0) {
      return NextResponse.json({ error: "Data tidak valid." }, { status: 400 });
    }

    await prisma.customerPrice.deleteMany({ where: { customerName, productId, variantId } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Gagal menghapus harga pelanggan." }, { status: 500 });
  }
}
