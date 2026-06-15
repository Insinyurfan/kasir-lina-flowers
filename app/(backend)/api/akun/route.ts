import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { recordActivityLog } from "@/lib/activityLog";

export const dynamic = "force-dynamic";

type AccountRow = {
  id: number;
  username: string;
  fullName: string;
  profilePhoto: string | null;
  role: string;
};

const normalizeRole = (role: string) => {
  if (role === "Owner") return "Owner";
  if (role === "Tamu") return "Tamu";
  return "Admin";
};

const findAccountById = async (id: number) => {
  const rows = await prisma.$queryRaw<AccountRow[]>`
    SELECT id, username, "fullName", "profilePhoto", role
    FROM "User"
    WHERE id = ${id}
    LIMIT 1
  `;
  return rows[0] ?? null;
};

const findAccountPasswordById = async (id: number) => {
  const rows = await prisma.$queryRaw<{ password: string }[]>`
    SELECT password FROM "User" WHERE id = ${id} LIMIT 1
  `;
  return rows[0]?.password ?? null;
};

const findAccountByUsername = async (username: string, ignoredId?: number) => {
  const rows = ignoredId
    ? await prisma.$queryRaw<AccountRow[]>`
        SELECT id, username, "fullName", "profilePhoto", role
        FROM "User"
        WHERE username = ${username} AND id <> ${ignoredId}
        LIMIT 1
      `
    : await prisma.$queryRaw<AccountRow[]>`
        SELECT id, username, "fullName", "profilePhoto", role
        FROM "User"
        WHERE username = ${username}
        LIMIT 1
      `;

  return rows[0] ?? null;
};

const findMainOwner = async () => {
  const rows = await prisma.$queryRaw<{ id: number }[]>`
    SELECT id
    FROM "User"
    WHERE role = 'Owner'
    ORDER BY id ASC
    LIMIT 1
  `;
  return rows[0] ?? null;
};

const accountSelectSql = `
  id, username, "fullName", "profilePhoto", role
`;

