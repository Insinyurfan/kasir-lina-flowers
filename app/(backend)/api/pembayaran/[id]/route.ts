import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { recordActivityLog } from "@/lib/activityLog";
import { actorFromUser, requireRole } from "@/lib/apiAuth";
import { hitungSisaTagihan, jumlahkanPembayaran, turunkanStatus } from "@/lib/piutang";

export const dynamic = "force-dynamic";

const rupiah = (nilai: number) => `Rp${nilai.toLocaleString("id-ID")}`;

// DELETE /api/pembayaran/[id] — batalkan pembayaran yang salah catat.
//
// Penghapusan dan penghitungan ulang `Transaction.status` terjadi dalam satu
// transaksi basis data, sehingga transaksi yang tadinya lunas otomatis kembali
// menjadi piutang dengan sisa sebesar nominal yang dihapus.
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireRole(request, ["Owner", "Admin"]);
    if (!auth.ok) return auth.response;
    const actor = actorFromUser(auth.user);

    const { id: idParam } = await params;
    const id = Number(idParam);
    if (!Number.isInteger(id)) {
      return NextResponse.json({ error: "ID pembayaran tidak sah." }, { status: 400 });
    }

    const hasil = await prisma.$transaction(async (tx) => {
      const pembayaran = await tx.payment.findUnique({
        where: { id },
        select: {
          id: true,
          nominal: true,
          transactionId: true,
          transaction: { select: { id: true, trxNumber: true, total_harga: true, nama_pembeli: true } },
        },
      });

      if (!pembayaran) return { gagal: "Pembayaran tidak ditemukan." as const };

      await tx.payment.delete({ where: { id } });

      const tersisa = await tx.payment.findMany({
        where: { transactionId: pembayaran.transactionId },
        select: { nominal: true },
      });

      const totalDibayar = jumlahkanPembayaran(tersisa);
      const status = turunkanStatus(pembayaran.transaction.total_harga, totalDibayar);
      await tx.transaction.update({
        where: { id: pembayaran.transactionId },
        data: { status },
      });

      return {
        pembayaran,
        totalDibayar,
        sisaTagihan: hitungSisaTagihan(pembayaran.transaction.total_harga, totalDibayar),
        status,
      };
    });

    if ("gagal" in hasil) {
      return NextResponse.json({ error: hasil.gagal }, { status: 404 });
    }

    const transaksi = hasil.pembayaran.transaction;
    const nomor = transaksi.trxNumber ? `#${transaksi.trxNumber}` : `ID ${transaksi.id}`;

    await recordActivityLog({
      action: "HAPUS",
      entity: "Pembayaran",
      entityId: id,
      title: `Pembayaran ${rupiah(hasil.pembayaran.nominal)} dibatalkan (nota ${nomor})`,
      description: `${actor.name} menghapus pembayaran ${rupiah(hasil.pembayaran.nominal)} pada nota ${nomor}. Sisa tagihan kembali menjadi ${rupiah(hasil.sisaTagihan)}.`,
      actor,
      metadata: {
        transactionId: transaksi.id,
        nominalDihapus: hasil.pembayaran.nominal,
        sisaTagihan: hasil.sisaTagihan,
        status: hasil.status,
      },
    });

    return NextResponse.json({
      sukses: true,
      totalDibayar: hasil.totalDibayar,
      sisaTagihan: hasil.sisaTagihan,
      status: hasil.status,
    });
  } catch (error) {
    console.error("Gagal menghapus pembayaran:", error);
    return NextResponse.json({ error: "Gagal menghapus pembayaran." }, { status: 500 });
  }
}
