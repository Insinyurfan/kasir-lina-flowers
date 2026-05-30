import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ensureActivityLogTable, getActorFromPayload, type ActivityLogRow } from "@/lib/activityLog";

export const dynamic = "force-dynamic";

const noStoreHeaders = { "Cache-Control": "no-store" };

const normalizeLimit = (value: string | null) => {
  const limit = Number(value || 100);
  if (!Number.isFinite(limit)) return 100;
  return Math.min(300, Math.max(20, limit));
};

export async function GET(request: Request) {
  try {
    await ensureActivityLogTable();

    const { searchParams } = new URL(request.url);
    const limit = normalizeLimit(searchParams.get("limit"));
    const action = searchParams.get("action");
    const entity = searchParams.get("entity");

    const logs =
      action && entity
        ? await prisma.$queryRaw<ActivityLogRow[]>`
            SELECT id, action, entity, "entityId", title, description, "actorId", "actorName", "actorRole", metadata, "createdAt"
            FROM "ActivityLog"
            WHERE action = ${action}
              AND entity = ${entity}
            ORDER BY "createdAt" DESC
            LIMIT ${limit}
          `
        : action
          ? await prisma.$queryRaw<ActivityLogRow[]>`
              SELECT id, action, entity, "entityId", title, description, "actorId", "actorName", "actorRole", metadata, "createdAt"
              FROM "ActivityLog"
              WHERE action = ${action}
              ORDER BY "createdAt" DESC
              LIMIT ${limit}
            `
          : entity
            ? await prisma.$queryRaw<ActivityLogRow[]>`
                SELECT id, action, entity, "entityId", title, description, "actorId", "actorName", "actorRole", metadata, "createdAt"
                FROM "ActivityLog"
                WHERE entity = ${entity}
                ORDER BY "createdAt" DESC
                LIMIT ${limit}
              `
            : await prisma.$queryRaw<ActivityLogRow[]>`
                SELECT id, action, entity, "entityId", title, description, "actorId", "actorName", "actorRole", metadata, "createdAt"
                FROM "ActivityLog"
                ORDER BY "createdAt" DESC
                LIMIT ${limit}
              `;

    return NextResponse.json(logs, { headers: noStoreHeaders });
  } catch {
    return NextResponse.json({ error: "Gagal memuat log aktivitas" }, { status: 500, headers: noStoreHeaders });
  }
}

export async function DELETE(request: Request) {
  try {
    await ensureActivityLogTable();

    const payload = (await request.json()) as {
      id?: number;
      ids?: number[];
      deleteAll?: boolean;
      actorId?: number;
      actorName?: string;
      actorRole?: string;
    };
    const actor = getActorFromPayload(payload as Record<string, unknown>);
    const actorId = Number(actor.id);
    const ownerRows = Number.isFinite(actorId)
      ? await prisma.$queryRaw<Array<{ id: number; role: string }>>`
          SELECT id, role
          FROM "User"
          WHERE id = ${actorId}
            AND role = 'Owner'
          LIMIT 1
        `
      : [];

    if (!ownerRows[0]) {
      return NextResponse.json({ error: "Hanya Owner yang dapat menghapus Log Aktivitas." }, { status: 403 });
    }

    if (payload.deleteAll) {
      await prisma.$executeRaw`
        DELETE FROM "ActivityLog"
      `;
      return NextResponse.json({ success: true }, { headers: noStoreHeaders });
    }

    const ids = Array.isArray(payload.ids)
      ? payload.ids.map((item) => Number(item)).filter((item) => Number.isFinite(item))
      : payload.id
        ? [Number(payload.id)]
        : [];

    if (ids.length === 0) {
      return NextResponse.json({ error: "Pilih log yang ingin dihapus." }, { status: 400, headers: noStoreHeaders });
    }

    for (const id of ids) {
      await prisma.$executeRaw`
        DELETE FROM "ActivityLog"
        WHERE id = ${id}
      `;
    }

    return NextResponse.json({ success: true }, { headers: noStoreHeaders });
  } catch {
    return NextResponse.json({ error: "Gagal menghapus log aktivitas" }, { status: 500, headers: noStoreHeaders });
  }
}
