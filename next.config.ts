import type { NextConfig } from "next";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  allowedDevOrigins: ['192.168.0.46'],
  devIndicators: false,
  turbopack: {
    root: projectRoot,
  },
  // Izinkan next/image mengambil gambar produk dari Supabase Storage.
  //
  // KENAPA PENTING: sebelumnya semua gambar dipasang lewat <img> mentah, jadi
  // SETIAP pengunjung menembus langsung ke Supabase. Dashboard menunjukkan
  // egress 0,19 GB dengan cached egress cuma 0,01 GB — 95% tidak ter-cache,
  // dan itulah yang menghabiskan kuota sampai Storage diblokir 402.
  //
  // Dengan next/image, Vercel mengambil sekali lalu menyajikannya dari CDN-nya
  // sendiri, sekaligus mengecilkan gambar sesuai ukuran tampil. Supabase jadi
  // diakses sekali per gambar, bukan sekali per pengunjung.
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  // /sw.js TIDAK BOLEH di-cache. Ini penjagaan terpenting pada service worker:
  // kalau berkasnya sendiri ikut tersimpan, perangkat tidak akan pernah tahu ada
  // versi baru — terkunci selamanya, dan tidak ada rilis yang bisa
  // menyelamatkannya dari jarak jauh.
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
    ];
  },
};

export default nextConfig;
