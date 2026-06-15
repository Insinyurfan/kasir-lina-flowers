import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getActorFromPayload, recordActivityLog } from "@/lib/activityLog";

export const dynamic = "force-dynamic";

type StoreSettingRow = {
  id: number;
  brand: string;
  address: string;
  footer: string;
  logo: string | null;
  receiptLogo: string | null;
};

type StoreSettingPayload = Partial<Omit<StoreSettingRow, "id">>;
type StoreSettingRequestPayload = StoreSettingPayload & {
  actorId?: number;
  actorName?: string;
  actorRole?: string;
};

const defaultStoreSetting: StoreSettingRow = {
  id: 1,
  brand: "Lina Flowers",
  address: "Pasar Pagi Asemka, Jakarta Barat",
  footer: "Terima Kasih Atas Kunjungan Anda",
  logo: null,
  receiptLogo: null,
};

const noStoreHeaders = { "Cache-Control": "no-store" };

const ensureReceiptLogoColumn = async () => {
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "StoreSetting"
    ADD COLUMN IF NOT EXISTS "receiptLogo" TEXT
  `);
};

const getErrorMessage = (error: unknown) => (error instanceof Error ? error.message : "Error tidak diketahui");

const getStoreSetting = async () => {
  await ensureReceiptLogoColumn();

  const rows = await prisma.$queryRaw<StoreSettingRow[]>`
    SELECT id, brand, address, footer, logo, "receiptLogo"
    FROM "StoreSetting"
    ORDER BY id ASC
    LIMIT 1
  `;

  if (rows[0]) return rows[0];

  await prisma.$executeRaw`
    INSERT INTO "StoreSetting" (id, brand, address, footer, logo, "receiptLogo")
    VALUES (
      ${defaultStoreSetting.id},
      ${defaultStoreSetting.brand},
      ${defaultStoreSetting.address},
      ${defaultStoreSetting.footer},
      ${defaultStoreSetting.logo},
      ${defaultStoreSetting.receiptLogo}
    )
    ON CONFLICT (id) DO NOTHING
  `;

  return defaultStoreSetting;
};

export async function GET() {
  try {
    const setting = await getStoreSetting();
    return NextResponse.json(setting, { headers: noStoreHeaders });
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal mengambil pengaturan", detail: getErrorMessage(error) },
      { status: 500, headers: noStoreHeaders }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as StoreSettingRequestPayload;
    const actor = getActorFromPayload(body as Record<string, unknown>);
    const current = await getStoreSetting();
    const next = {
      brand: body.brand !== undefined ? body.brand : current.brand,
      address: body.address !== undefined ? body.address : current.address,
      footer: body.footer !== undefined ? body.footer : current.footer,
      logo: body.logo !== undefined ? body.logo || null : current.logo,
      receiptLogo: body.receiptLogo !== undefined ? body.receiptLogo || null : current.receiptLogo,
    };

    await prisma.$executeRaw`
      UPDATE "StoreSetting"
      SET
        brand = ${next.brand},
        address = ${next.address},
        footer = ${next.footer},
        logo = ${next.logo},
        "receiptLogo" = ${next.receiptLogo}
      WHERE id = ${current.id}
    `;

    const updated = await getStoreSetting();
    const changedFields = (["brand", "address", "footer", "logo", "receiptLogo"] as const).filter(
      (field) => body[field] !== undefined && current[field] !== updated[field]
    );
    if (changedFields.length > 0) {
      await recordActivityLog({
        action: "UPDATE",
        entity: "Pengaturan",
        entityId: updated.id,
        title: "Pengaturan toko diperbarui",
        description: `${actor.name} memperbarui ${changedFields.join(", ")} pada pengaturan toko.`,
        actor,
        metadata: {
          changedFields,
          sebelum: {
            brand: current.brand,
            address: current.address,
            footer: current.footer,
            punyaLogoNavbar: Boolean(current.logo),
            punyaLogoStruk: Boolean(current.receiptLogo),
          },
          sesudah: {
            brand: updated.brand,
            address: updated.address,
            footer: updated.footer,
            punyaLogoNavbar: Boolean(updated.logo),
            punyaLogoStruk: Boolean(updated.receiptLogo),
          },
        },
      });
    }
    return NextResponse.json(updated, { headers: noStoreHeaders });
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal menyimpan pengaturan", detail: getErrorMessage(error) },
      { status: 500, headers: noStoreHeaders }
    );
  }
}
