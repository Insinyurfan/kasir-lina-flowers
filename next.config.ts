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
    // HANYA saat `next dev`. Next 16 menolak mengoptimasi gambar yang nama
    // hostnya menghasilkan alamat non-unicast, dan jaringan tethering di sini
    // memakai DNS64/NAT64: `supabase.co` ikut menghasilkan `64:ff9b::…`, yang
    // oleh ipaddr.js dikenali sebagai rentang `rfc6052` alias bukan unicast.
    // Alamat itu sebenarnya Cloudflare publik (`64:ff9b::6812:260a` =
    // 104.18.38.10), tapi Next menolak begitu ADA SATU saja yang tersaring —
    // walau alamat IPv4 yang sah juga ikut dikembalikan.
    //
    // Aman dimatikan di produksi dan tidak boleh dinyalakan di sana: Vercel
    // tidak memakai NAT64, dan di jaringan sungguhan pemeriksaan ini yang
    // mencegah pengoptimal gambar dipakai menjangkau alamat internal.
    // `remotePatterns` di bawah tetap berlaku, jadi bahkan saat menyala hanya
    // host yang terdaftar yang bisa diambil.
    dangerouslyAllowLocalIP: process.env.NODE_ENV === "development",
    remotePatterns: [
      // Rumah baru gambar produk: Cloudflare R2.
      //
      // Dua pola karena R2 punya dua cara menyajikan berkas ke publik:
      //   1. subdomain bawaan `pub-<hash>.r2.dev` — aktif tanpa memindahkan DNS
      //   2. domain sendiri `img.linaflowers.my.id` — perlu zona di Cloudflare
      // Yang dipakai ditentukan env `R2_PUBLIC_BASE_URL`, jadi pindah dari (1)
      // ke (2) nanti cukup mengganti satu env tanpa menyentuh berkas ini.
      {
        protocol: "https",
        hostname: "img.linaflowers.my.id",
        pathname: "/**",
      },
      // Host persis bucket `lina-produk`. Sebelumnya `**.r2.dev`, yang ikut
      // mencakup bucket milik orang lain — pengoptimal gambar Vercel bisa
      // dipakai memproksikan berkas asing. Sekarang dipersempit.
      //
      // Kalau subdomain ini pernah dibuat ulang di Cloudflare, gambar akan
      // ditolak 400 dan nilainya harus diperbarui di sini bersama
      // `R2_PUBLIC_BASE_URL`.
      {
        protocol: "https",
        hostname: "pub-33bec4176b1b4bd1a21fbcb2c6d6cf44.r2.dev",
        pathname: "/**",
      },
      // Supabase DIPERTAHANKAN selama masa transisi. Sebagian produk masih
      // menunjuk ke URL lama sampai fotonya diunggah ulang; menghapus pola ini
      // lebih awal akan mengubah "gambar rusak" menjadi "halaman galat".
      // Boleh dihapus setelah seluruh foto pindah.
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
