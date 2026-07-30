import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { recordActivityLog } from "@/lib/activityLog";
import { actorFromUser, requireRole } from "@/lib/apiAuth";
import {
  normalisasiJumlah,
  sisaPenugasan,
  tentukanPenerima,
  tentukanTarif,
} from "@/lib/pengrajin";
import { dariTanggalInputWIB } from "@/lib/waktu";

export const dynamic = "force-dynamic";

const rupiah = (nilai: number) => `Rp${nilai.toLocaleString("id-ID")}`;

// POST /api/setoran — catat barang jadi yang diserahkan pengrajin.
//
// SATU kejadian ini menggerakkan dua hal sekaligus: mengurangi sisa penugasan
// di papan tugas, dan menambah saldo upah penerimanya. Itulah sebabnya papan
// tugas dan upah dibangun sebagai satu change — kalau dipisah, "barang sudah
// disetor" harus dicatat dua kali dan keduanya bisa berbeda.
export async function POST(request: NextRequest) {
  try {
    const auth = await requireRole(request, ["Owner", "Admin"]);
    if (!auth.ok) return auth.response;
    const actor = actorFromUser(auth.user);

    const body = await request.json();

    const penugasanId = Number(body?.penugasanId);
    if (!Number.isInteger(penugasanId)) {
      return NextResponse.json({ error: "Penugasan tidak sah." }, { status: 400 });
    }

    const jumlah = normalisasiJumlah(body?.jumlah);
    if (jumlah === null) {
      return NextResponse.json(
        { error: "Jumlah setoran harus lebih besar dari nol." },
        { status: 400 }
      );
    }

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

    const hasil = await prisma.$transaction(async (tx) => {
      const penugasan = await tx.penugasan.findUnique({
        where: { id: penugasanId },
        include: {
          setoran: { select: { jumlah: true } },
          pengrajin: {
            select: {
              id: true,
              nama: true,
              tarifCadangan: true,
              penerimaUpah: true,
              kelompok: { select: { ketuaId: true } },
            },
          },
          transactionItem: {
            select: {
              satuanHarga: true,
              productId: true,
              product: { select: { nama_produk: true } },
              transaction: { select: { trxNumber: true, nama_pembeli: true } },
            },
          },
        },
      });

      if (!penugasan) return { gagal: "Penugasan tidak ditemukan." as const, kodeHttp: 404 };

      const sisa = sisaPenugasan(penugasan.jumlahDitugaskan, penugasan.setoran);
      if (sisa <= 0) {
        return {
          gagal: "Penugasan ini sudah disetor seluruhnya." as const,
          kodeHttp: 400,
        };
      }
      if (jumlah > sisa) {
        return {
          gagal:
            `Setoran melebihi sisa penugasan. Sisa tinggal ${sisa} ${penugasan.transactionItem.satuanHarga}.` as const,
          kodeHttp: 400,
        };
      }

      // Tarif: khusus produk ini lebih dulu, lalu tarif cadangan pengrajin.
      const tarifKhusus = await tx.tarifPengrajin.findUnique({
        where: {
          pengrajinId_productId: {
            pengrajinId: penugasan.pengrajin.id,
            productId: penugasan.transactionItem.productId,
          },
        },
        select: { tarif: true },
      });

      const tarif = tentukanTarif({
        namaPengrajin: penugasan.pengrajin.nama,
        namaProduk: penugasan.transactionItem.product.nama_produk,
        tarifProduk: tarifKhusus?.tarif,
        tarifCadangan: penugasan.pengrajin.tarifCadangan,
      });

      if (!tarif.ok) return { gagal: tarif.alasan, kodeHttp: 400 };

      // Penerima ditentukan SEKARANG lalu disimpan — jangan dihitung ulang saat
      // dibaca, supaya perubahan struktur kelompok kelak tidak memindahkan
      // upah yang sudah tercatat.
      const penerimaId = tentukanPenerima(penugasan.pengrajin);

      const setoran = await tx.setoran.create({
        data: {
          penugasanId,
          pengrajinId: penugasan.pengrajin.id,
          penerimaId,
          tanggal,
          jumlah,
          tarifSnapshot: tarif.tarif,
          pakaiTarifCadangan: tarif.pakaiCadangan,
          nilai: jumlah * tarif.tarif,
          catatan: typeof body?.catatan === "string" ? body.catatan.trim() || null : null,
          pencatatId: auth.user.id,
          pencatatNama: actor.name,
        },
      });

      const penerima =
        penerimaId === penugasan.pengrajin.id
          ? { id: penerimaId, nama: penugasan.pengrajin.nama }
          : await tx.pengrajin.findUnique({
              where: { id: penerimaId },
              select: { id: true, nama: true },
            });

      return {
        setoran,
        penugasan,
        penerima,
        sisaBaru: sisa - jumlah,
        pakaiCadangan: tarif.pakaiCadangan,
      };
    });

    if ("gagal" in hasil) {
      return NextResponse.json({ error: hasil.gagal }, { status: hasil.kodeHttp });
    }

    const item = hasil.penugasan.transactionItem;
    const nomor = item.transaction.trxNumber ? `#${item.transaction.trxNumber}` : "";
    const pekerja = hasil.penugasan.pengrajin.nama;
    const namaPenerima = hasil.penerima?.nama ?? pekerja;
    const beda = namaPenerima !== pekerja;

    await recordActivityLog({
      action: "TAMBAH",
      entity: "Setoran",
      entityId: hasil.setoran.id,
      title: `Setoran ${pekerja}: ${jumlah} ${item.satuanHarga} ${item.product.nama_produk}`,
      description: `${actor.name} mencatat setoran ${jumlah} ${item.satuanHarga} ${item.product.nama_produk} dari ${pekerja}${nomor ? ` (nota ${nomor})` : ""} bernilai ${rupiah(hasil.setoran.nilai)}${
        beda ? `, masuk ke saldo ${namaPenerima}` : ""
      }. Sisa penugasan ${hasil.sisaBaru} ${item.satuanHarga}.${
        hasil.pakaiCadangan ? " Memakai tarif cadangan karena produk ini belum punya tarif khusus." : ""
      }`,
      actor,
      metadata: {
        penugasanId,
        jumlah,
        nilai: hasil.setoran.nilai,
        pekerjaId: hasil.penugasan.pengrajin.id,
        penerimaId: hasil.setoran.penerimaId,
        pakaiTarifCadangan: hasil.pakaiCadangan,
        sisaPenugasan: hasil.sisaBaru,
      },
    });

    return NextResponse.json(
      {
        setoran: hasil.setoran,
        sisaPenugasan: hasil.sisaBaru,
        penerima: hasil.penerima,
        pakaiTarifCadangan: hasil.pakaiCadangan,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Gagal mencatat setoran:", error);
    return NextResponse.json({ error: "Gagal mencatat setoran." }, { status: 500 });
  }
}
