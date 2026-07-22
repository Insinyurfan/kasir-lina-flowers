import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { recordActivityLog } from "@/lib/activityLog";
import { actorFromUser, requireRole } from "@/lib/apiAuth";

export async function POST(request: Request) {
  try {
    // Hapus massal riwayat transaksi hanya Owner (dicek di server, bukan cuma UI).
    const auth = await requireRole(request, ["Owner"]);
    if (!auth.ok) return auth.response;
    const actor = actorFromUser(auth.user);

    const payload = await request.json();
    const { ids } = payload;
    const cleanIds = Array.isArray(ids) ? ids.map((id) => Number(id)).filter((id) => Number.isFinite(id)) : [];
    const transactions = await prisma.transaction.findMany({
      where: { id: { in: cleanIds } },
      select: {
        id: true,
        total_harga: true,
        nama_pembeli: true,
        nama_kasir: true,
        status: true,
        status_pengiriman: true,
      },
    });
    await prisma.transaction.deleteMany({
      where: { id: { in: cleanIds } }
    });
    await recordActivityLog({
      action: "HAPUS",
      entity: "Transaksi",
      title: `${transactions.length} transaksi dihapus`,
      description: `${actor.name} menghapus ${transactions.length} transaksi sekaligus.`,
      actor,
      metadata: {
        ids: cleanIds,
        transaksi: transactions.map((transaction) => ({
          id: transaction.id,
          total_harga: transaction.total_harga,
          nama_pembeli: transaction.nama_pembeli,
          nama_kasir: transaction.nama_kasir,
          status: transaction.status,
          status_pengiriman: transaction.status_pengiriman,
        })),
      },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Gagal menghapus" }, { status: 500 });
  }
}
