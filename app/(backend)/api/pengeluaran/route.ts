import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { recordActivityLog } from "@/lib/activityLog";
import { actorFromUser, requireRole } from "@/lib/apiAuth";
import {
  isKategoriPengeluaran,
  isMetodePengeluaran,
  KATEGORI_PENGELUARAN,
  normalisasiNominal,
} from "@/lib/pengeluaran";
import { dariTanggalInputWIB, rentangDariQuery } from "@/lib/waktu";

export const dynamic = "force-dynamic";

const rupiah = (nilai: number) => `Rp${nilai.toLocaleString("id-ID")}`;

// GET /api/pengeluaran?mulai=YYYY-MM-DD&selesai=YYYY-MM-DD&kategori=Bahan%20Baku
// Tanpa parameter tanggal: mengembalikan bulan berjalan (WIB).
export async function GET(request: NextRequest) {
  try {
    const auth = await requireRole(request, ["Owner", "Admin"]);
    if (!auth.ok) return auth.response;

    const params = request.nextUrl.searchParams;
    const rentang = rentangDariQuery(params.get("mulai"), params.get("selesai"));
    if (!rentang) {
      return NextResponse.json(
        { error: "Rentang tanggal tidak sah. Pakai format YYYY-MM-DD." },
        { status: 400 }
      );
    }

    const kategori = params.get("kategori");
    if (kategori && !isKategoriPengeluaran(kategori)) {
      return NextResponse.json({ error: "Kategori tidak dikenal." }, { status: 400 });
    }

    const pengeluaran = await prisma.expense.findMany({
      where: {
        tanggal: { gte: rentang.mulai, lte: rentang.selesai },
        ...(kategori ? { kategori } : {}),
      },
      orderBy: [{ tanggal: "desc" }, { id: "desc" }],
    });

    // Baris yang lahir dari pencairan upah tidak boleh diubah dari halaman ini
    // (lihat penjaga di [id]/route.ts). Tandai supaya antarmuka menyembunyikan
    // tombol ubah/hapus alih-alih memunculkan galat setelah ditekan.
    const dariPenarikan = await prisma.penarikan.findMany({
      where: { expenseId: { in: pengeluaran.map((item) => item.id) } },
      select: { expenseId: true, pengrajin: { select: { nama: true } } },
    });
    const petaUpah = new Map(
      dariPenarikan
        .filter((p) => p.expenseId !== null)
        .map((p) => [p.expenseId as number, p.pengrajin.nama])
    );

    const total = pengeluaran.reduce((jumlah, item) => jumlah + item.nominal, 0);
    const perKategori = Object.fromEntries(
      KATEGORI_PENGELUARAN.map((nama) => [
        nama,
        pengeluaran
          .filter((item) => item.kategori === nama)
          .reduce((jumlah, item) => jumlah + item.nominal, 0),
      ])
    );

    return NextResponse.json({
      rentang: { mulai: rentang.mulai, selesai: rentang.selesai },
      total,
      perKategori,
      pengeluaran: pengeluaran.map((item) => ({
        ...item,
        dariPencairanUpah: petaUpah.get(item.id) ?? null,
      })),
    });
  } catch (error) {
    console.error("Gagal memuat pengeluaran:", error);
    return NextResponse.json({ error: "Gagal memuat data pengeluaran." }, { status: 500 });
  }
}

// POST /api/pengeluaran — catat pengeluaran baru.
export async function POST(request: NextRequest) {
  try {
    const auth = await requireRole(request, ["Owner", "Admin"]);
    if (!auth.ok) return auth.response;
    const actor = actorFromUser(auth.user);

    const body = await request.json();

    const nominal = normalisasiNominal(body?.nominal);
    if (nominal === null) {
      return NextResponse.json(
        { error: "Nominal harus berupa angka lebih besar dari nol." },
        { status: 400 }
      );
    }

    if (!isKategoriPengeluaran(body?.kategori)) {
      return NextResponse.json({ error: "Kategori pengeluaran wajib dipilih." }, { status: 400 });
    }

    const metode = isMetodePengeluaran(body?.metode) ? body.metode : "Tunai";

    // Tanggal boleh diisi mundur (mis. baru sempat mencatat besoknya).
    let tanggal = new Date();
    if (typeof body?.tanggal === "string" && body.tanggal.trim()) {
      const diurai = dariTanggalInputWIB(body.tanggal);
      if (!diurai) {
        return NextResponse.json(
          { error: "Tanggal tidak sah. Pakai format YYYY-MM-DD." },
          { status: 400 }
        );
      }
      tanggal = diurai;
    }

    const pengeluaran = await prisma.expense.create({
      data: {
        tanggal,
        nominal,
        kategori: body.kategori,
        metode,
        catatan: typeof body?.catatan === "string" ? body.catatan.trim() || null : null,
        fotoUrl: typeof body?.fotoUrl === "string" ? body.fotoUrl.trim() || null : null,
        // Identitas pencatat SELALU dari sesi — nilai serupa di body diabaikan.
        pencatatId: auth.user.id,
        pencatatNama: actor.name,
      },
    });

    await recordActivityLog({
      action: "TAMBAH",
      entity: "Pengeluaran",
      entityId: pengeluaran.id,
      title: `Pengeluaran ${pengeluaran.kategori}: ${rupiah(pengeluaran.nominal)}`,
      description: `${actor.name} mencatat pengeluaran ${pengeluaran.kategori} sebesar ${rupiah(pengeluaran.nominal)}${pengeluaran.catatan ? ` (${pengeluaran.catatan})` : ""}.`,
      actor,
      metadata: { kategori: pengeluaran.kategori, nominal: pengeluaran.nominal },
    });

    return NextResponse.json(pengeluaran, { status: 201 });
  } catch (error) {
    console.error("Gagal menyimpan pengeluaran:", error);
    return NextResponse.json({ error: "Gagal menyimpan pengeluaran." }, { status: 500 });
  }
}
