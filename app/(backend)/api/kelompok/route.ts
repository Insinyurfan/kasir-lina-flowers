import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { recordActivityLog } from "@/lib/activityLog";
import { actorFromUser, requireRole, requireUser } from "@/lib/apiAuth";
import { normalisasiNama } from "@/lib/pengrajin";

export const dynamic = "force-dynamic";

// GET /api/kelompok
export async function GET(request: NextRequest) {
  try {
    const auth = await requireUser(request);
    if (!auth.ok) return auth.response;

    const kelompok = await prisma.kelompok.findMany({
      include: {
        ketua: { select: { id: true, nama: true } },
        anggota: { select: { id: true, nama: true, aktif: true, penerimaUpah: true } },
      },
      orderBy: { nama: "asc" },
    });

    return NextResponse.json(kelompok);
  } catch (error) {
    console.error("Gagal memuat kelompok:", error);
    return NextResponse.json({ error: "Gagal memuat data kelompok." }, { status: 500 });
  }
}

// Ketua MUST berupa pengrajin (bukan nama teks), karena ketua juga mengerjakan
// barang dan memegang saldo upah limpahan anggotanya.
const periksaKetua = async (ketuaId: number | null) => {
  if (ketuaId === null) return { ok: true as const, ketua: null };

  const ketua = await prisma.pengrajin.findUnique({
    where: { id: ketuaId },
    select: { id: true, nama: true, penerimaUpah: true, ketuaDari: { select: { id: true } } },
  });

  if (!ketua) {
    return { ok: false as const, alasan: "Pengrajin yang dipilih sebagai ketua tidak ditemukan." };
  }

  // Ketua wajib SENDIRI — kalau tidak, upah anggota diteruskan ke orang yang
  // upahnya sendiri diteruskan lagi, dan rantainya berputar tanpa tujuan.
  if (ketua.penerimaUpah !== "SENDIRI") {
    return {
      ok: false as const,
      alasan: `${ketua.nama} upahnya diteruskan ke ketua lain, jadi tidak bisa menjadi ketua. Ubah dulu penerima upahnya menjadi "sendiri".`,
    };
  }

  return { ok: true as const, ketua };
};

// POST /api/kelompok
export async function POST(request: NextRequest) {
  try {
    const auth = await requireRole(request, ["Owner", "Admin"]);
    if (!auth.ok) return auth.response;
    const actor = actorFromUser(auth.user);

    const body = await request.json();
    const nama = typeof body?.nama === "string" ? normalisasiNama(body.nama) : "";
    if (!nama) {
      return NextResponse.json({ error: "Nama kelompok wajib diisi." }, { status: 400 });
    }

    const sudahAda = await prisma.kelompok.findUnique({ where: { nama } });
    if (sudahAda) {
      return NextResponse.json(
        { error: `Kelompok bernama ${nama} sudah ada.` },
        { status: 400 }
      );
    }

    let ketuaId: number | null = null;
    if (body?.ketuaId !== undefined && body.ketuaId !== null && body.ketuaId !== "") {
      ketuaId = Number(body.ketuaId);
      if (!Number.isInteger(ketuaId)) {
        return NextResponse.json({ error: "Ketua tidak sah." }, { status: 400 });
      }
    }

    const cek = await periksaKetua(ketuaId);
    if (!cek.ok) return NextResponse.json({ error: cek.alasan }, { status: 400 });

    const kelompok = await prisma.kelompok.create({ data: { nama, ketuaId } });

    await recordActivityLog({
      action: "TAMBAH",
      entity: "Kelompok",
      entityId: kelompok.id,
      title: `Kelompok ditambahkan: ${kelompok.nama}`,
      description: `${actor.name} menambahkan kelompok ${kelompok.nama}${cek.ketua ? ` dengan ketua ${cek.ketua.nama}` : " tanpa ketua"}.`,
      actor,
    });

    return NextResponse.json(kelompok, { status: 201 });
  } catch (error) {
    console.error("Gagal menyimpan kelompok:", error);
    return NextResponse.json({ error: "Gagal menyimpan kelompok." }, { status: 500 });
  }
}

