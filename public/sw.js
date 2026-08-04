/* Service worker Lina Flowers.
 *
 * DITULIS TANGAN dengan sengaja — tanpa next-pwa/workbox/serwist. Cakupannya
 * kecil dan bisa dibaca sekali duduk. Pustaka PWA menghasilkan service worker
 * lewat lapisan build, dan saat ada yang salah — pada service worker, "salah"
 * berarti MENETAP DI PERANGKAT ORANG — lapisan itu justru menghalangi
 * penelusuran.
 *
 * Pemicunya: 3 Agustus 2026, Supabase memblokir Storage karena kuota egress
 * terlampaui, dan SELURUH gambar produk lenyap dari semua perangkat sekaligus
 * — termasuk yang baru saja membukanya beberapa menit sebelumnya. Kalau
 * gambarnya tersimpan di perangkat, pemadaman itu tidak akan terasa.
 *
 * ATURAN PALING PENTING: /api/** TIDAK PERNAH di-cache. Aplikasi ini memegang
 * harga, stok, piutang, dan saldo upah orang. Menyajikan angka basi jauh lebih
 * berbahaya daripada gagal terang-terangan — kegagalan yang kelihatan bisa
 * ditangani manusia, angka salah yang tampak wajar tidak.
 *
 * Naikkan VERSI setiap kali berkas ini diubah. Cache versi lama dihapus saat
 * versi baru aktif.
 */

const VERSI = "v3"; // v3: kenali juga subdomain bawaan R2 (pub-*.r2.dev)
const CACHE_ASET = `lina-${VERSI}-aset`;
const CACHE_GAMBAR = `lina-${VERSI}-gambar`;
const CACHE_HALAMAN = `lina-${VERSI}-halaman`;

const SEMUA_CACHE = [CACHE_ASET, CACHE_GAMBAR, CACHE_HALAMAN];

// ---------------------------------------------------------------- pemasangan

self.addEventListener("install", () => {
  // SENGAJA tidak memanggil skipWaiting(). Versi baru menunggu sampai pengguna
  // menekan "muat ulang" di toast. Mengambil alih di tengah sesi bisa membuat
  // halaman yang sudah terbuka meminta potongan JavaScript yang sudah tidak
  // ada lagi — tepat saat orang sedang membuat nota.
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const nama = await caches.keys();
      await Promise.all(
        nama
          .filter((n) => n.startsWith("lina-") && !SEMUA_CACHE.includes(n))
          .map((n) => caches.delete(n))
      );
      await self.clients.claim();
    })()
  );
});

// Halaman mengirim pesan ini saat pengguna menekan "muat ulang" pada toast.
self.addEventListener("message", (event) => {
  if (event.data === "LEWATI_MENUNGGU") self.skipWaiting();
});

// ---------------------------------------------------------------- strategi

const adalahAsetNext = (url) => url.pathname.startsWith("/_next/static/");

// Host gambar: R2 (baru) dan Supabase (lama, selama masa transisi).
// R2 bisa disajikan lewat subdomain bawaan `pub-<hash>.r2.dev` maupun domain
// sendiri, jadi keduanya dikenali — tidak perlu menyunting berkas ini kalau
// suatu saat pindah dari yang satu ke yang lain.
const adalahHostR2 = (hostname) =>
  hostname === "img.linaflowers.my.id" || hostname.endsWith(".r2.dev");

const adalahGambar = (request, url) =>
  request.destination === "image" ||
  url.pathname.startsWith("/_next/image") ||
  adalahHostR2(url.hostname) ||
  url.pathname.includes("/storage/v1/object/public/");

/** Cache dulu, permanen. Aman karena nama berkasnya sudah ber-hash isi. */
const cacheDuluPermanen = async (request, namaCache) => {
  const cache = await caches.open(namaCache);
  const tersimpan = await cache.match(request);
  if (tersimpan) return tersimpan;

  const respons = await fetch(request);
  if (respons && respons.status === 200) cache.put(request, respons.clone());
  return respons;
};

/**
 * Cache dulu, lalu segarkan di latar. Inilah yang membuat gambar bertahan saat
 * sumbernya mati: kalau salinannya ada, ia disajikan tanpa peduli server asalnya
 * sedang membalas 402 atau tidak.
 */
const cacheDuluSegarkanLatar = async (request, namaCache) => {
  const cache = await caches.open(namaCache);
  const tersimpan = await cache.match(request);

  const dariJaringan = fetch(request)
    .then((respons) => {
      // Respons galat (mis. 402 saat kuota habis) TIDAK boleh menimpa salinan
      // yang masih baik.
      if (respons && respons.status === 200) cache.put(request, respons.clone());
      return respons;
    })
    .catch(() => null);

  if (tersimpan) return tersimpan;

  const respons = await dariJaringan;
  if (respons) return respons;
  return Response.error();
};

/** Jaringan dulu, jatuh ke cache bila gagal. Dipakai untuk navigasi halaman. */
const jaringanDuluCadanganCache = async (request, namaCache) => {
  const cache = await caches.open(namaCache);
  try {
    const respons = await fetch(request);
    if (respons && respons.status === 200) cache.put(request, respons.clone());
    return respons;
  } catch {
    const tersimpan = await cache.match(request);
    if (tersimpan) return tersimpan;
    throw new Error("Tidak ada jaringan dan tidak ada salinan tersimpan.");
  }
};

// ---------------------------------------------------------------- penyadapan

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Hanya GET. POST/PATCH/DELETE selalu lewat ke jaringan apa adanya.
  if (request.method !== "GET") return;

  let url;
  try {
    url = new URL(request.url);
  } catch {
    return;
  }

  // Lewati skema selain http/https (chrome-extension:, data:, dsb).
  if (url.protocol !== "http:" && url.protocol !== "https:") return;

  // ATURAN PALING PENTING — data bisnis tidak pernah disentuh.
  if (url.pathname.startsWith("/api/")) return;

  if (adalahAsetNext(url)) {
    event.respondWith(cacheDuluPermanen(request, CACHE_ASET));
    return;
  }

  if (adalahGambar(request, url)) {
    event.respondWith(cacheDuluSegarkanLatar(request, CACHE_GAMBAR));
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(jaringanDuluCadanganCache(request, CACHE_HALAMAN));
  }
});
