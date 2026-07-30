import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { recordActivityLog } from "@/lib/activityLog";
import { actorFromUser, requireRole, requireUser } from "@/lib/apiAuth";
import { PCS_PER_UNIT } from "@/lib/satuan";
import {
  hitungSaldo,
  isPenerimaUpah,
  isSatuanTarif,
  normalisasiNama,
  normalisasiTarif,
  sisaPenugasan,
  validasiPenerimaUpah,
} from "@/lib/pengrajin";

export const dynamic = "force-dynamic";

const rupiah = (nilai: number) => `Rp${nilai.toLocaleString("id-ID")}`;

// Data yang dibutuhkan untuk menghitung beban kerja & saldo sekaligus.
const pengrajinInclude = {
  kelompok: { select: { id: true, nama: true, ketuaId: true } },
  ketuaDari: { select: { id: true, nama: true } },
  penugasan: {
    select: {
      id: true,
      jumlahDitugaskan: true,
      setoran: { select: { jumlah: true } },
      // Satuan dibutuhkan untuk menyamakan beban kerja ke pcs — 2 gross dan
      // 5 lusin tidak boleh dijumlahkan mentah-mentah.
      transactionItem: { select: { satuanHarga: true } },
    },
  },
  setoranTerima: { select: { nilai: true } },
  penarikan: { select: { nominal: true } },
  tarif: { select: { productId: true } },
} as const;

// GET /api/pengrajin — daftar pengrajin + beban kerja aktif + saldo.
export async function GET(request: NextRequest) {
  try {
    const auth = await requireUser(request);
    if (!auth.ok) return auth.response;

    const sertakanTidakAktif = request.nextUrl.searchParams.get("semua") === "1";

    const [daftar, kelompok] = await Promise.all([
      prisma.pengrajin.findMany({
        where: sertakanTidakAktif ? {} : { aktif: true },
        include: pengrajinInclude,
        orderBy: { nama: "asc" },
      }),
      prisma.kelompok.findMany({
        include: { ketua: { select: { id: true, nama: true } } },
        orderBy: { nama: "asc" },
      }),
    ]);

    // Nama ketua per pengrajin yang upahnya diteruskan — supaya antarmuka bisa
    // menulis "upah masuk ke X" alih-alih memperlihatkan saldo nol tanpa alasan.
    const namaPerId = new Map(daftar.map((p) => [p.id, p.nama]));

    const hasil = daftar.map((p) => {
      const pekerjaanAktif = p.penugasan.filter(
        (tugas) => sisaPenugasan(tugas.jumlahDitugaskan, tugas.setoran) > 0
      );
      const ketuaId = p.penerimaUpah === "KETUA" ? (p.kelompok?.ketuaId ?? null) : null;

      return {
        id: p.id,
        nama: p.nama,
        aktif: p.aktif,
        kelompok: p.kelompok,
        menjadiKetua: Boolean(p.ketuaDari),
        tarifCadangan: p.tarifCadangan,
        satuanTarif: p.satuanTarif,
        penerimaUpah: p.penerimaUpah,
        upahMasukKe: ketuaId ? { id: ketuaId, nama: namaPerId.get(ketuaId) ?? null } : null,
        jumlahTarifProduk: p.tarif.length,
        pekerjaanAktif: pekerjaanAktif.length,
        // pcs hanya untuk membandingkan/mengurutkan; yang ditampilkan adalah
        // rincian per satuan asli, karena pemakainya berpikir dalam gross
        // dan lusin — bukan pcs.
        sisaPcsAktif: pekerjaanAktif.reduce(
          (total, tugas) =>
            total +
            sisaPenugasan(tugas.jumlahDitugaskan, tugas.setoran) *
              (PCS_PER_UNIT[tugas.transactionItem.satuanHarga] ?? 1),
          0
        ),
        rincianSatuan: Array.from(
          pekerjaanAktif
            .reduce((peta, tugas) => {
              const satuan = tugas.transactionItem.satuanHarga;
              const sisa = sisaPenugasan(tugas.jumlahDitugaskan, tugas.setoran);
              peta.set(satuan, (peta.get(satuan) ?? 0) + sisa);
              return peta;
            }, new Map<string, number>())
            .entries()
        ).map(([satuan, jumlah]) => ({ satuan, jumlah })),
        saldo: hitungSaldo(p.setoranTerima, p.penarikan),
      };
    });

    return NextResponse.json({
      pengrajin: hasil,
      kelompok,
      totalTerutang: hasil.reduce((total, p) => total + Math.max(0, p.saldo), 0),
      jumlahAktif: hasil.filter((p) => p.aktif).length,
    });
  } catch (error) {
    console.error("Gagal memuat pengrajin:", error);
    return NextResponse.json({ error: "Gagal memuat data pengrajin." }, { status: 500 });
  }
}

