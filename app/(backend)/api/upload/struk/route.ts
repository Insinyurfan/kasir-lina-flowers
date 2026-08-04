import { NextResponse } from "next/server";
import { unggahGambarStruk } from "@/lib/r2Storage";
import { requireRole } from "@/lib/apiAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/upload/struk — unggah foto struk belanja untuk sebuah pengeluaran.
// Mengikuti pola api/upload/produk; bedanya bucket dan pembatasan peran.
export async function POST(request: Request) {
  try {
    const auth = await requireRole(request, ["Owner", "Admin"]);
    if (!auth.ok) return auth.response;

    const formData = await request.formData();
    const file = formData.get("file");
    const kategori = formData.get("kategori");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Foto struk belum dipilih." }, { status: 400 });
    }

    const result = await unggahGambarStruk(
      file,
      typeof kategori === "string" ? kategori : undefined
    );

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal upload foto struk.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
