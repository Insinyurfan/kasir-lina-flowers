import { NextResponse } from "next/server";

// Pembatas laju sederhana berbasis memori proses.
//
// BATASAN YANG DISENGAJA: hitungan disimpan per-instance server. Di Vercel
// (serverless) tiap instance punya hitungannya sendiri dan hilang saat cold
// start, jadi angka di sini BUKAN kuota global yang presisi. Tujuannya
// menaikkan biaya brute force dari "tak terbatas" menjadi "beberapa percobaan
// per jendela waktu", tanpa menambah dependensi atau tabel baru. Bila nanti
// butuh kuota yang dijamin lintas-instance, cukup pindahkan `buckets` ke
// Redis/tabel DB — bentuk fungsi di bawah tidak perlu berubah.

export type RateLimitRule = {
  limit: number; // jumlah percobaan yang diizinkan dalam satu jendela
  windowMs: number; // panjang jendela waktu
};

export type RateLimitStatus = {
  limited: boolean;
  retryAfterSeconds: number;
};

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

const SWEEP_INTERVAL_MS = 60_000;
let lastSweepAt = 0;

// Buang entri kedaluwarsa sesekali supaya map tidak tumbuh tanpa batas.
const sweepExpired = (now: number) => {
  if (now - lastSweepAt < SWEEP_INTERVAL_MS) return;
  lastSweepAt = now;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
};

const secondsUntil = (resetAt: number, now: number) => Math.max(1, Math.ceil((resetAt - now) / 1000));

// Baca status tanpa menambah hitungan. Dipakai untuk menolak lebih awal,
// sebelum pekerjaan mahal (bcrypt, query DB) sempat dijalankan.
export const checkRateLimit = (key: string, rule: RateLimitRule): RateLimitStatus => {
  const now = Date.now();
  sweepExpired(now);

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) return { limited: false, retryAfterSeconds: 0 };
  if (bucket.count < rule.limit) return { limited: false, retryAfterSeconds: 0 };

  return { limited: true, retryAfterSeconds: secondsUntil(bucket.resetAt, now) };
};

// Tambah satu hitungan. Jendela waktu dimulai dari percobaan pertama dan tidak
// diperpanjang oleh percobaan berikutnya (fixed window), sehingga pemakai sah
// yang terlanjur kena batas pasti pulih setelah `windowMs`.
export const recordHit = (key: string, rule: RateLimitRule) => {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + rule.windowMs });
    return;
  }
  bucket.count += 1;
};

// Hapus hitungan sebuah kunci — dipanggil saat percobaan akhirnya berhasil.
export const clearRateLimit = (key: string) => {
  buckets.delete(key);
};

// Identitas pemanggil untuk keperluan pembatasan laju. Di Vercel, IP asli ada
// di `x-forwarded-for` (entri pertama). Nilai "unknown" sengaja dibiarkan
// dipakai bersama: lebih baik satu ember bersama daripada batas yang hilang.
export const getClientIp = (request: Request) => {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip")?.trim() || "unknown";
};

export const tooManyRequests = (message: string, retryAfterSeconds: number) =>
  NextResponse.json(
    { error: message },
    { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } }
  );
