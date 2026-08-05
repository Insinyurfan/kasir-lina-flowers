// Perantara gambar R2 — lihat `lib/gambar.ts` untuk latar belakangnya.
//
// SENGAJA TIDAK DI BAWAH /api/. Service worker melewatkan seluruh `/api/**`
// tanpa disentuh supaya data bisnis tidak pernah disajikan basi; kalau rute ini
// ditaruh di sana, gambar kehilangan kemampuan bertahan saat jaringan mati —
// justru alasan service worker itu dibuat.

export const runtime = "nodejs";

const basisPublik = () => (process.env.R2_PUBLIC_BASE_URL || "").replace(/\/+$/, "");

const tolak = (pesan: string, status: number) =>
  new Response(pesan, { status, headers: { "Cache-Control": "no-store" } });

export async function GET(request: Request) {
  const asal = new URL(request.url).searchParams.get("url");
  const basis = basisPublik();

  if (!basis) return tolak("R2_PUBLIC_BASE_URL belum dikonfigurasi.", 500);
  if (!asal) return tolak("Parameter url wajib diisi.", 400);

  // Pembatasan ini yang membuat rute ini bukan perantara terbuka. Garis miring
  // pada akhir awalan penting: tanpa itu `https://pub-xxx.r2.dev.penyerang.com`
  // ikut lolos.
  if (!asal.startsWith(`${basis}/`)) {
    return tolak("Alamat gambar di luar bucket yang dikenal.", 400);
  }

  let hulu: Response;
  try {
    hulu = await fetch(asal, { cache: "no-store", signal: AbortSignal.timeout(15_000) });
  } catch {
    return tolak("Gagal menghubungi penyimpanan gambar.", 502);
  }

  if (!hulu.ok || !hulu.body) {
    return tolak(`Penyimpanan gambar membalas ${hulu.status}.`, 502);
  }

  return new Response(hulu.body, {
    headers: {
      "Content-Type": hulu.headers.get("content-type") || "image/webp",
      // Nama objek di R2 selalu baru setiap unggahan, jadi isinya tidak pernah
      // berubah untuk satu alamat. Aman disimpan selamanya di CDN & peramban,
      // dan itu membuat Vercel hanya sekali mengambil tiap gambar.
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
