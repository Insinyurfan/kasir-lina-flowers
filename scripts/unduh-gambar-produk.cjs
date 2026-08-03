// Unduh gambar produk dari Supabase Storage, DINAMAI MENURUT NAMA PRODUKNYA.
//
// LATAR: pemilik punya salinan foto di komputer, tapi namanya nama bawaan
// kamera (IMG_20260715_0842.jpg) sehingga tidak ketahuan itu produk apa.
// Database menyimpan pasangan nama produk <-> URL gambar, jadi skrip ini
// memakainya untuk menamai berkas dengan benar:
//
//     gambar-produk/012 - LN 2 - Bando Bunga panel 2 Merah Putih.webp
//
// Sekalian membuat `index.html` — buka di peramban untuk melihat semua gambar
// beserta nama produknya berdampingan, tanpa perlu internet.
//
// Pemakaian:
//   node scripts/unduh-gambar-produk.cjs             # unduh ke ./gambar-produk
//   node scripts/unduh-gambar-produk.cjs --peta-saja # HANYA buat daftar & index,
//                                                     tanpa mengunduh (jalan walau
//                                                     Storage sedang diblokir)

const fs = require("node:fs");
const path = require("node:path");
const { PrismaClient } = require("../lib/generated/prisma");

const PROJECT_ROOT = path.resolve(__dirname, "..");
const FOLDER_TUJUAN = path.join(PROJECT_ROOT, "gambar-produk");

const loadEnvFile = (filePath) => {
  if (!fs.existsSync(filePath)) return;
  for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const sep = trimmed.indexOf("=");
    if (sep === -1) continue;
    const key = trimmed.slice(0, sep).trim();
    let value = trimmed.slice(sep + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = process.env[key] || value;
  }
};
loadEnvFile(path.join(PROJECT_ROOT, ".env"));

