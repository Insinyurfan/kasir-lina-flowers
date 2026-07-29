import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { recordActivityLog } from "@/lib/activityLog";
import { actorFromUser, requireRole } from "@/lib/apiAuth";
import {
  hitungSisaTagihan,
  isMetodePembayaran,
  jumlahkanPembayaran,
  turunkanStatus,
} from "@/lib/piutang";
import { normalisasiNominal } from "@/lib/pengeluaran";
import { dariTanggalInputWIB } from "@/lib/waktu";

export const dynamic = "force-dynamic";

const rupiah = (nilai: number) => `Rp${nilai.toLocaleString("id-ID")}`;

// GET /api/pembayaran?transactionId=123 — riwayat pembayaran sebuah transaksi.
export async function GET(request: NextRequest) {
  try {
    const auth = await requireRole(request, ["Owner", "Admin"]);
    if (!auth.ok) return auth.response;

    const transactionId = Number(request.nextUrl.searchParams.get("transactionId"));
    if (!Number.isInteger(transactionId)) {
      return NextResponse.json({ error: "transactionId wajib diisi." }, { status: 400 });
    }

    const transaksi = await prisma.transaction.findUnique({
      where: { id: transactionId },
      select: {
        id: true,
        total_harga: true,
        status: true,
        payments: { orderBy: [{ tanggal: "asc" }, { id: "asc" }] },
      },
    });

    if (!transaksi) {
      return NextResponse.json({ error: "Transaksi tidak ditemukan." }, { status: 404 });
    }

    const totalDibayar = jumlahkanPembayaran(transaksi.payments);

    return NextResponse.json({
      transactionId: transaksi.id,
      totalHarga: transaksi.total_harga,
      totalDibayar,
      sisaTagihan: hitungSisaTagihan(transaksi.total_harga, totalDibayar),
      status: transaksi.status,
      pembayaran: transaksi.payments,
    });
  } catch (error) {
    console.error("Gagal memuat pembayaran:", error);
    return NextResponse.json({ error: "Gagal memuat riwayat pembayaran." }, { status: 500 });
  }
}

// POST /api/pembayaran — catat pembayaran penuh atau sebagian.
//
// Penyisipan pembayaran dan pembaruan `Transaction.status` terjadi dalam SATU
// transaksi basis data, supaya status tidak pernah tertinggal di keadaan salah
// bila salah satu operasi gagal.
export async function POST(request: NextRequest) {
  try {
    const auth = await requireRole(request, ["Owner", "Admin"]);
    if (!auth.ok) return auth.response;
    const actor = actorFromUser(auth.user);

    const body = await request.json();

    const transactionId = Number(body?.transactionId);
    if (!Number.isInteger(transactionId)) {
      return NextResponse.json({ error: "transactionId tidak sah." }, { status: 400 });
    }

    const nominal = normalisasiNominal(body?.nominal);
    if (nominal === null) {
      return NextResponse.json(
        { error: "Nominal pembayaran harus lebih besar dari nol." },
        { status: 400 }
      );
    }

    if (!isMetodePembayaran(body?.metode)) {
      return NextResponse.json({ error: "Metode pembayaran tidak dikenal." }, { status: 400 });
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
      const transaksi = await tx.transaction.findUnique({
        where: { id: transactionId },
        select: {
          id: true,
          trxNumber: true,
          total_harga: true,
          nama_pembeli: true,
          payments: { select: { nominal: true } },
        },
      });

      if (!transaksi) return { gagal: "Transaksi tidak ditemukan." as const, kodeHttp: 404 };

      const sudahDibayar = jumlahkanPembayaran(transaksi.payments);
      const sisa = hitungSisaTagihan(transaksi.total_harga, sudahDibayar);

      if (sisa === 0) {
        return { gagal: "Transaksi ini sudah lunas." as const, kodeHttp: 400 };
      }

      if (nominal > sisa) {
        return {
          gagal: `Pembayaran melebihi sisa tagihan. Sisa tagihan tinggal ${rupiah(sisa)}.` as const,
          kodeHttp: 400,
        };
      }

      const pembayaran = await tx.payment.create({
        data: {
          transactionId,
          tanggal,
          nominal,
          metode: body.metode,
          catatan: typeof body?.catatan === "string" ? body.catatan.trim() || null : null,
          // Identitas SELALU dari sesi, bukan dari body.
          pencatatId: auth.user.id,
          pencatatNama: actor.name,
        },
      });

      const totalDibayar = sudahDibayar + nominal;
      const status = turunkanStatus(transaksi.total_harga, totalDibayar);
      await tx.transaction.update({ where: { id: transactionId }, data: { status } });

      return {
        pembayaran,
        transaksi,
        totalDibayar,
        sisaTagihan: hitungSisaTagihan(transaksi.total_harga, totalDibayar),
        status,
      };
    });

    if ("gagal" in hasil) {
      return NextResponse.json({ error: hasil.gagal }, { status: hasil.kodeHttp });
    }

    const nomor = hasil.transaksi.trxNumber
      ? `#${hasil.transaksi.trxNumber}`
      : `ID ${hasil.transaksi.id}`;

    await recordActivityLog({
      action: "TAMBAH",
      entity: "Pembayaran",
      entityId: hasil.pembayaran.id,
      title: `Pembayaran ${rupiah(nominal)} untuk nota ${nomor}`,
      description: `${actor.name} mencatat pembayaran ${rupiah(nominal)} dari ${hasil.transaksi.nama_pembeli || "pelanggan"} untuk nota ${nomor}. Sisa tagihan ${rupiah(hasil.sisaTagihan)}.`,
      actor,
      metadata: {
        transactionId,
        nominal,
        sisaTagihan: hasil.sisaTagihan,
        status: hasil.status,
      },
    });

    return NextResponse.json(
      {
        pembayaran: hasil.pembayaran,
        totalDibayar: hasil.totalDibayar,
        sisaTagihan: hasil.sisaTagihan,
        status: hasil.status,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Gagal mencatat pembayaran:", error);
    return NextResponse.json({ error: "Gagal mencatat pembayaran." }, { status: 500 });
  }
}
