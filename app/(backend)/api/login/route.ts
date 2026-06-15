import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { recordActivityLog } from "@/lib/activityLog";
import { createServerSessionToken, serverSessionCookie } from "@/lib/serverSession";

type LoginUserRow = {
  id: number;
  username: string;
  fullName: string;
  profilePhoto: string | null;
  password: string;
  role: string;
};

export async function POST(request: Request) {
  try {
    const { username, password, rememberMe } = await request.json();
    const cleanUsername = String(username || "").trim();

    if (!cleanUsername || !password) {
      return NextResponse.json({ error: "Username dan password wajib diisi!" }, { status: 400 });
    }

    const rows = await prisma.$queryRaw<LoginUserRow[]>`
      SELECT id, username, "fullName", "profilePhoto", password, role
      FROM "User"
      WHERE LOWER(username) = LOWER(${cleanUsername})
      LIMIT 1
    `;
    const user = rows[0];

    if (!user) {
      return NextResponse.json({ error: "Username tidak ditemukan!" }, { status: 404 });
    }

    const isBcryptHash = /^\$2[aby]\$\d{2}\$/.test(user.password);
    const isPasswordValid = isBcryptHash
      ? await bcrypt.compare(password, user.password)
      : password === user.password;

    if (!isPasswordValid) {
      return NextResponse.json({ error: "Password salah!" }, { status: 401 });
    }

    if (!isBcryptHash) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      await prisma.$executeRaw`
        UPDATE "User"
        SET password = ${hashedPassword}
        WHERE id = ${user.id}
      `;
    }
    await recordActivityLog({
      action: "LOGIN",
      entity: "Akun",
      entityId: user.id,
      title: `Login berhasil: ${user.fullName || user.username}`,
      description: `${user.fullName || user.username} masuk ke aplikasi sebagai ${user.role}.`,
      actor: { id: user.id, name: user.fullName || user.username, role: user.role },
      metadata: { username: user.username, role: user.role },
    });

    const response = NextResponse.json(
      {
        id: user.id,
        username: user.username,
        fullName: user.fullName || user.username,
        profilePhoto: user.profilePhoto,
        role: user.role,
      },
      { status: 200 }
    );
    response.cookies.set(serverSessionCookie.name, createServerSessionToken(user.id, Boolean(rememberMe)), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      ...(rememberMe ? { maxAge: serverSessionCookie.maxAge } : {}),
    });
    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(serverSessionCookie.name, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return response;
}