// POST /api/pengrajin — tambah pengrajin baru.
export async function POST(request: NextRequest) {
  try {
    const auth = await requireRole(request, ["Owner", "Admin"]);
    if (!auth.ok) return auth.response;
    const actor = actorFromUser(auth.user);

    const body = await request.json();

    const nama = typeof body?.nama === "string" ? normalisasiNama(body.nama) : "";
    if (!nama) {
      return NextResponse.json({ error: "Nama pengrajin wajib diisi." }, { status: 400 });
    }

    const sudahAda = await prisma.pengrajin.findUnique({ where: { nama } });
    if (sudahAda) {
      return NextResponse.json(
        { error: `Pengrajin bernama ${nama} sudah terdaftar.` },
        { status: 400 }
      );
    }

    // Tarif cadangan OPSIONAL — boleh dikosongkan lalu diisi per produk.
    let tarifCadangan: number | null = null;
    if (body?.tarifCadangan !== undefined && body.tarifCadangan !== null && body.tarifCadangan !== "") {
      tarifCadangan = normalisasiTarif(body.tarifCadangan);
      if (tarifCadangan === null) {
        return NextResponse.json(
          { error: "Tarif cadangan harus berupa angka lebih besar dari nol." },
          { status: 400 }
        );
      }
    }

    const satuanTarif = isSatuanTarif(body?.satuanTarif) ? body.satuanTarif : "gross";
    const penerimaUpah = isPenerimaUpah(body?.penerimaUpah) ? body.penerimaUpah : "SENDIRI";

    let kelompokId: number | null = null;
    if (body?.kelompokId !== undefined && body.kelompokId !== null && body.kelompokId !== "") {
      kelompokId = Number(body.kelompokId);
      if (!Number.isInteger(kelompokId)) {
        return NextResponse.json({ error: "Kelompok tidak sah." }, { status: 400 });
      }
    }

    const kelompok = kelompokId
      ? await prisma.kelompok.findUnique({
          where: { id: kelompokId },
          select: { id: true, ketuaId: true },
        })
      : null;

    if (kelompokId && !kelompok) {
      return NextResponse.json({ error: "Kelompok tidak ditemukan." }, { status: 400 });
    }

    // Penjaga penerima upah dijalankan saat MENYIMPAN, bukan saat setoran,
    // supaya kesalahannya ketahuan lebih awal — bukan pada pagi tersibuk.
    const cek = validasiPenerimaUpah({
      penerimaUpah,
      pengrajinId: null,
      kelompok: kelompok ? { ketuaId: kelompok.ketuaId } : null,
      menjadiKetuaKelompok: false,
    });
    if (!cek.ok) return NextResponse.json({ error: cek.alasan }, { status: 400 });

    const pengrajin = await prisma.pengrajin.create({
      data: {
        nama,
        kelompokId,
        tarifCadangan,
        satuanTarif,
        penerimaUpah,
        aktif: body?.aktif === false ? false : true,
      },
    });

    await recordActivityLog({
      action: "TAMBAH",
      entity: "Pengrajin",
      entityId: pengrajin.id,
      title: `Pengrajin ditambahkan: ${pengrajin.nama}`,
      description: `${actor.name} menambahkan pengrajin ${pengrajin.nama}${
        pengrajin.tarifCadangan ? ` dengan tarif cadangan ${rupiah(pengrajin.tarifCadangan)}/${pengrajin.satuanTarif}` : " tanpa tarif cadangan"
      }.`,
      actor,
      metadata: { pengrajin },
    });

    return NextResponse.json(pengrajin, { status: 201 });
  } catch (error) {
    console.error("Gagal menyimpan pengrajin:", error);
    return NextResponse.json({ error: "Gagal menyimpan pengrajin." }, { status: 500 });
  }
}
