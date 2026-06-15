import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getActorFromPayload, recordActivityLog } from "@/lib/activityLog";
import { getServerSessionUser } from "@/lib/serverSession";

export const dynamic = "force-dynamic";

const activeStatuses = ["Diproses", "Sedang Disiapkan", "Siap Kirim", "Siap Dikirim", "Dikirim"];
const allowedStatuses = ["Sedang Disiapkan", "Siap Dikirim", "Dikirim", "Selesai"];
const maskPhone = (value: string) => {
  if (value.length <= 6) return `${value.slice(0, 2)}****`;
  return `${value.slice(0, 4)}${"*".repeat(Math.max(4, value.length - 7))}${value.slice(-3)}`;
};
const statusDescriptions: Record<string, string> = {
  "Sedang Disiapkan": "Pesanan anda sedang disiapkan.",
  "Siap Dikirim": "Pesanan anda sudah siap dikirimkan sedang menunggu di kirimkan.",
  Dikirim: "Pesanan anda sudah dalam perjalanan dan akan segera sampai.",
  Selesai: "Pesanan telah selesai.",
};

export async function GET(request: Request) {
  try {
    const viewer = await getServerSessionUser(request);
    if (!viewer || !["Owner", "Admin"].includes(viewer.role)) {
      return NextResponse.json({ error: "Sesi Owner atau Admin diperlukan." }, { status: 401 });
    }
    const transactions = await prisma.transaction.findMany({
      where: { status_pengiriman: { in: activeStatuses } },
      include: {
        items: {
          include: {
            product: {
              select: { id: true, nama_produk: true, gambar: true, harga: true },
            },
          },
        },
        orderRequest: {
          select: { code: true, phone: true },
        },
      },
      orderBy: { tanggal: "asc" },
    });
    return NextResponse.json(
      transactions.map((transaction) => ({
        ...transaction,
        orderRequest: transaction.orderRequest
          ? {
              ...transaction.orderRequest,
              phone: viewer.role === "Owner" ? transaction.orderRequest.phone : maskPhone(transaction.orderRequest.phone),
            }
          : null,
      }))
    );
  } catch {
    return NextResponse.json({ error: "Gagal memuat status pesanan." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const payload = (await request.json()) as {
      id?: number;
      status?: string;
      artisanName?: string;
      actorId?: number;
      actorName?: string;
      actorRole?: string;
    };
    const authorizedUser = await getServerSessionUser(request);
    if (!authorizedUser || !["Owner", "Admin"].includes(authorizedUser.role)) {
      return NextResponse.json({ error: "Hanya Owner atau Admin yang dapat memperbarui pesanan." }, { status: 403 });
    }
    const actor = getActorFromPayload({
      actorId: authorizedUser.id,
      actorName: authorizedUser.fullName || authorizedUser.username,
      actorRole: authorizedUser.role,
    });

    const id = Number(payload.id);
    const before = await prisma.transaction.findUnique({ where: { id } });
    if (!before) {
      return NextResponse.json({ error: "Pesanan tidak ditemukan." }, { status: 404 });
    }

    const data: { status_pengiriman?: string; nama_pengrajin?: string | null } = {};
    if (payload.status !== undefined) {
      if (!allowedStatuses.includes(payload.status)) {
        return NextResponse.json({ error: "Status pesanan tidak valid." }, { status: 400 });
      }
      data.status_pengiriman = payload.status;
    }
    if (payload.artisanName !== undefined) {
      data.nama_pengrajin = payload.artisanName.trim().slice(0, 100) || null;
    }
    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "Tidak ada perubahan." }, { status: 400 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.update({
        where: { id },
        data,
        include: {
          items: { include: { product: true } },
          orderRequest: { select: { id: true, code: true, phone: true } },
        },
      });

      if (
        payload.status !== undefined &&
        payload.status !== before.status_pengiriman &&
        transaction.orderRequest
      ) {
        await tx.orderStatusHistory.create({
          data: {
            orderRequestId: transaction.orderRequest.id,
            status: payload.status,
            description: statusDescriptions[payload.status] || `Status pesanan berubah menjadi ${payload.status}.`,
          },
        });
      }

      return transaction;
    });

    await recordActivityLog({
      action: "UPDATE",
      entity: "Status Pesanan",
      entityId: id,
      title: `Status pesanan diperbarui: TRX-${String(id).padStart(4, "0")}`,
      description: `${actor.name} memperbarui status pesanan ${updated.nama_pembeli || ""}.`,
      actor,
      metadata: {
        statusSebelum: before.status_pengiriman,
        statusSesudah: updated.status_pengiriman,
        pengrajinSebelum: before.nama_pengrajin,
        pengrajinSesudah: updated.nama_pengrajin,
      },
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Gagal memperbarui status pesanan." }, { status: 500 });
  }
}
