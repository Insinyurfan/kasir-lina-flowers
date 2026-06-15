const fs = require("node:fs");
const path = require("node:path");
const { PrismaClient } = require("../lib/generated/prisma");

const PROJECT_ROOT = path.resolve(__dirname, "..");

const loadEnvFile = (filePath) => {
  if (!fs.existsSync(filePath)) return;

  for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();
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

const PRODUCT_IMAGE_BUCKET = "produk";

const mimeExtension = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const trimTrailingSlash = (value) => value.replace(/\/+$/, "");

const getStorageConfig = () => {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error("SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY harus tersedia di .env.");
  }

  return {
    url: trimTrailingSlash(url),
    serviceKey,
  };
};

const storageHeaders = (serviceKey) => ({
  apikey: serviceKey,
  Authorization: `Bearer ${serviceKey}`,
});

const ensureProductImageBucket = async () => {
  const { url, serviceKey } = getStorageConfig();
  const bucketUrl = `${url}/storage/v1/bucket/${PRODUCT_IMAGE_BUCKET}`;

  const existing = await fetch(bucketUrl, {
    headers: storageHeaders(serviceKey),
  });

  if (existing.ok) return;

  const created = await fetch(`${url}/storage/v1/bucket`, {
    method: "POST",
    headers: {
      ...storageHeaders(serviceKey),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: PRODUCT_IMAGE_BUCKET,
      name: PRODUCT_IMAGE_BUCKET,
      public: true,
      file_size_limit: 3 * 1024 * 1024,
      allowed_mime_types: ["image/jpeg", "image/png", "image/webp"],
    }),
  });

  if (!created.ok && created.status !== 409) {
    throw new Error("Gagal menyiapkan bucket foto produk.");
  }
};

const sanitizeSegment = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);

const dataUrlToImage = (dataUrl) => {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) throw new Error("Format base64 foto tidak valid.");

  const mimeType = match[1];
  const extension = mimeExtension[mimeType] || "jpg";
  const bytes = Buffer.from(match[2], "base64");
  return { bytes, mimeType, extension };
};

const uploadProductImage = async (image, productName) => {
  await ensureProductImageBucket();

  const { url, serviceKey } = getStorageConfig();
  const timestamp = Date.now();
  const randomPart = crypto.randomUUID();
  const namePart = sanitizeSegment(productName || "produk") || "produk";
  const objectPath = `${namePart}/${timestamp}-${randomPart}.${image.extension}`;
  const uploadUrl = `${url}/storage/v1/object/${PRODUCT_IMAGE_BUCKET}/${objectPath}`;

  const uploaded = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      ...storageHeaders(serviceKey),
      "Content-Type": image.mimeType,
      "x-upsert": "false",
    },
    body: image.bytes,
  });

  if (!uploaded.ok) {
    const detail = await uploaded.text().catch(() => "");
    throw new Error(`Gagal upload foto produk ke Supabase Storage. ${detail}`);
  }

  return {
    path: objectPath,
    url: `${url}/storage/v1/object/public/${PRODUCT_IMAGE_BUCKET}/${objectPath}`,
  };
};

const main = async () => {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Isi SUPABASE_SERVICE_ROLE_KEY di .env sebelum migrasi foto lama.");
  }

  const prisma = new PrismaClient();
  try {
    const products = await prisma.product.findMany({
      where: {
        gambar: {
          startsWith: "data:image/",
        },
      },
      select: {
        id: true,
        nama_produk: true,
        gambar: true,
      },
    });

    const result = [];
    for (const product of products) {
      if (!product.gambar) continue;
      const image = dataUrlToImage(product.gambar);
      const uploaded = await uploadProductImage(image, product.nama_produk);
      await prisma.product.update({
        where: { id: product.id },
        data: { gambar: uploaded.url },
      });
      result.push({ id: product.id, nama_produk: product.nama_produk, url: uploaded.url });
    }

    console.log(JSON.stringify({ migratedImages: result.length, products: result }, null, 2));
  } finally {
    await prisma.$disconnect();
  }
};

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
