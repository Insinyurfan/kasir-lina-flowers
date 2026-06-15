import { NextResponse } from "next/server";
import { uploadProductImage } from "@/lib/supabaseStorage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const productName = formData.get("nama_produk");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "File foto produk belum dipilih." }, { status: 400 });
    }

    const result = await uploadProductImage(
      file,
      typeof productName === "string" ? productName : undefined
    );

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal upload foto produk.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
