import { createHmac, timingSafeEqual } from "node:crypto";
import prisma from "@/lib/prisma";

const SESSION_COOKIE = "lina_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

const getSessionSecret = () => {
  const secret =
    process.env.SESSION_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.DATABASE_URL;
  if (!secret) throw new Error("SESSION_SECRET belum dikonfigurasi.");
  return secret;
};

const sign = (value: string) =>
  createHmac("sha256", getSessionSecret()).update(value).digest("base64url");

export const createServerSessionToken = (userId: number, persistent: boolean) => {
  const expiresAt = Math.floor(Date.now() / 1000) + (persistent ? SESSION_MAX_AGE_SECONDS : 60 * 60 * 12);
  const payload = `${userId}.${expiresAt}`;
  return `${payload}.${sign(payload)}`;
};

const readCookie = (request: Request, name: string) => {
  const cookieHeader = request.headers.get("cookie") || "";
  const cookie = cookieHeader
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${name}=`));
  return cookie ? decodeURIComponent(cookie.slice(name.length + 1)) : null;
};

const getSessionUserId = (request: Request) => {
  const token = readCookie(request, SESSION_COOKIE);
  if (!token) return null;
  const [userId, expiresAt, signature] = token.split(".");
  if (!userId || !expiresAt || !signature || Number(expiresAt) <= Math.floor(Date.now() / 1000)) return null;

  const payload = `${userId}.${expiresAt}`;
  const expected = Buffer.from(sign(payload));
  const received = Buffer.from(signature);
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) return null;

  const numericUserId = Number(userId);
  return Number.isInteger(numericUserId) && numericUserId > 0 ? numericUserId : null;
};

export const getServerSessionUser = async (request: Request) => {
  const userId = getSessionUserId(request);
  if (!userId) return null;
  return prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, username: true, fullName: true, role: true },
  });
};

export const serverSessionCookie = {
  name: SESSION_COOKIE,
  maxAge: SESSION_MAX_AGE_SECONDS,
};
