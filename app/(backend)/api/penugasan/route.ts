import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { recordActivityLog } from "@/lib/activityLog";
import { actorFromUser, requireRole } from "@/lib/apiAuth";
import { normalisasiJumlah, sisaBelumDitugaskan, tenggatBawaan } from "@/lib/pengrajin";
import { awalHariWIB, dariTanggalInputWIB } from "@/lib/waktu";

export const dynamic = "force-dynamic";

// POST /api/penugasan — tetapkan pekerjaan pada sebuah baris pesanan.
//
// Penugasan menempel pada TransactionItem, bukan Transaction: dalam satu nota,
// Bando Satin dan Bando Pompom bisa dipegang orang berbeda. Satu baris pun
// boleh dibagi ke beberapa pengrajin, jadi yang divalidasi adalah TOTAL.
export async function POST(request: NextRequest) {
  try {
    const auth = await requireRole(request, ["Owner", "Admin"]);
    if (!auth.ok) return auth.response;
    const actor = actorFromUser(auth.user);

    const body = await request.json();

    const transactionItemId = Number(body?.transactionItemId);
    if (!Number.isInteger(transactionItemId)) {
      return NextResponse.json({ error: "Baris pesanan tidak sah." }, { status: 400 });
    }

    const pengrajinId = Number(body?.pengrajinId);
    if (!Number.isInteger(pengrajinId)) {
      return NextResponse.json({ error: "Pengrajin belum dipilih." }, { status: 400 });
    }

    const jumlahDitugaskan = normalisasiJumlah(body?.jumlahDitugaskan);
    if (jumlahDitugaskan === null) {
      return NextResponse.json(
        { error: "Jumlah yang ditugaskan harus lebih besar dari nol." },
        { status: 400 }
      );
    }

    let tenggat = tenggatBawaan();
    if (typeof body?.tenggat === "string" && body.tenggat.trim()) {
      const diurai = dariTanggalInputWIB(body.tenggat);
      if (!diurai) {
        return NextResponse.json(
          { error: "Tanggal tenggat tidak sah. Pakai format YYYY-MM-DD." },
          { status: 400 }
        );
      }
      tenggat = diurai;
    }

    const hasil = await prisma.$transaction(async (tx) => {
      const baris = await tx.transactionItem.findUnique({
        where: { id: transactionItemId },
        select: {
          id: true,
          jumlah: true,
          satuanHarga: true,
          product: { select: { nama_produk: true } },
          transaction: { select: { trxNumber: true, nama_pembeli: true } },
          penugasan: { select: { jumlahDitugaskan: true } },
        },
      });

      if (!baris) return { gagal: "Baris pesanan tidak ditemukan." as const, kodeHttp: 404 };

      const pengrajin = await tx.pengrajin.findUnique({
        where: { id: pengrajinId },
        select: { id: true, nama: true, aktif: true },
      });

      if (!pengrajin) return { gagal: "Pengrajin tidak ditemukan." as const, kodeHttp: 404 };
      if (!pengrajin.aktif) {
        return {
          gagal: `${pengrajin.nama} sudah tidak aktif, jadi tidak bisa diberi pekerjaan baru.` as const,
          kodeHttp: 400,
        };
      }

      const sisa = sisaBelumDitugaskan(baris.jumlah, baris.penugasan);
      if (jumlahDitugaskan > sisa) {
        return {
          gagal:
            sisa === 0
              ? (`Baris ini sudah ditugaskan seluruhnya (${baris.jumlah} ${baris.satuanHarga}).` as const)
              : (`Sisa yang masih boleh ditugaskan hanya ${sisa} ${baris.satuanHarga}.` as const),
          kodeHttp: 400,
        };
      }

      const penugasan = await tx.penugasan.create({
        data: {
          transactionItemId,
          pengrajinId,
          jumlahDitugaskan,
          tenggat,
          catatan: typeof body?.catatan === "string" ? body.catatan.trim() || null : null,
          pembuatId: auth.user.id,
          pembuatNama: actor.name,
        },
      });

      return { penugasan, baris, pengrajin, sisaBaru: sisa - jumlahDitugaskan };
    });

    if ("gagal" in hasil) {
      return NextResponse.json({ error: hasil.gagal }, { status: hasil.kodeHttp });
    }

    const nomor = hasil.baris.transaction.trxNumber
      ? `#${hasil.baris.transaction.trxNumber}`
      : `ID ${transactionItemId}`;

    await recordActivityLog({
      action: "TAMBAH",
      entity: "Penugasan",
      entityId: hasil.penugasan.id,
      title: `${hasil.pengrajin.nama} ditugaskan ${jumlahDitugaskan} ${hasil.baris.satuanHarga} ${hasil.baris.product.nama_produk}`,
      description: `${actor.name} menugaskan ${jumlahDitugaskan} ${hasil.baris.satuanHarga} ${hasil.baris.product.nama_produk} untuk ${hasil.baris.transaction.nama_pembeli || "pelanggan"} (nota ${nomor}) kepada ${hasil.pengrajin.nama}.`,
      actor,
      metadata: {
        transactionItemId,
        pengrajinId,
        jumlahDitugaskan,
        tenggat,
        sisaBelumDitugaskan: hasil.sisaBaru,
      },
    });

    return NextResponse.json(hasil.penugasan, { status: 201 });
  } catch (error) {
    console.error("Gagal menetapkan penugasan:", error);
    return NextResponse.json({ error: "Gagal menetapkan penugasan." }, { status: 500 });
  }
}

// GET /api/penugasan?transactionItemId=123 — penugasan pada satu baris pesanan.
export async function GET(request: NextRequest) {
  try {
    const auth = await requireRole(request, ["Owner", "Admin"]);
    if (!auth.ok) return auth.response;

    const transactionItemId = Number(request.nextUrl.searchParams.get("transactionItemId"));
    if (!Number.isInteger(transactionItemId)) {
      return NextResponse.json({ error: "transactionItemId wajib diisi." }, { status: 400 });
    }

    const baris = await prisma.transactionItem.findUnique({
      where: { id: transactionItemId },
      select: {
        id: true,
        jumlah: true,
        satuanHarga: true,
        penugasan: {
          include: {
            pengrajin: { select: { id: true, nama: true } },
            setoran: { select: { jumlah: true } },
          },
          orderBy: { id: "asc" },
        },
      },
    });

    if (!baris) {
      return NextResponse.json({ error: "Baris pesanan tidak ditemukan." }, { status: 404 });
    }

    return NextResponse.json({
      ...baris,
      sisaBelumDitugaskan: sisaBelumDitugaskan(baris.jumlah, baris.penugasan),
      hariIniWIB: awalHariWIB(new Date()),
    });
  } catch (error) {
    console.error("Gagal memuat penugasan:", error);
    return NextResponse.json({ error: "Gagal memuat penugasan." }, { status: 500 });
  }
}
