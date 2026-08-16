import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { recordActivityLog } from "@/lib/activityLog";
import { createServerSessionToken, serverSessionCookie } from "@/lib/serverSession";
import {
  checkRateLimit,
  clearRateLimit,
  getClientIp,
  recordHit,
  tooManyRequests,
  type RateLimitRule,
} from "@/lib/rateLimit";

// Dua batas berlapis, dan keduanya hanya menghitung percobaan GAGAL:
//   - per IP       : menahan satu penyerang yang menyapu banyak username.
//   - per username : menahan penyerang tersebar (banyak IP) yang membidik satu akun.
// Angkanya sengaja longgar supaya kasir yang salah ketik beberapa kali tidak
// ikut terkunci; yang dipangkas adalah percobaan otomatis berskala ribuan.
const LOGIN_IP_RULE: RateLimitRule = { limit: 20, windowMs: 10 * 60 * 1000 };
const LOGIN_USERNAME_RULE: RateLimitRule = { limit: 8, windowMs: 10 * 60 * 1000 };

// Balasan gagal yang SATU-SATUNYA. Membedakan "username tidak ada" dari
// "password salah" akan memberi tahu penyerang username mana yang valid,
// sehingga ia tinggal fokus menebak passwordnya saja.
const invalidCredentials = () =>
  NextResponse.json({ error: "Username atau password salah!" }, { status: 401 });

// Hash buatan untuk username yang tidak ditemukan. Tanpa ini, balasan untuk
// username tak dikenal datang seketika sementara username valid tertunda ~100ms
// oleh bcrypt — selisih waktu itu sendiri sudah membocorkan username yang ada.
// Hasil perbandingannya tidak pernah dipakai, hanya waktunya yang disamakan.
const DUMMY_PASSWORD_HASH = "$2b$10$X4LNyGkZKAo2/0A/HiygSOmHSg492LK9X/3V4p88pmozDI2TC6zLm";

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

    // Kunci username disamakan huruf kecilnya, mengikuti pencarian yang
    // case-insensitive di bawah — supaya "Lina" dan "lina" berbagi satu jatah.
    const ipKey = `login:ip:${getClientIp(request)}`;
    const usernameKey = `login:user:${cleanUsername.toLowerCase()}`;

    // Diperiksa sebelum query & bcrypt, supaya percobaan yang sudah melewati
    // batas tidak lagi membebani database maupun CPU.
    for (const [key, rule] of [
      [ipKey, LOGIN_IP_RULE],
      [usernameKey, LOGIN_USERNAME_RULE],
    ] as const) {
      const status = checkRateLimit(key, rule);
      if (status.limited) {
        const minutes = Math.ceil(status.retryAfterSeconds / 60);
        return tooManyRequests(
          `Terlalu banyak percobaan login. Coba lagi dalam ${minutes} menit.`,
          status.retryAfterSeconds
        );
      }
    }

    const rows = await prisma.$queryRaw<LoginUserRow[]>`
      SELECT id, username, "fullName", "profilePhoto", password, role
      FROM "User"
      WHERE LOWER(username) = LOWER(${cleanUsername})
      LIMIT 1
    `;
    const user = rows[0];

    if (!user) {
      await bcrypt.compare(String(password), DUMMY_PASSWORD_HASH);
      recordHit(ipKey, LOGIN_IP_RULE);
      recordHit(usernameKey, LOGIN_USERNAME_RULE);
      return invalidCredentials();
    }

    // Password wajib tersimpan sebagai hash bcrypt — nilai lain DITOLAK, bukan
    // dibandingkan apa adanya. Membandingkan langsung berarti password mentah
    // di database tetap bisa dipakai login, dan itu tak akan pernah ketahuan
    // justru karena loginnya berhasil. Semua jalur penulisan password
    // (POST & PATCH /api/akun) sudah mem-bcrypt, jadi nilai non-hash hanya bisa
    // lahir dari sunting manual di database atau kode baru yang lupa mem-hash;
    // keduanya memang harus gagal dengan berisik, bukan diterima diam-diam.
    if (!/^\$2[aby]\$\d{2}\$/.test(user.password)) {
      console.error(
        `Login ditolak: password akun "${user.username}" tidak tersimpan sebagai hash bcrypt. ` +
          `Setel ulang lewat halaman Akun, jangan menulis password langsung ke database.`
      );
      recordHit(ipKey, LOGIN_IP_RULE);
      recordHit(usernameKey, LOGIN_USERNAME_RULE);
      return invalidCredentials();
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      recordHit(ipKey, LOGIN_IP_RULE);
      recordHit(usernameKey, LOGIN_USERNAME_RULE);
      return invalidCredentials();
    }

    // Login sah menghapus jatah gagal, jadi kasir yang sempat salah ketik
    // tidak menyeret sisa hitungan itu ke sesi berikutnya.
    clearRateLimit(ipKey);
    clearRateLimit(usernameKey);

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
