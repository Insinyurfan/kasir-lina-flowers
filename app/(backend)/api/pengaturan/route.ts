import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { recordActivityLog } from "@/lib/activityLog";
import { actorFromUser, requireRole } from "@/lib/apiAuth";

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

// GET /api/pengaturan
//   (tanpa parameter)   -> lengkap, termasuk logo & receiptLogo
//   ?tampilan=1         -> logo saja, TANPA receiptLogo
//   ?ringkas=1          -> tanpa gambar sama sekali
//
// KENAPA ADA PILIHAN INI: logo toko dan logo struk disimpan sebagai base64 di
// dalam basis data — masing-masing 1,2 MB dan 2,8 MB. Endpoint ini dipanggil
// dari app/layout.tsx, yang berarti SETIAP pemuatan halaman dulu menyeret ~4 MB
// walau yang dipakai cuma nama toko dan logo kecil di header. Itu penyebab
// terbesar kuota egress Supabase jebol sampai Storage diblokir.
export async function GET(request: Request) {
  try {
    const params = new URL(request.url).searchParams;
    const ringkas = params.get("ringkas") === "1";
    const tampilan = params.get("tampilan") === "1";

    const setting = await getStoreSetting();

    if (ringkas || tampilan) {
      return NextResponse.json(
        {
          id: setting.id,
          brand: setting.brand,
          address: setting.address,
          footer: setting.footer,
          // `tampilan` tetap membawa logo header; `ringkas` tidak membawa
          // gambar sama sekali.
          ...(tampilan ? { logo: setting.logo } : {}),
        },
        { headers: noStoreHeaders }
      );
    }

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
    const auth = await requireRole(request, ["Owner"]);
    if (!auth.ok) return auth.response;
    const actor = actorFromUser(auth.user);

    const body = (await request.json()) as StoreSettingRequestPayload;
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
