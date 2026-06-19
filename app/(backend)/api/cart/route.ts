import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

type CartScope = "produk" | "pos";

type CartPayloadItem = {
  id?: number;
  productId?: number;
  variantId?: number | null;
  quantity?: number;
  harga?: number;
  hargaAwal?: number;
  satuanPesan?: string;
};

const normalizeScope = (value: string | null | undefined): CartScope =>
  value === "pos" ? "pos" : "produk";

const normalizeUserId = (value: string | number | null | undefined) => {
  const userId = Number(value);
  return Number.isInteger(userId) && userId > 0 ? userId : null;
};

type QueryClient = Pick<typeof prisma, "$queryRaw" | "$executeRaw">;

const getOrCreateCartId = async (client: QueryClient, userId: number, scope: CartScope) => {
  const existing = await client.$queryRaw<Array<{ id: number }>>`
    SELECT "id" FROM "UserCart" WHERE "userId" = ${userId} AND "scope" = ${scope} LIMIT 1
  `;

  if (existing[0]?.id) return existing[0].id;

  const created = await client.$queryRaw<Array<{ id: number }>>`
    INSERT INTO "UserCart" ("userId", "scope", "createdAt", "updatedAt")
    VALUES (${userId}, ${scope}, NOW(), NOW())
    ON CONFLICT ("userId", "scope") DO UPDATE SET "updatedAt" = NOW()
    RETURNING "id"
  `;

  return created[0].id;
};

const getCartItems = async (userId: number, scope: CartScope) => {
  return prisma.$queryRaw<
    Array<{
      id: number;
      productId: number;
      variantId: number | null;
      variantName: string | null;
      nama_produk: string;
      harga: number;
      hargaAwal: number;
      hargaBase: number;
      satuanHarga: string;
      satuanPesan: string;
      quantity: number;
      stok: number;
      barcode: string | null;
      gambar: string | null;
    }>
  >`
    SELECT
      CASE WHEN ci."variantId" IS NOT NULL THEN p."id" * 1000000 + ci."variantId" ELSE p."id" END AS "id",
      p."id" AS "productId",
      ci."variantId",
      v."name" AS "variantName",
      p."nama_produk",
      COALESCE(ci."priceOverride", v."priceModifier", p."harga")::int AS "harga",
      COALESCE(v."priceModifier", p."harga")::int AS "hargaAwal",
      COALESCE(v."priceModifier", p."harga")::int AS "hargaBase",
      COALESCE(p."satuanHarga", 'pcs') AS "satuanHarga",
      COALESCE(ci."satuanPesan", 'pcs') AS "satuanPesan",
      LEAST(ci."quantity", p."stok")::int AS "quantity",
      p."stok"::int AS "stok",
      p."barcode",
      p."gambar"
    FROM "UserCart" c
    JOIN "UserCartItem" ci ON ci."cartId" = c."id"
    JOIN "Product" p ON p."id" = ci."productId"
    LEFT JOIN "ProductVariant" v ON v."id" = ci."variantId"
    WHERE c."userId" = ${userId}
      AND c."scope" = ${scope}
      AND p."stok" > 0
    ORDER BY ci."updatedAt" ASC, ci."id" ASC
  `;
};

