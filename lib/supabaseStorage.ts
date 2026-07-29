const PRODUCT_IMAGE_BUCKET = "produk";
const RECEIPT_IMAGE_BUCKET = "struk";
const STORAGE_KEY_CANDIDATES = [
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_SECRET_KEY",
  "SUPABASE_SERVICE_ROLE",
  "SERVICE_ROLE_KEY",
];

type StorageConfig = {
  url: string;
  serviceKey: string;
};

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

const getSupabaseUrlFromDatabaseUrl = () => {
  const databaseUrl = process.env.DATABASE_URL || process.env.DIRECT_URL;
  if (!databaseUrl) return "";

  try {
    const parsed = new URL(databaseUrl);
    const username = decodeURIComponent(parsed.username);
    const projectRef = username.startsWith("postgres.") ? username.slice("postgres.".length) : "";
    return projectRef ? `https://${projectRef}.supabase.co` : "";
  } catch {
    return "";
  }
};

const getStorageConfig = (): StorageConfig => {
  const url =
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    getSupabaseUrlFromDatabaseUrl();
  const serviceKey = STORAGE_KEY_CANDIDATES.map((key) => process.env[key]).find(Boolean);

  if (!url || !serviceKey) {
    throw new Error("Konfigurasi Supabase Storage belum lengkap.");
  }

  return {
    url: trimTrailingSlash(url),
    serviceKey,
  };
};

const storageHeaders = (serviceKey: string) => ({
  apikey: serviceKey,
  Authorization: `Bearer ${serviceKey}`,
});

export const productImageBucket = PRODUCT_IMAGE_BUCKET;
export const receiptImageBucket = RECEIPT_IMAGE_BUCKET;

const ensureBucket = async (bucket: string, labelGagal: string) => {
  const { url, serviceKey } = getStorageConfig();
  const bucketUrl = `${url}/storage/v1/bucket/${bucket}`;

  const existing = await fetch(bucketUrl, {
    headers: storageHeaders(serviceKey),
    cache: "no-store",
  });

  if (existing.ok) return;

  const created = await fetch(`${url}/storage/v1/bucket`, {
    method: "POST",
    headers: {
      ...storageHeaders(serviceKey),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: bucket,
      name: bucket,
      public: true,
      file_size_limit: 3 * 1024 * 1024,
      allowed_mime_types: ["image/jpeg", "image/png", "image/webp"],
    }),
  });

  if (!created.ok && created.status !== 409) {
    throw new Error(labelGagal);
  }
};

export const ensureProductImageBucket = async () =>
  ensureBucket(PRODUCT_IMAGE_BUCKET, "Gagal menyiapkan bucket foto produk.");

export const ensureReceiptImageBucket = async () =>
  ensureBucket(RECEIPT_IMAGE_BUCKET, "Gagal menyiapkan bucket foto struk.");

const getFileExtension = (file: File) => {
  const extensionByType: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  };
  return extensionByType[file.type] || file.name.split(".").pop()?.toLowerCase() || "jpg";
};

const sanitizeSegment = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);

export const uploadProductImage = async (file: File, productName?: string) => {
  if (!file.type.startsWith("image/")) {
    throw new Error("File harus berupa gambar.");
  }

  if (file.size > 3 * 1024 * 1024) {
    throw new Error("Ukuran foto maksimal 3MB.");
  }

  await ensureProductImageBucket();

  const { url, serviceKey } = getStorageConfig();
  const timestamp = Date.now();
  const randomPart = crypto.randomUUID();
  const namePart = sanitizeSegment(productName || "produk") || "produk";
  const extension = getFileExtension(file);
  const objectPath = `${namePart}/${timestamp}-${randomPart}.${extension}`;
  const uploadUrl = `${url}/storage/v1/object/${PRODUCT_IMAGE_BUCKET}/${objectPath}`;

  const uploaded = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      ...storageHeaders(serviceKey),
      "Content-Type": file.type || "application/octet-stream",
      "x-upsert": "false",
    },
    body: file,
  });

  if (!uploaded.ok) {
    throw new Error("Gagal upload foto produk ke Supabase Storage.");
  }

  return {
    path: objectPath,
    url: `${url}/storage/v1/object/public/${PRODUCT_IMAGE_BUCKET}/${objectPath}`,
  };
};

// Foto struk belanja. Bucket terpisah dari foto produk supaya bukti pengeluaran
// tidak tercampur dengan katalog dan bisa diatur retensinya sendiri.
export const uploadReceiptImage = async (file: File, kategori?: string) => {
  if (!file.type.startsWith("image/")) {
    throw new Error("File harus berupa gambar.");
  }

  if (file.size > 3 * 1024 * 1024) {
    throw new Error("Ukuran foto maksimal 3MB.");
  }

  await ensureReceiptImageBucket();

  const { url, serviceKey } = getStorageConfig();
  const namePart = sanitizeSegment(kategori || "struk") || "struk";
  const objectPath = `${namePart}/${Date.now()}-${crypto.randomUUID()}.${getFileExtension(file)}`;

  const uploaded = await fetch(
    `${url}/storage/v1/object/${RECEIPT_IMAGE_BUCKET}/${objectPath}`,
    {
      method: "POST",
      headers: {
        ...storageHeaders(serviceKey),
        "Content-Type": file.type || "application/octet-stream",
        "x-upsert": "false",
      },
      body: file,
    }
  );

  if (!uploaded.ok) {
    throw new Error("Gagal upload foto struk ke Supabase Storage.");
  }

  return {
    path: objectPath,
    url: `${url}/storage/v1/object/public/${RECEIPT_IMAGE_BUCKET}/${objectPath}`,
  };
};

export const deleteReceiptImageFromStorage = async (imageUrl?: string | null) => {
  if (!imageUrl) return;
  const marker = `/storage/v1/object/public/${RECEIPT_IMAGE_BUCKET}/`;
  const index = imageUrl.indexOf(marker);
  if (index === -1) return;

  const path = imageUrl.slice(index + marker.length).split("?")[0];
  if (!path) return;

  const { url, serviceKey } = getStorageConfig();
  await fetch(`${url}/storage/v1/object/${RECEIPT_IMAGE_BUCKET}`, {
    method: "DELETE",
    headers: {
      ...storageHeaders(serviceKey),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prefixes: [path] }),
  });
};

export const getProductImagePathFromUrl = (imageUrl?: string | null) => {
  if (!imageUrl) return null;
  const marker = `/storage/v1/object/public/${PRODUCT_IMAGE_BUCKET}/`;
  const index = imageUrl.indexOf(marker);
  if (index === -1) return null;
  return imageUrl.slice(index + marker.length).split("?")[0] || null;
};

export const deleteProductImageFromStorage = async (imageUrl?: string | null) => {
  const path = getProductImagePathFromUrl(imageUrl);
  if (!path) return;

  const { url, serviceKey } = getStorageConfig();
  await fetch(`${url}/storage/v1/object/${PRODUCT_IMAGE_BUCKET}`, {
    method: "DELETE",
    headers: {
      ...storageHeaders(serviceKey),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prefixes: [path] }),
  });
};