export async function GET() {
  try {
    const users = await prisma.$queryRawUnsafe<AccountRow[]>(`
      SELECT ${accountSelectSql}
      FROM "User"
      ORDER BY id ASC
    `);
    return NextResponse.json(users);
  } catch {
    return NextResponse.json({ error: "Gagal mengambil data akun" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { username, fullName, profilePhoto, password, role, actorId } = await request.json();
    const actor = await findAccountById(Number(actorId));

    if (!actor || actor.role !== "Owner") {
      return NextResponse.json({ error: "Hanya Owner yang bisa menambahkan akun." }, { status: 403 });
    }

    const cleanUsername = String(username || "").trim().toLowerCase();
    const cleanFullName = String(fullName || "").trim();

    if (!cleanUsername || !password || !cleanFullName) {
      return NextResponse.json({ error: "Username, nama lengkap, dan password wajib diisi." }, { status: 400 });
    }

    const existingUser = await findAccountByUsername(cleanUsername);
    if (existingUser) {
      return NextResponse.json({ error: "Username sudah digunakan!" }, { status: 400 });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const rows = await prisma.$queryRaw<AccountRow[]>`
      INSERT INTO "User" (username, "fullName", "profilePhoto", password, role)
      VALUES (${cleanUsername}, ${cleanFullName}, ${profilePhoto || null}, ${hashedPassword}, ${normalizeRole(role)})
      RETURNING id, username, "fullName", "profilePhoto", role
    `;
    const created = rows[0];
    await recordActivityLog({
      action: "TAMBAH",
      entity: "Akun",
      entityId: created.id,
      title: `Akun ditambahkan: ${created.fullName || created.username}`,
      description: `${actor.fullName || actor.username} menambahkan akun ${created.fullName || created.username} sebagai ${created.role}.`,
      actor: { id: actor.id, name: actor.fullName || actor.username, role: actor.role },
      metadata: {
        username: created.username,
        fullName: created.fullName,
        role: created.role,
        punyaFoto: Boolean(created.profilePhoto),
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Gagal membuat akun" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, username, fullName, profilePhoto, password, oldPassword, role, actorId } = await request.json();
    const targetId = Number(id);
    const actor = await findAccountById(Number(actorId));
    const target = await findAccountById(targetId);
    const mainOwner = await findMainOwner();

    if (!actor || !target) {
      return NextResponse.json({ error: "Akun tidak ditemukan." }, { status: 404 });
    }

    if (actor.role !== "Owner" && actor.id !== target.id) {
      return NextResponse.json({ error: "Admin hanya bisa mengubah akun sendiri." }, { status: 403 });
    }

    if (mainOwner?.id === target.id && actor.id !== target.id) {
      return NextResponse.json({ error: "Owner utama dengan ID terlama tidak bisa diubah oleh Owner lain." }, { status: 403 });
    }

    const cleanUsername = String(username || "").trim().toLowerCase();
    const cleanFullName = String(fullName || "").trim();

    if (!cleanUsername || !cleanFullName) {
      return NextResponse.json({ error: "Username dan nama lengkap wajib diisi." }, { status: 400 });
    }

    const existingUser = await findAccountByUsername(cleanUsername, targetId);
    if (existingUser) {
      return NextResponse.json({ error: "Username sudah digunakan user lain!" }, { status: 400 });
    }

    const canChangeRole = actor.role === "Owner" && mainOwner?.id !== target.id;
    const nextRole = canChangeRole ? normalizeRole(role) : target.role;
    const nextProfilePhoto = profilePhoto || null;

    const isChangingPassword = password && password.trim() !== "";

    if (isChangingPassword && actor.id === target.id) {
      if (!oldPassword) {
        return NextResponse.json({ error: "Password lama wajib diisi untuk mengubah password." }, { status: 400 });
      }
      const currentHash = await findAccountPasswordById(targetId);
      if (!currentHash) {
        return NextResponse.json({ error: "Akun tidak ditemukan." }, { status: 404 });
      }
      const isMatch = await bcrypt.compare(oldPassword, currentHash);
      if (!isMatch) {
        return NextResponse.json({ error: "Password lama tidak sesuai." }, { status: 401 });
      }
    }

    let rows: AccountRow[];

    if (isChangingPassword) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      rows = await prisma.$queryRaw<AccountRow[]>`
        UPDATE "User"
        SET username = ${cleanUsername},
            "fullName" = ${cleanFullName},
            "profilePhoto" = ${nextProfilePhoto},
            password = ${hashedPassword},
            role = ${nextRole}
        WHERE id = ${targetId}
        RETURNING id, username, "fullName", "profilePhoto", role
      `;
    } else {
      rows = await prisma.$queryRaw<AccountRow[]>`
        UPDATE "User"
        SET username = ${cleanUsername},
            "fullName" = ${cleanFullName},
            "profilePhoto" = ${nextProfilePhoto},
            role = ${nextRole}
        WHERE id = ${targetId}
        RETURNING id, username, "fullName", "profilePhoto", role
      `;
    }

    const updated = rows[0];
    await recordActivityLog({
      action: "UPDATE",
      entity: "Akun",
      entityId: updated.id,
      title: `Akun diperbarui: ${updated.fullName || updated.username}`,
      description: `${actor.fullName || actor.username} memperbarui akun ${updated.fullName || updated.username}.`,
      actor: { id: actor.id, name: actor.fullName || actor.username, role: actor.role },
      metadata: {
        sebelum: {
          username: target.username,
          fullName: target.fullName,
          role: target.role,
          punyaFoto: Boolean(target.profilePhoto),
        },
        sesudah: {
          username: updated.username,
          fullName: updated.fullName,
          role: updated.role,
          punyaFoto: Boolean(updated.profilePhoto),
          passwordDiubah: Boolean(isChangingPassword),
        },
      },
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Gagal update akun" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id, actorId } = await request.json();
    const targetId = Number(id);
    const actor = await findAccountById(Number(actorId));
    const mainOwner = await findMainOwner();

    if (!actor || actor.role !== "Owner") {
      return NextResponse.json({ error: "Hanya Owner yang bisa menghapus akun." }, { status: 403 });
    }

    if (actor.id === targetId) {
      return NextResponse.json({ error: "Anda tidak bisa menghapus akun yang sedang dipakai." }, { status: 400 });
    }

    if (mainOwner?.id === targetId) {
      return NextResponse.json({ error: "Owner utama dengan ID terlama tidak bisa dihapus." }, { status: 403 });
    }

    const target = await findAccountById(targetId);
    await prisma.$executeRaw`
      DELETE FROM "User"
      WHERE id = ${targetId}
    `;
    await recordActivityLog({
      action: "HAPUS",
      entity: "Akun",
      entityId: targetId,
      title: `Akun dihapus: ${target?.fullName || target?.username || `ID ${targetId}`}`,
      description: `${actor.fullName || actor.username} menghapus akun ${target?.fullName || target?.username || `ID ${targetId}`}.`,
      actor: { id: actor.id, name: actor.fullName || actor.username, role: actor.role },
      metadata: target
        ? {
            username: target.username,
            fullName: target.fullName,
            role: target.role,
          }
        : null,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Gagal menghapus akun" }, { status: 500 });
  }
}
