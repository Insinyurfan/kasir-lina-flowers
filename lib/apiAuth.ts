import { NextResponse } from "next/server";
import { getServerSessionUser } from "@/lib/serverSession";

// Identitas pemanggil yang sudah diverifikasi dari cookie sesi ber-HMAC.
export type SessionUser = {
  id: number;
  username: string;
  fullName: string | null;
  role: string;
};

export type AuthResult =
  | { ok: true; user: SessionUser }
  | { ok: false; response: NextResponse };

// Daftar endpoint PUBLIK eksplisit — satu-satunya rute yang boleh diakses tanpa sesi.
// Semua endpoint lain diperlakukan TERPROTEKSI secara default (fail-safe).
//   - POST   /api/login              → autentikasi
//   - DELETE /api/login              → logout
//   - GET    /api/produk?public=1    → katalog produk untuk pelanggan
//   - POST   /api/request-pesanan    → pelanggan menaruh pesanan
//   - GET    /api/request-pesanan    → hanya varian lacak (butuh code + phone yang cocok)
// Catatan: GET /api/produk tanpa `public=1`, GET /api/request-pesanan tanpa code,
// dan GET /api/status-pesanan tetap TERPROTEKSI (butuh sesi Owner/Admin).
export const PUBLIC_ENDPOINTS = [
  { method: "POST", path: "/api/login" },
  { method: "DELETE", path: "/api/login" },
  { method: "GET", path: "/api/produk", note: "hanya bila ?public=1" },
  { method: "POST", path: "/api/request-pesanan" },
  { method: "GET", path: "/api/request-pesanan", note: "hanya lacak dengan code + phone" },
] as const;

// Ambil user sesi terverifikasi. Bila secret tidak dikonfigurasi atau sesi tidak valid,
// gagal-tertutup: kembalikan null (tidak pernah melempar ke pemanggil).
const safeGetSessionUser = async (request: Request): Promise<SessionUser | null> => {
  try {
    const user = await getServerSessionUser(request);
    return (user as SessionUser) || null;
  } catch {
    return null;
  }
};

// Wajib login. Kembalikan { ok, user } atau { ok:false, response:401 }.
export const requireUser = async (request: Request): Promise<AuthResult> => {
  const user = await safeGetSessionUser(request);
  if (!user) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Anda harus login untuk mengakses ini." }, { status: 401 }),
    };
  }
  return { ok: true, user };
};

// Wajib login + peran tertentu. 401 bila tanpa sesi, 403 bila peran tidak diizinkan.
export const requireRole = async (request: Request, roles: string[]): Promise<AuthResult> => {
  const result = await requireUser(request);
  if (!result.ok) return result;
  if (!roles.includes(result.user.role)) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Anda tidak memiliki izin untuk aksi ini." }, { status: 403 }),
    };
  }
  return result;
};

// Bentuk aktor untuk log aktivitas dari user sesi (bukan dari body request).
export const actorFromUser = (user: SessionUser) => ({
  id: user.id,
  name: user.fullName || user.username,
  role: user.role,
});
