import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { recordActivityLog } from "@/lib/activityLog";
import { actorFromUser, requireRole } from "@/lib/apiAuth";

export const dynamic = "force-dynamic";

const rupiah = (nilai: number) => `Rp${nilai.toLocaleString("id-ID")}`;

// DELETE /api/penarikan/[id] — batalkan pencairan upah.
//
// Penarikan dan Expense tertautnya dihapus BERSAMA-SAMA, supaya halaman
// Pengrajin dan Laba Rugi tidak pernah berbeda untuk kejadian yang sama.
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireRole(request, ["Owner", "Admin"]);
    if (!auth.ok) return auth.response;
    const actor = actorFromUser(auth.user);

    const { id: idParam } = await params;
    const id = Number(idParam);
    if (!Number.isInteger(id)) {
      return NextResponse.json({ error: "ID penarikan tidak sah." }, { status: 400 });
    }

    const hasil = await prisma.$transaction(async (tx) => {
      const penarikan = await tx.penarikan.findUnique({
        where: { id },
        include: { pengrajin: { select: { id: true, nama: true } } },
      });

      if (!penarikan) return { gagal: "Penarikan tidak ditemukan." as const };

      await tx.penarikan.delete({ where: { id } });

      // Expense hasil penarikan ini ikut hilang. Kalau expense-nya sudah
      // terlanjur dihapus dari tempat lain, penghapusan tetap lanjut — yang
      // penting keduanya berakhir sama-sama tidak ada.
      if (penarikan.expenseId) {
        await tx.expense.deleteMany({ where: { id: penarikan.expenseId } });
      }

      const [totalNilai, totalTarik] = await Promise.all([
        tx.setoran.aggregate({
          where: { penerimaId: penarikan.pengrajinId },
          _sum: { nilai: true },
        }),
        tx.penarikan.aggregate({
          where: { pengrajinId: penarikan.pengrajinId },
          _sum: { nominal: true },
        }),
      ]);

      return {
        penarikan,
        saldoSesudah: (totalNilai._sum.nilai ?? 0) - (totalTarik._sum.nominal ?? 0),
      };
    });

    if ("gagal" in hasil) {
      return NextResponse.json({ error: hasil.gagal }, { status: 404 });
    }

    await recordActivityLog({
      action: "HAPUS",
      entity: "Penarikan",
      entityId: id,
      title: `Pencairan upah dibatalkan: ${hasil.penarikan.pengrajin.nama} ${rupiah(hasil.penarikan.nominal)}`,
      description: `${actor.name} membatalkan pencairan upah ${rupiah(hasil.penarikan.nominal)} untuk ${hasil.penarikan.pengrajin.nama}. Pengeluaran Upah Pengrajin yang tertaut ikut dihapus, dan saldo kembali menjadi ${rupiah(hasil.saldoSesudah)}.`,
      actor,
      metadata: { penarikan: hasil.penarikan, saldoSesudah: hasil.saldoSesudah },
    });

    return NextResponse.json({ sukses: true, saldo: hasil.saldoSesudah });
  } catch (error) {
    console.error("Gagal membatalkan penarikan:", error);
    return NextResponse.json({ error: "Gagal membatalkan penarikan." }, { status: 500 });
  }
}
