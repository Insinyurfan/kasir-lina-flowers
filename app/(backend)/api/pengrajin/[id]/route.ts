import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { recordActivityLog } from "@/lib/activityLog";
import { actorFromUser, requireRole, requireUser } from "@/lib/apiAuth";
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

const ambilId = async (params: Promise<{ id: string }>) => {
  const { id } = await params;
  const angka = Number(id);
  return Number.isInteger(angka) ? angka : null;
};

// GET /api/pengrajin/[id] — rinci + riwayat setoran & penarikan.
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireUser(request);
    if (!auth.ok) return auth.response;

    const id = await ambilId(params);
    if (id === null) {
      return NextResponse.json({ error: "ID pengrajin tidak sah." }, { status: 400 });
    }

    const pengrajin = await prisma.pengrajin.findUnique({
      where: { id },
      include: {
        kelompok: { select: { id: true, nama: true, ketuaId: true } },
        ketuaDari: { select: { id: true, nama: true } },
        tarif: {
          include: { product: { select: { id: true, nama_produk: true, satuanHarga: true } } },
          orderBy: { productId: "asc" },
        },
        // Setoran sebagai PEKERJA — riwayat kerja tetap menempel padanya walau
        // upahnya masuk ke ketua.
        setoranKerja: {
          include: {
            penerima: { select: { id: true, nama: true } },
            penugasan: {
              select: {
                transactionItem: {
                  select: {
                    product: { select: { nama_produk: true } },
                    transaction: { select: { trxNumber: true, nama_pembeli: true } },
                  },
                },
              },
            },
          },
          orderBy: [{ tanggal: "desc" }, { id: "desc" }],
          take: 100,
        },
        // Setoran sebagai PENERIMA — dasar saldonya.
        setoranTerima: {
          select: { id: true, nilai: true, tanggal: true, pengrajin: { select: { nama: true } } },
          orderBy: [{ tanggal: "desc" }, { id: "desc" }],
          take: 100,
        },
        penarikan: { orderBy: [{ tanggal: "desc" }, { id: "desc" }] },
        penugasan: {
          select: {
            id: true,
            jumlahDitugaskan: true,
            tenggat: true,
            setoran: { select: { jumlah: true } },
            transactionItem: {
              select: {
                satuanHarga: true,
                product: { select: { nama_produk: true } },
                transaction: { select: { trxNumber: true, nama_pembeli: true } },
              },
            },
          },
        },
      },
    });

    if (!pengrajin) {
      return NextResponse.json({ error: "Pengrajin tidak ditemukan." }, { status: 404 });
    }

    const saldo = hitungSaldo(pengrajin.setoranTerima, pengrajin.penarikan);
    const pekerjaanAktif = pengrajin.penugasan.filter(
      (tugas) => sisaPenugasan(tugas.jumlahDitugaskan, tugas.setoran) > 0
    );

    return NextResponse.json({
      ...pengrajin,
      saldo,
      // Pengrajin yang upahnya diteruskan selalu bersaldo nol; sebutkan ke siapa
      // agar tidak disalahpahami sebagai upah yang belum dibayar.
      upahMasukKeKetuaId:
        pengrajin.penerimaUpah === "KETUA" ? (pengrajin.kelompok?.ketuaId ?? null) : null,
      pekerjaanAktif,
    });
  } catch (error) {
    console.error("Gagal memuat pengrajin:", error);
    return NextResponse.json({ error: "Gagal memuat data pengrajin." }, { status: 500 });
  }
}

