import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/apiAuth";
import {
  KATEGORI_BIAYA_USAHA,
  KATEGORI_PENGELUARAN,
  KATEGORI_PRIVE,
  type KategoriPengeluaran,
} from "@/lib/pengeluaran";
import {
  labelBulanWIB,
  rentangBulanSebelumnyaWIB,
  rentangBulanWIB,
  rentangDariQuery,
} from "@/lib/waktu";

export const dynamic = "force-dynamic";

type Rentang = { mulai: Date; selesai: Date };

type RingkasanPeriode = {
  rentang: Rentang;
  label: string;
  omzet: number;
  jumlahTransaksi: number;
  biayaUsaha: number;
  perKategori: { kategori: KategoriPengeluaran; nominal: number; porsi: number }[];
  labaUsaha: number;
  rugi: boolean;
  kasMasuk: number;
  kasKeluar: number;
  posisiKas: number;
  prive: number;
  kenaikanPiutang: number;
  jembatanSeimbang: boolean;
};

// Periode pembanding: bila rentangnya persis satu bulan kalender, pakai bulan
// sebelumnya. Untuk rentang bebas, pakai rentang sepanjang yang sama tepat
// sebelumnya — supaya perbandingannya adil.
const rentangPembanding = (rentang: Rentang): Rentang => {
  const bulanIni = rentangBulanWIB(rentang.mulai);
  const persisSatuBulan =
    bulanIni.mulai.getTime() === rentang.mulai.getTime() &&
    bulanIni.selesai.getTime() === rentang.selesai.getTime();

  if (persisSatuBulan) return rentangBulanSebelumnyaWIB(rentang.mulai);

  const panjang = rentang.selesai.getTime() - rentang.mulai.getTime();
  return {
    mulai: new Date(rentang.mulai.getTime() - panjang - 1),
    selesai: new Date(rentang.mulai.getTime() - 1),
  };
};

const hitungPeriode = async (rentang: Rentang): Promise<RingkasanPeriode> => {
  const dalamRentang = { gte: rentang.mulai, lte: rentang.selesai };

  const [agregatTransaksi, agregatPembayaran, pengeluaran] = await Promise.all([
    // Omzet berbasis AKRUAL: seluruh transaksi bertanggal dalam periode ini,
    // terlepas sudah dibayar atau belum.
    prisma.transaction.aggregate({
      where: { tanggal: dalamRentang },
      _sum: { total_harga: true },
      _count: { _all: true },
    }),
    // Kas masuk: uang yang BENAR-BENAR diterima dalam periode ini, termasuk
    // pelunasan atas transaksi dari periode sebelumnya.
    prisma.payment.aggregate({
      where: { tanggal: dalamRentang },
      _sum: { nominal: true },
    }),
    prisma.expense.groupBy({
      by: ["kategori"],
      where: { tanggal: dalamRentang },
      _sum: { nominal: true },
    }),
  ]);

  const omzet = agregatTransaksi._sum.total_harga ?? 0;
  const jumlahTransaksi = agregatTransaksi._count._all;
  const kasMasuk = agregatPembayaran._sum.nominal ?? 0;

  const nominalKategori = new Map<string, number>(
    pengeluaran.map((baris) => [baris.kategori, baris._sum.nominal ?? 0])
  );

  const biayaUsaha = KATEGORI_BIAYA_USAHA.reduce(
    (jumlah, kategori) => jumlah + (nominalKategori.get(kategori) ?? 0),
    0
  );
  const prive = nominalKategori.get(KATEGORI_PRIVE) ?? 0;

  // Ambilan pribadi TIDAK mengurangi laba usaha — itu pembagian keuntungan,
  // bukan ongkos menjalankan usaha.
  const labaUsaha = omzet - biayaUsaha;

  // Kas keluar mencakup SEMUA pengeluaran, termasuk ambilan pribadi.
  const kasKeluar = KATEGORI_PENGELUARAN.reduce(
    (jumlah, kategori) => jumlah + (nominalKategori.get(kategori) ?? 0),
    0
  );
  const posisiKas = kasMasuk - kasKeluar;

  // Selisih laba dan kas selalu terjelaskan oleh dua sebab:
  //   labaUsaha − kenaikanPiutang − prive = posisiKas
  // dengan kenaikanPiutang = omzet periode − kas yang diterima periode ini.
  const kenaikanPiutang = omzet - kasMasuk;

  return {
    rentang,
    label: labelBulanWIB(rentang.mulai),
    omzet,
    jumlahTransaksi,
    biayaUsaha,
    perKategori: KATEGORI_BIAYA_USAHA.map((kategori) => {
      const nominal = nominalKategori.get(kategori) ?? 0;
      return {
        kategori,
        nominal,
        porsi: biayaUsaha > 0 ? Math.round((nominal / biayaUsaha) * 1000) / 10 : 0,
      };
    }).sort((a, b) => b.nominal - a.nominal),
    labaUsaha,
    rugi: labaUsaha < 0,
    kasMasuk,
    kasKeluar,
    posisiKas,
    prive,
    kenaikanPiutang,
    jembatanSeimbang: labaUsaha - kenaikanPiutang - prive === posisiKas,
  };
};

// GET /api/laba-rugi?mulai=YYYY-MM-DD&selesai=YYYY-MM-DD
// Hanya Owner — angka laba dan rincian biaya adalah data paling sensitif di sini.
export async function GET(request: NextRequest) {
  try {
    const auth = await requireRole(request, ["Owner"]);
    if (!auth.ok) return auth.response;

    const params = request.nextUrl.searchParams;
    const rentang = rentangDariQuery(params.get("mulai"), params.get("selesai"));
    if (!rentang) {
      return NextResponse.json(
        { error: "Rentang tanggal tidak sah. Pakai format YYYY-MM-DD." },
        { status: 400 }
      );
    }

    const [periode, pembanding] = await Promise.all([
      hitungPeriode(rentang),
      hitungPeriode(rentangPembanding(rentang)),
    ]);

    return NextResponse.json({
      periode,
      pembanding,
      selisihLaba: periode.labaUsaha - pembanding.labaUsaha,
    });
  } catch (error) {
    console.error("Gagal menghitung laba rugi:", error);
    return NextResponse.json({ error: "Gagal menghitung laba rugi." }, { status: 500 });
  }
}
