import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/apiAuth";
import { hitungSaldo } from "@/lib/pengrajin";

export const dynamic = "force-dynamic";

// GET /api/upah — rekap saldo seluruh pengrajin + total terutang.
//
// Owner saja: ini memperlihatkan berapa uang yang terutang ke semua orang
// sekaligus, data paling sensitif di modul ini.
export async function GET(request: NextRequest) {
  try {
    const auth = await requireRole(request, ["Owner"]);
    if (!auth.ok) return auth.response;

    const daftar = await prisma.pengrajin.findMany({
      include: {
        kelompok: { select: { id: true, nama: true, ketuaId: true } },
        setoranTerima: { select: { nilai: true } },
        penarikan: { select: { nominal: true } },
      },
      orderBy: { nama: "asc" },
    });

    const namaPerId = new Map(daftar.map((p) => [p.id, p.nama]));

    const rekap = daftar.map((p) => {
      const saldo = hitungSaldo(p.setoranTerima, p.penarikan);
      const ketuaId = p.penerimaUpah === "KETUA" ? (p.kelompok?.ketuaId ?? null) : null;

      return {
        pengrajinId: p.id,
        nama: p.nama,
        aktif: p.aktif,
        kelompok: p.kelompok?.nama ?? null,
        penerimaUpah: p.penerimaUpah,
        // Pengrajin yang upahnya diteruskan selalu bersaldo nol — sebutkan ke
        // siapa, supaya tidak dikira upahnya belum dibayar.
        upahMasukKe: ketuaId ? { id: ketuaId, nama: namaPerId.get(ketuaId) ?? null } : null,
        bolehMenarik: p.penerimaUpah !== "KETUA",
        totalSetoran: p.setoranTerima.reduce((total, s) => total + s.nilai, 0),
        totalPenarikan: p.penarikan.reduce((total, t) => total + t.nominal, 0),
        saldo,
      };
    });

    return NextResponse.json({
      pengrajin: rekap,
      // Total terutang adalah KEWAJIBAN yang belum muncul di Laba Rugi, karena
      // biaya baru diakui saat penarikan. Harus terlihat supaya tidak lupa.
      totalTerutang: rekap.reduce((total, p) => total + Math.max(0, p.saldo), 0),
      adaSaldoMinus: rekap.some((p) => p.saldo < 0),
    });
  } catch (error) {
    console.error("Gagal memuat rekap upah:", error);
    return NextResponse.json({ error: "Gagal memuat rekap upah." }, { status: 500 });
  }
}