// Nama berkas harus aman di Windows: \ / : * ? " < > | dilarang.
const namaBerkasAman = (nilai) =>
  nilai
    .replace(/[\\/:*?"<>|]/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);

const ekstensiDariUrl = (url) => {
  const bersih = url.split("?")[0];
  const titik = bersih.lastIndexOf(".");
  if (titik === -1) return "jpg";
  const ext = bersih.slice(titik + 1).toLowerCase();
  return /^[a-z0-9]{2,5}$/.test(ext) ? ext : "jpg";
};

const escapeHtml = (nilai) =>
  String(nilai)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const buatIndexHtml = (baris) => `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="utf-8" />
<title>Daftar Gambar Produk — Lina Flowers</title>
<style>
  body { font-family: Arial, Helvetica, sans-serif; background: #fff4f9; margin: 0; padding: 24px; color: #5f1738; }
  h1 { margin: 0 0 4px; }
  p.ket { margin: 0 0 24px; color: #8d4561; font-size: 14px; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; }
  .kartu { background: #fff; border: 1px solid #ffd2e3; border-radius: 14px; overflow: hidden; }
  .kartu img { width: 100%; height: 180px; object-fit: cover; display: block; background: #ffe3ee; }
  .kartu .kosong { width: 100%; height: 180px; display: flex; align-items: center; justify-content: center;
                   background: #ffe3ee; color: #cf5f94; font-size: 13px; font-weight: bold; }
  .kartu .isi { padding: 10px 12px; }
  .kartu .nama { font-weight: 800; font-size: 14px; line-height: 1.3; }
  .kartu .id { font-family: "Courier New", monospace; font-size: 11px; color: #8d4561; margin-top: 4px; }
  .kartu .berkas { font-size: 10px; color: #999; word-break: break-all; margin-top: 4px; }
</style>
</head>
<body>
  <h1>Daftar Gambar Produk</h1>
  <p class="ket">${baris.length} produk &middot; dibuat ${new Date().toLocaleString("id-ID")}</p>
  <div class="grid">
    ${baris
      .map(
        (b) => `
    <div class="kartu">
      ${
        b.namaBerkas
          ? `<img src="${escapeHtml(b.namaBerkas)}" alt="${escapeHtml(b.nama)}" loading="lazy" />`
          : `<div class="kosong">Tanpa gambar</div>`
      }
      <div class="isi">
        <div class="nama">${escapeHtml(b.nama)}</div>
        <div class="id">ID ${b.id}</div>
        ${b.namaBerkas ? `<div class="berkas">${escapeHtml(b.namaBerkas)}</div>` : ""}
      </div>
    </div>`
      )
      .join("")}
  </div>
</body>
</html>`;

const main = async () => {
  const petaSaja = process.argv.includes("--peta-saja");
  const prisma = new PrismaClient();

  try {
    const produk = await prisma.product.findMany({
      select: { id: true, nama_produk: true, gambar: true, isArchived: true },
      orderBy: { id: "asc" },
    });

    const punyaGambar = produk.filter((p) => p.gambar);
    console.log("=== Unduh gambar produk ===");
    console.log(`Produk         : ${produk.length}`);
    console.log(`Punya gambar   : ${punyaGambar.length}`);
    console.log(`Tanpa gambar   : ${produk.length - punyaGambar.length}`);
    console.log(`Mode           : ${petaSaja ? "PETA SAJA (tidak mengunduh)" : "UNDUH"}`);
    console.log(`Tujuan         : ${FOLDER_TUJUAN}\n`);

    fs.mkdirSync(FOLDER_TUJUAN, { recursive: true });

    const baris = [];
    let berhasil = 0;
    let gagal = 0;

    for (const p of produk) {
      const nomor = String(p.id).padStart(3, "0");
      const namaDasar = namaBerkasAman(`${nomor} - ${p.nama_produk}`);

      if (!p.gambar) {
        baris.push({ id: p.id, nama: p.nama_produk, namaBerkas: null });
        continue;
      }

      const namaBerkas = `${namaDasar}.${ekstensiDariUrl(p.gambar)}`;
      baris.push({ id: p.id, nama: p.nama_produk, namaBerkas, url: p.gambar });

      if (petaSaja) continue;

      const tujuan = path.join(FOLDER_TUJUAN, namaBerkas);
      if (fs.existsSync(tujuan)) {
        console.log(`  lewati (sudah ada)  ${namaBerkas}`);
        berhasil += 1;
        continue;
      }

      try {
        const res = await fetch(p.gambar);
        if (!res.ok) {
          console.log(`  GAGAL ${res.status}        ${namaBerkas}`);
          gagal += 1;
          continue;
        }
        const buf = Buffer.from(await res.arrayBuffer());
        fs.writeFileSync(tujuan, buf);
        console.log(`  ok ${String(Math.round(buf.length / 1024)).padStart(5)} KB  ${namaBerkas}`);
        berhasil += 1;
      } catch (e) {
        console.log(`  GAGAL ${e.message}  ${namaBerkas}`);
        gagal += 1;
      }
    }

    // Daftar teks — gampang dicari pakai Ctrl+F.
    const daftarTxt = baris
      .map((b) => `${String(b.id).padStart(3, "0")}\t${b.nama}\t${b.namaBerkas ?? "(tanpa gambar)"}`)
      .join("\n");
    fs.writeFileSync(
      path.join(FOLDER_TUJUAN, "daftar-produk.txt"),
      `ID\tNAMA PRODUK\tNAMA BERKAS\n${daftarTxt}\n`,
      "utf8"
    );

    fs.writeFileSync(path.join(FOLDER_TUJUAN, "index.html"), buatIndexHtml(baris), "utf8");

    console.log("\n=== Hasil ===");
    if (!petaSaja) {
      console.log(`Terunduh : ${berhasil}`);
      console.log(`Gagal    : ${gagal}`);
    }
    console.log(`Daftar   : gambar-produk/daftar-produk.txt`);
    console.log(`Katalog  : gambar-produk/index.html  (buka di peramban)`);

    if (gagal > 0) {
      console.log(
        "\nAda yang gagal diunduh. Kalau statusnya 402, Storage Supabase masih diblokir —" +
          "\njalankan ulang skrip ini setelah restriksinya diangkat. Yang sudah terunduh dilewati."
      );
    }
  } finally {
    await prisma.$disconnect();
  }
};

main().catch((e) => {
  console.error("Gagal:", e);
  process.exitCode = 1;
});
