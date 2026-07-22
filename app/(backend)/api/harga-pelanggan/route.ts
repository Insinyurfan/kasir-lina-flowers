import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole, requireUser } from "@/lib/apiAuth";

export const dynamic = "force-dynamic";

const normalizeName = (value: unknown): string =>
  typeof value === "string" ? value.trim().toUpperCase() : "";

// Resolve pelanggan ke master Customer. Utamakan customerId; bila tak ada, upsert
// Customer berdasarkan nama kanonik (UPPERCASE). Mengembalikan { id, name } atau null.
const resolveCustomer = async (
  customerId: unknown,
  customerName: unknown
): Promise<{ id: number; name: string } | null> => {
  const id = Number(customerId);
  if (Number.isInteger(id) && id > 0) {
    const existing = await prisma.customer.findUnique({ where: { id }, select: { id: true, name: true } });
    if (existing) return existing;
  }
  const name = normalizeName(customerName);
  if (!name) return null;
  return prisma.customer.upsert({
    where: { name },
    update: {},
    create: { name },
    select: { id: true, name: true },
  });
};

// GET /api/harga-pelanggan?customerId=12  (atau ?customerName=ANEKA)
// Mengembalikan daftar harga khusus tersimpan untuk pelanggan tersebut.
export async function GET(request: NextRequest) {
  const auth = await requireUser(request);
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(request.url);
  const customerIdParam = Number(searchParams.get("customerId"));
  const customerName = normalizeName(searchParams.get("customerName"));

  try {
    if (Number.isInteger(customerIdParam) && customerIdParam > 0) {
      const rows = await prisma.customerPrice.findMany({
        where: { customerId: customerIdParam },
        select: { productId: true, variantId: true, price: true },
      });
      return NextResponse.json(rows);
    }

    if (!customerName) return NextResponse.json([]);
    const rows = await prisma.customerPrice.findMany({
      where: { customerName },
      select: { productId: true, variantId: true, price: true },
    });
    return NextResponse.json(rows);
  } catch {
    return NextResponse.json({ error: "Gagal memuat harga pelanggan." }, { status: 500 });
  }
}

// POST /api/harga-pelanggan  { customerId? | customerName, productId, variantId?, price }
// Simpan / perbarui (upsert) harga khusus untuk pelanggan + produk (+ varian opsional).
// Dikunci ke master Customer (customerId); customerName tetap disimpan sebagai snapshot.
export async function POST(request: NextRequest) {
  try {
    const auth = await requireRole(request, ["Owner", "Admin"]);
    if (!auth.ok) return auth.response;

    const data = await request.json();
    const productId = Number(data.productId);
    const variantId = Number(data.variantId) || 0;
    const price = Math.max(0, Math.round(Number(data.price)));

    const customer = await resolveCustomer(data.customerId, data.customerName);
    if (!customer || !Number.isInteger(productId) || productId <= 0 || !Number.isFinite(price)) {
      return NextResponse.json({ error: "Data harga pelanggan tidak valid." }, { status: 400 });
    }

    // Key by customerName kanonik (reuse baris lama) sambil selalu mengisi customerId.
    const saved = await prisma.customerPrice.upsert({
      where: {
        customerName_productId_variantId: { customerName: customer.name, productId, variantId },
      },
      update: { price, customerId: customer.id },
      create: { customerName: customer.name, customerId: customer.id, productId, variantId, price },
    });

    // Harga level produk (variantId 0) menjadi acuan tunggal: hapus harga per-varian lama
    // untuk produk ini agar SEMUA varian/kode mengikuti harga produk.
    if (variantId === 0) {
      await prisma.customerPrice.deleteMany({
        where: { customerId: customer.id, productId, NOT: { variantId: 0 } },
      });
    }

    return NextResponse.json(saved);
  } catch {
    return NextResponse.json({ error: "Gagal menyimpan harga pelanggan." }, { status: 500 });
  }
}

// DELETE /api/harga-pelanggan  { customerId? | customerName, productId, variantId? }
// Hapus harga khusus sehingga kembali memakai harga universal.
export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireRole(request, ["Owner", "Admin"]);
    if (!auth.ok) return auth.response;

    const data = await request.json();
    const productId = Number(data.productId);
    const variantId = Number(data.variantId) || 0;

    const customer = await resolveCustomer(data.customerId, data.customerName);
    if (!customer || !Number.isInteger(productId) || productId <= 0) {
      return NextResponse.json({ error: "Data tidak valid." }, { status: 400 });
    }

    await prisma.customerPrice.deleteMany({
      where: { customerId: customer.id, productId, variantId },
    });
    // Bersihkan pula baris lama pra-migrasi yang mungkin belum ber-customerId.
    await prisma.customerPrice.deleteMany({
      where: { customerName: customer.name, productId, variantId },
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Gagal menghapus harga pelanggan." }, { status: 500 });
  }
}
