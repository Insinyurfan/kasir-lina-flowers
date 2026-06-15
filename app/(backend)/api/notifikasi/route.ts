import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma";
import { getActorFromPayload, recordActivityLog } from "@/lib/activityLog";

type NotificationRow = {
  id: number;
  transactionId: number | null;
  targetRole: string;
  senderRole: string;
  senderName: string | null;
  statusPengiriman: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
};

const statusMessages: Record<string, string> = {
  Diproses: "Orderan baru perlu segera dikerjakan.",
  "Siap Kirim": "Orderan sudah siap dikirimkan.",
  Dikirim: "Orderan sudah masuk tahap pengiriman.",
  Selesai: "Orderan sudah selesai.",
};

const getTargetRoles = async () => {
  try {
    const rows = await prisma.$queryRaw<Array<{ role: string }>>`
      SELECT DISTINCT role
      FROM "User"
      WHERE role IS NOT NULL
        AND role <> 'Tamu'
    `;
    const roles = rows.map((row) => row.role).filter(Boolean);
    return roles.length > 0 ? roles : ["Admin", "Owner"];
  } catch {
    return ["Admin", "Owner"];
  }
};

export const dynamic = "force-dynamic";

const ensureNotificationHiddenColumn = async () => {
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "Notification"
    ADD COLUMN IF NOT EXISTS "hidden" BOOLEAN NOT NULL DEFAULT false
  `);
};

export async function GET(request: Request) {
  try {
    await ensureNotificationHiddenColumn();

    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");

    if (!role) {
      return NextResponse.json({ error: "Role wajib diisi" }, { status: 400 });
    }

    const notifications = await prisma.$queryRaw<NotificationRow[]>`
      SELECT id, "transactionId", "targetRole", "senderRole", "senderName", "statusPengiriman", message, "isRead", "createdAt"
      FROM "Notification"
      WHERE "targetRole" = ${role}
        AND "hidden" = false
      ORDER BY "createdAt" DESC
      LIMIT 30
    `;

    const transactionIds = notifications
      .map((notification) => notification.transactionId)
      .filter((id): id is number => typeof id === "number");
    const transactions = transactionIds.length
      ? await prisma.transaction.findMany({
          where: { id: { in: transactionIds } },
          include: { items: { include: { product: true } } },
        })
      : [];
    const transactionsById = transactions.reduce<Record<number, (typeof transactions)[number]>>((result, transaction) => {
      result[transaction.id] = transaction;
      return result;
    }, {});

    return NextResponse.json(
      notifications.map((notification) => ({
        ...notification,
        transaction: notification.transactionId ? transactionsById[notification.transactionId] || null : null,
      }))
    );
  } catch {
    return NextResponse.json({ error: "Gagal memuat notifikasi" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await ensureNotificationHiddenColumn();

    const { transactionId, senderRole, senderName, statusPengiriman } = (await request.json()) as {
      transactionId?: number;
      senderRole?: string;
      senderName?: string;
      statusPengiriman?: string;
    };
    const actor = getActorFromPayload({ senderRole, senderName });

    if (!transactionId || !senderRole || !statusPengiriman) {
      return NextResponse.json({ error: "Data notifikasi belum lengkap" }, { status: 400 });
    }

    if (senderRole === "Admin" && statusPengiriman === "Diproses") {
      return NextResponse.json({ error: "Admin tidak bisa mengirim notifikasi pada status Diproses." }, { status: 403 });
    }

    const transaction = await prisma.transaction.findUnique({
      where: { id: Number(transactionId) },
      include: { items: { include: { product: true } } },
    });

    if (!transaction) {
      return NextResponse.json({ error: "Transaksi tidak ditemukan" }, { status: 404 });
    }

    const targetRoles = await getTargetRoles();
    const existing = await prisma.$queryRaw<Array<{ id: number; targetRole: string }>>`
      SELECT id, "targetRole"
      FROM "Notification"
      WHERE "transactionId" = ${Number(transactionId)}
        AND "senderRole" = ${senderRole}
        AND "statusPengiriman" = ${statusPengiriman}
    `;
    const existingTargetRoles = new Set(existing.map((notification) => notification.targetRole));

    if (senderRole === "Admin" && targetRoles.every((targetRole) => existingTargetRoles.has(targetRole))) {
      return NextResponse.json({ error: "Notifikasi untuk status ini sudah pernah dikirim." }, { status: 409 });
    }

    const trxNumber = `TRX-${String(transaction.id).padStart(4, "0")}`;
    const baseMessage = statusMessages[statusPengiriman] || "Ada update orderan.";
    const message = `${baseMessage} ${trxNumber} - ${transaction.nama_pembeli || "Tanpa nama"}`;

    for (const targetRole of targetRoles) {
      await prisma.$executeRaw`
        INSERT INTO "Notification" ("transactionId", "targetRole", "senderRole", "senderName", "statusPengiriman", message, "isRead", "hidden", "createdAt")
        VALUES (${Number(transactionId)}, ${targetRole}, ${senderRole}, ${senderName || null}, ${statusPengiriman}, ${message}, false, false, NOW())
        ON CONFLICT ("transactionId", "targetRole", "senderRole", "statusPengiriman")
        DO UPDATE SET
          "senderName" = EXCLUDED."senderName",
          message = EXCLUDED.message,
          "isRead" = false,
          "hidden" = false,
          "createdAt" = NOW()
      `;
    }
    await recordActivityLog({
      action: "KIRIM",
      entity: "Notifikasi",
      entityId: transactionId,
      title: `Notifikasi dikirim: ${statusPengiriman}`,
      description: `${actor.name} mengirim notifikasi ${statusPengiriman} untuk ${trxNumber}.`,
      actor,
      metadata: {
        transactionId,
        statusPengiriman,
        targetRoles,
        recalled: existing.length > 0,
      },
    });

    return NextResponse.json({ success: true, recalled: existing.length > 0 });
  } catch {
    return NextResponse.json({ error: "Gagal mengirim notifikasi" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    await ensureNotificationHiddenColumn();

    const payload = (await request.json()) as {
      id?: number;
      ids?: number[];
      role?: string;
      readAll?: boolean;
      isRead?: boolean;
      actorId?: number;
      actorName?: string;
      actorRole?: string;
    };
    const { id, ids, role, readAll, isRead } = payload;
    const actor = getActorFromPayload(payload as Record<string, unknown>);
    const nextReadState = isRead === false ? false : true;

    if (readAll && role) {
      await prisma.notification.updateMany({
        where: { targetRole: role },
        data: { isRead: nextReadState },
      });
      await recordActivityLog({
        action: "UPDATE",
        entity: "Notifikasi",
        title: nextReadState ? "Semua notifikasi ditandai dibaca" : "Semua notifikasi ditandai belum dibaca",
        description: `${actor.name} mengubah status baca semua notifikasi role ${role}.`,
        actor,
        metadata: { role, readAll: true, isRead: nextReadState },
      });
      return NextResponse.json({ success: true });
    }

    if (Array.isArray(ids) && ids.length > 0) {
      await prisma.notification.updateMany({
        where: { id: { in: ids.map((item) => Number(item)).filter((item) => Number.isFinite(item)) } },
        data: { isRead: nextReadState },
      });
      await recordActivityLog({
        action: "UPDATE",
        entity: "Notifikasi",
        title: nextReadState ? "Notifikasi ditandai dibaca" : "Notifikasi ditandai belum dibaca",
        description: `${actor.name} mengubah status baca ${ids.length} notifikasi.`,
        actor,
        metadata: { ids, isRead: nextReadState },
      });
      return NextResponse.json({ success: true });
    }

    if (!id) {
      return NextResponse.json({ error: "ID notifikasi wajib diisi" }, { status: 400 });
    }

    await prisma.notification.updateMany({
      where: { id: Number(id) },
      data: { isRead: nextReadState },
    });
    await recordActivityLog({
      action: "UPDATE",
      entity: "Notifikasi",
      entityId: id,
      title: nextReadState ? "Notifikasi ditandai dibaca" : "Notifikasi ditandai belum dibaca",
      description: `${actor.name} mengubah status baca notifikasi ID ${id}.`,
      actor,
      metadata: { id, isRead: nextReadState },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Gagal memperbarui notifikasi" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await ensureNotificationHiddenColumn();

    const payload = (await request.json()) as {
      id?: number;
      ids?: number[];
      role?: string;
      deleteAll?: boolean;
      actorId?: number;
      actorName?: string;
      actorRole?: string;
    };
    const { id, ids, role, deleteAll } = payload;
    const actor = getActorFromPayload(payload as Record<string, unknown>);

    if (deleteAll && role) {
      await prisma.$executeRaw`
        UPDATE "Notification"
        SET "hidden" = true
        WHERE "targetRole" = ${role}
      `;
      await recordActivityLog({
        action: "HAPUS",
        entity: "Notifikasi",
        title: "Semua notifikasi disembunyikan",
        description: `${actor.name} menghapus semua notifikasi untuk role ${role}.`,
        actor,
        metadata: { role, deleteAll: true },
      });
      return NextResponse.json({ success: true });
    }

    if (Array.isArray(ids) && ids.length > 0) {
      const cleanIds = ids.map((item) => Number(item)).filter((item) => Number.isFinite(item));
      if (cleanIds.length === 0) {
        return NextResponse.json({ error: "ID notifikasi tidak valid" }, { status: 400 });
      }

      if (role) {
        await prisma.$executeRaw`
          UPDATE "Notification"
          SET "hidden" = true
          WHERE id IN (${Prisma.join(cleanIds)})
            AND "targetRole" = ${role}
        `;
      } else {
        await prisma.$executeRaw`
          UPDATE "Notification"
          SET "hidden" = true
          WHERE id IN (${Prisma.join(cleanIds)})
        `;
      }
      await recordActivityLog({
        action: "HAPUS",
        entity: "Notifikasi",
        title: `${cleanIds.length} notifikasi dihapus`,
        description: `${actor.name} menghapus ${cleanIds.length} notifikasi.`,
        actor,
        metadata: { ids: cleanIds, role: role || null },
      });
      return NextResponse.json({ success: true });
    }

    if (!id) {
      return NextResponse.json({ error: "ID notifikasi wajib diisi" }, { status: 400 });
    }

    if (role) {
      await prisma.$executeRaw`
        UPDATE "Notification"
        SET "hidden" = true
        WHERE id = ${Number(id)}
          AND "targetRole" = ${role}
      `;
    } else {
      await prisma.$executeRaw`
        UPDATE "Notification"
        SET "hidden" = true
        WHERE id = ${Number(id)}
      `;
    }
    await recordActivityLog({
      action: "HAPUS",
      entity: "Notifikasi",
      entityId: id,
      title: `Notifikasi dihapus: ID ${id}`,
      description: `${actor.name} menghapus notifikasi ID ${id}.`,
      actor,
      metadata: { id, role: role || null },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Gagal menghapus notifikasi" }, { status: 500 });
  }
}