// PATCH /api/pengrajin/[id]
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireRole(request, ["Owner", "Admin"]);
    if (!auth.ok) return auth.response;
    const actor = actorFromUser(auth.user);

    const id = await ambilId(params);
    if (id === null) {
      return NextResponse.json({ error: "ID pengrajin tidak sah." }, { status: 400 });
    }

    const sebelum = await prisma.pengrajin.findUnique({
      where: { id },
      include: { ketuaDari: { select: { id: true } }, kelompok: { select: { ketuaId: true } } },
    });
    if (!sebelum) {
      return NextResponse.json({ error: "Pengrajin tidak ditemukan." }, { status: 404 });
    }

    const body = await request.json();
    const data: {
      nama?: string;
      kelompokId?: number | null;
      tarifCadangan?: number | null;
      satuanTarif?: string;
      penerimaUpah?: string;
      aktif?: boolean;
    } = {};

    if (body?.nama !== undefined) {
      const nama = normalisasiNama(String(body.nama));
      if (!nama) {
        return NextResponse.json({ error: "Nama pengrajin wajib diisi." }, { status: 400 });
      }
      if (nama !== sebelum.nama) {
        const bentrok = await prisma.pengrajin.findUnique({ where: { nama } });
        if (bentrok) {
          return NextResponse.json(
            { error: `Pengrajin bernama ${nama} sudah terdaftar.` },
            { status: 400 }
          );
        }
      }
      data.nama = nama;
    }

    if (body?.tarifCadangan !== undefined) {
      if (body.tarifCadangan === null || body.tarifCadangan === "") {
        data.tarifCadangan = null;
      } else {
        const tarif = normalisasiTarif(body.tarifCadangan);
        if (tarif === null) {
          return NextResponse.json(
            { error: "Tarif cadangan harus berupa angka lebih besar dari nol." },
            { status: 400 }
          );
        }
        data.tarifCadangan = tarif;
      }
    }

    if (body?.satuanTarif !== undefined) {
      if (!isSatuanTarif(body.satuanTarif)) {
        return NextResponse.json({ error: "Satuan tarif tidak dikenal." }, { status: 400 });
      }
      data.satuanTarif = body.satuanTarif;
    }

    if (body?.aktif !== undefined) data.aktif = Boolean(body.aktif);

    if (body?.kelompokId !== undefined) {
      if (body.kelompokId === null || body.kelompokId === "") {
        data.kelompokId = null;
      } else {
        const kelompokId = Number(body.kelompokId);
        if (!Number.isInteger(kelompokId)) {
          return NextResponse.json({ error: "Kelompok tidak sah." }, { status: 400 });
        }
        const ada = await prisma.kelompok.findUnique({ where: { id: kelompokId } });
        if (!ada) {
          return NextResponse.json({ error: "Kelompok tidak ditemukan." }, { status: 400 });
        }
        data.kelompokId = kelompokId;
      }
    }

    if (body?.penerimaUpah !== undefined) {
      if (!isPenerimaUpah(body.penerimaUpah)) {
        return NextResponse.json({ error: "Penerima upah tidak dikenal." }, { status: 400 });
      }
      data.penerimaUpah = body.penerimaUpah;
    }

    // Validasi penerima upah memakai kelompok SETELAH perubahan, bukan sebelum.
    const penerimaUpahAkhir = data.penerimaUpah ?? sebelum.penerimaUpah;
    const kelompokIdAkhir =
      data.kelompokId !== undefined ? data.kelompokId : sebelum.kelompokId;
    const kelompokAkhir = kelompokIdAkhir
      ? await prisma.kelompok.findUnique({
          where: { id: kelompokIdAkhir },
          select: { ketuaId: true },
        })
      : null;

    const cek = validasiPenerimaUpah({
      penerimaUpah: penerimaUpahAkhir,
      pengrajinId: id,
      kelompok: kelompokAkhir,
      menjadiKetuaKelompok: Boolean(sebelum.ketuaDari),
    });
    if (!cek.ok) return NextResponse.json({ error: cek.alasan }, { status: 400 });

    const sesudah = await prisma.pengrajin.update({ where: { id }, data });

    await recordActivityLog({
      action: "UPDATE",
      entity: "Pengrajin",
      entityId: id,
      title: `Pengrajin diubah: ${sesudah.nama}`,
      description: `${actor.name} memperbarui data pengrajin ${sesudah.nama}.`,
      actor,
      metadata: { sebelum, sesudah },
    });

    return NextResponse.json(sesudah);
  } catch (error) {
    console.error("Gagal mengubah pengrajin:", error);
    return NextResponse.json({ error: "Gagal mengubah pengrajin." }, { status: 500 });
  }
}

// DELETE /api/pengrajin/[id]
//
// Ditolak bila masih ada jejak upah: menghapusnya akan melubangi riwayat upah
// dan laporan biaya bulan-bulan lampau. Sarankan menonaktifkan.
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireRole(request, ["Owner", "Admin"]);
    if (!auth.ok) return auth.response;
    const actor = actorFromUser(auth.user);

    const id = await ambilId(params);
    if (id === null) {
      return NextResponse.json({ error: "ID pengrajin tidak sah." }, { status: 400 });
    }

    const pengrajin = await prisma.pengrajin.findUnique({
      where: { id },
      include: {
        setoranKerja: { select: { id: true } },
        setoranTerima: { select: { nilai: true } },
        penarikan: { select: { nominal: true } },
        penugasan: { select: { id: true } },
        ketuaDari: { select: { id: true, nama: true } },
      },
    });

    if (!pengrajin) {
      return NextResponse.json({ error: "Pengrajin tidak ditemukan." }, { status: 404 });
    }

    const saldo = hitungSaldo(pengrajin.setoranTerima, pengrajin.penarikan);
    const adaJejakUpah =
      pengrajin.setoranKerja.length > 0 ||
      pengrajin.setoranTerima.length > 0 ||
      pengrajin.penarikan.length > 0;

    if (adaJejakUpah) {
      return NextResponse.json(
        {
          error: `${pengrajin.nama} sudah punya riwayat setoran atau upah${
            saldo !== 0 ? ` (saldo ${rupiah(saldo)})` : ""
          }, jadi tidak bisa dihapus. Nonaktifkan saja — riwayatnya tetap utuh dan namanya berhenti muncul saat menugaskan.`,
        },
        { status: 400 }
      );
    }

    if (pengrajin.penugasan.length > 0) {
      return NextResponse.json(
        {
          error: `${pengrajin.nama} masih punya ${pengrajin.penugasan.length} penugasan. Pindahkan atau hapus penugasannya dulu.`,
        },
        { status: 400 }
      );
    }

    if (pengrajin.ketuaDari) {
      return NextResponse.json(
        {
          error: `${pengrajin.nama} masih menjadi ketua kelompok. Ganti ketuanya dulu.`,
        },
        { status: 400 }
      );
    }

    await prisma.pengrajin.delete({ where: { id } });

    await recordActivityLog({
      action: "HAPUS",
      entity: "Pengrajin",
      entityId: id,
      title: `Pengrajin dihapus: ${pengrajin.nama}`,
      description: `${actor.name} menghapus pengrajin ${pengrajin.nama} (belum punya riwayat setoran atau upah).`,
      actor,
    });

    return NextResponse.json({ sukses: true });
  } catch (error) {
    console.error("Gagal menghapus pengrajin:", error);
    return NextResponse.json({ error: "Gagal menghapus pengrajin." }, { status: 500 });
  }
}