const getCartMeta = async (userId: number, scope: CartScope) => {
  const rows = await prisma.$queryRaw<
    Array<{
      customerName: string | null;
      paymentMethod: string | null;
      sessionActive: boolean;
    }>
  >`
    SELECT
      "customerName",
      "paymentMethod",
      "sessionActive"
    FROM "UserCart"
    WHERE "userId" = ${userId}
      AND "scope" = ${scope}
    LIMIT 1
  `;

  return (
    rows[0] || {
      customerName: null,
      paymentMethod: null,
      sessionActive: false,
    }
  );
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = normalizeUserId(searchParams.get("userId"));
  const scope = normalizeScope(searchParams.get("scope"));

  if (!userId) {
    return NextResponse.json({ error: "userId tidak valid." }, { status: 400 });
  }

  try {
    const items = await getCartItems(userId, scope);
    const meta = await getCartMeta(userId, scope);
    return NextResponse.json({ items, ...meta });
  } catch {
    return NextResponse.json({ error: "Gagal memuat keranjang." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const payload = await request.json();
    const userId = normalizeUserId(payload.userId);
    const scope = normalizeScope(payload.scope);

    if (!userId) {
      return NextResponse.json({ error: "userId tidak valid." }, { status: 400 });
    }

    const items = Array.isArray(payload.items) ? (payload.items as CartPayloadItem[]) : [];
    const customerName =
      typeof payload.customerName === "string" && payload.customerName.trim()
        ? payload.customerName.trim()
        : null;
    const paymentMethod =
      typeof payload.paymentMethod === "string" && payload.paymentMethod.trim()
        ? payload.paymentMethod.trim()
        : null;
    const sessionActive = Boolean(payload.sessionActive);
    const normalizedItems = items
      .map((item) => {
        const productId = Number(item.productId || item.id);
        const variantId = item.variantId != null ? Number(item.variantId) : null;
        const quantity = Math.max(0, Math.floor(Number(item.quantity || 0)));
        const price = Number(item.harga);
        const basePrice = Number(item.hargaAwal);
        const satuanPesan = typeof item.satuanPesan === "string" && item.satuanPesan ? item.satuanPesan : "pcs";

        return {
          productId,
          variantId: variantId && Number.isInteger(variantId) && variantId > 0 ? variantId : null,
          quantity,
          satuanPesan,
          priceOverride:
            scope === "pos" && Number.isFinite(price) && Number.isFinite(basePrice) && price !== basePrice
              ? Math.max(0, Math.round(price))
              : null,
        };
      })
      .filter((item) => Number.isInteger(item.productId) && item.productId > 0 && item.quantity > 0);

    await prisma.$transaction(async (tx) => {
      const cartId = await getOrCreateCartId(tx, userId, scope);

      await tx.$executeRaw`DELETE FROM "UserCartItem" WHERE "cartId" = ${cartId}`;

      // Catatan: baris item lama sudah dihapus di atas (DELETE), jadi INSERT langsung.
      // Tidak pakai ON CONFLICT karena tidak ada unique constraint (cartId, productId)
      // dan satu produk bisa punya beberapa baris untuk variasi berbeda.
      for (const item of normalizedItems) {
        await tx.$executeRaw`
          INSERT INTO "UserCartItem" ("cartId", "productId", "variantId", "quantity", "priceOverride", "satuanPesan", "createdAt", "updatedAt")
          VALUES (${cartId}, ${item.productId}, ${item.variantId}, ${item.quantity}, ${item.priceOverride}, ${item.satuanPesan}, NOW(), NOW())
        `;
      }

      await tx.$executeRaw`
        UPDATE "UserCart"
        SET
          "customerName" = ${customerName},
          "paymentMethod" = ${paymentMethod},
          "sessionActive" = ${sessionActive},
          "updatedAt" = NOW()
        WHERE "id" = ${cartId}
      `;
    });

    const savedItems = await getCartItems(userId, scope);
    const meta = await getCartMeta(userId, scope);
    return NextResponse.json({ items: savedItems, ...meta });
  } catch {
    return NextResponse.json({ error: "Gagal menyimpan keranjang." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const payload = await request.json();
    const userId = normalizeUserId(payload.userId);
    const scope = normalizeScope(payload.scope);

    if (!userId) {
      return NextResponse.json({ error: "userId tidak valid." }, { status: 400 });
    }

    const existing = await prisma.$queryRaw<Array<{ id: number }>>`
      SELECT "id" FROM "UserCart" WHERE "userId" = ${userId} AND "scope" = ${scope} LIMIT 1
    `;

    if (existing[0]?.id) {
      await prisma.$executeRaw`DELETE FROM "UserCartItem" WHERE "cartId" = ${existing[0].id}`;
      await prisma.$executeRaw`
        UPDATE "UserCart"
        SET
          "customerName" = NULL,
          "paymentMethod" = NULL,
          "sessionActive" = false,
          "updatedAt" = NOW()
        WHERE "id" = ${existing[0].id}
      `;
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Gagal menghapus keranjang." }, { status: 500 });
  }
}
