import prisma from "@/lib/prisma";

export type ActivityAction = "TAMBAH" | "UPDATE" | "HAPUS" | "LOGIN" | "KIRIM" | "BACA";

export type ActivityActor = {
  id?: number | string | null;
  name?: string | null;
  role?: string | null;
};

type ActivityLogInput = {
  action: ActivityAction;
  entity: string;
  entityId?: number | string | null;
  title: string;
  description: string;
  actor?: ActivityActor | null;
  metadata?: unknown;
};

export type ActivityLogRow = {
  id: number;
  action: string;
  entity: string;
  entityId: string | null;
  title: string;
  description: string;
  actorId: number | null;
  actorName: string | null;
  actorRole: string | null;
  metadata: unknown;
  createdAt: Date;
};

export const ensureActivityLogTable = async () => {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "ActivityLog" (
      id SERIAL PRIMARY KEY,
      action TEXT NOT NULL,
      entity TEXT NOT NULL,
      "entityId" TEXT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      "actorId" INTEGER,
      "actorName" TEXT,
      "actorRole" TEXT,
      metadata JSONB,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "ActivityLog_createdAt_idx" ON "ActivityLog" ("createdAt")
  `);

  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "ActivityLog_entity_action_idx" ON "ActivityLog" (entity, action)
  `);

  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "ActivityLog_actorRole_createdAt_idx" ON "ActivityLog" ("actorRole", "createdAt")
  `);
};

export const buildActor = (input?: ActivityActor | null): Required<ActivityActor> => ({
  id: input?.id ?? null,
  name: input?.name || "Sistem",
  role: input?.role || "Sistem",
});

export const getActorFromPayload = (payload: Record<string, unknown> = {}): Required<ActivityActor> => {
  const actorId = payload.actorId ?? payload.userId;
  const actorName =
    payload.actorName ??
    payload.senderName ??
    payload.fullName ??
    payload.nama_kasir ??
    payload.username;
  const actorRole = payload.actorRole ?? payload.senderRole ?? payload.role;

  return buildActor({
    id: typeof actorId === "number" || typeof actorId === "string" ? actorId : null,
    name: typeof actorName === "string" ? actorName : null,
    role: typeof actorRole === "string" ? actorRole : null,
  });
};

export const recordActivityLog = async (input: ActivityLogInput) => {
  try {
    await ensureActivityLogTable();
    const actor = buildActor(input.actor);
    const actorId = actor.id === null || actor.id === undefined ? null : Number(actor.id);
    const safeActorId = Number.isFinite(actorId) ? actorId : null;
    const metadata = input.metadata === undefined ? null : JSON.stringify(input.metadata);

    await prisma.$executeRaw`
      INSERT INTO "ActivityLog" (action, entity, "entityId", title, description, "actorId", "actorName", "actorRole", metadata, "createdAt")
      VALUES (
        ${input.action},
        ${input.entity},
        ${input.entityId === null || input.entityId === undefined ? null : String(input.entityId)},
        ${input.title},
        ${input.description},
        ${safeActorId},
        ${actor.name},
        ${actor.role},
        ${metadata}::jsonb,
        NOW()
      )
    `;
  } catch (error) {
    console.error("Gagal mencatat log aktivitas:", error);
  }
};
