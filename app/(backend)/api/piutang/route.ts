import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireUser } from "@/lib/apiAuth";
import { bentukPiutang, KELOMPOK_UMUR, type KelompokUmur, type PiutangTransaksi } from "@/lib/piutang";
import { awalHariWIB } from "@/lib/waktu";

export const dynamic = "force-dynamic";

// Piutang lama hasil migrasi bisa sangat banyak dan sebagian sudah tak relevan.
// Bawaan 90 hari menjaga daftar tetap dapat dipercaya; `?semua=1` membuka semuanya.
const BAWAAN_HARI_KEBELAKANG = 90;

type KelompokPelanggan = {
  kunci: string;
  namaPelanggan: string;
  customerId: number | null;
  totalSisa: number;
  umurTertua: number;
  kelompokUmurTertua: KelompokUmur;
  transaksi: PiutangTransaksi[];
};

// GET /api/piutang?semua=1
// Daftar transaksi belum lunas, dikelompokkan per pelanggan, tagihan tertua di atas.
export async function GET(request: NextRequest) {
  try {
    const auth = await requireUser(request);
    if (!auth.ok) return auth.response;

    const semua = request.nextUrl.searchParams.get("semua") === "1";
    const batasTanggal = semua
      ? undefined
      : awalHariWIB(new Date(Date.now() - BAWAAN_HARI_KEBELAKANG * 24 * 60 * 60 * 1000));

    const transaksi = await prisma.transaction.findMany({
      where: {
        ...(batasTanggal ? { tanggal: { gte: batasTanggal } } : {}),
      },
      select: {
        id: true,
        trxNumber: true,
        tanggal: true,
        total_harga: true,
        nama_pembeli: true,
        customerId: true,
        customer: { select: { id: true, name: true, phone: true } },
        payments: { select: { nominal: true } },
      },
      orderBy: { tanggal: "asc" },
    });

    const sekarang = new Date();
    const perPelanggan = new Map<string, KelompokPelanggan>();
    let totalPiutang = 0;
    const ringkasanUmur: Record<KelompokUmur, { jumlahTransaksi: number; nominal: number }> =
      Object.fromEntries(
        KELOMPOK_UMUR.map((kelompok) => [kelompok, { jumlahTransaksi: 0, nominal: 0 }])
      ) as Record<KelompokUmur, { jumlahTransaksi: number; nominal: number }>;

    for (const trx of transaksi) {
      const baris = bentukPiutang(trx, sekarang);
      // Sisa 0 berarti sudah lunas — tidak muncul di daftar piutang.
      if (baris.sisaTagihan <= 0) continue;

      const namaPelanggan = trx.customer?.name || trx.nama_pembeli?.trim() || "Tanpa Nama";
      const kunci = trx.customerId ? `id:${trx.customerId}` : `nama:${namaPelanggan.toUpperCase()}`;

      const kelompok = perPelanggan.get(kunci) ?? {
        kunci,
        namaPelanggan,
        customerId: trx.customerId,
        totalSisa: 0,
        umurTertua: 0,
        kelompokUmurTertua: "0-7" as KelompokUmur,
        transaksi: [],
      };

      kelompok.transaksi.push(baris);
      kelompok.totalSisa += baris.sisaTagihan;
      if (baris.umurHari >= kelompok.umurTertua) {
        kelompok.umurTertua = baris.umurHari;
        kelompok.kelompokUmurTertua = baris.kelompokUmur;
      }
      perPelanggan.set(kunci, kelompok);

      totalPiutang += baris.sisaTagihan;
      ringkasanUmur[baris.kelompokUmur].jumlahTransaksi += 1;
      ringkasanUmur[baris.kelompokUmur].nominal += baris.sisaTagihan;
    }

    const pelanggan = Array.from(perPelanggan.values())
      // Tagihan tertua di atas — yang paling mendesak ditagih lebih dulu.
      .sort((a, b) => b.umurTertua - a.umurTertua || b.totalSisa - a.totalSisa)
      .map((kelompok) => ({
        ...kelompok,
        transaksi: kelompok.transaksi.sort((a, b) => b.umurHari - a.umurHari),
      }));

    const pengaturan = await prisma.storeSetting.findUnique({ where: { id: 1 } });

    return NextResponse.json({
      totalPiutang,
      jumlahPelanggan: pelanggan.length,
      ringkasanUmur,
      pelanggan,
      namaToko: pengaturan?.brand || "Lina Flowers",
      penyaringan: {
        semua,
        hariKebelakang: semua ? null : BAWAAN_HARI_KEBELAKANG,
        sejak: batasTanggal ?? null,
      },
    });
  } catch (error) {
    console.error("Gagal memuat piutang:", error);
    return NextResponse.json({ error: "Gagal memuat data piutang." }, { status: 500 });
  }
}
