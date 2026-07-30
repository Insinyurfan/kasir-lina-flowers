import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { recordActivityLog } from "@/lib/activityLog";
import { actorFromUser, requireRole } from "@/lib/apiAuth";
import { hitungSaldo } from "@/lib/pengrajin";
import { normalisasiNominal } from "@/lib/pengeluaran";
import { dariTanggalInputWIB } from "@/lib/waktu";

export const dynamic = "force-dynamic";

const rupiah = (nilai: number) => `Rp${nilai.toLocaleString("id-ID")}`;

// GET /api/penarikan?pengrajinId=1 — riwayat penarikan seorang pengrajin.
export async function GET(request: NextRequest) {
  try {
    const auth = await requireRole(request, ["Owner", "Admin"]);
    if (!auth.ok) return auth.response;

    const pengrajinId = Number(request.nextUrl.searchParams.get("pengrajinId"));
    if (!Number.isInteger(pengrajinId)) {
      return NextResponse.json({ error: "pengrajinId wajib diisi." }, { status: 400 });
    }

    const [penarikan, setoran] = await Promise.all([
      prisma.penarikan.findMany({
        where: { pengrajinId },
        orderBy: [{ tanggal: "desc" }, { id: "desc" }],
      }),
      prisma.setoran.findMany({ where: { penerimaId: pengrajinId }, select: { nilai: true } }),
    ]);

    return NextResponse.json({
      penarikan,
      saldo: hitungSaldo(setoran, penarikan),
    });
  } catch (error) {
    console.error("Gagal memuat penarikan:", error);
    return NextResponse.json({ error: "Gagal memuat riwayat penarikan." }, { status: 500 });
  }
}

// POST /api/penarikan — cairkan upah, penuh atau sebagian.
//
// Di sinilah biaya diakui. Setoran TIDAK membuat pengeluaran — upah bisa
// menumpuk berminggu-minggu sebelum dicairkan, dan mencatatnya sebagai biaya
// lebih awal akan membuat laporan kas mencatat uang keluar yang belum terjadi.
export async function POST(request: NextRequest) {
  try {
    const auth = await requireRole(request, ["Owner", "Admin"]);
    if (!auth.ok) return auth.response;
    const actor = actorFromUser(auth.user);

    const body = await request.json();

    const pengrajinId = Number(body?.pengrajinId);
    if (!Number.isInteger(pengrajinId)) {
      return NextResponse.json({ error: "Pengrajin tidak sah." }, { status: 400 });
    }

    const nominal = normalisasiNominal(body?.nominal);
    if (nominal === null) {
      return NextResponse.json(
        { error: "Nominal penarikan harus lebih besar dari nol." },
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

    const catatan =
      typeof body?.catatan === "string" && body.catatan.trim() ? body.catatan.trim() : null;

    const hasil = await prisma.$transaction(async (tx) => {
      const pengrajin = await tx.pengrajin.findUnique({
        where: { id: pengrajinId },
        include: {
          kelompok: { select: { ketuaId: true } },
          setoranTerima: { select: { nilai: true } },
          penarikan: { select: { nominal: true } },
        },
      });

      if (!pengrajin) return { gagal: "Pengrajin tidak ditemukan." as const, kodeHttp: 404 };

      // Upah yang diteruskan ke ketua tidak boleh ditarik oleh anggotanya.
      if (pengrajin.penerimaUpah === "KETUA") {
        const ketua = pengrajin.kelompok?.ketuaId
          ? await tx.pengrajin.findUnique({
              where: { id: pengrajin.kelompok.ketuaId },
              select: { nama: true },
            })
          : null;

        return {
          gagal:
            `Upah ${pengrajin.nama} diteruskan ke ${ketua?.nama ?? "ketua kelompoknya"}, jadi penarikannya lewat sana.` as const,
          kodeHttp: 400,
        };
      }

      const saldo = hitungSaldo(pengrajin.setoranTerima, pengrajin.penarikan);
      if (saldo <= 0) {
        return { gagal: `${pengrajin.nama} belum punya saldo upah.` as const, kodeHttp: 400 };
      }
      if (nominal > saldo) {
        return {
          gagal: `Penarikan melebihi saldo. Saldo ${pengrajin.nama} tinggal ${rupiah(saldo)}.` as const,
          kodeHttp: 400,
        };
      }

      // Penarikan dan Expense ditulis BERSAMA-SAMA. Kalau salah satu gagal,
      // halaman Pengrajin dan Laba Rugi akan menampilkan angka berbeda untuk
      // kejadian yang sama — persis ketidakpercayaan yang membuat orang
      // kembali ke buku tulis.
      const pengeluaran = await tx.expense.create({
        data: {
          tanggal,
          nominal,
          kategori: "Upah Pengrajin",
          metode: "Tunai",
          catatan: `Upah ${pengrajin.nama}${catatan ? ` — ${catatan}` : ""}`,
          pencatatId: auth.user.id,
          pencatatNama: actor.name,
        },
      });

      const penarikan = await tx.penarikan.create({
        data: {
          pengrajinId,
          tanggal,
          nominal,
          expenseId: pengeluaran.id,
          catatan,
          pencatatId: auth.user.id,
          pencatatNama: actor.name,
        },
      });

      return { penarikan, pengeluaran, pengrajin, saldoSisa: saldo - nominal };
    });

    if ("gagal" in hasil) {
      return NextResponse.json({ error: hasil.gagal }, { status: hasil.kodeHttp });
    }

    await recordActivityLog({
      action: "TAMBAH",
      entity: "Penarikan",
      entityId: hasil.penarikan.id,
      title: `Upah dicairkan: ${hasil.pengrajin.nama} ${rupiah(nominal)}`,
      description: `${actor.name} mencairkan upah ${rupiah(nominal)} untuk ${hasil.pengrajin.nama}. Sisa saldo ${rupiah(hasil.saldoSisa)}. Tercatat sebagai pengeluaran Upah Pengrajin.`,
      actor,
      metadata: {
        pengrajinId,
        nominal,
        saldoSisa: hasil.saldoSisa,
        expenseId: hasil.pengeluaran.id,
      },
    });

    return NextResponse.json(
      {
        penarikan: hasil.penarikan,
        saldoSisa: hasil.saldoSisa,
        expenseId: hasil.pengeluaran.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Gagal mencairkan upah:", error);
    return NextResponse.json({ error: "Gagal mencairkan upah." }, { status: 500 });
  }
}
