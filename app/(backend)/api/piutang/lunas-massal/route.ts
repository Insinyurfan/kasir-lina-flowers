import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { recordActivityLog } from "@/lib/activityLog";
import { actorFromUser, requireRole } from "@/lib/apiAuth";
import {
  hitungSisaTagihan,
  jumlahkanPembayaran,
  STATUS_LUNAS,
  isMetodePembayaran,
} from "@/lib/piutang";

export const dynamic = "force-dynamic";

const rupiah = (nilai: number) => `Rp${nilai.toLocaleString("id-ID")}`;
const BATAS_SEKALI_PROSES = 500;

// POST /api/piutang/lunas-massal
// Body: { transactionIds: number[], metode?: string, catatan?: string }
//
// Dipakai untuk sesi PEMBERSIHAN AWAL setelah migrasi: banyak transaksi lama
// ber-status "Unpaid" sebenarnya sudah dibayar, hanya statusnya tak pernah
// diperbarui. Endpoint ini membuat satu pembayaran senilai sisa tagihan untuk
// tiap transaksi terpilih, sehingga daftar piutang menjadi bersih dan layak
// dipercaya sejak hari pertama.
export async function POST(request: NextRequest) {
  try {
    const auth = await requireRole(request, ["Owner", "Admin"]);
    if (!auth.ok) return auth.response;
    const actor = actorFromUser(auth.user);

    const body = await request.json();
    const daftarId: unknown = body?.transactionIds;

    if (!Array.isArray(daftarId) || daftarId.length === 0) {
      return NextResponse.json(
        { error: "Pilih dulu transaksi yang mau ditandai lunas." },
        { status: 400 }
      );
    }

    if (daftarId.length > BATAS_SEKALI_PROSES) {
      return NextResponse.json(
        { error: `Maksimal ${BATAS_SEKALI_PROSES} transaksi sekali proses.` },
        { status: 400 }
      );
    }

    const ids = daftarId.map(Number).filter((id) => Number.isInteger(id));
    if (ids.length === 0) {
      return NextResponse.json({ error: "Daftar transaksi tidak sah." }, { status: 400 });
    }

    const metode = isMetodePembayaran(body?.metode) ? body.metode : "Tunai";
    const catatan =
      typeof body?.catatan === "string" && body.catatan.trim()
        ? body.catatan.trim()
        : "Pembersihan piutang lama";

    const hasil = await prisma.$transaction(async (tx) => {
      const transaksi = await tx.transaction.findMany({
        where: { id: { in: ids } },
        select: {
          id: true,
          tanggal: true,
          total_harga: true,
          payments: { select: { nominal: true } },
        },
      });

      let dilunasi = 0;
      let totalNominal = 0;
      let dilewati = 0;

      for (const trx of transaksi) {
        const sisa = hitungSisaTagihan(trx.total_harga, jumlahkanPembayaran(trx.payments));
        if (sisa <= 0) {
          dilewati += 1;
          continue;
        }

        await tx.payment.create({
          data: {
            transactionId: trx.id,
            // Bertanggal transaksi, bukan hari ini — supaya laporan kas periode
            // lampau tidak mendadak melonjak karena sesi pembersihan.
            tanggal: trx.tanggal,
            nominal: sisa,
            metode,
            catatan,
            pencatatId: auth.user.id,
            pencatatNama: actor.name,
          },
        });

        await tx.transaction.update({ where: { id: trx.id }, data: { status: STATUS_LUNAS } });

        dilunasi += 1;
        totalNominal += sisa;
      }

      return { dilunasi, totalNominal, dilewati, tidakDitemukan: ids.length - transaksi.length };
    });

    await recordActivityLog({
      action: "UPDATE",
      entity: "Piutang",
      entityId: null,
      title: `Pelunasan massal ${hasil.dilunasi} nota (${rupiah(hasil.totalNominal)})`,
      description: `${actor.name} menandai ${hasil.dilunasi} transaksi sebagai lunas sekaligus senilai ${rupiah(hasil.totalNominal)} — ${catatan}.`,
      actor,
      metadata: { ...hasil, transactionIds: ids },
    });

    return NextResponse.json(hasil);
  } catch (error) {
    console.error("Gagal menandai lunas massal:", error);
    return NextResponse.json({ error: "Gagal menandai lunas massal." }, { status: 500 });
  }
}
