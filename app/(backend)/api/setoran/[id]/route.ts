import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { recordActivityLog } from "@/lib/activityLog";
import { actorFromUser, requireRole } from "@/lib/apiAuth";

export const dynamic = "force-dynamic";

const rupiah = (nilai: number) => `Rp${nilai.toLocaleString("id-ID")}`;

// DELETE /api/setoran/[id] — koreksi setoran salah catat.
//
// Menghapusnya mengurangi saldo PENERIMA (bukan pekerja, kalau keduanya beda)
// dan mengembalikan sisa penugasan di papan tugas. Saldo dihitung dari buku
// besar, jadi tidak ada angka yang perlu disesuaikan manual.
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireRole(request, ["Owner", "Admin"]);
    if (!auth.ok) return auth.response;
    const actor = actorFromUser(auth.user);

    const { id: idParam } = await params;
    const id = Number(idParam);
    if (!Number.isInteger(id)) {
      return NextResponse.json({ error: "ID setoran tidak sah." }, { status: 400 });
    }

    const setoran = await prisma.setoran.findUnique({
      where: { id },
      include: {
        pengrajin: { select: { id: true, nama: true } },
        penerima: { select: { id: true, nama: true } },
        penugasan: {
          select: {
            id: true,
            jumlahDitugaskan: true,
            transactionItem: {
              select: { satuanHarga: true, product: { select: { nama_produk: true } } },
            },
          },
        },
      },
    });

    if (!setoran) {
      return NextResponse.json({ error: "Setoran tidak ditemukan." }, { status: 404 });
    }

    // Peringatan yang tidak bisa dicegah sistem: kalau upahnya sudah terlanjur
    // ditarik, menghapus setoran membuat saldo penerima menjadi minus. Itu
    // memang keadaan yang benar (kelebihan bayar) dan harus terlihat apa adanya.
    const [totalNilai, totalTarik] = await Promise.all([
      prisma.setoran.aggregate({
        where: { penerimaId: setoran.penerimaId },
        _sum: { nilai: true },
      }),
      prisma.penarikan.aggregate({
        where: { pengrajinId: setoran.penerimaId },
        _sum: { nominal: true },
      }),
    ]);

    const saldoSesudah =
      (totalNilai._sum.nilai ?? 0) - setoran.nilai - (totalTarik._sum.nominal ?? 0);

    await prisma.setoran.delete({ where: { id } });

    const bedaPenerima = setoran.penerimaId !== setoran.pengrajinId;
    const produk = setoran.penugasan.transactionItem.product.nama_produk;
    const satuan = setoran.penugasan.transactionItem.satuanHarga;

    await recordActivityLog({
      action: "HAPUS",
      entity: "Setoran",
      entityId: id,
      title: `Setoran dihapus: ${setoran.pengrajin.nama} — ${setoran.jumlah} ${satuan} ${produk}`,
      description: `${actor.name} menghapus setoran ${setoran.jumlah} ${satuan} ${produk} dari ${setoran.pengrajin.nama} senilai ${rupiah(setoran.nilai)}. Saldo ${setoran.penerima.nama} berkurang menjadi ${rupiah(saldoSesudah)}${
        bedaPenerima ? " (penerima berbeda dari pekerjanya)" : ""
      }.`,
      actor,
      metadata: { setoran, saldoSesudah },
    });

    return NextResponse.json({
      sukses: true,
      saldoPenerima: saldoSesudah,
      // Saldo minus berarti upah sudah terlanjur ditarik melebihi setoran yang
      // tersisa — perlu diketahui pemakainya, bukan disembunyikan.
      peringatanSaldoMinus: saldoSesudah < 0,
    });
  } catch (error) {
    console.error("Gagal menghapus setoran:", error);
    return NextResponse.json({ error: "Gagal menghapus setoran." }, { status: 500 });
  }
}
