import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole, requireUser } from "@/lib/apiAuth";

export const dynamic = "force-dynamic";

const normalizeName = (value: unknown): string =>
  typeof value === "string" ? value.trim().toUpperCase() : "";

// GET /api/pelanggan
//   default        → array nama (string[]) untuk autocomplete (master ∪ riwayat).
//   ?master=1      → array objek Customer master [{ id, name, phone, note }].
//   ?q=...         → filter (contains) di kedua mode.
export async function GET(request: Request) {
  const auth = await requireUser(request);
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(request.url);
  const isMaster = searchParams.get("master") === "1";
  const q = normalizeName(searchParams.get("q"));

  try {
    if (isMaster) {
      const customers = await prisma.customer.findMany({
        where: q ? { name: { contains: q } } : undefined,
        orderBy: { name: "asc" },
        select: { id: true, name: true, phone: true, note: true },
      });
      return NextResponse.json(customers);
    }

    // Mode kompatibel: gabungan nama dari master Customer + harga khusus + riwayat transaksi.
    const [masterRows, priceRows, txnRows] = await Promise.all([
      prisma.customer.findMany({ select: { name: true } }),
      prisma.customerPrice.findMany({ distinct: ["customerName"], select: { customerName: true } }),
      prisma.transaction.findMany({
        where: { nama_pembeli: { not: null } },
        distinct: ["nama_pembeli"],
        select: { nama_pembeli: true },
        take: 2000,
      }),
    ]);

    const names = new Set<string>();
    for (const row of masterRows) {
      const name = normalizeName(row.name);
      if (name) names.add(name);
    }
    for (const row of priceRows) {
      const name = normalizeName(row.customerName);
      if (name) names.add(name);
    }
    for (const row of txnRows) {
      const name = normalizeName(row.nama_pembeli);
      if (name && name !== "-") names.add(name);
    }

    const filtered = q ? [...names].filter((name) => name.includes(q)) : [...names];
    const sorted = filtered.sort((a, b) => a.localeCompare(b, "id"));
    return NextResponse.json(sorted);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}

// POST /api/pelanggan  { name, phone?, note? }  → buat Customer master.
export async function POST(request: Request) {
  try {
    const auth = await requireRole(request, ["Owner", "Admin"]);
    if (!auth.ok) return auth.response;

    const data = await request.json();
    const name = normalizeName(data.name);
    if (name.length < 2) {
      return NextResponse.json({ error: "Nama pelanggan wajib diisi (min. 2 karakter)." }, { status: 400 });
    }

    const existing = await prisma.customer.findUnique({ where: { name }, select: { id: true } });
    if (existing) {
      return NextResponse.json({ error: "Nama pelanggan sudah ada." }, { status: 400 });
    }

    const created = await prisma.customer.create({
      data: {
        name,
        phone: typeof data.phone === "string" && data.phone.trim() ? data.phone.trim() : null,
        note: typeof data.note === "string" && data.note.trim() ? data.note.trim() : null,
      },
      select: { id: true, name: true, phone: true, note: true },
    });
    return NextResponse.json(created, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Gagal membuat pelanggan." }, { status: 500 });
  }
}

// PATCH /api/pelanggan  { id, name?, phone?, note? }  → perbarui Customer.
// Mengganti nama juga menyelaraskan snapshot CustomerPrice.customerName agar
// Lock Price tetap konsisten dengan nama kanonik baru.
export async function PATCH(request: Request) {
  try {
    const auth = await requireRole(request, ["Owner", "Admin"]);
    if (!auth.ok) return auth.response;

    const data = await request.json();
    const id = Number(data.id);
    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ error: "ID pelanggan tidak valid." }, { status: 400 });
    }

    const target = await prisma.customer.findUnique({ where: { id }, select: { id: true, name: true } });
    if (!target) {
      return NextResponse.json({ error: "Pelanggan tidak ditemukan." }, { status: 404 });
    }

    const nextName = data.name !== undefined ? normalizeName(data.name) : target.name;
    if (nextName.length < 2) {
      return NextResponse.json({ error: "Nama pelanggan wajib diisi (min. 2 karakter)." }, { status: 400 });
    }
    if (nextName !== target.name) {
      const clash = await prisma.customer.findUnique({ where: { name: nextName }, select: { id: true } });
      if (clash && clash.id !== id) {
        return NextResponse.json({ error: "Nama pelanggan sudah dipakai pelanggan lain." }, { status: 400 });
      }
    }

    const updated = await prisma.$transaction(async (tx) => {
      const customer = await tx.customer.update({
        where: { id },
        data: {
          name: nextName,
          ...(data.phone !== undefined
            ? { phone: typeof data.phone === "string" && data.phone.trim() ? data.phone.trim() : null }
            : {}),
          ...(data.note !== undefined
            ? { note: typeof data.note === "string" && data.note.trim() ? data.note.trim() : null }
            : {}),
        },
        select: { id: true, name: true, phone: true, note: true },
      });

      if (nextName !== target.name) {
        await tx.customerPrice.updateMany({ where: { customerId: id }, data: { customerName: nextName } });
      }
      return customer;
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Gagal memperbarui pelanggan." }, { status: 500 });
  }
}

// DELETE /api/pelanggan  { id }  → hapus Customer (harga khusus ikut terhapus via cascade;
// transaksi tetap ada, customerId di-set null).
export async function DELETE(request: Request) {
  try {
    const auth = await requireRole(request, ["Owner", "Admin"]);
    if (!auth.ok) return auth.response;

    const data = await request.json();
    const id = Number(data.id);
    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ error: "ID pelanggan tidak valid." }, { status: 400 });
    }

    await prisma.customer.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Gagal menghapus pelanggan." }, { status: 500 });
  }
}