// PATCH /api/kelompok — ubah nama atau ketua. Body memuat `id`.
export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireRole(request, ["Owner", "Admin"]);
    if (!auth.ok) return auth.response;
    const actor = actorFromUser(auth.user);

    const body = await request.json();
    const id = Number(body?.id);
    if (!Number.isInteger(id)) {
      return NextResponse.json({ error: "ID kelompok tidak sah." }, { status: 400 });
    }

    const sebelum = await prisma.kelompok.findUnique({
      where: { id },
      include: { anggota: { select: { id: true, nama: true, penerimaUpah: true } } },
    });
    if (!sebelum) {
      return NextResponse.json({ error: "Kelompok tidak ditemukan." }, { status: 404 });
    }

    const data: { nama?: string; ketuaId?: number | null } = {};

    if (body?.nama !== undefined) {
      const nama = normalisasiNama(String(body.nama));
      if (!nama) {
        return NextResponse.json({ error: "Nama kelompok wajib diisi." }, { status: 400 });
      }
      if (nama !== sebelum.nama) {
        const bentrok = await prisma.kelompok.findUnique({ where: { nama } });
        if (bentrok) {
          return NextResponse.json({ error: `Kelompok bernama ${nama} sudah ada.` }, { status: 400 });
        }
      }
      data.nama = nama;
    }

    if (body?.ketuaId !== undefined) {
      const ketuaId =
        body.ketuaId === null || body.ketuaId === "" ? null : Number(body.ketuaId);
      if (ketuaId !== null && !Number.isInteger(ketuaId)) {
        return NextResponse.json({ error: "Ketua tidak sah." }, { status: 400 });
      }

      const cek = await periksaKetua(ketuaId);
      if (!cek.ok) return NextResponse.json({ error: cek.alasan }, { status: 400 });

      // Mengosongkan ketua membuat anggota berpenanda KETUA jadi menggantung —
      // upahnya tidak jelas masuk ke siapa. Tolak sebelum itu terjadi.
      if (ketuaId === null) {
        const menggantung = sebelum.anggota.filter((a) => a.penerimaUpah === "KETUA");
        if (menggantung.length > 0) {
          return NextResponse.json(
            {
              error: `${menggantung.map((a) => a.nama).join(", ")} upahnya diteruskan ke ketua kelompok ini. Ubah dulu penerima upah mereka sebelum ketuanya dikosongkan.`,
            },
            { status: 400 }
          );
        }
      }

      data.ketuaId = ketuaId;
    }

    const sesudah = await prisma.kelompok.update({
      where: { id },
      data,
      include: { ketua: { select: { nama: true } } },
    });

    await recordActivityLog({
      action: "UPDATE",
      entity: "Kelompok",
      entityId: id,
      title: `Kelompok diubah: ${sesudah.nama}`,
      description: `${actor.name} memperbarui kelompok ${sesudah.nama}${sesudah.ketua ? ` (ketua ${sesudah.ketua.nama})` : ""}.`,
      actor,
      metadata: { sebelum: { nama: sebelum.nama, ketuaId: sebelum.ketuaId }, sesudah },
    });

    return NextResponse.json(sesudah);
  } catch (error) {
    console.error("Gagal mengubah kelompok:", error);
    return NextResponse.json({ error: "Gagal mengubah kelompok." }, { status: 500 });
  }
}

// DELETE /api/kelompok?id=123
export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireRole(request, ["Owner", "Admin"]);
    if (!auth.ok) return auth.response;
    const actor = actorFromUser(auth.user);

    const id = Number(request.nextUrl.searchParams.get("id"));
    if (!Number.isInteger(id)) {
      return NextResponse.json({ error: "ID kelompok tidak sah." }, { status: 400 });
    }

    const kelompok = await prisma.kelompok.findUnique({
      where: { id },
      include: { anggota: { select: { id: true, nama: true, penerimaUpah: true } } },
    });
    if (!kelompok) {
      return NextResponse.json({ error: "Kelompok tidak ditemukan." }, { status: 404 });
    }

    const menggantung = kelompok.anggota.filter((a) => a.penerimaUpah === "KETUA");
    if (menggantung.length > 0) {
      return NextResponse.json(
        {
          error: `${menggantung.map((a) => a.nama).join(", ")} upahnya diteruskan ke ketua kelompok ini. Ubah dulu penerima upah mereka sebelum kelompoknya dihapus.`,
        },
        { status: 400 }
      );
    }

    // Anggota tidak ikut terhapus — `kelompokId` mereka menjadi null (SetNull).
    await prisma.kelompok.delete({ where: { id } });

    await recordActivityLog({
      action: "HAPUS",
      entity: "Kelompok",
      entityId: id,
      title: `Kelompok dihapus: ${kelompok.nama}`,
      description: `${actor.name} menghapus kelompok ${kelompok.nama}. ${kelompok.anggota.length} pengrajin menjadi tanpa kelompok.`,
      actor,
    });

    return NextResponse.json({ sukses: true });
  } catch (error) {
    console.error("Gagal menghapus kelompok:", error);
    return NextResponse.json({ error: "Gagal menghapus kelompok." }, { status: 500 });
  }
}
