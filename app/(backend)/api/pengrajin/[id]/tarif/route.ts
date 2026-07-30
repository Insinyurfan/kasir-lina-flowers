import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { recordActivityLog } from "@/lib/activityLog";
import { actorFromUser, requireRole, requireUser } from "@/lib/apiAuth";
import { normalisasiTarif } from "@/lib/pengrajin";

export const dynamic = "force-dynamic";

const rupiah = (nilai: number) => `Rp${nilai.toLocaleString("id-ID")}`;

const ambilId = async (params: Promise<{ id: string }>) => {
  const { id } = await params;
  const angka = Number(id);
  return Number.isInteger(angka) ? angka : null;
};

// GET /api/pengrajin/[id]/tarif
// Seluruh produk aktif beserta tarif khususnya (bila ada), sehingga antarmuka
// dapat menandai produk mana yang masih memakai tarif cadangan.
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireUser(request);
    if (!auth.ok) return auth.response;

    const pengrajinId = await ambilId(params);
    if (pengrajinId === null) {
      return NextResponse.json({ error: "ID pengrajin tidak sah." }, { status: 400 });
    }

    const pengrajin = await prisma.pengrajin.findUnique({
      where: { id: pengrajinId },
      select: { id: true, nama: true, tarifCadangan: true, satuanTarif: true },
    });
    if (!pengrajin) {
      return NextResponse.json({ error: "Pengrajin tidak ditemukan." }, { status: 404 });
    }

    const [produk, tarif] = await Promise.all([
      prisma.product.findMany({
        where: { isArchived: false },
        select: { id: true, nama_produk: true, satuanHarga: true },
        orderBy: { nama_produk: "asc" },
      }),
      prisma.tarifPengrajin.findMany({ where: { pengrajinId } }),
    ]);

    const tarifPerProduk = new Map(tarif.map((baris) => [baris.productId, baris.tarif]));

    return NextResponse.json({
      pengrajin,
      produk: produk.map((p) => {
        const khusus = tarifPerProduk.get(p.id) ?? null;
        return {
          productId: p.id,
          namaProduk: p.nama_produk,
          satuanHarga: p.satuanHarga,
          tarifKhusus: khusus,
          // Tarif yang benar-benar dipakai bila ada setoran hari ini.
          tarifBerlaku: khusus ?? pengrajin.tarifCadangan,
          pakaiCadangan: khusus === null && pengrajin.tarifCadangan !== null,
          belumAdaTarif: khusus === null && pengrajin.tarifCadangan === null,
        };
      }),
    });
  } catch (error) {
    console.error("Gagal memuat tarif pengrajin:", error);
    return NextResponse.json({ error: "Gagal memuat tarif pengrajin." }, { status: 500 });
  }
}

// PUT /api/pengrajin/[id]/tarif — tetapkan atau ubah tarif satu produk.
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireRole(request, ["Owner", "Admin"]);
    if (!auth.ok) return auth.response;
    const actor = actorFromUser(auth.user);

    const pengrajinId = await ambilId(params);
    if (pengrajinId === null) {
      return NextResponse.json({ error: "ID pengrajin tidak sah." }, { status: 400 });
    }

    const body = await request.json();
    const productId = Number(body?.productId);
    if (!Number.isInteger(productId)) {
      return NextResponse.json({ error: "Produk tidak sah." }, { status: 400 });
    }

    const tarif = normalisasiTarif(body?.tarif);
    if (tarif === null) {
      return NextResponse.json(
        { error: "Tarif harus berupa angka lebih besar dari nol." },
        { status: 400 }
      );
    }

    const [pengrajin, produk] = await Promise.all([
      prisma.pengrajin.findUnique({ where: { id: pengrajinId }, select: { nama: true } }),
      prisma.product.findUnique({ where: { id: productId }, select: { nama_produk: true } }),
    ]);

    if (!pengrajin) {
      return NextResponse.json({ error: "Pengrajin tidak ditemukan." }, { status: 404 });
    }
    if (!produk) {
      return NextResponse.json({ error: "Produk tidak ditemukan." }, { status: 404 });
    }

    const hasil = await prisma.tarifPengrajin.upsert({
      where: { pengrajinId_productId: { pengrajinId, productId } },
      create: { pengrajinId, productId, tarif },
      update: { tarif },
    });

    await recordActivityLog({
      action: "UPDATE",
      entity: "TarifPengrajin",
      entityId: hasil.id,
      title: `Tarif ${pengrajin.nama} — ${produk.nama_produk}: ${rupiah(tarif)}`,
      description: `${actor.name} menetapkan tarif ${pengrajin.nama} untuk ${produk.nama_produk} sebesar ${rupiah(tarif)}. Setoran yang sudah tercatat TIDAK berubah karena memakai tarif snapshot.`,
      actor,
      metadata: { pengrajinId, productId, tarif },
    });

    return NextResponse.json(hasil);
  } catch (error) {
    console.error("Gagal menyimpan tarif:", error);
    return NextResponse.json({ error: "Gagal menyimpan tarif." }, { status: 500 });
  }
}

// DELETE /api/pengrajin/[id]/tarif?productId=123 — hapus tarif khusus,
// sehingga produk itu kembali memakai tarif cadangan.
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireRole(request, ["Owner", "Admin"]);
    if (!auth.ok) return auth.response;
    const actor = actorFromUser(auth.user);

    const pengrajinId = await ambilId(params);
    if (pengrajinId === null) {
      return NextResponse.json({ error: "ID pengrajin tidak sah." }, { status: 400 });
    }

    const productId = Number(request.nextUrl.searchParams.get("productId"));
    if (!Number.isInteger(productId)) {
      return NextResponse.json({ error: "productId wajib diisi." }, { status: 400 });
    }

    const ada = await prisma.tarifPengrajin.findUnique({
      where: { pengrajinId_productId: { pengrajinId, productId } },
      include: {
        pengrajin: { select: { nama: true, tarifCadangan: true } },
        product: { select: { nama_produk: true } },
      },
    });

    if (!ada) {
      return NextResponse.json({ error: "Tarif khusus ini tidak ada." }, { status: 404 });
    }

    await prisma.tarifPengrajin.delete({
      where: { pengrajinId_productId: { pengrajinId, productId } },
    });

    await recordActivityLog({
      action: "HAPUS",
      entity: "TarifPengrajin",
      entityId: ada.id,
      title: `Tarif khusus dihapus: ${ada.pengrajin.nama} — ${ada.product.nama_produk}`,
      description: `${actor.name} menghapus tarif khusus ${ada.pengrajin.nama} untuk ${ada.product.nama_produk}. ${
        ada.pengrajin.tarifCadangan
          ? `Selanjutnya memakai tarif cadangan ${rupiah(ada.pengrajin.tarifCadangan)}.`
          : "Pengrajin ini belum punya tarif cadangan, jadi setoran produk itu akan ditolak sampai tarifnya diatur."
      }`,
      actor,
    });

    return NextResponse.json({ sukses: true });
  } catch (error) {
    console.error("Gagal menghapus tarif:", error);
    return NextResponse.json({ error: "Gagal menghapus tarif." }, { status: 500 });
  }
}
