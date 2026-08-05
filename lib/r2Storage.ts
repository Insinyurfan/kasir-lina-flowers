// Penyimpanan gambar di Cloudflare R2.
//
// KENAPA PINDAH DARI SUPABASE STORAGE: pada 3 Agustus 2026 Supabase memblokir
// Storage karena kuota egress terlampaui, dan seluruh gambar produk lenyap.
// Penyebab utamanya ternyata egress basis data, bukan gambar — tapi di Supabase
// keduanya berbagi jatah yang sama, jadi apa pun yang membuat salah satunya
// jebol akan mematikan keduanya. R2 tidak menagih egress sama sekali, dan
// memisahkan nasib gambar dari nasib basis data.
//
// KENAPA `aws4fetch`, bukan `@aws-sdk/client-s3`: yang dibutuhkan hanya tanda
// tangan AWS SigV4 untuk PUT dan DELETE. aws4fetch ~84 KB; SDK resmi
// megabyte-an dan membawa banyak hal yang tidak dipakai. Menulis SigV4 sendiri
// juga ditolak — canonical request, hashing bertingkat, dan turunan kunci per
// tanggal; salah sedikit menghasilkan 403 yang sulit ditelusuri.

import { AwsClient } from "aws4fetch";

const AWALAN_PRODUK = "produk";
const AWALAN_STRUK = "struk";
const BATAS_UKURAN = 3 * 1024 * 1024;

type KonfigurasiR2 = {
  klien: AwsClient;
  endpointBucket: string;
  basisPublik: string;
};

const bacaEnv = (nama: string) => process.env[nama]?.trim() || "";

const buangGarisMiringAkhir = (nilai: string) => nilai.replace(/\/+$/, "");

/**
 * Baca konfigurasi R2 dari env. Sengaja melempar pesan berbahasa Indonesia yang
 * menyebutkan env mana yang kurang — kalau tidak, kegagalannya muncul sebagai
 * galat tanda tangan yang membingungkan.
 */
const ambilKonfigurasi = (): KonfigurasiR2 => {
  const accountId = bacaEnv("R2_ACCOUNT_ID");
  const accessKeyId = bacaEnv("R2_ACCESS_KEY_ID");
  const secretAccessKey = bacaEnv("R2_SECRET_ACCESS_KEY");
  const bucket = bacaEnv("R2_BUCKET");
  const basisPublik = bacaEnv("R2_PUBLIC_BASE_URL");

  const kurang = [
    ["R2_ACCOUNT_ID", accountId],
    ["R2_ACCESS_KEY_ID", accessKeyId],
    ["R2_SECRET_ACCESS_KEY", secretAccessKey],
    ["R2_BUCKET", bucket],
    ["R2_PUBLIC_BASE_URL", basisPublik],
  ]
    .filter(([, nilai]) => !nilai)
    .map(([nama]) => nama);

  if (kurang.length > 0) {
    throw new Error(
      `Konfigurasi Cloudflare R2 belum lengkap. Env yang belum diisi: ${kurang.join(", ")}.`
    );
  }

  return {
    klien: new AwsClient({
      accessKeyId,
      secretAccessKey,
      service: "s3",
      // R2 tidak memakai region sungguhan, tetapi SigV4 mewajibkan nilainya.
      region: "auto",
    }),
    endpointBucket: `https://${accountId}.r2.cloudflarestorage.com/${bucket}`,
    basisPublik: buangGarisMiringAkhir(basisPublik),
  };
};

const ekstensiBerkas = (file: File) => {
  const menurutTipe: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  };
  return menurutTipe[file.type] || file.name.split(".").pop()?.toLowerCase() || "jpg";
};

const rapikanSegmen = (nilai: string) =>
  nilai
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);

const periksaBerkas = (file: File) => {
  if (!file.type.startsWith("image/")) throw new Error("File harus berupa gambar.");
  if (file.size > BATAS_UKURAN) throw new Error("Ukuran foto maksimal 3MB.");
};

/**
 * Unggah satu berkas ke R2. Nama objek memakai cap waktu + UUID sehingga dua
 * unggahan bersamaan tidak pernah saling menimpa. Nama produk/kategori dipakai
 * sebagai folder supaya isi bucket masih bisa dibaca manusia.
 */
const unggah = async (file: File, awalan: string, namaFolder?: string) => {
  periksaBerkas(file);

  const { klien, endpointBucket, basisPublik } = ambilKonfigurasi();

  const folder = rapikanSegmen(namaFolder || awalan) || awalan;
  const objek = `${awalan}/${folder}/${Date.now()}-${crypto.randomUUID()}.${ekstensiBerkas(file)}`;

  const respons = await klien.fetch(`${endpointBucket}/${objek}`, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": file.type || "application/octet-stream",
      // Gambar tidak pernah berubah isinya (nama objek selalu baru), jadi aman
      // di-cache lama di CDN maupun peramban.
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });

  if (!respons.ok) {
    // Sertakan kode galat dari R2. Tanpa ini yang sampai ke pemakai cuma angka
    // status, dan 403 karena kunci salah tidak bisa dibedakan dari 403 karena
    // izin token kurang — dua hal dengan perbaikan yang berbeda.
    // `<Code>` aman ditampilkan: isinya nama galat, bukan kredensial.
    const kode = await respons
      .text()
      .then((teks) => teks.match(/<Code>([^<]+)<\/Code>/)?.[1] ?? "")
      .catch(() => "");
    throw new Error(
      `Gagal mengunggah gambar ke Cloudflare R2 (${respons.status}${kode ? ` ${kode}` : ""}).`
    );
  }

  return { path: objek, url: `${basisPublik}/${objek}` };
};

export const unggahGambarProduk = (file: File, namaProduk?: string) =>
  unggah(file, AWALAN_PRODUK, namaProduk);

export const unggahGambarStruk = (file: File, kategori?: string) =>
  unggah(file, AWALAN_STRUK, kategori);

/** Turunkan path objek dari URL publik. Kembalikan null bila bukan URL R2 kita. */
export const pathDariUrlR2 = (url?: string | null): string | null => {
  if (!url) return null;
  const basisPublik = buangGarisMiringAkhir(bacaEnv("R2_PUBLIC_BASE_URL"));
  if (!basisPublik || !url.startsWith(`${basisPublik}/`)) return null;
  return url.slice(basisPublik.length + 1).split("?")[0] || null;
};

/**
 * Hapus berkas dari R2.
 *
 * SENGAJA tidak pernah melempar galat: berkas yatim jauh lebih ringan
 * akibatnya daripada penghapusan pengeluaran atau penggantian foto yang batal
 * gara-gara jaringan sedang bermasalah.
 */
export const hapusGambarR2 = async (url?: string | null): Promise<void> => {
  try {
    const objek = pathDariUrlR2(url);
    if (!objek) return;

    const { klien, endpointBucket } = ambilKonfigurasi();
    await klien.fetch(`${endpointBucket}/${objek}`, { method: "DELETE" });
  } catch {
    // Diamkan — lihat catatan di atas.
  }
};
